'use client';

import { useState, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import {
  RefreshCw, Plus, Pencil, Trash2, X, UploadCloud, Star, UtensilsCrossed, GripVertical,
} from 'lucide-react';

/**
 * Fixed set — mirrored by the menu_items_category_check constraint (migration 007)
 * and the MenuCategory Literal in backend/app/schemas/menu.py. Change all three together.
 */
export const MENU_CATEGORIES = ['Breakfast', 'Main Course', 'Drinks', 'Desserts'] as const;
export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
}

/** Blank item used by the "Add Dish" form. */
const EMPTY: Omit<MenuItem, 'id' | 'sort_order'> = {
  name: '',
  description: '',
  price: 0,
  category: 'Main Course',
  image_url: '',
  is_available: true,
  is_featured: false,
};

type Draft = MenuItem | Omit<MenuItem, 'id' | 'sort_order'>;

export default function MenuClient({ initialItems }: { initialItems: MenuItem[] }) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [error, setError] = useState('');

  // Drag-to-reorder state: the row being dragged, and the row it's hovering over.
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu', { cache: 'no-store' });
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Paint `next` immediately, then send the request. If it fails, roll the table
   * back to exactly what it was and surface the error — so the UI never claims a
   * change the database didn't accept.
   */
  async function optimistic(
    next: MenuItem[],
    send: () => Promise<Response>,
    fallbackMsg: string,
  ) {
    const previous = items;
    setItems(next);
    setError('');

    let res: Response;
    try {
      res = await send();
    } catch {
      setItems(previous);
      setError(`${fallbackMsg} — could not reach the server`);
      return null;
    }

    if (!res.ok) {
      setItems(previous);
      setError((await res.json().catch(() => ({}))).error ?? fallbackMsg);
      return null;
    }
    return res;
  }

  async function handleDelete(item: MenuItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    await optimistic(
      items.filter((i) => i.id !== item.id),
      () => fetch(`/api/menu/${item.id}`, { method: 'DELETE' }),
      'Delete failed',
    );
  }

  /** Toggle availability / featured straight from the table row. */
  async function patch(item: MenuItem, changes: Partial<MenuItem>) {
    const res = await optimistic(
      items.map((i) => (i.id === item.id ? { ...i, ...changes } : i)),
      () =>
        fetch(`/api/menu/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changes),
        }),
      'Update failed',
    );
    if (!res) return;

    // Reconcile with the row the server actually stored (e.g. updated_at).
    const updated: MenuItem = await res.json();
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  /** Move the dragged row to the dropped-on row's position, then persist the new order. */
  async function handleDrop(targetId: number) {
    const from = items.findIndex((i) => i.id === dragId);
    const to = items.findIndex((i) => i.id === targetId);
    setDragId(null);
    setOverId(null);
    if (from === -1 || to === -1 || from === to) return;

    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    await optimistic(
      next,
      () =>
        fetch('/api/menu/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: next.map((i) => i.id) }),
        }),
      'Reorder failed',
    );
  }

  /** Close the modal immediately and persist in the background. */
  async function handleSave(draft: Draft) {
    setEditing(null);

    const payload = {
      name: draft.name,
      description: draft.description,
      price: Number(draft.price),
      category: draft.category,
      image_url: draft.image_url,
      is_available: draft.is_available,
      is_featured: draft.is_featured,
    };

    if ('id' in draft) {
      const edited = draft as MenuItem;
      const res = await optimistic(
        items.map((i) => (i.id === edited.id ? edited : i)),
        () =>
          fetch(`/api/menu/${edited.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }),
        'Save failed',
      );
      if (!res) return;
      const updated: MenuItem = await res.json();
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      return;
    }

    // New dish: show it right away under a temporary id, then swap in the real row.
    const tempId = -Date.now();
    const placeholder = {
      ...payload,
      id: tempId,
      sort_order: Number.MAX_SAFE_INTEGER, // appended, same as the server does
    } as MenuItem;

    const res = await optimistic(
      [...items, placeholder],
      () =>
        fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
      'Create failed',
    );
    if (!res) return;
    const created: MenuItem = await res.json();
    setItems((prev) => prev.map((i) => (i.id === tempId ? created : i)));
  }


  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar active="menu" />

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-semibold text-navy-900">Menu</h1>
            <p className="text-charcoal-400 text-xs mt-0.5">
              {items.length} dish{items.length !== 1 ? 'es' : ''} · drag rows to reorder · changes go live immediately
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-navy-900 border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => setEditing({ ...EMPTY })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-navy-900 transition-all"
              style={{ background: 'linear-gradient(135deg, #C9A227, #D4B332)' }}
            >
              <Plus size={14} />
              Add Dish
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-charcoal-400 text-xs uppercase tracking-wider">
                  <th className="w-8" />
                  <th className="px-5 py-3 font-semibold">Dish</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Available</th>
                  <th className="px-5 py-3 font-semibold">Featured</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-charcoal-400">
                      <UtensilsCrossed size={28} className="mx-auto mb-3 opacity-40" />
                      No dishes yet. Click <strong>Add Dish</strong> to create the first one.
                    </td>
                  </tr>
                )}
                {items.map((item) => {
                  // A negative id means the row is still being created server-side —
                  // it has no real id yet, so it can't be dragged, edited or deleted.
                  const pending = item.id < 0;

                  return (
                  <tr
                    key={item.id}
                    draggable={!pending}
                    onDragStart={() => !pending && setDragId(item.id)}
                    onDragEnd={() => { setDragId(null); setOverId(null); }}
                    onDragOver={(e) => { e.preventDefault(); if (!pending) setOverId(item.id); }}
                    onDrop={() => !pending && handleDrop(item.id)}
                    className={`border-b border-slate-100 last:border-0 transition-colors ${
                      pending
                        ? 'opacity-50 animate-pulse cursor-progress'
                        : 'cursor-grab active:cursor-grabbing'
                    } ${
                      dragId === item.id
                        ? 'opacity-40'
                        : overId === item.id && dragId !== null
                          ? 'bg-gold-50 shadow-[inset_0_2px_0_0_#C9A227]'
                          : !pending ? 'hover:bg-slate-50/60' : ''
                    }`}
                  >
                    <td className="pl-3 text-slate-300">
                      <GripVertical size={16} className={pending ? 'invisible' : ''} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url || 'data:image/gif;base64,R0lGODlhAQABAAAAACw='}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-navy-900 truncate">{item.name}</div>
                          <div className="text-charcoal-400 text-xs truncate max-w-xs">
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-charcoal-600">{item.category}</td>
                    <td className="px-5 py-3 font-semibold text-navy-900">₹{item.price}</td>
                    <td className="px-5 py-3">
                      <Toggle
                        on={item.is_available}
                        disabled={pending}
                        onClick={() => patch(item, { is_available: !item.is_available })}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => patch(item, { is_featured: !item.is_featured })}
                        disabled={pending}
                        title="Featured items appear in the Signature Flavors carousel"
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-all disabled:cursor-not-allowed"
                      >
                        <Star
                          size={16}
                          className={item.is_featured ? 'text-gold-500' : 'text-slate-300'}
                          fill={item.is_featured ? '#D4A843' : 'none'}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditing(item)}
                          disabled={pending}
                          className="p-2 rounded-lg text-charcoal-500 hover:text-navy-900 hover:bg-slate-100 transition-all disabled:cursor-not-allowed"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={pending}
                          className="p-2 rounded-lg text-charcoal-500 hover:text-red-600 hover:bg-red-50 transition-all disabled:cursor-not-allowed"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {editing && (
        <ItemModal
          item={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}

function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-10 h-5.5 rounded-full p-0.5 transition-all flex disabled:cursor-not-allowed ${
        on ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
      }`}
      style={{ height: '22px', width: '40px' }}
    >
      <span className="block w-[18px] h-[18px] rounded-full bg-white shadow-sm" />
    </button>
  );
}

function ItemModal({
  item, onClose, onSubmit,
}: {
  item: Draft;
  onClose: () => void;
  onSubmit: (draft: Draft) => void;
}) {
  const [form, setForm] = useState(item);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const isEdit = 'id' in item;

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/menu/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Upload failed');
        return;
      }
      set('image_url', data.url);
    } finally {
      setUploading(false);
    }
  }

  function handleSave() {
    if (!form.name.trim()) return setError('Dish name is required');
    if (!form.category.trim()) return setError('Category is required');
    onSubmit(form); // parent closes the modal and persists optimistically
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="font-serif text-lg font-semibold text-navy-900">
            {isEdit ? 'Edit Dish' : 'Add Dish'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-charcoal-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
              Image
            </label>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.image_url || 'data:image/gif;base64,R0lGODlhAQABAAAAACw='}
                alt=""
                className="w-20 h-20 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
              />
              <div className="flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-navy-900 border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  <UploadCloud size={14} className={uploading ? 'animate-pulse' : ''} />
                  {uploading ? 'Uploading…' : 'Upload Image'}
                </button>
                <p className="text-charcoal-400 text-xs mt-1.5">JPEG/PNG/WebP, max 5 MB</p>
              </div>
            </div>
          </div>

          <Field label="Dish Name">
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Butter Chicken"
              className={inputCls}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Short description shown on the menu card"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₹)">
              <input
                type="number"
                min={0}
                step="1"
                value={form.price}
                onChange={(e) => set('price', Number(e.target.value))}
                className={inputCls}
              />
            </Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value as MenuCategory)}
                className={inputCls}
              >
                {MENU_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-charcoal-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={(e) => set('is_available', e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-charcoal-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => set('is_featured', e.target.checked)}
                className="w-4 h-4 accent-gold-500"
              />
              Featured on Dining page
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-charcoal-500 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={uploading}
            title={uploading ? 'Wait for the image upload to finish' : undefined}
            className="px-5 py-2 rounded-lg text-sm font-medium text-navy-900 transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #C9A227, #D4B332)' }}
          >
            {isEdit ? 'Save Changes' : 'Create Dish'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg text-charcoal-700 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
