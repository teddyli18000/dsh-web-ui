import { afterEach, describe, expect, it, vi } from 'vitest'
import { mintTurnstileRequestId } from '../src/client/turnstile.ts'

const originalCrypto = globalThis.crypto

afterEach(() => {
  vi.restoreAllMocks()
  Object.defineProperty(globalThis, 'crypto', {
    value: originalCrypto,
    configurable: true,
  })
})

describe('mintTurnstileRequestId', () => {
  it('uses native randomUUID when available', () => {
    const randomUUID = vi.fn(() => 'native-id')
    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID },
      configurable: true,
    })

    expect(mintTurnstileRequestId()).toBe('native-id')
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  it('falls back to getRandomValues when randomUUID is unavailable', () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.fill(0x11)
      return bytes
    })
    Object.defineProperty(globalThis, 'crypto', {
      value: { getRandomValues },
      configurable: true,
    })

    expect(mintTurnstileRequestId()).toBe('11111111-1111-4111-9111-111111111111')
    expect(getRandomValues).toHaveBeenCalledOnce()
  })

  it('keeps a non-secure fallback when Web Crypto is unavailable', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
    })
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    expect(mintTurnstileRequestId()).toBe('80808080-8080-4080-8080-808080808080')
  })
})
