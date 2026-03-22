import { useState } from 'react';
import { setCredentials } from './api';

interface Props {
  onLogin: (username: string) => void;
}

function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }
    setCredentials(username, password);
    onLogin(username);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '2rem' }}>
      <h2>Secure File Storage</h2>
      <h3>Login</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ display: 'block', marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ display: 'block', marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
        />
        <button onClick={handleLogin} style={{ width: '100%', padding: '0.5rem' }}>
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;