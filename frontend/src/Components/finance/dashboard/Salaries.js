// src/pages/Salaries.js
import React, { useEffect, useMemo, useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { api } from '../services/financeApi'
import Modal from './components/Modal'
import Skeleton from './components/Skeleton'
import {
  Search,
  RefreshCcw,
  Plus,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Factory,
  Check
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import '../css/dashboard/salaries.css'

export default function Salaries() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10
  const [createOpen, setCreateOpen] = useState(false)
  const [viewRow, setViewRow] = useState(null)
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [confirmPayrollOpen, setConfirmPayrollOpen] = useState(false)
  const [payrollForm, setPayrollForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseDefault: 100000
  })

  const load = async () => {
    try {
      setLoading(true)
      const data = await api.get('/salaries')
      setRows(data.salaries || [])
    } catch {
      toast.error('Failed to load salaries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let arr = rows || []
    if (search.trim()) {
      const q = search.toLowerCase()
      arr = arr.filter(
        s =>
          (s.employeeID?.name || '').toLowerCase().includes(q) ||
          (s.employeeID?.email || '').toLowerCase().includes(q)
      )
    }
    if (roleFilter !== 'ALL') {
      arr = arr.filter(s => s.employeeID?.role === roleFilter)
    }
    return arr
  }, [rows, search, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const remove = async id => {
    if (!window.confirm('Delete salary record?')) return
    try {
      await api.delete(`/salary/${id}`)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const confirmGeneratePayroll = () => setConfirmPayrollOpen(true)

  const doGeneratePayroll = async staffPayload => {
    try {
      const { month, year } = payrollForm
      await api.post('/salary/generate', {
        month,
        year,
        roles: staffPayload
      })
      toast.success(`Payroll generated for ${month}/${year}`)
      setConfirmPayrollOpen(false)
      load()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Payroll generation failed')
    }
  }

  const exportSalaryPDF = s => {
    const doc = new jsPDF()
    doc.setFontSize(16).text('Employee Payslip', 14, 20)
    doc.setFontSize(12)
    doc.text(`Name: ${s.employeeID?.name || '-'}`, 14, 35)
    doc.text(`Email: ${s.employeeID?.email || '-'}`, 14, 42)
    doc.text(`Month/Year: ${s.month}/${s.year}`, 14, 52)
    autoTable(doc, {
      startY: 65,
      head: [['Component', 'Amount (LKR)']],
      body: [
        ['Base Salary', fmtLKR(s.baseSalary)],
        ['Allowances', fmtLKR(s.allowances || 0)],
        ['Deductions', fmtLKR(s.deductions || 0)],
        ['Net Salary', fmtLKR(s.netSalary || 0)]
      ]
    })
    doc.save(
      `Payslip_${s.employeeID?.name || 'Employee'}_${s.month}-${s.year}.pdf`
    )
  }

  return (
    <div className="salaries-page">
      <Toaster position="top-right" />

      <div className="salaries-head">
        <h2>Salaries</h2>
        <div className="salaries-head-actions">
          <button className="sal-btn sal-btn-refresh" onClick={load}>
            <RefreshCcw size={16} /> Refresh
          </button>
          <button
            className="sal-btn sal-btn-generate"
            onClick={confirmGeneratePayroll}
          >
            <Factory size={16} /> Generate Payroll
          </button>
          <button
            className="sal-btn sal-btn-create"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={16} /> New Salary
          </button>
        </div>
      </div>

      <div className="salaries-toolbar">
        <div className="salaries-filters">
          <div className="salaries-search">
            <Search size={16} />
            <input
              className="salaries-search-input"
              placeholder="Search by employee or email"
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="salaries-role-filter">
            <label className="salaries-role-label" htmlFor="roleSelect">
              Role:
            </label>
            <select
              id="roleSelect"
              className="salaries-role-select"
              value={roleFilter}
              onChange={e => {
                setRoleFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="INVENTORY_MANAGER">Inventory Manager</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="PET_CARE_TAKER">Pet Care Taker</option>
              <option value="FINANCE_MANAGER">Finance Manager</option>
            </select>
          </div>
        </div>
      </div>

      <div className="salaries-card">
        {loading ? (
          <Skeleton rows={8} />
        ) : (
          <>
            <table className="salaries-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Base</th>
                  <th>Month</th>
                  <th>Status</th>
                  <th style={{ width: '220px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="salaries-empty">
                      No records
                    </td>
                  </tr>
                )}
                {pageItems.map(s => (
                  <tr key={s._id || s.employeeID?._id}>
                    <td>
                      <div className="sal-owner">
                        <div className="sal-owner-name">
                          {s.employeeID?.name || '-'}
                        </div>
                        <div className="sal-owner-email">
                          {s.employeeID?.email || '-'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={s.employeeID?.role} />
                    </td>
                    <td className="salaries-mono">
                      {s.baseSalary ? fmtLKR(s.baseSalary) : '-'}
                    </td>
                    <td>{s.month}/{s.year}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      <div className="sal-actions-row">
                        <button
                          className="sal-btn sal-btn-view"
                          onClick={() => setViewRow(s)}
                        >
                          <Eye size={16} /> View
                        </button>

                        <button
                          className="sal-btn sal-btn-pdf"
                          onClick={() => exportSalaryPDF(s)}
                        >
                          <FileDown size={16} /> PDF
                        </button>

                        <button
                          className="sal-btn sal-btn-delete"
                          onClick={() => remove(s._id)}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="salaries-pagination">
              <button
                className="sal-btn sal-btn-refresh"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <div>
                Page {page} of {totalPages}
              </div>
              <button
                className="sal-btn sal-btn-refresh"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {confirmPayrollOpen && (
        <ConfirmPayrollModal
          open={confirmPayrollOpen}
          onClose={() => setConfirmPayrollOpen(false)}
          form={payrollForm}
          setForm={setPayrollForm}
          onGenerate={doGeneratePayroll}
        />
      )}

      {createOpen && (
        <CreateSalaryModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false)
            load()
          }}
        />
      )}

      {viewRow && (
        <ViewSalaryModal
          open={!!viewRow}
          onClose={() => setViewRow(null)}
          s={viewRow}
          onUpdated={load}
        />
      )}
    </div>
  )
}

/* ---------------------- MODALS ---------------------- */

function ConfirmPayrollModal({ open, onClose, form, setForm, onGenerate }) {
  const [roleBases, setRoleBases] = useState({
    SUPER_ADMIN: 100000,
    ADMIN: 100000,
    INVENTORY_MANAGER: 100000,
    RECEPTIONIST: 100000,
    PET_CARE_TAKER: 100000,
    FINANCE_MANAGER: 100000
  })

  const updateRoleBase = (role, val) =>
    setRoleBases(curr => ({ ...curr, [role]: val }))

  const validateAndGenerate = () => {
    if (form.month < 1 || form.month > 12) return toast.error('Month must be 1–12')
    if (form.year < 2000) return toast.error('Year invalid')
    for (const [r, b] of Object.entries(roleBases))
      if (b < 0) return toast.error(`Base salary for ${r} must be non-negative`)
    onGenerate(roleBases)
  }

  const roles = Object.keys(roleBases)

  return (
    <Modal open={open} onClose={onClose} title="Generate Payroll">
      <p>This will generate salary records for all staff roles if not already generated.</p>

      <div className="sal-grid-2">
        <div className="sal-field">
          <label>Month</label>
          <input
            className="sal-input"
            type="number"
            min="1"
            max="12"
            value={form.month}
            onChange={e =>
              setForm(f => ({ ...f, month: Number(e.target.value) }))
            }
          />
        </div>
        <div className="sal-field">
          <label>Year</label>
          <input
            className="sal-input"
            type="number"
            value={form.year}
            onChange={e =>
              setForm(f => ({ ...f, year: Number(e.target.value) }))
            }
          />
        </div>
      </div>

      <table className="salaries-table small">
        <thead><tr><th>Role</th><th>Base Salary</th></tr></thead>
        <tbody>
          {roles.map(role => (
            <tr key={role}>
              <td><RoleBadge role={role} /></td>
              <td>
                <input
                  type="number"
                  min="0"
                  className="sal-input"
                  value={roleBases[role]}
                  onChange={e =>
                    updateRoleBase(role, Number(e.target.value))
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sal-row sal-actions">
        <button className="sal-btn sal-btn-cancel" onClick={onClose}>
          Cancel
        </button>
        <button className="sal-btn sal-btn-save" onClick={validateAndGenerate}>
          <Check size={16} /> Generate
        </button>
      </div>
    </Modal>
  )
}

function CreateSalaryModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({
    employeeID: '',
    baseSalary: 100000,
    allowances: 0,
    deductions: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const save = async () => {
    if (form.baseSalary < 0) return toast.error('Base salary must be non‑negative.')
    try {
      await api.post('/salary', { ...form })
      toast.success('Created')
      onSaved?.()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Create failed')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New Salary">
      <div className="sal-grid-2">
        <div className="sal-field">
          <label>Employee ID</label>
          <input
            className="sal-input"
            value={form.employeeID}
            onChange={e => set('employeeID', e.target.value)}
          />
        </div>
        <div className="sal-field">
          <label>Base salary</label>
          <input
            className="sal-input"
            type="number"
            value={form.baseSalary}
            onChange={e => set('baseSalary', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="sal-grid-2">
        <div className="sal-field">
          <label>Month</label>
          <input
            className="sal-input"
            type="number"
            min="1"
            max="12"
            value={form.month}
            onChange={e => set('month', Number(e.target.value))}
          />
        </div>
        <div className="sal-field">
          <label>Year</label>
          <input
            className="sal-input"
            type="number"
            value={form.year}
            onChange={e => set('year', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="sal-row sal-actions">
        <button className="sal-btn sal-btn-cancel" onClick={onClose}>
          Cancel
        </button>
        <button className="sal-btn sal-btn-save" onClick={save}>
          Create
        </button>
      </div>
    </Modal>
  )
}

function ViewSalaryModal({ open, onClose, s, onUpdated }) {
  const [form, setForm] = useState({
    allowances: s.allowances || 0,
    deductions: s.deductions || 0,
    status: s.status
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const save = async () => {
    try {
      await api.put(`/salary/${s._id}`, form)
      toast.success('Updated')
      onUpdated?.()
      onClose()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Salary Details — ${s.employeeID?.name || ''}`}
    >
      <p><b>Base:</b> {fmtLKR(s.baseSalary)}</p>

      <p><b>Allowances:</b></p>
      <input
        className="sal-input"
        type="number"
        value={form.allowances}
        onChange={e => set('allowances', Number(e.target.value))}
      />

      <p><b>Deductions:</b></p>
      <input
        className="sal-input"
        type="number"
        value={form.deductions}
        onChange={e => set('deductions', Number(e.target.value))}
      />

      <p><b>Net Salary:</b> {fmtLKR(s.baseSalary + form.allowances - form.deductions || 0)}</p>

      <p><b>Status:</b></p>
      <select
        className="sal-input"
        value={form.status}
        onChange={e => set('status', e.target.value)}
      >
        <option>Pending</option>
        <option>Paid</option>
      </select>

      <div className="sal-row sal-actions">
        <button className="sal-btn sal-btn-cancel" onClick={onClose}>
          Close
        </button>
        <button className="sal-btn sal-btn-save" onClick={save}>
          <Check size={16} /> Save
        </button>
      </div>
    </Modal>
  )
}

/* ------------------- Small Helper Components ------------------- */

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase()
  let cls = 'tag-pill'
  if (s === 'paid') cls += ' green'
  else if (s === 'pending') cls += ' yellow'
  else cls += ' gray'
  return <span className={cls}>{status}</span>
}

function RoleBadge({ role }) {
  if (!role) return <span className="sl-tag-pill gray">Unknown</span>
  const map = {
    ADMIN: 'purple',
    INVENTORY_MANAGER: 'blue',
    RECEPTIONIST: 'yellow',
    PET_CARE_TAKER: 'green',
    FINANCE_MANAGER: 'orange',
    SUPER_ADMIN: 'red'
  }
  const cls = 'sl-tag-pill ' + (map[role] || 'gray')
  return <span className={cls}>{role.replace('_', ' ')}</span>
}

/* ------------------- Utils ------------------- */
function fmtLKR(n) {
  try {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(Number(n) || 0)
  } catch {
    return `LKR ${Number(n || 0).toFixed(2)}`
  }
}