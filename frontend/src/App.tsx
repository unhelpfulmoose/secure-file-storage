import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import UserDashboard from './UserDashboard';

function App() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  const handleLogin = (username: string) => {
    setLoggedInUser(username);
  };

  if (!loggedInUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (loggedInUser === 'admin') {
    return <Dashboard />;
  }

  return <UserDashboard />;
}

export default App;