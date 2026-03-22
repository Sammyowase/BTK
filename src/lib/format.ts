import { formatUnits } from 'ethers'

export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatTokenAmount(value: bigint | number | string) {
  const formatted = Number(formatUnits(value, 18))

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: formatted >= 1000 ? 0 : 4,
  }).format(formatted)
}

export function formatCountdown(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0)
  const hours = Math.floor((safeSeconds % 86400) / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  return `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`
}

export function formatDateTime(timestampInSeconds: number) {
  if (!timestampInSeconds) {
    return 'Available now'
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestampInSeconds * 1000)
}

export function extractErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null) {
    if ('shortMessage' in error && typeof error.shortMessage === 'string') {
      return error.shortMessage
    }
    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }
  }

  return 'Something went wrong while talking to the contract.'
}
