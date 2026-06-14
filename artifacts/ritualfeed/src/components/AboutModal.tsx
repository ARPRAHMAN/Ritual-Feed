import React, { useState } from 'react'
import { EXPLORER_URL, CONTRACT_ADDRESS } from '../config'

export function AboutModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-[#6B7280] hover:text-[#0F2D4A] transition-colors"
      >
        About
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 z-10">
            <div className="flex items-start justify-between mb-5">
              <h2 className="text-lg font-bold text-[#0F2D4A]">How RitualFeed works</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#6B7280]"
                aria-label="Close about modal"
              >
                ✕
              </button>
            </div>

            <section className="mb-5">
              <h3 className="text-sm font-semibold text-[#0F2D4A] mb-2">The Agent</h3>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                RitualFeed is powered by an autonomous agent running on Ritual Chain. The agent wakes every 100 blocks (~35 seconds),
                fetches new AI papers from arXiv, scores each abstract with a fine-tuned ML model running on the ONNX precompile,
                and summarises the top 5 papers using an on-chain LLM. It pays its own compute costs from its RitualWallet and
                revives itself automatically if it ever goes down.
              </p>
            </section>

            <section className="mb-5">
              <h3 className="text-sm font-semibold text-[#0F2D4A] mb-3">The Stack</h3>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {[
                    ['Paper fetching', 'Ritual HTTP precompile (0x0801)'],
                    ['Relevance scoring', 'ONNX precompile (0x0800) — fine-tuned MiniLM'],
                    ['Summarisation', 'LLM precompile (0x0802)'],
                    ['Scheduling', 'Ritual Scheduler contract'],
                    ['Fee payment', 'RitualWallet system contract'],
                    ['Frontend', 'React + wagmi + Ritual Chain'],
                  ].map(([feature, impl]) => (
                    <tr key={feature} className="border-b border-[#F1F5F9] last:border-0">
                      <td className="py-2 pr-4 text-[#6B7280] font-medium w-2/5">{feature}</td>
                      <td className="py-2 text-[#0F2D4A]">{impl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-[#0F2D4A] mb-2">Links</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#1A6FB0] hover:underline"
                >
                  View contract →
                </a>
                <a
                  href="https://docs.ritualfoundation.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#1A6FB0] hover:underline"
                >
                  Ritual Chain docs →
                </a>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  )
}
