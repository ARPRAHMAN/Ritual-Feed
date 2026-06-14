import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS
if (contractAddress && contractAddress !== 'YOUR_CONTRACT_ADDRESS' && !contractAddress.startsWith('0x')) {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Inter,sans-serif;flex-direction:column;gap:16px;background:#F8FAFB">
      <h1 style="color:#0F2D4A;font-size:18px;font-weight:600">App not configured</h1>
      <p style="color:#6B7280;font-size:14px">Set VITE_CONTRACT_ADDRESS to a valid 0x address.</p>
    </div>
  `
} else {
  createRoot(document.getElementById('root')!).render(<App />)
}
