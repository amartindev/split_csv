import { useState } from 'react';

function App() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloadUrls, setDownloadUrls] = useState([]); // Estado para múltiples URLs de descarga
    const [filenames, setFilenames] = useState([]); // Estado para guardar los nombres de archivos
    const [rowsPerFile, setRowsPerFile] = useState(2); // Establece un valor mínimo por defecto
    const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito
    const [downloadingZip, setDownloadingZip] = useState(false); // Estado para el botón de descarga ZIP

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

        const backendUrl = process.env.REACT_APP_BACKEND_URL; // URL del backend desde el .env

        try {
            console.log('Enviando datos al backend:', formData); // Verifica qué se está enviando
            const response = await fetch(`${backendUrl}/upload`, {
                method: 'POST',
                body: formData,
            });

            console.log('Response status:', response.status); // Verifica el código de respuesta
            const result = await response.json();
            console.log('Response body:', result); // Verifica el cuerpo de la respuesta

            if (response.ok) {
                setSuccessMessage(result.message);
                setFilenames(result.filenames); // Guarda los nombres de archivos
                setDownloadUrls(result.filenames.map(filename => `${backendUrl}/download/${filename}`));
            } else {
                setSuccessMessage('Error uploading file.');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setSuccessMessage('Error uploading file.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadAll = async () => {
        if (filenames.length === 0) {
            setSuccessMessage('No hay archivos para descargar');
            return;
        }

        setDownloadingZip(true);
        const backendUrl = process.env.REACT_APP_BACKEND_URL;

        try {
            const response = await fetch(`${backendUrl}/download-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filenames }),
            });

            if (response.ok) {
                // Crea un blob del ZIP y lo descarga
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `all_files_${Date.now()}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                setSuccessMessage('Todos los archivos descargados correctamente');
                // Limpia los estados después de descargar
                setDownloadUrls([]);
                setFilenames([]);
            } else {
                const error = await response.json();
                setSuccessMessage(error.error || 'Error al descargar los archivos');
            }
        } catch (error) {
            console.error('Error downloading ZIP:', error);
            setSuccessMessage('Error al descargar los archivos');
        } finally {
            setDownloadingZip(false);
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
                    <button 
                        className='button_form' 
                        onClick={handleDownloadAll} 
                        disabled={downloadingZip}
                        style={{ marginBottom: '20px' }}
                    >
                        {downloadingZip ? 'Descargando...' : 'Descargar todos (ZIP)'}
                    </button>
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
