export const urlExists = async (url: string) => {
  try {
    await fetch(url, { method: 'GET', mode: 'no-cors' });
    return true;
  } catch (e) {
    return false
  }
}