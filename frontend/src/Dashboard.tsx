import { useState, useEffect } from 'react';
import { getFiles, uploadFile, downloadFile, deleteFile } from './api';

interface FileMetadata {
  id: number;
  fileName: string;
  fileType: string;
  uploadAt: string;
}

function Dashboard() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }
    try {
      await uploadFile(selectedFile);
      setMessage('File uploaded successfully!');
      setSelectedFile(null);
      fetchFiles(page);
    } catch {
      setMessage('Upload failed. Make sure you are logged in as admin.');
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

  const handleDelete = async (id: number, fileName: string) => {
    if (!window.confirm(`Delete "${fileName}"?`)) return;
    try {
      await deleteFile(id);
      fetchFiles(page);
    } catch {
      setMessage('Delete failed.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h2>Admin Dashboard</h2>
      <div style={{ marginBottom: '2rem' }}>
        <h3>Upload file</h3>
        <input
          type="file"
          onChange={e => setSelectedFile(e.target.files?.[0] || null)}
          style={{ marginBottom: '1rem', display: 'block' }}
        />
        <button onClick={handleUpload} style={{ padding: '0.5rem 1rem' }}>
          Upload
        </button>
        {message && <p style={{ color: 'green', marginTop: '0.5rem' }}>{message}</p>}
      </div>
      <div>
        <h3>Files</h3>
        {files.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Uploaded</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map(file => (
                  <tr key={file.id}>
                    <td style={{ padding: '0.5rem' }}>{file.fileName}</td>
                    <td style={{ padding: '0.5rem' }}>{file.fileType}</td>
                    <td style={{ padding: '0.5rem' }}>{new Date(file.uploadAt).toLocaleDateString()}</td>
                    <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleDownload(file.id, file.fileName)}>Download</button>
                      <button onClick={() => handleDelete(file.id, file.fileName)} style={{ color: 'red' }}>Delete</button>
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
    </div>
  );
}

export default Dashboard;
