export const LOCAL_STORAGE_KEY = 'phoneNumber'

export const loadLocalState = (key = LOCAL_STORAGE_KEY) => {
  try {
    const serializedState = localStorage.getItem(key)
    if (!serializedState) return undefined
    return JSON.parse(serializedState)
  } catch (e) {
    return undefined
  }
}

export const saveLocalState = (state, key = LOCAL_STORAGE_KEY) => {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(key, serializedState)
  } catch (e) {
    // Ignore
  }
}
