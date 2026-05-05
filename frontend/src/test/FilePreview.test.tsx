import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import FilePreview from '../FilePreview'
import * as api from '../api'

vi.mock('../api')

describe('FilePreview', () => {
    it('shows loading while fetching a non-text file', () => {
        vi.mocked(api.previewFile).mockReturnValue(new Promise(() => {}))
        render(<FilePreview id={1} fileName="photo.jpg" fileType="image/jpeg" onClose={vi.fn()} />)
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('shows the file name in the modal header', () => {
        vi.mocked(api.previewFile).mockReturnValue(new Promise(() => {}))
        render(<FilePreview id={1} fileName="photo.jpg" fileType="image/jpeg" onClose={vi.fn()} />)
        expect(screen.getByText('photo.jpg')).toBeInTheDocument()
    })

    it('calls onClose when the close button is clicked', () => {
        vi.mocked(api.previewFile).mockReturnValue(new Promise(() => {}))
        const onClose = vi.fn()
        render(<FilePreview id={1} fileName="photo.jpg" fileType="image/jpeg" onClose={onClose} />)
        fireEvent.click(screen.getByRole('button', { name: 'Close' }))
        expect(onClose).toHaveBeenCalledOnce()
    })

    it('calls onClose when the backdrop is clicked', () => {
        vi.mocked(api.previewFile).mockReturnValue(new Promise(() => {}))
        const onClose = vi.fn()
        const { container } = render(
            <FilePreview id={1} fileName="photo.jpg" fileType="image/jpeg" onClose={onClose} />
        )
        fireEvent.click(container.firstChild as Element)
        expect(onClose).toHaveBeenCalledOnce()
    })

    it('does not close when the inner modal content is clicked', () => {
        vi.mocked(api.previewFile).mockReturnValue(new Promise(() => {}))
        const onClose = vi.fn()
        render(<FilePreview id={1} fileName="photo.jpg" fileType="image/jpeg" onClose={onClose} />)
        fireEvent.click(screen.getByText('photo.jpg'))
        expect(onClose).not.toHaveBeenCalled()
    })

    it('renders text content for text files', async () => {
        vi.mocked(api.previewFile).mockResolvedValue(
            { data: new Blob(['Hello, World!'], { type: 'text/plain' }) } as never
        )
        render(<FilePreview id={1} fileName="notes.txt" fileType="text/plain" onClose={vi.fn()} />)
        await waitFor(() => {
            expect(screen.getByText('Hello, World!')).toBeInTheDocument()
        })
    })

    it('shows error message when preview fetch fails', async () => {
        vi.mocked(api.previewFile).mockRejectedValue(new Error('Network error'))
        render(<FilePreview id={1} fileName="photo.jpg" fileType="image/jpeg" onClose={vi.fn()} />)
        await waitFor(() => {
            expect(screen.getByText('Could not load preview.')).toBeInTheDocument()
        })
    })

    it('renders an image element for image files', async () => {
        vi.mocked(api.previewFile).mockResolvedValue(
            { data: new Blob(['...'], { type: 'image/jpeg' }) } as never
        )
        render(<FilePreview id={1} fileName="photo.jpg" fileType="image/jpeg" onClose={vi.fn()} />)
        await waitFor(() => {
            expect(screen.getByRole('img', { name: 'photo.jpg' })).toBeInTheDocument()
        })
    })
})
