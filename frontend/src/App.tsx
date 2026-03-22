import { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div>
      {loggedIn ? (
        <Dashboard />
      ) : (
        <Login onLogin={() => setLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;