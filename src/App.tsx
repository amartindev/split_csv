import { useState } from 'react';

function App() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloadUrls, setDownloadUrls] = useState([]); // Estado para múltiples URLs de descarga
    const [rowsPerFile, setRowsPerFile] = useState();
    const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleRowsChange = (e) => {
        setRowsPerFile(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('rowsPerFile', rowsPerFile);

        setLoading(true);
        setSuccessMessage(''); // Resetea el mensaje de éxito

        try {
            const response = await fetch('http://localhost:3001/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

            const result = await response.json();
            setSuccessMessage(result.message); // Muestra el mensaje en la página

            // Genera las URLs de descarga para cada archivo generado
            setDownloadUrls(result.filenames.map(filename => `http://localhost:3001/download/${filename}`));
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
                <input type="file" onChange={handleFileChange} />
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
