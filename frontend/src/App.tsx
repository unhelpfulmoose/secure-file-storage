// Root component — decides which page to show based on whether the user is logged in
// and what role they have (ADMIN or USER).

import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import UserDashboard from './UserDashboard';
import { logout } from './api';

function App() {
  // Stores the user's role after login. Null means not logged in.
  const [role, setRole] = useState<string | null>(null);

  const handleLogin = (_username: string, role: string) => {
    setRole(role);
  };

  const handleLogout = async () => {
    await logout();
    setRole(null);
  };

  // Not logged in — show the login page
  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  // Admin — show the admin dashboard (upload, download, delete)
  if (role === 'ADMIN') {
    return <Dashboard onLogout={handleLogout} />;
  }

  // Regular user — show the user dashboard (download and preview only)
  return <UserDashboard onLogout={handleLogout} />;
}

export default App;
