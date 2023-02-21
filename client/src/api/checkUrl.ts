export const urlExists = async (url: string) => {
  try {
    console.log('url to check', url)
    const result = await fetch(url, { method: 'HEAD' });
    console.log('urlExists', result)
    return result.ok;
  } catch (e) {
    console.log(e)
  }
}