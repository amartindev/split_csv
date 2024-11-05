import { useState } from 'react';

function App() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloadUrls, setDownloadUrls] = useState([]); // Estado para múltiples URLs de descarga
    const [rowsPerFile, setRowsPerFile] = useState(2); // Establece un valor mínimo por defecto
    const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleRowsChange = (e) => {
        setRowsPerFile(Number(e.target.value)); // Convierte el valor a número
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('rowsPerFile', rowsPerFile - 1); // Resta 1 al número de filas

        setLoading(true);
        setSuccessMessage(''); // Resetea el mensaje de éxito

        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'; // Cambia a la URL del backend

        try {
            const response = await fetch(`${backendUrl}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

            const result = await response.json();
            setSuccessMessage(result.message); // Muestra el mensaje en la página

            // Genera las URLs de descarga para cada archivo generado
            setDownloadUrls(result.filenames.map(filename => `${backendUrl}/download/${filename}`));
        } catch (error) {
            console.error('Error uploading file:', error);
            setSuccessMessage('Error uploading file.'); // Muestra un mensaje de error en la página
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Upload CSV</h1>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} accept=".csv" /> {/* Acepta solo archivos CSV */}
                <input
                    type="number"
                    value={rowsPerFile}
                    onChange={handleRowsChange}
                    placeholder="Rows per file"
                    min="2"
                />
                <button className='button_form' type="submit" disabled={loading}>
                    Upload
                </button>
            </form>
            {loading && <p>Uploading file...</p>}
            {successMessage && <p>{successMessage}</p>} {/* Muestra el mensaje de éxito o error */}
            {downloadUrls.length > 0 && (
                <div>
                    <h2>Download Files</h2>
                    <ul>
                        {downloadUrls.map((url, index) => (
                            <li key={index}>
                                <a href={url} download>
                                    Download part {index + 1}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default App;
