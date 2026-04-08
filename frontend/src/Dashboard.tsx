// Admin dashboard — shown when the logged-in user has the ADMIN role.
// Includes a file upload form and the full file list with delete access.

import { useState } from 'react';
import { uploadFile } from './api';
import FileList from './FileList';

interface Props {
  onLogout: () => void;
}

function Dashboard({ onLogout }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);  // incrementing this triggers a file list reload

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }
    setUploading(true);
    setMessage('');
    try {
      await uploadFile(selectedFile);
      setMessage('File uploaded successfully!');
      setSelectedFile(null);
      setRefreshKey(k => k + 1);  // auto-refresh the file list after upload
    } catch {
      setMessage('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin Dashboard</h2>
        <button onClick={onLogout}>Logout</button>
      </div>
      <div style={{ marginBottom: '2rem' }}>
        <h3>Upload file</h3>
        <input
          type="file"
          onChange={e => setSelectedFile(e.target.files?.[0] || null)}
          style={{ marginBottom: '1rem', display: 'block' }}
        />
        <button onClick={handleUpload} disabled={uploading} style={{ padding: '0.5rem 1rem' }}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {message && (
          <p style={{ color: message.includes('failed') ? 'red' : 'green', marginTop: '0.5rem' }}>
            {message}
          </p>
        )}
      </div>
      <FileList canDelete refreshKey={refreshKey} />
    </div>
  );
}

export default Dashboard;
