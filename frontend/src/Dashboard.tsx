import { useState } from 'react';
import { uploadFile } from './api';
import FileList from './FileList';

interface Props {
  onLogout: () => void;
}

function Dashboard({ onLogout }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file first.');
      return;
    }
    try {
      await uploadFile(selectedFile);
      setMessage('File uploaded successfully!');
      setSelectedFile(null);
    } catch {
      setMessage('Upload failed.');
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
        <button onClick={handleUpload} style={{ padding: '0.5rem 1rem' }}>Upload</button>
        {message && <p style={{ color: 'green', marginTop: '0.5rem' }}>{message}</p>}
      </div>
      <FileList canDelete />
    </div>
  );
}

export default Dashboard;
