import { useState, useEffect } from 'react';
import { getFiles, downloadFile, deleteFile } from './api';
import FilePreview from './FilePreview';

interface FileMetadata {
  id: number;
  fileName: string;
  fileType: string;
  uploadAt: string;
}

interface Props {
  canDelete?: boolean;
}

function FileList({ canDelete = false }: Props) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [previewFile, setPreviewFile] = useState<FileMetadata | null>(null);

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
    <div>
      {previewFile && (
        <FilePreview
          id={previewFile.id}
          fileName={previewFile.fileName}
          fileType={previewFile.fileType}
          onClose={() => setPreviewFile(null)}
        />
      )}
      <h3>Files</h3>
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
                    <button onClick={() => setPreviewFile(file)}>Open</button>
                    <button onClick={() => handleDownload(file.id, file.fileName)}>Download</button>
                    {canDelete && (
                      <button onClick={() => handleDelete(file.id, file.fileName)} style={{ color: 'red' }}>
                        Delete
                      </button>
                    )}
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

export default FileList;
