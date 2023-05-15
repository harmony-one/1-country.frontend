import { useSearchParams } from 'react-router-dom'

export const useMinimalRender = () => {
  const [searchParams] = useSearchParams()
  const rm = searchParams.get('rm')
  return rm === 'minimal'
}
