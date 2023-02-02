import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageName } from '../utils/store/pageSlice'

export const getDomainName = () => {
  if (!window) {
    return null
  }
  // console.log('getSubDomain()', window.location.host)
  const host = window.location.host
  const parts = host.split('.')
  if (parts.length <= 2) {
    return ''
  }
  if (parts.length <= 4) { // 3 CHANGE FOR PRODUCTION
    return parts[0]
  }
  return parts.slice(0, parts.length - 2).join('.')
}

export const useDomainName = () => {
  const [domainName, setDomainName] = useState<string>()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!domainName) {
      const name = getDomainName()
      setDomainName(name)
      dispatch(setPageName(name))
    }
  }, [domainName])

  return [domainName]
}
