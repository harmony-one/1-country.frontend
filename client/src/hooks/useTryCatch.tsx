import type React from 'react'
import { useCallback, useState } from 'react'
import { toast } from 'react-toastify'

interface TryCatchState {
  pending: boolean
  initializing: boolean
  setPending: React.Dispatch<React.SetStateAction<boolean>>
  setInitializing: React.Dispatch<React.SetStateAction<boolean>>
  tryCatch: (f: () => Promise<any>, isInit?: boolean) => Promise<void>
}
export const useTryCatch = (): TryCatchState => {
  const [pending, setPending] = useState(false)
  const [initializing, setInitializing] = useState(true)

  const tryCatch = useCallback(
    async (f: () => Promise<any>, isInit?: boolean): Promise<void> => {
      try {
        if (isInit) {
          setInitializing(true)
        } else {
          setPending(true)
        }
        await f()
      } catch (ex) {
        console.error(ex)
        console.log(f())
        if (ex?.response?.error) {
          toast.error(`Request failed. Error: ${ex?.response?.error}`)
        }
        toast.info('Request cancelled')
      } finally {
        if (isInit) {
          setInitializing(false)
        } else {
          setPending(false)
        }
      }
    },
    []
  )
  return { pending, setPending, initializing, setInitializing, tryCatch }
}
