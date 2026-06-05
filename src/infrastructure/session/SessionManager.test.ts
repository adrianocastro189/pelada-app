import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SessionManager } from './SessionManager'

describe('SessionManager', () => {
  let mockSessionStorage: Map<string, string>

  beforeEach(() => {
    mockSessionStorage = new Map()
    const mockStorage = {
      setItem: (key: string, value: string) => {
        mockSessionStorage.set(key, value)
      },
      getItem: (key: string) => mockSessionStorage.get(key) ?? null,
      removeItem: (key: string) => {
        mockSessionStorage.delete(key)
      },
      clear: () => {
        mockSessionStorage.clear()
      },
      length: 0,
      key: () => null,
    }

    vi.stubGlobal('sessionStorage', mockStorage)
  })

  describe('buildConnectionString', () => {
    it('builds connection string with correct format', () => {
      vi.stubEnv('VITE_DB_USER', 'pelada_app')
      vi.stubEnv('VITE_DB_HOST', 'ep-xxx.us-east-2.aws.neon.tech/pelada')
      vi.stubEnv('VITE_DB_NAME', 'pelada')

      const conn = SessionManager.buildConnectionString('pass123')

      expect(conn).toBe(
        'postgresql://pelada_app:pass123@ep-xxx.us-east-2.aws.neon.tech/pelada/pelada',
      )
    })

    it('throws error when env vars are missing', () => {
      vi.stubEnv('VITE_DB_USER', '')
      vi.stubEnv('VITE_DB_HOST', '')
      vi.stubEnv('VITE_DB_NAME', '')

      expect(() => SessionManager.buildConnectionString('pass123')).toThrow(
        'Missing environment variables',
      )
    })
  })

  describe('save and load', () => {
    it('saves and retrieves connection string from sessionStorage', () => {
      const connStr = 'postgresql://user:pass@host/db'

      SessionManager.save(connStr)
      const loaded = SessionManager.load()

      expect(loaded).toBe(connStr)
    })

    it('load returns null when nothing is stored', () => {
      const loaded = SessionManager.load()
      expect(loaded).toBeNull()
    })
  })

  describe('clear', () => {
    it('removes connection string from sessionStorage', () => {
      const connStr = 'postgresql://user:pass@host/db'

      SessionManager.save(connStr)
      expect(SessionManager.load()).toBe(connStr)

      SessionManager.clear()
      expect(SessionManager.load()).toBeNull()
    })
  })
})
