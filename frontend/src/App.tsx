import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import UserDashboard from './UserDashboard';

function App() {
  const [role, setRole] = useState<string | null>(null);

  const handleLogin = (_username: string, role: string) => {
    setRole(role);
  };

  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  if (role === 'ADMIN') {
    return <Dashboard />;
  }

  return <UserDashboard />;
}

export default App;
