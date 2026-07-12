"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  departmentId: string | null
  department?: { name: string } | null
}

type Factor = {
  id: string
  name: string
  scope: string
  unit: string
  factor: number
}

type Dept = { id: string; name: string }

export function AdminPanel({
  users,
  factors,
  departments,
}: {
  users: UserRow[]
  factors: Factor[]
  departments: Dept[]
}) {
  const router = useRouter()
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState(false)

  async function updateRole(userId: string, role: string, departmentId: string | null) {
    setBusy(true)
    setErr("")
    setMsg("")
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role, departmentId }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || "Failed to update user")
      }
      setMsg("User updated")
      router.refresh()
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed")
    } finally {
      setBusy(false)
    }
  }

  async function addFactor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setErr("")
    setMsg("")
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/admin/emission-factors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          scope: fd.get("scope"),
          unit: fd.get("unit"),
          factor: Number(fd.get("factor")),
          keywords: String(fd.get("keywords") || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(typeof d.error === "string" ? d.error : "Failed to create factor")
      }
      setMsg("Emission factor created")
      e.currentTarget.reset()
      router.refresh()
    } catch (e2: unknown) {
      setErr(e2 instanceof Error ? e2.message : "Failed")
    } finally {
      setBusy(false)
    }
  }

  async function publishPolicy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setErr("")
    setMsg("")
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/admin/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fd.get("title"),
          body: fd.get("body"),
          mandatory: fd.get("mandatory") === "on",
          ackDeadline: fd.get("ackDeadline"),
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(typeof d.error === "string" ? d.error : "Failed to publish")
      }
      setMsg("Policy published")
      e.currentTarget.reset()
      router.refresh()
    } catch (e2: unknown) {
      setErr(e2 instanceof Error ? e2.message : "Failed")
    } finally {
      setBusy(false)
    }
  }

  const input =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
  const label = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"

  return (
    <div className="space-y-8">
      {(msg || err) && (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            err
              ? "bg-red-50 text-red-700 dark:bg-red-900/30"
              : "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30"
          }`}
        >
          {err || msg}
        </p>
      )}

      {/* Users */}
      <section className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Users & roles
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Department</th>
                <th className="py-2">Save</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRoleRow
                  key={u.id}
                  user={u}
                  departments={departments}
                  disabled={busy}
                  onSave={updateRole}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Emission factors */}
      <section className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          Emission factors
        </h3>
        <p className="mb-4 text-sm text-gray-500">
          {factors.length} factors in catalog. Add more for AI mapping.
        </p>
        <ul className="mb-4 max-h-40 space-y-1 overflow-y-auto text-xs text-gray-600 dark:text-gray-400">
          {factors.map((f) => (
            <li key={f.id}>
              {f.name} · {f.scope} · {f.factor} kgCO2e/{f.unit}
            </li>
          ))}
        </ul>
        <form onSubmit={addFactor} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>Name</label>
            <input name="name" required className={input} placeholder="Diesel (fleet)" />
          </div>
          <div>
            <label className={label}>Scope</label>
            <select name="scope" className={input} defaultValue="Scope 1">
              <option>Scope 1</option>
              <option>Scope 2</option>
              <option>Scope 3</option>
            </select>
          </div>
          <div>
            <label className={label}>Unit</label>
            <input name="unit" required className={input} placeholder="L" />
          </div>
          <div>
            <label className={label}>Factor (kgCO2e per unit)</label>
            <input name="factor" type="number" step="any" required className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Keywords (comma-separated)</label>
            <input name="keywords" className={input} placeholder="diesel, fuel" />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 sm:col-span-2"
          >
            Add emission factor
          </button>
        </form>
      </section>

      {/* Publish policy */}
      <section className="rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Publish policy
        </h3>
        <form onSubmit={publishPolicy} className="space-y-3">
          <div>
            <label className={label}>Title</label>
            <input name="title" required className={input} />
          </div>
          <div>
            <label className={label}>Body</label>
            <textarea name="body" required rows={4} className={input} />
          </div>
          <div>
            <label className={label}>Acknowledgement deadline</label>
            <input
              name="ackDeadline"
              type="date"
              required
              className={input}
              defaultValue={new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input name="mandatory" type="checkbox" defaultChecked />
            Mandatory for employees
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Publish policy
          </button>
        </form>
      </section>
    </div>
  )
}

function UserRoleRow({
  user,
  departments,
  disabled,
  onSave,
}: {
  user: UserRow
  departments: Dept[]
  disabled: boolean
  onSave: (id: string, role: string, deptId: string | null) => void
}) {
  const [role, setRole] = useState(user.role)
  const [deptId, setDeptId] = useState(user.departmentId || "")

  return (
    <tr className="border-t dark:border-gray-800">
      <td className="py-2 pr-3 font-medium text-gray-900 dark:text-white">{user.name}</td>
      <td className="py-2 pr-3 text-gray-500">{user.email}</td>
      <td className="py-2 pr-3">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded border px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="ADMIN">ADMIN</option>
          <option value="MANAGER">MANAGER</option>
          <option value="AUDITOR">AUDITOR</option>
          <option value="EMPLOYEE">EMPLOYEE</option>
        </select>
      </td>
      <td className="py-2 pr-3">
        <select
          value={deptId}
          onChange={(e) => setDeptId(e.target.value)}
          className="rounded border px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="">None</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSave(user.id, role, deptId || null)}
          className="rounded bg-gray-900 px-2 py-1 text-xs text-white dark:bg-gray-200 dark:text-gray-900"
        >
          Save
        </button>
      </td>
    </tr>
  )
}
