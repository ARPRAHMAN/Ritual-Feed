import React, { useState } from 'react'
import { X } from 'lucide-react'
import { AgentStatusContent } from './AgentStatusPanel'

interface MobileStatusSheetProps {
  cycleCount: number | null
  lastUpdated: Date | null
}

export function MobileStatusBar({ cycleCount, lastUpdated }: MobileStatusSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </div>
          <span className="text-sm text-slate-900 dark:text-white font-medium">
            {cycleCount != null ? `Cycle #${cycleCount}` : 'Connecting...'}
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
          aria-label="View agent status"
        >
          Agent Status ↑
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity duration-250 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 bg-slate-50 dark:bg-slate-950 rounded-t-2xl z-50 transition-transform duration-300 ease-out max-h-[85vh] overflow-y-auto ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Agent Status panel"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Agent Status</h2>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close agent status"
            >
              <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          <AgentStatusContent lastUpdated={lastUpdated} />
          <div className="h-8" />
        </div>
      </div>
    </>
  )
}
