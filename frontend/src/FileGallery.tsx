// Gallery view that loads and displays each file's content inline.
// Images, video, audio, PDF and text are rendered directly — no need to click Open.

import { useState, useEffect } from 'react';
import { getFiles, previewFile, downloadFile, type FileMetadata } from './api';

function FileCard({ file }: { file: FileMetadata }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let url: string;
    previewFile(file.id)
      .then(async (response) => {
        const blob = response.data;
        if (file.fileType.startsWith('text/')) {
          setText(await blob.text());
        } else {
          url = URL.createObjectURL(blob);
          setObjectUrl(url);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file.id, file.fileType]);

  const renderContent = () => {
    if (loading) return (
      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    );
    if (error) return (
      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
        Could not load preview.
      </div>
    );
    if (file.fileType.startsWith('image/') && objectUrl) {
      return <img src={objectUrl} alt={file.fileName} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }} />;
    }
    if (file.fileType.startsWith('video/') && objectUrl) {
      return <video src={objectUrl} controls style={{ width: '100%', height: '180px', display: 'block', background: '#000' }} />;
    }
    if (file.fileType.startsWith('audio/') && objectUrl) {
      return (
        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <audio src={objectUrl} controls style={{ width: '100%' }} />
        </div>
      );
    }
    if (file.fileType === 'application/pdf' && objectUrl) {
      return <iframe src={objectUrl} title={file.fileName} style={{ width: '100%', height: '180px', border: 'none', display: 'block' }} />;
    }
    if (file.fileType.startsWith('text/') && text !== null) {
      return (
        <pre style={{ margin: 0, padding: '0.75rem', height: '180px', overflowY: 'auto', fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {text}
        </pre>
      );
    }
    return (
      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No preview available.
      </div>
    );
  };

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface)' }}>
      {renderContent()}
      <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.fileName}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            {new Date(file.uploadAt).toLocaleDateString()}
          </div>
        </div>
        <button
          className="btn-secondary"
          style={{ flexShrink: 0 }}
          onClick={async () => {
            const response = await downloadFile(file.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
          }}
        >
          Download
        </button>
      </div>
    </div>
  );
}

function FileGallery() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    void fetchFiles(page);
  }, [page]);

  const fetchFiles = async (p: number) => {
    setLoading(true);
    try {
      const response = await getFiles(p);
      setFiles(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch {
      // silently fail — no files shown
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (files.length === 0) return <p>No files available.</p>;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
        {files.map(file => (
          <FileCard key={file.id} file={file} />
        ))}
      </div>
      {totalPages > 1 && (
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>Previous</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next</button>
        </div>
      )}
    </div>
  );
}

export default FileGallery;
