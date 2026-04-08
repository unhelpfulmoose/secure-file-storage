// Tests for the admin Dashboard — upload form behaviour and loading states.

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import Dashboard from '../Dashboard'
import * as api from '../api'

vi.mock('../api')

const emptyFiles = { data: { content: [], totalPages: 0 } }

describe('Dashboard', () => {
  beforeEach(() => {
    vi.mocked(api.getFiles).mockResolvedValue(emptyFiles as never)
  })

  it('renders the upload form', () => {
    render(<Dashboard onLogout={vi.fn()} />)

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Upload file')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument()
  })

  it('shows error when uploading without selecting a file', async () => {
    render(<Dashboard onLogout={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

    expect(screen.getByText('Please select a file first.')).toBeInTheDocument()
  })

  it('shows uploading state while upload is in progress', async () => {
    vi.mocked(api.uploadFile).mockReturnValue(new Promise(() => {})) // never resolves

    render(<Dashboard onLogout={vi.fn()} />)

    const input = screen.getByRole('button', { name: 'Upload' }).previousElementSibling as HTMLInputElement
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Uploading...' })).toBeDisabled()
    })
  })

  it('shows success message after upload', async () => {
    vi.mocked(api.uploadFile).mockResolvedValue({} as never)

    render(<Dashboard onLogout={vi.fn()} />)

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

    const fileInput = screen.getByRole('button', { name: 'Upload' }).previousElementSibling as HTMLInputElement
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    fireEvent.change(fileInput, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }))

    await waitFor(() => {
      expect(screen.getByText('Upload failed.')).toBeInTheDocument()
    })
  })
})
