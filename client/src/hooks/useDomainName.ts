import {useState} from "react";

const getDomainName = () => {
  if (!window) {
    return null
  }
  console.log('getSubDomain()', window.location.host)
  const host = window.location.host
  const parts = host.split('.')
  console.log(host, parts, parts.length)
  if (parts.length <= 2) {
    return ''
  }
  if (parts.length <= 4) { // 3 CHANGE FOR PRODUCTION
    return parts[0]
  }
  return parts.slice(0, parts.length - 2).join('.')
}

export const useDomainName = () => {
  const [domainName, setDomainName] = useState(getDomainName());
  return [domainName];
}
