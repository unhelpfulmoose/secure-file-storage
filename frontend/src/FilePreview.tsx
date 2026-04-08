// Modal overlay that previews a file in the browser without downloading it.
// Supports images, video, audio, PDF, and plain text.
// Clicking outside the modal (the dark backdrop) closes it.

import { useEffect, useState } from 'react';
import { previewFile } from './api';

interface Props {
  id: number;
  fileName: string;
  fileType: string;
  onClose: () => void;  // called when the user closes the preview
}

function FilePreview({ id, fileName, fileType, onClose }: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let url: string;
    previewFile(id)
      .then(async (response) => {
        const blob: Blob = response.data;
        if (fileType.startsWith('text/')) {
          setText(await blob.text());
        } else {
          url = URL.createObjectURL(blob);
          setObjectUrl(url);
        }
      })
      .catch(() => setError('Could not load preview.'));

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [id, fileType]);

  const renderContent = () => {
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (fileType.startsWith('text/')) {
      return text === null
        ? <p>Loading...</p>
        : <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '70vh', overflowY: 'auto' }}>{text}</pre>;
    }
    if (!objectUrl) return <p>Loading...</p>;
    if (fileType.startsWith('image/')) {
      return <img src={objectUrl} alt={fileName} style={{ maxWidth: '100%', maxHeight: '70vh' }} />;
    }
    if (fileType.startsWith('video/')) {
      return <video src={objectUrl} controls style={{ maxWidth: '100%', maxHeight: '70vh' }} />;
    }
    if (fileType.startsWith('audio/')) {
      return <audio src={objectUrl} controls style={{ width: '100%' }} />;
    }
    if (fileType === 'application/pdf') {
      return <iframe src={objectUrl} title={fileName} style={{ width: '100%', height: '70vh', border: 'none' }} />;
    }
    return <p>Preview not available for this file type.</p>;
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '8px', padding: '1.5rem',
          maxWidth: '90vw', width: '800px', maxHeight: '90vh', overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <strong style={{ wordBreak: 'break-all' }}>{fileName}</strong>
          <button onClick={onClose} style={{ marginLeft: '1rem', flexShrink: 0 }}>Close</button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

export default FilePreview;
