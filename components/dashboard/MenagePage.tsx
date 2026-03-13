'use client'

import { useState, useMemo } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Cleaner {
  id: string
  name: string
  email?: string
  phone?: string
}

interface CleaningTask {
  id: string
  scheduled_date: string
  status: 'pending' | 'in_progress' | 'done' | 'cancelled'
  cleaner_id?: string | null
  checklist?: boolean[]
  notes?: string
  properties?: { name: string; cover_image?: string; address?: string } | null
  cleaners?: { name: string; phone?: string } | null
  bookings?: { guest_name?: string; check_in?: string; check_out?: string } | null
}

interface MenagePageProps {
  initialTasks: CleaningTask[]
  initialCleaners: Cleaner[]
  tenantId: string
  initialYM: string // "YYYY-MM"
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS = {
  pending:     { label: 'À faire',    color: '#6b7280', bg: '#f3f4f6' },
  in_progress: { label: 'En cours',   color: '#b45309', bg: '#fef3c7' },
  done:        { label: 'Terminé',    color: '#065f46', bg: '#d1fae5' },
  cancelled:   { label: 'Annulé',     color: '#991b1b', bg: '#fee2e2' },
}

const CHECKLIST_ITEMS = [
  'Changer les draps et taies',
  'Nettoyer salle de bain (WC, douche, lavabo)',
  'Aspirer et laver les sols',
  'Nettoyer cuisine et électroménager',
  'Vider les poubelles',
  'Réapprovisionner les consommables',
]

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

function toYMD(d: Date) {
  return d.toISOString().split('T')[0]
}

// Couleur d'urgence selon date
function urgencyStyle(date: string): { border?: string; bg?: string } {
  const today = toYMD(new Date())
  const tomorrow = toYMD(new Date(Date.now() + 86400000))
  if (date === today)    return { border: '#ef4444', bg: '#fff5f5' }
  if (date === tomorrow) return { border: '#f59e0b', bg: '#fffbeb' }
  return {}
}

function urgencyBadge(date: string) {
  const today = toYMD(new Date())
  const tomorrow = toYMD(new Date(Date.now() + 86400000))
  if (date === today)    return <span className="text-xs font-bold text-red-500">⚠️ Aujourd'hui</span>
  if (date === tomorrow) return <span className="text-xs font-bold text-amber-500">⏰ Demain</span>
  return null
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function weekLabel(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  // Lundi de la semaine
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (x: Date) => x.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return `Semaine du ${fmt(monday)} au ${fmt(sunday)}`
}

function getWeekKey(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return toYMD(monday)
}

// ─── Checklist Modal ──────────────────────────────────────────────────────────

function ChecklistModal({
  task,
  onClose,
  onUpdate,
}: {
  task: CleaningTask
  onClose: () => void
  onUpdate: (id: string, patch: Partial<CleaningTask>) => void
}) {
  const [items, setItems] = useState<boolean[]>(
    task.checklist?.length === CHECKLIST_ITEMS.length
      ? task.checklist
      : CHECKLIST_ITEMS.map(() => false)
  )
  const [saving, setSaving] = useState(false)

  const toggle = async (i: number) => {
    const next = items.map((v, idx) => idx === i ? !v : v)
    setItems(next)
    setSaving(true)
    await fetch(`/api/cleaning-tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklist: next }),
    })
    onUpdate(task.id, { checklist: next })
    setSaving(false)
  }

  const done = items.filter(Boolean).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#e9e3da' }}>
          <div>
            <h3 className="font-semibold" style={{ color: '#00243f' }}>
              Checklist — {task.properties?.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(task.scheduled_date)}</p>
          </div>
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-gray-400">Sauvegarde…</span>}
            <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: '#f8f4ee', color: '#00243f' }}>
              {done}/{CHECKLIST_ITEMS.length}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pt-4">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${(done / CHECKLIST_ITEMS.length) * 100}%`, backgroundColor: '#0097b2' }}
            />
          </div>
        </div>

        <div className="p-5 space-y-3">
          {CHECKLIST_ITEMS.map((item, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <div
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  borderColor: items[i] ? '#0097b2' : '#d1d5db',
                  backgroundColor: items[i] ? '#0097b2' : 'white',
                }}
                onClick={() => toggle(i)}
              >
                {items[i] && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span
                className="text-sm transition-colors"
                style={{ color: items[i] ? '#9ca3af' : '#00243f', textDecoration: items[i] ? 'line-through' : 'none' }}
              >
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Add Cleaner Modal ────────────────────────────────────────────────────────

function AddCleanerModal({
  tenantId,
  onClose,
  onAdd,
}: {
  tenantId: string
  onClose: () => void
  onAdd: (c: Cleaner) => void
}) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!form.name.trim()) { setError('Le nom est requis'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/cleaners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tenant_id: tenantId }),
      })
      if (!res.ok) throw new Error(await res.text())
      onAdd(await res.json())
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b" style={{ borderColor: '#e9e3da' }}>
          <h3 className="font-semibold" style={{ color: '#00243f' }}>Ajouter un agent</h3>
        </div>
        <div className="p-5 space-y-4">
          {[
            { key: 'name',  label: 'Nom *',    type: 'text',  placeholder: 'Sophie Martin' },
            { key: 'email', label: 'Email',     type: 'email', placeholder: 'sophie@email.com' },
            { key: 'phone', label: 'Téléphone', type: 'tel',   placeholder: '+33 6 12 34 56 78' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1.5 text-gray-500">{label}</label>
              <input
                type={type}
                value={(form as Record<string, string>)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: '#e9e3da', color: '#00243f' }}
              />
            </div>
          ))}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <div className="p-5 border-t flex justify-end gap-3" style={{ borderColor: '#e9e3da' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: '#e9e3da', color: '#666' }}>
            Annuler
          </button>
          <button
            onClick={submit} disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: '#0097b2' }}
          >
            {saving ? 'Ajout…' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  cleaners,
  onUpdate,
  onChecklist,
}: {
  task: CleaningTask
  cleaners: Cleaner[]
  onUpdate: (id: string, patch: Partial<CleaningTask>) => void
  onChecklist: (task: CleaningTask) => void
}) {
  const [updating, setUpdating] = useState(false)
  const st = STATUS[task.status] || STATUS.pending
  const urgency = urgencyStyle(task.scheduled_date)

  const patch = async (update: Partial<CleaningTask>) => {
    setUpdating(true)
    const res = await fetch(`/api/cleaning-tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update),
    })
    if (res.ok) onUpdate(task.id, update)
    setUpdating(false)
  }

  const checklistDone = (task.checklist || []).filter(Boolean).length

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border overflow-hidden transition-colors"
      style={{
        borderColor: urgency.border || '#e9e3da',
        backgroundColor: urgency.bg || 'white',
      }}
    >
      <div className="flex gap-4 p-4">
        {/* Cover photo */}
        <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden bg-gray-100">
          {task.properties?.cover_image ? (
            <img src={task.properties.cover_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <div>
              <p className="font-semibold text-sm" style={{ color: '#00243f' }}>
                {task.properties?.name || 'Logement inconnu'}
              </p>
              {task.properties?.address && (
                <p className="text-xs text-gray-400 truncate">{task.properties.address}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {urgencyBadge(task.scheduled_date)}
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{ color: st.color, backgroundColor: st.bg }}
              >
                {st.label}
              </span>
            </div>
          </div>

          {/* Date + guest */}
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 mb-3">
            <span>📅 {formatDate(task.scheduled_date)}</span>
            {task.bookings?.guest_name && (
              <span>🧳 Départ : {task.bookings.guest_name}</span>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Agent select */}
            <select
              value={task.cleaner_id || ''}
              onChange={e => patch({ cleaner_id: e.target.value || null })}
              disabled={updating}
              className="text-xs border rounded-lg px-2 py-1.5 bg-white focus:outline-none"
              style={{ borderColor: '#e9e3da', color: '#00243f' }}
            >
              <option value="">👤 Assigner un agent</option>
              {cleaners.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Checklist */}
            <button
              onClick={() => onChecklist(task)}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
              style={{ borderColor: '#e9e3da', color: '#00243f' }}
            >
              ✅ Checklist
              {checklistDone > 0 && (
                <span className="ml-0.5 text-[10px] font-bold" style={{ color: '#0097b2' }}>
                  {checklistDone}/{CHECKLIST_ITEMS.length}
                </span>
              )}
            </button>

            {/* Marquer terminé */}
            {task.status !== 'done' && task.status !== 'cancelled' && (
              <button
                onClick={() => patch({ status: 'done' })}
                disabled={updating}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-white transition-opacity disabled:opacity-60"
                style={{ backgroundColor: '#0097b2' }}
              >
                {updating ? '…' : '✓ Terminé'}
              </button>
            )}

            {/* In progress */}
            {task.status === 'pending' && (
              <button
                onClick={() => patch({ status: 'in_progress' })}
                disabled={updating}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-amber-50"
                style={{ borderColor: '#f59e0b', color: '#b45309' }}
              >
                En cours
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MenagePage({ initialTasks, initialCleaners, tenantId, initialYM }: MenagePageProps) {
  const [tasks,    setTasks]    = useState<CleaningTask[]>(initialTasks)
  const [cleaners, setCleaners] = useState<Cleaner[]>(initialCleaners)
  const [ym, setYM]             = useState(initialYM) // "YYYY-MM"
  const [loading,  setLoading]  = useState(false)
  const [showAddCleaner, setShowAddCleaner] = useState(false)
  const [checklistTask,  setChecklistTask]  = useState<CleaningTask | null>(null)

  const [ymYear, ymMonth] = ym.split('-').map(Number)

  const navigate = async (delta: number) => {
    let m = ymMonth + delta
    let y = ymYear
    if (m > 12) { m = 1; y++ }
    if (m < 1)  { m = 12; y-- }
    const next = `${y}-${String(m).padStart(2, '0')}`
    setYM(next)
    setLoading(true)
    try {
      const res = await fetch(`/api/cleaning-tasks?tenant_id=${tenantId}&date=${next}`)
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  const updateTask = (id: string, patch: Partial<CleaningTask>) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))

  // Grouper par semaine
  const grouped = useMemo(() => {
    const map = new Map<string, CleaningTask[]>()
    for (const t of tasks) {
      const wk = getWeekKey(t.scheduled_date)
      if (!map.has(wk)) map.set(wk, [])
      map.get(wk)!.push(t)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [tasks])

  const counts = {
    total:   tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    done:    tasks.filter(t => t.status === 'done').length,
  }

  return (
    <div className="space-y-8">

      {/* ── Section Équipe ── */}
      <section className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#e9e3da' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: '#e9e3da' }}>
          <h2 className="font-semibold text-sm" style={{ color: '#00243f' }}>
            Équipe de ménage · {cleaners.length} agent{cleaners.length !== 1 ? 's' : ''}
          </h2>
          <button
            onClick={() => setShowAddCleaner(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
            style={{ backgroundColor: '#0097b2' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </button>
        </div>
        <div className="flex flex-wrap gap-3 p-5">
          {cleaners.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Aucun agent pour le moment</p>
          ) : cleaners.map(c => (
            <div
              key={c.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl border"
              style={{ borderColor: '#e9e3da', backgroundColor: '#fafaf9' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: '#00243f' }}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#00243f' }}>{c.name}</p>
                {c.phone && <p className="text-[10px] text-gray-400">{c.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section Tâches ── */}
      <section>
        {/* Header tâches */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-white transition-colors text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-[var(--font-suez)] text-xl min-w-[180px] text-center" style={{ color: '#00243f' }}>
              {MONTHS_FR[ymMonth - 1]} {ymYear}
            </h2>
            <button
              onClick={() => navigate(1)}
              className="p-2 rounded-xl hover:bg-white transition-colors text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Stats rapides */}
          <div className="flex gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-full" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
              {counts.total} tâche{counts.total !== 1 ? 's' : ''}
            </span>
            <span className="px-3 py-1.5 rounded-full" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
              {counts.pending} à faire
            </span>
            <span className="px-3 py-1.5 rounded-full" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
              {counts.done} terminée{counts.done !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="w-6 h-6 animate-spin" style={{ color: '#0097b2' }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          </div>
        ) : grouped.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border" style={{ borderColor: '#e9e3da' }}>
            <p className="text-4xl mb-3">🧹</p>
            <p className="text-gray-400 text-sm">Aucune tâche pour ce mois</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([weekKey, weekTasks]) => (
              <div key={weekKey}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
                  {weekLabel(weekTasks[0].scheduled_date)}
                </p>
                <div className="space-y-3">
                  {weekTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      cleaners={cleaners}
                      onUpdate={updateTask}
                      onChecklist={t => setChecklistTask(t)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modales */}
      {showAddCleaner && (
        <AddCleanerModal
          tenantId={tenantId}
          onClose={() => setShowAddCleaner(false)}
          onAdd={c => { setCleaners(prev => [...prev, c]); setShowAddCleaner(false) }}
        />
      )}
      {checklistTask && (
        <ChecklistModal
          task={checklistTask}
          onClose={() => setChecklistTask(null)}
          onUpdate={(id, patch) => { updateTask(id, patch); setChecklistTask(prev => prev ? { ...prev, ...patch } : null) }}
        />
      )}
    </div>
  )
}
