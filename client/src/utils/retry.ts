import { sleep } from './sleep'

export const retry = async <T>(
  fn: () => Promise<T> | T,
  { retries, retryIntervalMs }: { retries: number; retryIntervalMs: number }
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) {
      throw error
    }
    await sleep(retryIntervalMs)
    return retry(fn, { retries: retries - 1, retryIntervalMs })
  }
}
