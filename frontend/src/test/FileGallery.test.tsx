import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import FileGallery from '../FileGallery'
import * as api from '../api'

vi.mock('../api')

const textBlob = { data: new Blob(['hello'], { type: 'text/plain' }) }

const mockFiles = {
    data: {
        content: [
            { id: 1, fileName: 'notes.txt', fileType: 'text/plain', uploadAt: '2026-04-08T10:00:00', uploadedBy: 'admin' },
            { id: 2, fileName: 'report.txt', fileType: 'text/plain', uploadAt: '2026-04-08T11:00:00', uploadedBy: 'admin' },
        ],
        totalPages: 1, totalElements: 2, number: 0, size: 20,
    },
}

const emptyFiles = {
    data: { content: [], totalPages: 0, totalElements: 0, number: 0, size: 20 },
}

describe('FileGallery', () => {
    it('shows loading state while fetching', () => {
        vi.mocked(api.getFiles).mockReturnValue(new Promise(() => {}))
        render(<FileGallery />)
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('shows empty message when no files', async () => {
        vi.mocked(api.getFiles).mockResolvedValue(emptyFiles as never)
        render(<FileGallery />)
        await waitFor(() => {
            expect(screen.getByText('No files available.')).toBeInTheDocument()
        })
    })

    it('renders a card with file name for each file', async () => {
        vi.mocked(api.getFiles).mockResolvedValue(mockFiles as never)
        vi.mocked(api.previewFile).mockResolvedValue(textBlob as never)
        render(<FileGallery />)
        await waitFor(() => {
            expect(screen.getByText('notes.txt')).toBeInTheDocument()
            expect(screen.getByText('report.txt')).toBeInTheDocument()
        })
    })

    it('shows a download button for each file', async () => {
        vi.mocked(api.getFiles).mockResolvedValue(mockFiles as never)
        vi.mocked(api.previewFile).mockResolvedValue(textBlob as never)
        render(<FileGallery />)
        await waitFor(() => {
            expect(screen.getAllByRole('button', { name: 'Download' })).toHaveLength(2)
        })
    })

    it('shows preview content for text files', async () => {
        vi.mocked(api.getFiles).mockResolvedValue(mockFiles as never)
        vi.mocked(api.previewFile).mockResolvedValue(
            { data: new Blob(['file content here'], { type: 'text/plain' }) } as never
        )
        render(<FileGallery />)
        await waitFor(() => {
            expect(screen.getAllByText('file content here')).toHaveLength(2)
        })
    })

    it('shows error state in card when preview fails', async () => {
        vi.mocked(api.getFiles).mockResolvedValue(mockFiles as never)
        vi.mocked(api.previewFile).mockRejectedValue(new Error('Network error'))
        render(<FileGallery />)
        await waitFor(() => {
            expect(screen.getAllByText('Could not load preview.')).toHaveLength(2)
        })
    })
})
