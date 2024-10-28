import { useState } from 'react'

function App() {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [downloadUrl, setDownloadUrl] = useState('')

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('file', file)

        setLoading(true) // Iniciar el indicador de carga

        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json() // Cambiar a JSON
            alert(result.message) // Mensaje de éxito

            // Establecer la URL para descargar el archivo
            setDownloadUrl(`http://localhost:3001/download/${result.filename}`)
        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Error uploading file.')
        } finally {
            setLoading(false) // Detener el indicador de carga
        }
    }

    return (
        <div>
            <h1>Upload CSV</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit" disabled={loading}>
                    Upload
                </button>
            </form>
            {loading && <p>Uploading file...</p>}
            {downloadUrl && (
                <a href={downloadUrl} download>
                    Download created CSV
                </a>
            )}
        </div>
    )
}

export default App
