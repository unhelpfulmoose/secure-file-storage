import { useState, useEffect } from 'react';
import { getFiles, downloadFile } from './api';

interface FileMetadata {
  id: number;
  fileName: string;
  fileType: string;
  uploadAt: string;
}

function UserDashboard() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await getFiles();
      setFiles(response.data);
    } catch {
      setMessage('Could not load files.');
    }
  };

  const handleDownload = async (id: number, fileName: string) => {
    try {
      const response = await downloadFile(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setMessage('Download failed.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h2>File Storage</h2>
      <h3>Available files</h3>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      {files.length === 0 ? (
        <p>No files available.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Uploaded</th>
              <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id}>
                <td style={{ padding: '0.5rem' }}>{file.fileName}</td>
                <td style={{ padding: '0.5rem' }}>{file.fileType}</td>
                <td style={{ padding: '0.5rem' }}>{new Date(file.uploadAt).toLocaleDateString()}</td>
                <td style={{ padding: '0.5rem' }}>
                  <button onClick={() => handleDownload(file.id, file.fileName)}>
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserDashboard;