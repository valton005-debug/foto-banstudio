import { useState, useEffect } from 'react'

function AdminPage({ apiKey }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newKey, setNewKey] = useState('')

  useEffect(() => {
    if (apiKey) {
      fetchFiles()
    }
  }, [apiKey])

  const fetchFiles = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `https://media-upload.YOUR_SUBDOMAIN.workers.dev/list/${apiKey}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gabim në marrjen e files')
      }

      setFiles(data.files || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (filename) => {
    if (!confirm(`A jeni i sigurt që doni të fshini: ${filename}?`)) {
      return
    }

    try {
      const response = await fetch(
        `https://media-upload.YOUR_SUBDOMAIN.workers.dev/delete/${apiKey}/${filename}`,
        {
          method: 'DELETE'
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Fshirja dështoi')
      }

      // Refresh list
      fetchFiles()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreateKey = () => {
    if (!newKey.trim()) {
      alert('Ju lutem vendosni një API Key të ri')
      return
    }

    setApiKey(newKey)
    localStorage.setItem('apiKey', newKey)
    setNewKey('')
    alert('API Key u krijua me sukses!')
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          🔑 Admin Panel
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              API Key e Aktualë (Për upload)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="TOKEN-IM-TUAJ"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-gray-700 font-medium mb-2">
              Krijo API Key të Ri
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="TOKEN-IM-RI"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button
                onClick={handleCreateKey}
                className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
              >
                Krijo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            📁 Foto e Uploaduara
          </h2>
          <span className="text-gray-600">
            {files.length} foto të uploaduara
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="mt-4 text-gray-600">Duke ngarkuar...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center font-medium">❌ {error}</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nuk ka foto të uploaduara</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <div
                key={file.key}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl">🖼️</span>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 truncate">
                    {file.key.split('/').pop()}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(file.uploaded).toLocaleDateString('sq-AL')}
                  </p>
                  <button
                    onClick={() => handleDelete(file.key.split('/').pop())}
                    className="mt-3 w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    Fshi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage
