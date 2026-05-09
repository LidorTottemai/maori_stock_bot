"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MdArrowBack, MdAdd, MdEdit, MdDelete, MdVisibility, MdVisibilityOff, MdCheck, MdClose } from "react-icons/md";

type Testimonial = {
  id: string;
  name: string;
  text: string;
  initials: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
};

const COLOR_OPTIONS = [
  { label: "כחול כהה", value: "from-[#0C4A8B] to-[#1565C0]" },
  { label: "ציאן", value: "from-[#00B4D8] to-[#0077B6]" },
  { label: "כחול-ציאן", value: "from-[#1565C0] to-[#00B4D8]" },
  { label: "כחול עמוק", value: "from-[#0C4A8B] to-[#00B4D8]" },
  { label: "כחול-כהה", value: "from-[#1565C0] to-[#0C4A8B]" },
];

const EMPTY: Omit<Testimonial, "id"> = {
  name: "",
  text: "",
  initials: "",
  color: "from-[#0C4A8B] to-[#1565C0]",
  isActive: true,
  sortOrder: 0,
};

export default function TestimonialsAdminPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<Testimonial, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/testimonials");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startAdd() {
    setForm({ ...EMPTY, sortOrder: items.length });
    setAdding(true);
    setEditing(null);
  }

  function startEdit(t: Testimonial) {
    const { id, ...rest } = t;
    setForm(rest);
    setEditing(t);
    setAdding(false);
  }

  function cancel() {
    setAdding(false);
    setEditing(null);
    setError("");
  }

  async function save() {
    setError("");
    if (!form.name || !form.text || !form.initials) {
      setError("שם, טקסט וראשי תיבות הם שדות חובה");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/admin/testimonials/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      cancel();
      await load();
    } catch {
      setError("שגיאה בשמירה");
    }
    setSaving(false);
  }

  async function toggleActive(t: Testimonial) {
    await fetch(`/api/admin/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !t.isActive }),
    });
    await load();
  }

  async function remove(t: Testimonial) {
    if (!confirm(`למחוק את המלצת ${t.name}?`)) return;
    await fetch(`/api/admin/testimonials/${t.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/admin/dashboard"
            className="text-slate-500 hover:text-[#0C4A8B] transition-colors"
          >
            <MdArrowBack size={24} />
          </Link>
          <h1 className="text-2xl font-black text-[#0C4A8B]">ניהול המלצות</h1>
          <button
            onClick={startAdd}
            className="mr-auto flex items-center gap-1 bg-[#0C4A8B] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#1565C0] transition-colors"
          >
            <MdAdd size={18} />
            הוסף המלצה
          </button>
        </div>

        {/* Add / Edit form */}
        {(adding || editing) && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
            <h2 className="font-black text-[#0C4A8B] mb-4 text-lg">
              {editing ? "עריכת המלצה" : "המלצה חדשה"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">שם מלא *</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00B4D8]"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="רונית כהן"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">ראשי תיבות *</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00B4D8]"
                  value={form.initials}
                  onChange={(e) => setForm({ ...form, initials: e.target.value })}
                  placeholder="רכ"
                  maxLength={3}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-600 mb-1">טקסט ההמלצה *</label>
              <textarea
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00B4D8] resize-none"
                rows={3}
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="כתוב כאן את ההמלצה..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">צבע אווטאר</label>
                <select
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00B4D8]"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                >
                  {COLOR_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">סדר תצוגה</label>
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00B4D8]"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#0C4A8B]"
                  />
                  <span className="text-sm font-semibold text-slate-600">פעיל (מוצג באתר)</span>
                </label>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1 bg-[#0C4A8B] text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-[#1565C0] transition-colors disabled:opacity-60"
              >
                <MdCheck size={16} />
                {saving ? "שומר..." : "שמור"}
              </button>
              <button
                onClick={cancel}
                className="flex items-center gap-1 border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold hover:border-slate-400 transition-colors"
              >
                <MdClose size={16} />
                ביטול
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-black text-[#0C4A8B] text-lg">
              כל ההמלצות ({items.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">טוען...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-slate-400">אין המלצות עדיין</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((t) => (
                <div key={t.id} className={`flex items-start gap-4 px-5 py-4 ${!t.isActive ? "opacity-50" : ""}`}>
                  {/* Avatar preview */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm`}>
                    {t.initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#0C4A8B] text-sm">{t.name}</span>
                      {!t.isActive && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">מוסתר</span>
                      )}
                      <span className="text-xs text-slate-400 mr-auto">סדר: {t.sortOrder}</span>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{t.text}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleActive(t)}
                      title={t.isActive ? "הסתר" : "הצג"}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#0C4A8B] transition-colors"
                    >
                      {t.isActive ? <MdVisibility size={16} /> : <MdVisibilityOff size={16} />}
                    </button>
                    <button
                      onClick={() => startEdit(t)}
                      title="עריכה"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#0C4A8B] transition-colors"
                    >
                      <MdEdit size={16} />
                    </button>
                    <button
                      onClick={() => remove(t)}
                      title="מחיקה"
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
