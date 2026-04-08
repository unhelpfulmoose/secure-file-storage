// User dashboard — shown when the logged-in user has the USER role.
// Read-only view: can preview and download files but cannot upload or delete.

import FileList from './FileList';

interface Props {
  onLogout: () => void;
}

function UserDashboard({ onLogout }: Props) {
  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>File Storage</h2>
        <button onClick={onLogout}>Logout</button>
      </div>
      <FileList />
    </div>
  );
}

export default UserDashboard;
