// Tests for FileList — rendering files, loading state, empty state, and delete.

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import FileList from '../FileList'
import * as api from '../api'

vi.mock('../api')

const mockFiles = {
  data: {
    content: [
      { id: 1, fileName: 'report.pdf', fileType: 'application/pdf', uploadAt: '2026-04-08T10:00:00' },
      { id: 2, fileName: 'photo.jpg', fileType: 'image/jpeg', uploadAt: '2026-04-08T11:00:00' },
    ],
    totalPages: 1,
  },
}

const emptyFiles = { data: { content: [], totalPages: 0 } }

describe('FileList', () => {
  it('shows loading state while fetching', async () => {
    vi.mocked(api.getFiles).mockReturnValue(new Promise(() => {})) // never resolves

    render(<FileList />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows files after loading', async () => {
    vi.mocked(api.getFiles).mockResolvedValue(mockFiles as never)

    render(<FileList />)

    await waitFor(() => {
      expect(screen.getByText('report.pdf')).toBeInTheDocument()
      expect(screen.getByText('photo.jpg')).toBeInTheDocument()
    })
  })

  it('shows empty message when no files', async () => {
    vi.mocked(api.getFiles).mockResolvedValue(emptyFiles as never)

    render(<FileList />)

    await waitFor(() => {
      expect(screen.getByText('No files available.')).toBeInTheDocument()
    })
  })

  it('shows error message when fetch fails', async () => {
    vi.mocked(api.getFiles).mockRejectedValue(new Error('Network error'))

    render(<FileList />)

    await waitFor(() => {
      expect(screen.getByText('Could not load files.')).toBeInTheDocument()
    })
  })

  it('does not show delete button for regular users', async () => {
    vi.mocked(api.getFiles).mockResolvedValue(mockFiles as never)

    render(<FileList canDelete={false} />)

    await waitFor(() => {
      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    })
  })

  it('shows delete button for admins', async () => {
    vi.mocked(api.getFiles).mockResolvedValue(mockFiles as never)

    render(<FileList canDelete={true} />)

    await waitFor(() => {
      expect(screen.getAllByText('Delete')).toHaveLength(2)
    })
  })
})
