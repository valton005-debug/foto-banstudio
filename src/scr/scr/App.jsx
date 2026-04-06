import { useState } from 'react'
import UploadPage from './UploadPage.jsx'
import AdminPage from './AdminPage.jsx'

function App() {
  const [view, setView] = useState('upload') // 'upload' | 'admin'
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '')

  const handleSetApiKey = (key) => {
    setApiKey(key)
    localStorage.setItem('apiKey', key)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            🎊 Platformë Upload Foto
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setView('upload')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                view === 'upload'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Guest Upload
            </button>
            <button
              onClick={() => setView('admin')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                view === 'admin'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {view === 'upload' ? (
          <UploadPage apiKey={apiKey} />
        ) : (
          <AdminPage apiKey={apiKey} />
        )}
      </main>
    </div>
  )
}

export default App
