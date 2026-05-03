// Admin section for listing, creating, and deleting users.

import { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser, changePassword, type AppUser } from './api';

function UserManagement() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [creating, setCreating] = useState(false);
    const [changingPasswordFor, setChangingPasswordFor] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        void fetchUsers();
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
            await fetchUsers();
        } catch {
            setMessage('Failed to create user.');
        } finally {
            setCreating(false);
        }
    };

    const handleChangePassword = async (id: number) => {
        if (!newPassword) {
            setMessage('New password is required.');
            return;
        }
        try {
            await changePassword(id, newPassword);
            setChangingPasswordFor(null);
            setNewPassword('');
            setMessage('Password changed successfully!');
        } catch {
            setMessage('Failed to change password.');
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`Delete user "${name}"?`)) return;
        try {
            await deleteUser(id);
            await fetchUsers();
        } catch {
            setMessage('Failed to delete user.');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>Users</h3>
                <button className="btn-secondary" onClick={() => void fetchUsers()}>Refresh</button>
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
                <button onClick={() => void handleCreate()} disabled={creating}>
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
                                    {changingPasswordFor === user.id ? (
                                        <span style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                                            <input
                                                type="password"
                                                placeholder="New password"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                style={{ padding: '0.3rem', width: '140px' }}
                                                autoFocus
                                            />
                                            <button onClick={() => void handleChangePassword(user.id)}>Save</button>
                                            <button className="btn-secondary" onClick={() => {
                                                setChangingPasswordFor(null);
                                                setNewPassword('');
                                            }}>Cancel</button>
                                        </span>
                                    ) : (
                                        <span style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                            <button className="btn-secondary" onClick={() => {
                                                setChangingPasswordFor(user.id);
                                                setNewPassword('');
                                                setMessage('');
                                            }}>Change password</button>
                                            <button
                                                onClick={() => void handleDelete(user.id, user.username)}
                                                className="btn-danger"
                                            >
                                                Delete
                                            </button>
                                        </span>
                                    )}
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
