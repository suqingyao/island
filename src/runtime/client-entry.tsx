import { createRoot } from 'react-dom/client'
import App from './App'

function renderInBrowser() {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('#root element not found')
  }
  createRoot(rootElement).render(<App />)
}

renderInBrowser()
