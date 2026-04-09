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
    expect(screen.getByText('Overview')).toBeInTheDocument()
  })

  it('navigates to the files section', async () => {
    render(<Dashboard onLogout={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Files' }))

    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument()
  })

  it('shows error when uploading without selecting a file', async () => {
    render(<Dashboard onLogout={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Files' }))

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

    expect(screen.getByText('Please select a file first.')).toBeInTheDocument()
  })

  it('shows uploading state while upload is in progress', async () => {
    vi.mocked(api.uploadFile).mockReturnValue(new Promise(() => {})) // never resolves

    render(<Dashboard onLogout={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Files' }))

    const input = screen.getByRole('button', { name: 'Upload' }).previousElementSibling as HTMLInputElement
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Uploading…' })).toBeDisabled()
    })
  })

  it('shows success message after upload', async () => {
    vi.mocked(api.uploadFile).mockResolvedValue({} as never)

    render(<Dashboard onLogout={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Files' }))

    const fileInput = screen.getByRole('button', { name: 'Upload' }).previousElementSibling as HTMLInputElement
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

    await waitFor(() => {
      expect(screen.getByText('File uploaded successfully!')).toBeInTheDocument()
    })
  })

  it('shows error message when upload fails', async () => {
    vi.mocked(api.uploadFile).mockRejectedValue(new Error('Server error'))

    render(<Dashboard onLogout={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Files' }))

    const fileInput = screen.getByRole('button', { name: 'Upload' }).previousElementSibling as HTMLInputElement
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

    await waitFor(() => {
      expect(screen.getByText('Upload failed.')).toBeInTheDocument()
    })
  })

  it('calls onLogout when logout button is clicked', async () => {
    const onLogout = vi.fn()
    render(<Dashboard onLogout={onLogout} />)

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))

    expect(onLogout).toHaveBeenCalledOnce()
  })
})
