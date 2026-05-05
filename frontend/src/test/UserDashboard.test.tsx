import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import UserDashboard from '../UserDashboard'
import * as api from '../api'

vi.mock('../api')

describe('UserDashboard', () => {
    beforeEach(() => {
        vi.mocked(api.getFiles).mockResolvedValue(
            { data: { content: [], totalPages: 0, totalElements: 0, number: 0, size: 20 } } as never
        )
    })

    it('renders the brand name', () => {
        render(<UserDashboard onLogout={vi.fn()} />)
        expect(screen.getByText('SecureFiles')).toBeInTheDocument()
    })

    it('renders the logout button', () => {
        render(<UserDashboard onLogout={vi.fn()} />)
        expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
    })

    it('renders the Files heading', () => {
        render(<UserDashboard onLogout={vi.fn()} />)
        expect(screen.getByRole('heading', { name: 'Files' })).toBeInTheDocument()
    })

    it('calls onLogout when logout button is clicked', async () => {
        const onLogout = vi.fn()
        render(<UserDashboard onLogout={onLogout} />)
        fireEvent.click(screen.getByRole('button', { name: 'Logout' }))
        expect(onLogout).toHaveBeenCalledOnce()
    })

    it('shows empty file state after loading', async () => {
        render(<UserDashboard onLogout={vi.fn()} />)
        await waitFor(() => {
            expect(screen.getByText('No files available.')).toBeInTheDocument()
        })
    })
})
