// Tests for App — verifies that the correct dashboard is shown based on the user's role.

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../App'
import * as api from '../api'

vi.mock('../api')

// Minimal mock response for getFiles so the file list doesn't error after login
const emptyFileList = { data: { content: [], totalPages: 0 } }

describe('App', () => {
  it('shows login form when not logged in', () => {
    render(<App />)

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  it('shows admin dashboard after logging in as admin', async () => {
    vi.mocked(api.login).mockResolvedValue({ token: 'token', username: 'admin', role: 'ADMIN' })
    vi.mocked(api.getFiles).mockResolvedValue(emptyFileList as never)

    render(<App />)

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'admin123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    })
  })

  it('shows user dashboard after logging in as user', async () => {
    vi.mocked(api.login).mockResolvedValue({ token: 'token', username: 'user', role: 'USER' })
    vi.mocked(api.getFiles).mockResolvedValue(emptyFileList as never)

    render(<App />)

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'user' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'user123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(screen.getByText('File Storage')).toBeInTheDocument()
    })
  })
})
