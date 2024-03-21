import React from 'react'
import './Welcome.scss'

import { observer } from 'mobx-react-lite'
import Text from '../../atoms/text/Text'

import CinnySvg from '../../../../public/res/svg/cinny.svg'
import { useMobxStore } from '../../../stores/StoreProvider'
import MetaMaskCard from '../../connectors/MetaMaskCard'

function Welcome() {
  const {
    appStore: { count },
  } = useMobxStore()
  return (
    <div className="app-welcome flex--center">
      <div>
        <img className="app-welcome__logo noselect" src={CinnySvg} alt="Cinny logo" />
        <Text className="app-welcome__heading" variant="h1" weight="medium" primary>
          Welcome to DEFED
        </Text>
        <Text className="app-welcome__subheading" variant="s1">
          Enjoy encrypted decentralized chat and easy links to your existing social networks.
        </Text>
      </div>
      <MetaMaskCard />
    </div>
  )
}

export default observer(Welcome)
