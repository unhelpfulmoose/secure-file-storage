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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchFiles(page);
  }, [page]);

  const fetchFiles = async (p: number) => {
    try {
      const response = await getFiles(p);
      setFiles(response.data.content);
      setTotalPages(response.data.totalPages);
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
        <>
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
                    <button onClick={() => handleDownload(file.id, file.fileName)}>Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>Previous</button>
              <span>Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UserDashboard;
