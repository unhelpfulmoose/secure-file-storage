// Tests for UserManagement — listing users, creating users, and deleting users.

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import UserManagement from '../UserManagement'
import * as api from '../api'

vi.mock('../api')

const mockUsers = {
    data: [
        { id: 1, username: 'admin', role: 'ADMIN', createdAt: '2026-04-01T10:00:00' },
        { id: 2, username: 'alice', role: 'USER', createdAt: '2026-04-02T10:00:00' },
    ],
}

const emptyUsers = { data: [] }

describe('UserManagement', () => {
    it('shows loading state while fetching', () => {
        vi.mocked(api.getUsers).mockReturnValue(new Promise(() => {}))

        render(<UserManagement />)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('shows users after loading', async () => {
        vi.mocked(api.getUsers).mockResolvedValue(mockUsers as never)

        render(<UserManagement />)

        await waitFor(() => {
            expect(screen.getByText('admin')).toBeInTheDocument()
            expect(screen.getByText('alice')).toBeInTheDocument()
        })
    })

    it('shows empty message when no users', async () => {
        vi.mocked(api.getUsers).mockResolvedValue(emptyUsers as never)

        render(<UserManagement />)

        await waitFor(() => {
            expect(screen.getByText('No users found.')).toBeInTheDocument()
        })
    })

    it('shows error when fetch fails', async () => {
        vi.mocked(api.getUsers).mockRejectedValue(new Error('Network error'))

        render(<UserManagement />)

        await waitFor(() => {
            expect(screen.getByText('Could not load users.')).toBeInTheDocument()
        })
    })

    it('shows error when creating user without filling in fields', async () => {
        vi.mocked(api.getUsers).mockResolvedValue(emptyUsers as never)

        render(<UserManagement />)

        fireEvent.click(screen.getByRole('button', { name: 'Create user' }))

        expect(screen.getByText('Username and password are required.')).toBeInTheDocument()
    })

    it('shows success message after creating user', async () => {
        vi.mocked(api.getUsers).mockResolvedValue(emptyUsers as never)
        vi.mocked(api.createUser).mockResolvedValue({} as never)

        render(<UserManagement />)

        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'newuser' } })
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } })
        fireEvent.click(screen.getByRole('button', { name: 'Create user' }))

        await waitFor(() => {
            expect(screen.getByText('User created successfully!')).toBeInTheDocument()
        })
    })

    it('shows error message when create fails', async () => {
        vi.mocked(api.getUsers).mockResolvedValue(emptyUsers as never)
        vi.mocked(api.createUser).mockRejectedValue(new Error('Server error'))

        render(<UserManagement />)

        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'newuser' } })
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } })
        fireEvent.click(screen.getByRole('button', { name: 'Create user' } ))

        await waitFor(() => {
            expect(screen.getByText('Failed to create user.')).toBeInTheDocument()
        })
    })

    it('shows delete button for each user', async () => {
        vi.mocked(api.getUsers).mockResolvedValue(mockUsers as never)

        render(<UserManagement />)

        await waitFor(() => {
            expect(screen.getAllByText('Delete')).toHaveLength(2)
        })
    })
})
