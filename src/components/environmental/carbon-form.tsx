"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function CarbonForm({ emissionFactors, departments }: { emissionFactors: any[], departments: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const data = {
      source: formData.get("source"),
      description: formData.get("description"),
      quantity: Number(formData.get("quantity")),
      emissionFactorId: formData.get("emissionFactorId"),
      departmentId: formData.get("departmentId") || undefined
    }

    try {
      const res = await fetch("/api/carbon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : body.error?.message || "Failed to add transaction"
        )
      }

      router.refresh()
      e.currentTarget.reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Log Manual Carbon Transaction</h3>
      
      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Source Type</label>
          <select name="source" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
            <option value="PURCHASE">Purchase</option>
            <option value="MANUFACTURING">Manufacturing</option>
            <option value="EXPENSE">Expense</option>
            <option value="FLEET">Fleet</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emission Factor</label>
          <select name="emissionFactorId" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
            <option value="">Select a factor...</option>
            {emissionFactors.map(ef => (
              <option key={ef.id} value={ef.id}>{ef.name} ({ef.unit})</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
          <input type="number" step="any" name="quantity" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department (Optional)</label>
          <select name="departmentId" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
            <option value="">Org-wide</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <input type="text" name="description" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" placeholder="e.g. Monthly electricity bill for HQ" />
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50">
        {loading ? "Logging..." : "Log Transaction"}
      </button>
    </form>
  )
}
