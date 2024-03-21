import { observer } from 'mobx-react-lite'
import React from 'react'
import { isAuthenticated } from '../../client/state/auth'
import Client from '../templates/client/Client'
import Auth from '../templates/auth/Auth'

const MainPage: React.FC<any> = () => (isAuthenticated() ? <Client /> : <Auth />)
export default observer(MainPage)
