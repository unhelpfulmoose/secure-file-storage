// Tests for AuditLogView — loading state, rendering entries, empty state, and error.

import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import AuditLogView from '../AuditLogView'
import * as api from '../api'

vi.mock('../api')

const mockEntries = {
    data: {
        content: [
            { id: 1, action: 'LOGIN_SUCCESS', username: 'admin', details: null, ip: '127.0.0.1', createdAt: '2026-04-09T10:00:00' },
            { id: 2, action: 'FILE_UPLOAD', username: 'admin', details: 'file="report.pdf" id=1', ip: null, createdAt: '2026-04-09T10:01:00' },
            { id: 3, action: 'ACCESS_DENIED', username: 'user', details: 'path=/files/upload', ip: '127.0.0.1', createdAt: '2026-04-09T10:02:00' },
        ],
        totalPages: 1,
    },
}

const emptyEntries = { data: { content: [], totalPages: 0 } }

describe('AuditLogView', () => {
    it('shows loading state while fetching', () => {
        vi.mocked(api.getAuditLog).mockReturnValue(new Promise(() => {}))

        render(<AuditLogView />)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('shows entries after loading', async () => {
        vi.mocked(api.getAuditLog).mockResolvedValue(mockEntries as never)

        render(<AuditLogView />)

        await waitFor(() => {
            expect(screen.getByText('LOGIN_SUCCESS')).toBeInTheDocument()
            expect(screen.getByText('FILE_UPLOAD')).toBeInTheDocument()
            expect(screen.getByText('ACCESS_DENIED')).toBeInTheDocument()
        })
    })

    it('shows empty message when no entries', async () => {
        vi.mocked(api.getAuditLog).mockResolvedValue(emptyEntries as never)

        render(<AuditLogView />)

        await waitFor(() => {
            expect(screen.getByText('No events yet.')).toBeInTheDocument()
        })
    })

    it('shows error message when fetch fails', async () => {
        vi.mocked(api.getAuditLog).mockRejectedValue(new Error('Network error'))

        render(<AuditLogView />)

        await waitFor(() => {
            expect(screen.getByText('Could not load audit log.')).toBeInTheDocument()
        })
    })

    it('shows dash for missing username and ip', async () => {
        vi.mocked(api.getAuditLog).mockResolvedValue(mockEntries as never)

        render(<AuditLogView />)

        await waitFor(() => {
            // FILE_UPLOAD entry has no ip — should show —
            const dashes = screen.getAllByText('—')
            expect(dashes.length).toBeGreaterThan(0)
        })
    })
})
