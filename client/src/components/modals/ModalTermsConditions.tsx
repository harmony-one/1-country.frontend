import React, { Dispatch, SetStateAction } from 'react'
import { observer } from 'mobx-react-lite'
import { ModalContent } from './ModalContent'
import { Title } from '../Text'
import { CancelButton, Button } from '../Controls'
import { Row } from '../Layout'

interface Props {
  setChecked: Dispatch<SetStateAction<boolean>>
  onClose?: () => void
}

export const ModalTermsConditions: React.FC<Props> = observer(
  ({ onClose, setChecked }) => {
    return (
      <ModalContent>
        <Title>RELEASE FOR HORIZON BRIDGE HACK</Title>
        <div style={{ overflowY: 'auto', marginBottom: '1em' }}>
          <p>
            You ("User"), on behalf of User and User’s assigns, heirs, and
            estates (the “Releasing Party”) hereby generally release and forever
            discharge foundations, associations, operating companies and
            development companies for the Harmony ecosystem and their
            affiliates, and their respective past and present, core developers,
            validators, officers, directors, employees, shareholders, partners,
            agents, principals, managers, attorneys, contractors, contributors,
            insurers or indemnitors, parent corporations, direct and indirect
            subsidiaries, affiliates, predecessors, successors, assigns, heirs,
            and estates (the “Released Parties”), and each of them, separately
            and collectively, from any and all existing claims, liens, demands,
            causes of action, obligations, damages, and liabilities of any
            nature whatsoever, whether or not now known, suspected, or claimed,
            that the Releasing Party ever had, now has, or may claim to have
            had, including without limitation those arising from or relating to
            the Harmony Horizon Bridge Hack (the “Released Claims”). For the
            purposes of this Agreement, “Horizon Bridge Hack” means the
            conducting of unauthorized transactions on June 23, 2022, by a
            malicious third party on the Harmony Horizon bridge that resulted in
            the transfer of cryptocurrency asset tokens from the Harmony Horizon
            Bridge to the malicious actor’s wallet.
          </p>
          <p>
            User acknowledges and agrees that we (modulo.so and its affiliates,
            owners, employees, contractors) are not affiliated with the Released
            Parties and are the sole party providing the services on our
            platform as described herein. Nothing herein shall be construed as
            creating any obligation to User from the Released Parties, nor any
            agreement between the Released Parties and User, provided however,
            that User acknowledges and agrees that the Released Parties are
            intended third-party beneficiaries of this section and the release
            for the Horizon Bridge Hack contained herein. User further
            acknowledges and agrees that User shall have no rights in respect of
            any funds provided to us by the Released Parties to facilitate the
            development of our platform or delivery of its services or to
            otherwise enable any contribution made by us to the Harmony
            ecosystem.
          </p>
        </div>

        <Row style={{ justifyContent: 'space-between' }}>
          <CancelButton
            type="submit"
            onClick={() => {
              setChecked(false)
              onClose()
            }}
          >
            Cancel
          </CancelButton>
          <Button
            type="submit"
            onClick={() => {
              setChecked(true)
              onClose()
            }}
          >
            I agree
          </Button>
        </Row>
      </ModalContent>
    )
  }
)
