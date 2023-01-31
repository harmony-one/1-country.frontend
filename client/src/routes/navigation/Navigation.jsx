import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { useDefaultNetwork, useIsHarmonyNetwork } from '../../hooks/network'
import { useClient } from '../../hooks/useClient'
import { useDomainName } from '../../hooks/useDomainName'

const Navigation = () => {
  const [record, setRecord] = useState(null)
  const [lastRentedRecord, setLastRentedRecord] = useState(null)
  const [price, setPrice] = useState(null)
  const [parameters, setParameters] = useState({
    rentalPeriod: 0,
    priceMultiplier: 0,
  })
  const [name] = useDomainName()
  const { client, walletAddress, isClientConnected } = useClient()
  const isOwner =
    walletAddress &&
    record?.renter &&
    record.renter.toLowerCase() === walletAddress.toLowerCase()

  useDefaultNetwork()

  useEffect(() => {
    if (client) {
      client.getPrice({ name }).then((p) => {
        setPrice(p)
      })
    }
  }, [client, name])

  const pollParams = () => {
    if (!client) {
      return
    }
    client.getParameters().then((p) => setParameters(p))
    client.getRecord({ name }).then((r) => setRecord(r))
    client.getPrice({ name }).then((p) => setPrice(p))
  }

  useEffect(() => {
    if (!client) {
      return
    }
    pollParams()
  }, [client])

  useEffect(() => {
    if (!parameters?.lastRented) {
      setTimeout(() => {
        console.log('Poll params')
        pollParams()
      }, 12000)
      return
    }
    client
      .getRecord({ name: parameters.lastRented })
      .then((r) => setLastRentedRecord(r))
  }, [parameters?.lastRented])

  const isHarmonyNetwork = useIsHarmonyNetwork()

  return (
    <div>
      <Outlet context={{
        record,
        lastRentedRecord,
        price,
        parameters,
        name,
        client,
        walletAddress,
        isClientConnected,
        isOwner,
        isHarmonyNetwork
      }}
      />
    </div>
  )
}

export default Navigation
