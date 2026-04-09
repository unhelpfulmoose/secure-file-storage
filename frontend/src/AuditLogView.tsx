// Admin section that shows a paginated audit log of all system events.

import { useState, useEffect } from 'react';
import { getAuditLog } from './api';

interface AuditEntry {
    id: number;
    action: string;
    username: string | null;
    details: string | null;
    ip: string | null;
    createdAt: string;
}

const actionColors: Record<string, string> = {
    LOGIN_FAILURE: 'orange',
    UPLOAD_REJECTED: 'orange',
    ACCESS_DENIED: 'red',
    INVALID_TOKEN: 'red',
    REVOKED_TOKEN: 'red',
    USER_CREATION_FAILED: 'orange',
    FILE_DELETE: 'orange',
    USER_DELETED: 'orange',
};

function AuditLogView() {
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchLog(page);
    }, [page]);

    const fetchLog = async (p: number) => {
        setLoading(true);
        setError('');
        try {
            const response = await getAuditLog(p);
            setEntries(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch {
            setError('Could not load audit log.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>Audit log</h3>
                <button className="btn-secondary" onClick={() => fetchLog(page)}>Refresh</button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {loading ? (
                <p>Loading...</p>
            ) : entries.length === 0 ? (
                <p>No events yet.</p>
            ) : (
                <>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Time</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Action</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>User</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>Details</th>
                                <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #ccc' }}>IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map(entry => (
                                <tr key={entry.id}>
                                    <td style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>
                                        {new Date(entry.createdAt).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.5rem', color: actionColors[entry.action] ?? 'green', fontWeight: 500 }}>
                                        {entry.action}
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>{entry.username ?? '—'}</td>
                                    <td style={{ padding: '0.5rem' }}>{entry.details ?? '—'}</td>
                                    <td style={{ padding: '0.5rem' }}>{entry.ip ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {totalPages > 1 && (
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>Previous</button>
                            <span>Page {page + 1} of {totalPages}</span>
                            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>Next</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default AuditLogView;
