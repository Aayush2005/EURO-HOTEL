from __future__ import annotations

from decimal import Decimal
from typing import Literal, get_args

from pydantic import BaseModel, Field

# Fixed set — mirrored by the menu_items_category_check constraint (migration 007)
# and MENU_CATEGORIES in frontend/src/data/menu.ts. Change all three together.
MenuCategory = Literal["Breakfast", "Main Course", "Drinks", "Desserts"]

MENU_CATEGORIES: list[str] = list(get_args(MenuCategory))


class MenuItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    description: str = Field(default="", max_length=1000)
    price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    category: MenuCategory
    image_url: str = Field(default="", max_length=1000)
    is_available: bool = True
    is_featured: bool = False


class MenuReorderRequest(BaseModel):
    """Full list of item ids in the order they should appear."""

    ids: list[int] = Field(min_length=1)


class MenuItemUpdate(BaseModel):
    """All fields optional — only the ones sent are updated."""

    name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = Field(default=None, max_length=1000)
    price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    category: MenuCategory | None = None
    image_url: str | None = Field(default=None, max_length=1000)
    is_available: bool | None = None
    is_featured: bool | None = None
