import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import App from './App.tsx'
import AdminApp from './admin/AdminApp.tsx'
import BrandPreview from './pages/BrandPreview.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/brand" element={<BrandPreview />} />
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<App />} />
    </Routes>
  </BrowserRouter>,
)
