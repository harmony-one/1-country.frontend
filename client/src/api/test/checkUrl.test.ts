import { urlExists } from '../checkUrl'

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(),
  })
) as jest.Mock

describe('urlExists', () => {
  it('test cases', async () => {
    expect(await urlExists('https://1.country/')).toEqual(true)
    expect(await urlExists('https://s.country/')).toEqual(true)
    expect(await urlExists('https://openconsensus.country/')).toEqual(true)
  })
})
