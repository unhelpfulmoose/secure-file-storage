// Tests for the Login component — form rendering, validation, and API interaction.

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import Login from '../Login'
import * as api from '../api'

vi.mock('../api')

describe('Login', () => {
  it('renders username and password inputs', () => {
    render(<Login onLogin={vi.fn()} />)

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  it('shows error when submitting with empty fields', () => {
    render(<Login onLogin={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(screen.getByText('Please enter username and password.')).toBeInTheDocument()
  })

  it('calls onLogin with username and role on successful login', async () => {
    vi.mocked(api.login).mockResolvedValue({ token: 'fake-token', username: 'admin', role: 'ADMIN' })
    const onLogin = vi.fn()

    render(<Login onLogin={onLogin} />)

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'admin123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith('admin', 'ADMIN')
    })
  })

  it('shows error message on failed login', async () => {
    vi.mocked(api.login).mockRejectedValue(new Error('Unauthorized'))

    render(<Login onLogin={vi.fn()} />)

    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'admin' } })
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } })
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password.')).toBeInTheDocument()
    })
  })
})
