import React from 'react'
import './SettingTile.scss'

import Text from '../../atoms/text/Text'

interface ISettingTileProps {
  title: React.ReactElement | string
  options?: React.ReactElement
  content?: React.ReactElement
}
const SettingTile: React.FC<ISettingTileProps> = ({ title, options = null, content = null }) => (
  <div className="setting-tile">
    <div className="setting-tile__content">
      <div className="setting-tile__title">{typeof title === 'string' ? <Text variant="b1">{title}</Text> : title}</div>
      {content}
    </div>
    {options !== null && <div className="setting-tile__options">{options}</div>}
  </div>
)

export default SettingTile
