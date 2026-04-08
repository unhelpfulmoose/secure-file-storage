// Tests for api.ts — verifies that each function calls the correct backend endpoint.
// Axios is mocked so no real HTTP requests are made.

import { vi, describe, it, expect, beforeEach } from 'vitest'
import axios from 'axios'
import { login, logout, getFiles, deleteFile } from '../api'

vi.mock('axios')

const BASE_URL = 'http://localhost:8080'

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login sends POST to /auth/login with credentials', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { token: 'fake-token', username: 'admin', role: 'ADMIN' }
    })

    await login('admin', 'admin123')

    expect(axios.post).toHaveBeenCalledWith(
      `${BASE_URL}/auth/login`,
      { username: 'admin', password: 'admin123' }
    )
  })

  it('login returns token, username and role', async () => {
    vi.mocked(axios.post).mockResolvedValue({
      data: { token: 'fake-token', username: 'admin', role: 'ADMIN' }
    })

    const result = await login('admin', 'admin123')

    expect(result.token).toBe('fake-token')
    expect(result.username).toBe('admin')
    expect(result.role).toBe('ADMIN')
  })

  it('logout sends POST to /auth/logout with auth header', async () => {
    // Login first so the token is set
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { token: 'fake-token', username: 'admin', role: 'ADMIN' }
    })
    await login('admin', 'admin123')

    vi.mocked(axios.post).mockResolvedValueOnce({ data: {} })
    await logout()

    expect(axios.post).toHaveBeenLastCalledWith(
      `${BASE_URL}/auth/logout`,
      {},
      expect.objectContaining({
        headers: { Authorization: 'Bearer fake-token' }
      })
    )
  })

  it('getFiles sends GET to /files with page and size params', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { content: [], totalPages: 0 } })

    await getFiles(2, 10)

    expect(axios.get).toHaveBeenCalledWith(
      `${BASE_URL}/files`,
      expect.objectContaining({ params: { page: 2, size: 10 } })
    )
  })

  it('deleteFile sends DELETE to /files/:id', async () => {
    // Login first so auth header is set
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { token: 'fake-token', username: 'admin', role: 'ADMIN' }
    })
    await login('admin', 'admin123')

    vi.mocked(axios.delete).mockResolvedValue({ data: {} })
    await deleteFile(42)

    expect(axios.delete).toHaveBeenCalledWith(
      `${BASE_URL}/files/42`,
      expect.objectContaining({
        headers: { Authorization: 'Bearer fake-token' }
      })
    )
  })
})
