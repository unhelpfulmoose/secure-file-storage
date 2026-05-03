// Admin dashboard with left sidebar navigation.
// Sections: Overview (stats + recent activity), Files, Users, Audit Log.

import { useState, useEffect, useRef } from 'react';
import { uploadFile, getFiles, getUsers, getAuditLog } from './api';
import FileList from './FileList';
import UserManagement from './UserManagement';
import AuditLogView from './AuditLogView';

type View = 'overview' | 'files' | 'users' | 'audit';

interface Props {
  onLogout: () => void;
}

// Stat card

function StatCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '1.25rem 1.75rem',
      minWidth: '130px',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
        {label}
      </div>
    </div>
  );
}

// Overview

interface AuditEntry {
  id: number;
  action: string;
  username: string | null;
  details: string | null;
  ip: string | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  LOGIN_FAILURE: 'orange',
  UPLOAD_REJECTED: 'orange',
  ACCESS_DENIED: 'red',
  INVALID_TOKEN: 'red',
  REVOKED_TOKEN: 'red',
  USER_CREATION_FAILED: 'orange',
  FILE_DELETE: 'orange',
  USER_DELETED: 'orange',
};

function Overview() {
  const [fileCount, setFileCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [recentEvents, setRecentEvents] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFiles(0, 1),
      getUsers(),
      getAuditLog(0, 5),
    ])
      .then(([filesRes, usersRes, auditRes]) => {
        setFileCount(filesRes.data.totalElements);
        setUserCount(usersRes.data.length);
        setRecentEvents(auditRes.data.content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Overview</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <StatCard label="Files" value={fileCount} />
        <StatCard label="Users" value={userCount} />
      </div>

      <h3>Recent activity</h3>
      {loading ? (
        <p>Loading...</p>
      ) : recentEvents.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Action</th>
              <th>User</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {recentEvents.map(entry => (
              <tr key={entry.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {new Date(entry.createdAt).toLocaleString()}
                </td>
                <td style={{ color: ACTION_COLORS[entry.action] ?? 'green', fontWeight: 500 }}>
                  {entry.action}
                </td>
                <td>{entry.username ?? '—'}</td>
                <td>{entry.ip ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Files section

function FilesSection() {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [draggingOver, setDraggingOver] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const onDragEnter = () => {
      dragCounter.current++;
      setDraggingOver(true);
    };
    const onDragLeave = () => {
      dragCounter.current--;
      if (dragCounter.current === 0) setDraggingOver(false);
    };
    const onDragOver = (e: DragEvent) => e.preventDefault();
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setDraggingOver(false);
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);

    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    setUploading(true);
    setMessage('');
    const results = await Promise.allSettled(fileArray.map(f => uploadFile(f)));
    const failed = results.filter(r => r.status === 'rejected').length;
    setRefreshKey(k => k + 1);
    setUploading(false);
    if (failed === 0) {
      setMessage(`${fileArray.length} file${fileArray.length > 1 ? 's' : ''} uploaded successfully!`);
    } else {
      setMessage(`${fileArray.length - failed} uploaded, ${failed} failed.`);
    }
  };

  return (
    <div>
      {draggingOver && (
        <div
          onDrop={e => {
            e.preventDefault();
            dragCounter.current = 0;
            setDraggingOver(false);
            void handleFiles(e.dataTransfer.files);
          }}
          onDragOver={e => e.preventDefault()}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(59,130,246,0.1)',
            border: '3px dashed var(--accent)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--accent)',
            pointerEvents: 'all',
          }}
        >
          Drop files to upload
        </div>
      )}

      <h2>Files</h2>
      <div style={{ marginBottom: '2rem' }}>
        <h3>Upload</h3>
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed var(--border)',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '1rem',
          cursor: 'pointer',
          color: 'var(--text-muted)',
        }}>
          <span style={{ marginBottom: '0.4rem' }}>Click to select files, or drag and drop anywhere on the page</span>
          <span style={{ fontSize: '0.8rem' }}>PDF, images, text, audio, video — max 10 MB each</span>
          <input
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files) void handleFiles(e.target.files); }}
          />
        </label>
        {uploading && <p>Uploading...</p>}
        {message && (
          <p style={{ color: message.includes('failed') ? 'red' : 'green', marginTop: '0.5rem' }}>
            {message}
          </p>
        )}
      </div>
      <FileList canDelete showUploader refreshKey={refreshKey} />
    </div>
  );
}

// Sidebar nav

const NAV_ITEMS: { id: View; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'files',    label: 'Files' },
  { id: 'users',    label: 'Users' },
  { id: 'audit',    label: 'Audit Log' },
];

function NavItem({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: active ? 'var(--bg)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text)',
        border: 'none',
        borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
        borderRadius: 0,
        padding: '0.65rem 1.25rem',
        fontWeight: active ? 600 : 400,
        fontSize: '0.9rem',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

// Dashboard

function Dashboard({ onLogout }: Props) {
  const [activeView, setActiveView] = useState<View>('overview');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Sidebar */}
      <nav style={{
        width: '200px',
        flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '1.5rem',
      }}>
        <div style={{
          padding: '0 1.25rem',
          marginBottom: '2rem',
          fontWeight: 700,
          fontSize: '0.95rem',
          color: 'var(--accent)',
          letterSpacing: '0.03em',
        }}>
          SecureFiles
        </div>

        <div style={{ flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.id}
              label={item.label}
              active={activeView === item.id}
              onClick={() => setActiveView(item.id)}
            />
          ))}
        </div>

        <div style={{ padding: '1.25rem' }}>
          <button onClick={onLogout} style={{ width: '100%' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
        {activeView === 'overview' && <Overview />}
        {activeView === 'files'    && <FilesSection />}
        {activeView === 'users'    && <UserManagement />}
        {activeView === 'audit'    && <AuditLogView />}
      </main>

    </div>
  );
}

export default Dashboard;
