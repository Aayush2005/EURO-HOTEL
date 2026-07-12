from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from asyncpg import Connection
from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.auth.dependencies import require_roles
from app.db import get_db
from app.schemas.menu import MenuItemCreate, MenuItemUpdate, MenuReorderRequest

limiter = Limiter(key_func=get_remote_address)

# Public — consumed by the dining page and /dining/menu on the website.
router = APIRouter(prefix="/api/menu", tags=["menu"])

# Admin — consumed by the admin panel.
admin_router = APIRouter(prefix="/admin/menu", tags=["admin-menu"])

_MANAGERS = ["admin", "manager"]

_COLUMNS = """
    id, name, description, price, category, image_url,
    is_available, is_featured, sort_order, created_at, updated_at
"""

# Manual drag-to-reorder order, with id as a stable tiebreaker.
_ORDER_BY = "ORDER BY sort_order, id"


def _serialize(row: Any) -> dict:
    item = dict(row)
    item["price"] = float(item["price"])
    for key in ("created_at", "updated_at"):
        if item.get(key) is not None:
            item[key] = item[key].isoformat()
    return item


@router.get("", response_model=list[dict])
@limiter.limit("60/minute")
async def list_public_menu(request: Request, connection: Connection = Depends(get_db)) -> list[dict]:
    """Available items only — this is what guests see."""
    rows = await connection.fetch(
        f"SELECT {_COLUMNS} FROM hotel.menu_items WHERE is_available = true {_ORDER_BY}"
    )
    return [_serialize(r) for r in rows]


@admin_router.get("", response_model=list[dict])
async def list_all_menu_items(
    _admin: dict[str, Any] = Depends(require_roles(_MANAGERS)),
    connection: Connection = Depends(get_db),
) -> list[dict]:
    """Every item, including unavailable ones."""
    rows = await connection.fetch(f"SELECT {_COLUMNS} FROM hotel.menu_items {_ORDER_BY}")
    return [_serialize(r) for r in rows]


@admin_router.post("", response_model=dict, status_code=201)
async def create_menu_item(
    payload: MenuItemCreate,
    _admin: dict[str, Any] = Depends(require_roles(_MANAGERS)),
    connection: Connection = Depends(get_db),
) -> dict:
    row = await connection.fetchrow(
        f"""
        INSERT INTO hotel.menu_items
            (name, description, price, category, image_url, is_available, is_featured, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7,
                (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM hotel.menu_items))
        RETURNING {_COLUMNS}
        """,
        payload.name,
        payload.description,
        payload.price,
        payload.category,
        payload.image_url,
        payload.is_available,
        payload.is_featured,
    )
    return _serialize(row)


@admin_router.post("/reorder", response_model=dict)
async def reorder_menu_items(
    payload: MenuReorderRequest,
    _admin: dict[str, Any] = Depends(require_roles(_MANAGERS)),
    connection: Connection = Depends(get_db),
) -> dict:
    """Rewrite sort_order from the given id sequence (position in the list wins)."""
    result = await connection.execute(
        """
        UPDATE hotel.menu_items m
        SET sort_order = v.pos, updated_at = now()
        FROM unnest($1::bigint[]) WITH ORDINALITY AS v(id, pos)
        WHERE m.id = v.id
        """,
        payload.ids,
    )
    # asyncpg returns e.g. "UPDATE 16"
    updated = int(result.split()[-1])
    return {"status": "reordered", "updated": updated}


@admin_router.patch("/{item_id}", response_model=dict)
async def update_menu_item(
    item_id: int,
    payload: MenuItemUpdate,
    _admin: dict[str, Any] = Depends(require_roles(_MANAGERS)),
    connection: Connection = Depends(get_db),
) -> dict:
    fields = payload.model_dump(exclude_unset=True)
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Build "col = $n" for each supplied field; updated_at always bumped.
    assignments = [f"{col} = ${i}" for i, col in enumerate(fields, start=1)]
    values = list(fields.values())
    assignments.append(f"updated_at = ${len(values) + 1}")
    values.append(datetime.now(UTC))

    row = await connection.fetchrow(
        f"""
        UPDATE hotel.menu_items
        SET {", ".join(assignments)}
        WHERE id = ${len(values) + 1}
        RETURNING {_COLUMNS}
        """,
        *values,
        item_id,
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return _serialize(row)


@admin_router.delete("/{item_id}", response_model=dict)
async def delete_menu_item(
    item_id: int,
    _admin: dict[str, Any] = Depends(require_roles(_MANAGERS)),
    connection: Connection = Depends(get_db),
) -> dict:
    row = await connection.fetchrow(
        "DELETE FROM hotel.menu_items WHERE id = $1 RETURNING id", item_id
    )
    if row is None:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"status": "deleted", "id": row["id"]}
