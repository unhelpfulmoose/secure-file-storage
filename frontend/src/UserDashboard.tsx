// User dashboard — shown when the logged-in user has the USER role.
// Read-only view: can preview and download files but cannot upload or delete.

import FileGallery from './FileGallery';

interface Props {
  onLogout: () => void;
}

function UserDashboard({ onLogout }: Props) {
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

        <div style={{ flex: 1 }} />

        <div style={{ padding: '1.25rem' }}>
          <button onClick={onLogout} style={{ width: '100%' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' }}>
        <h2>Files</h2>
        <FileGallery />
      </main>

    </div>
  );
}

export default UserDashboard;
