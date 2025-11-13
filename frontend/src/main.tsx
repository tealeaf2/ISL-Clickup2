/**
 * Application Entry Point
 * 
 * This is the main entry point for the React application. It:
 * - Initializes the React root and renders the App component
 * - Imports global styles
 * - Wraps the app in StrictMode for development-time checks
 * 
 * StrictMode enables additional React development checks and warnings,
 * such as identifying components with unsafe lifecycles, legacy API usage,
 * and unexpected side effects.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Get the root DOM element where the app will be mounted
// The non-null assertion (!) is safe here because index.html always includes a root div
const rootElement = document.getElementById('root')!

// Create a React root and render the App component
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
