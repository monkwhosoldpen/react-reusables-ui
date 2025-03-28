"use client"

import { ConstituencyTree } from "../../components/common/ConstituencyTree"

export default function ConstituenciesPage() {
  return (
    <div>
      <main className="app-container py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Constituencies</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Browse all constituencies in a hierarchical view
              </p>
            </div>
          </div>

          <ConstituencyTree />
        </div>
      </main>
    </div>
  )
} 