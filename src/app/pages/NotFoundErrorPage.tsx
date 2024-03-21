import { observer } from 'mobx-react-lite'
import React from 'react'
import { Box } from 'folds'
import { useRouteError } from 'react-router-dom'

const NotFoundErrorPage: React.FC<any> = () => {
  const error = useRouteError()
  console.error(error)
  return <Box>{404}</Box>
}
export default observer(NotFoundErrorPage)
