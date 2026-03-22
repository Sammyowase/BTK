import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#ffffff',
            border: '1px solid #E4E4E4',
            color: '#09293d',
            boxShadow: '0 20px 50px rgba(13, 54, 77, 0.12)',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
