import { useState, useEffect } from 'react';
import { getFiles, uploadFile, downloadFile } from './api';

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

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }
    try {
      await uploadFile(selectedFile);
      setMessage('File uploaded successfully!');
      setSelectedFile(null);
      fetchFiles();
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
    </div>
  );
}

export default Dashboard;