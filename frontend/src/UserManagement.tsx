// Admin section for listing, creating, and deleting users.

import { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser } from './api';

interface AppUser {
    id: number;
    username: string;
    role: string;
    createdAt: string;
}

function UserManagement() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getUsers();
            setUsers(response.data);
        } catch {
            setMessage('Could not load users.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!username || !password) {
            setMessage('Username and password are required.');
            return;
        }
        setCreating(true);
        setMessage('');
        try {
            await createUser(username, password, role);
            setUsername('');
            setPassword('');
            setRole('USER');
            setMessage('User created successfully!');
            fetchUsers();
        } catch {
            setMessage('Failed to create user.');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`Delete user "${name}"?`)) return;
        try {
            await deleteUser(id);
            fetchUsers();
        } catch {
            setMessage('Failed to delete user.');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>Users</h3>
                <button className="btn-secondary" onClick={fetchUsers}>Refresh</button>
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    style={{ padding: '0.4rem', width: '160px' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ padding: '0.4rem', width: '160px' }}
                />
                <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: '0.4rem' }}>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                </select>
                <button onClick={handleCreate} disabled={creating}>
                    {creating ? 'Creating...' : 'Create user'}
                </button>
            </div>

            {message && (
                <p style={{ color: message.includes('successfully') ? 'green' : 'red', marginBottom: '0.5rem' }}>
                    {message}
                </p>
            )}

            {loading ? (
                <p>Loading...</p>
            ) : users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Username</th>
                            <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Role</th>
                            <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Created</th>
                            <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td style={{ padding: '0.5rem' }}>{user.username}</td>
                                <td style={{ padding: '0.5rem' }}>{user.role}</td>
                                <td style={{ padding: '0.5rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '0.5rem' }}>
                                    <button
                                        onClick={() => handleDelete(user.id, user.username)}
                                        className="btn-danger"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UserManagement;
