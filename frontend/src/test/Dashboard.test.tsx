// Tests for the admin Dashboard — sidebar navigation and upload form behaviour.

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import Dashboard from '../Dashboard'
import * as api from '../api'

vi.mock('../api')

const emptyFiles = { data: { content: [], totalPages: 0, totalElements: 0 } }
const emptyUsers = { data: [] }
const emptyAudit = { data: { content: [], totalPages: 0 } }

describe('Dashboard', () => {
  beforeEach(() => {
    vi.mocked(api.getFiles).mockResolvedValue(emptyFiles as never)
    vi.mocked(api.getUsers).mockResolvedValue(emptyUsers as never)
    vi.mocked(api.getAuditLog).mockResolvedValue(emptyAudit as never)
  })

  it('renders the sidebar with all nav items', () => {
    render(<Dashboard onLogout={vi.fn()} />)

    expect(screen.getByText('SecureFiles')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Files' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Users' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Audit Log' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })

  it('shows the overview by default', () => {
    render(<Dashboard onLogout={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
  })

  it('navigates to the files section', async () => {
    render(<Dashboard onLogout={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Files' }))

    expect(screen.getByRole('heading', { name: 'Upload' })).toBeInTheDocument()
  })

  it('shows a file input in the upload section', async () => {
    const { container } = render(<Dashboard onLogout={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Files' }))

    expect(container.querySelector('input[type="file"]')).toBeInTheDocument()
  })

  it('shows uploading state while upload is in progress', async () => {
    vi.mocked(api.uploadFile).mockReturnValue(new Promise(() => {})) // never resolves

    const { container } = render(<Dashboard onLogout={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Files' }))

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeInTheDocument()
    })
  })

  it('shows success message after upload', async () => {
    vi.mocked(api.uploadFile).mockResolvedValue({} as never)

    const { container } = render(<Dashboard onLogout={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Files' }))

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('1 file uploaded successfully!')).toBeInTheDocument()
    })
  })

  it('shows error message when upload fails', async () => {
    vi.mocked(api.uploadFile).mockRejectedValue(new Error('Server error'))

    const { container } = render(<Dashboard onLogout={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Files' }))

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('0 uploaded, 1 failed.')).toBeInTheDocument()
    })
  })

  it('calls onLogout when logout button is clicked', async () => {
    const onLogout = vi.fn()
    render(<Dashboard onLogout={onLogout} />)

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

    expect(onLogout).toHaveBeenCalledOnce()
  })
})
