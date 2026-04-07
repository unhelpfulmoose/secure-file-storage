import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import UserDashboard from './UserDashboard';
import { logout } from './api';

function App() {
  const [role, setRole] = useState<string | null>(null);

  const handleLogin = (_username: string, role: string) => {
    setRole(role);
  };

  const handleLogout = () => {
    logout();
    setRole(null);
  };

  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  if (role === 'ADMIN') {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <UserDashboard onLogout={handleLogout} />;
}

export default App;
