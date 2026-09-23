import { Component, StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { StoreProvider } from './state/store'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{ padding: 40, fontFamily: 'system-ui' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Something went wrong</h1>
        <pre style={{ marginTop: 12, color: '#dc2626', whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
        <button
          style={{ marginTop: 16, padding: '8px 14px', border: '1px solid #e7e5e4', borderRadius: 6 }}
          onClick={() => {
            try {
              localStorage.clear()
            } catch {
              /* ignore */
            }
            location.reload()
          }}
        >
          Reset demo data and reload
        </button>
      </div>
    )
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <StoreProvider>
          <App />
        </StoreProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
