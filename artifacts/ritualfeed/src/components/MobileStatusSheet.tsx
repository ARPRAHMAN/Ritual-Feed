import React, { useState } from 'react'
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] px-4 py-3 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </div>
          <span className="text-sm text-[#0F2D4A] font-medium">
            {cycleCount != null ? `Cycle #${cycleCount}` : 'Connecting...'}
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-[#1A6FB0] font-medium"
          aria-label="View agent status"
        >
          Agent Status
        </button>
      </div>

      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity duration-250 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      {/* Bottom sheet */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 bg-[#F8FAFB] rounded-t-2xl z-50 transition-transform duration-300 ease-out max-h-[80vh] overflow-y-auto ${open ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#0F2D4A]">Agent Status</h2>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              aria-label="Close agent status"
            >
              <svg className="w-5 h-5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <AgentStatusContent lastUpdated={lastUpdated} />
          <div className="h-6" />
        </div>
      </div>
    </>
  )
}
