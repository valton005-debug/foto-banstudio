import { useState } from 'react'

function UploadPage({ apiKey }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleUpload = async () => {
    if (!file) {
      setError('Ju lutem zgjidhni një file')
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(
        `https://media-upload.YOUR_SUBDOMAIN.workers.dev/upload/${apiKey}`,
        {
          method: 'POST',
          body: formData
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload dështoi')
      }

      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          📸 Upload Foto
        </h2>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-400 transition">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer block"
          >
            <div className="text-6xl mb-4">📁</div>
            <p className="text-gray-600 font-medium mb-2">
              Kliko për të zgjedhur një file
            </p>
            <p className="text-gray-400 text-sm">
              JPG, PNG, GIF, MP4 (Maksimum 50MB)
            </p>
          </label>
        </div>

        {file && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">
              <span className="font-medium">File i zgjedhur:</span>{' '}
              {file.name}
            </p>
            <p className="text-gray-500 text-sm">
              <span className="font-medium">Sasi:</span>{' '}
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="mt-6 w-full bg-black text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? '⏳ Duke uploaduar...' : '📤 Upload Foto'}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-center font-medium">❌ {error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl">
            <h3 className="text-xl font-semibold text-green-800 mb-4">
              ✅ Upload u bë me sukses!
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">File:</span>{' '}
                  {result.key.split('/').pop()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Link:</span>
                </p>
                <a
                  href={result.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  {result.downloadUrl}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadPage
