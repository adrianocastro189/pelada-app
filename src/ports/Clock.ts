/** Injected clock port. Keeps Date.now() out of the domain. */
export interface Clock {
  /** Returns the current date (time component is irrelevant). */
  today(): Date
}
