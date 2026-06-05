/**
 * Manages the in-memory + sessionStorage persistence of the DB connection string.
 */
export const SessionManager = {
  SESSION_KEY: 'pelada_conn',

  /**
   * Builds and stores the connection string from user-supplied password.
   * Stores in sessionStorage so it survives page refresh within the same tab.
   * Never touches localStorage.
   */
  save(connectionString: string): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(this.SESSION_KEY, connectionString)
    }
  },

  /**
   * Retrieves the stored connection string, or null if not present.
   */
  load(): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(this.SESSION_KEY)
    }
    return null
  },

  /**
   * Clears the stored connection string from sessionStorage.
   */
  clear(): void {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem(this.SESSION_KEY)
    }
  },

  /**
   * Builds the Neon connection string from password.
   * Format: postgresql://{VITE_DB_USER}:{password}@{VITE_DB_HOST}/{VITE_DB_NAME}
   * Reads host/user/dbname from Vite env vars (VITE_DB_USER, VITE_DB_HOST, VITE_DB_NAME).
   * These env vars are public (no secret) — only the password is secret.
   */
  buildConnectionString(password: string): string {
    const user = import.meta.env.VITE_DB_USER
    const host = import.meta.env.VITE_DB_HOST
    const dbName = import.meta.env.VITE_DB_NAME

    if (!user || !host || !dbName) {
      throw new Error('Missing environment variables: VITE_DB_USER, VITE_DB_HOST, VITE_DB_NAME')
    }

    return `postgresql://${user}:${password}@${host}/${dbName}`
  },
}
