// Gallery view that loads and displays each file's content inline.
// Images, video, audio, PDF and text are rendered directly — no need to click Open.
// Clicking the preview opens a larger lightbox view.

import { useState, useEffect } from 'react';
import { getFiles, previewFile, downloadFile, type FileMetadata } from './api';

const isPreviewable = (fileType: string) =>
  fileType.startsWith('image/') ||
  fileType.startsWith('video/') ||
  fileType.startsWith('audio/') ||
  fileType.startsWith('text/') ||
  fileType === 'application/pdf';

function FileCard({ file, onOpen }: { file: FileMetadata; onOpen: () => void }) {
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
      return <img src={objectUrl} alt={file.fileName} draggable={false} onContextMenu={(e) => e.preventDefault()} style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block', userSelect: 'none' }} />;
    }
    if (file.fileType.startsWith('video/') && objectUrl) {
      return <video src={objectUrl} muted playsInline style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block', background: '#000', pointerEvents: 'none' }} />;
    }
    if (file.fileType.startsWith('audio/') && objectUrl) {
      return (
        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <audio src={objectUrl} controls controlsList="nodownload noplaybackrate" onContextMenu={(e) => e.preventDefault()} style={{ width: '100%' }} />
        </div>
      );
    }
    if (file.fileType === 'application/pdf' && objectUrl) {
      return <iframe src={`${objectUrl}#toolbar=0&navpanes=0`} title={file.fileName} style={{ width: '100%', height: '180px', border: 'none', display: 'block', pointerEvents: 'none' }} />;
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

  // Audio keeps its inline player and isn't clickable — clicking would fight the playback controls.
  // Everything else previewable opens the lightbox on click.
  const clickableForOpen = isPreviewable(file.fileType) && !error &&
    !file.fileType.startsWith('audio/');

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: 'var(--surface)' }}>
      {clickableForOpen ? (
        <div
          role="button"
          tabIndex={0}
          onClick={onOpen}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
          aria-label={`Open larger preview of ${file.fileName}`}
          style={{ cursor: 'pointer' }}
        >
          {renderContent()}
        </div>
      ) : renderContent()}
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

function FilePreviewModal({ file, onClose }: { file: FileMetadata; onClose: () => void }) {
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const renderLarge = () => {
    if (loading) return <div style={{ color: '#fff' }}>Loading...</div>;
    if (error) return <div style={{ color: 'salmon' }}>Could not load preview.</div>;
    if (file.fileType.startsWith('image/') && objectUrl) {
      return <img src={objectUrl} alt={file.fileName} draggable={false} onContextMenu={(e) => e.preventDefault()} style={{ maxWidth: '100%', maxHeight: '85vh', display: 'block', userSelect: 'none' }} />;
    }
    if (file.fileType.startsWith('video/') && objectUrl) {
      return <video src={objectUrl} controls controlsList="nodownload noplaybackrate noremoteplayback" disablePictureInPicture autoPlay onContextMenu={(e) => e.preventDefault()} style={{ maxWidth: '100%', maxHeight: '85vh', display: 'block' }} />;
    }
    if (file.fileType.startsWith('audio/') && objectUrl) {
      return <audio src={objectUrl} controls controlsList="nodownload noplaybackrate" autoPlay onContextMenu={(e) => e.preventDefault()} style={{ width: 'min(600px, 90vw)' }} />;
    }
    if (file.fileType === 'application/pdf' && objectUrl) {
      return <iframe src={`${objectUrl}#toolbar=0&navpanes=0`} title={file.fileName} style={{ width: '90vw', height: '85vh', border: 'none', background: '#fff' }} />;
    }
    if (file.fileType.startsWith('text/') && text !== null) {
      return (
        <pre style={{
          margin: 0, padding: '1.5rem', background: '#fff', color: '#000',
          maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          {text}
        </pre>
      );
    }
    return <div style={{ color: '#fff' }}>No preview available.</div>;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview of ${file.fileName}`}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', zIndex: 1000,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'transparent', color: '#fff', border: '1px solid #fff',
          borderRadius: '4px', padding: '0.25rem 0.75rem', cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Close
      </button>
      <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {renderLarge()}
      </div>
    </div>
  );
}

function FileGallery() {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [activeFile, setActiveFile] = useState<FileMetadata | null>(null);

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
          <FileCard key={file.id} file={file} onOpen={() => setActiveFile(file)} />
        ))}
      </div>
      {totalPages > 1 && (
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>Previous</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next</button>
        </div>
      )}
      {activeFile && <FilePreviewModal file={activeFile} onClose={() => setActiveFile(null)} />}
    </div>
  );
}

export default FileGallery;
