import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { ChildrenProvider } from './contexts/ChildrenContext'
import { AssessmentProvider } from './contexts/AssessmentContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChildrenProvider>
          <AssessmentProvider>
            <App />
          </AssessmentProvider>
        </ChildrenProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
