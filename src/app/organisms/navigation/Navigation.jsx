import React from 'react'
import './Navigation.scss'

import SideBar from './SideBar'
import Drawer from './Drawer'
import Postie from '../../../util/Postie'

const drawerPostie = new Postie()
function Navigation() {
  return (
    <div className="navigation">
      <SideBar drawerPostie={drawerPostie} />
      <Drawer drawerPostie={drawerPostie} />
    </div>
  )
}

export default Navigation
