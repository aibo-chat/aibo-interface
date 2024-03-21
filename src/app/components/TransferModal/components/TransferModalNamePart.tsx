import React, { useMemo } from 'react'
import { Box, SxProps } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { observer } from 'mobx-react-lite'
import { substitutionString } from '../../../../util/common'
import { chatsNameDisplay } from '../../../utils/common'
import { useUserInfoWithProxy } from '../../../hooks/useUserInfoWithProxy'

interface ITransferModalNamePartProps {
  proxy: string
  containerSx?: SxProps<Theme>
}

const TransferModalNamePart: React.FC<ITransferModalNamePartProps> = (props) => {
  const { proxy, containerSx } = props
  const [userInfo] = useUserInfoWithProxy(proxy)
  const name = useMemo(() => chatsNameDisplay(proxy, '', userInfo.handleName, { frontLength: 0, endLength: 0, character: '' }), [proxy, userInfo.handleName])
  return (
    <Box
      sx={{
        width: '100',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
        ...(containerSx || {}),
      }}
    >
      <Box
        component="img"
        sx={{
          marginRight: { xs: '16px', xsm: '16px' },
          width: { xs: '56px', xsm: '68px' },
          height: { xs: '56px', xsm: '68px' },
          borderRadius: { xs: '28px', xsm: '34px' },
          flexShrink: 0,
        }}
        src={userInfo.avatarLink}
      />
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        {name && name !== proxy ? (
          <Box
            sx={{
              color: '#323C46',
              fontSize: { xs: '18px', xsm: '20px' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'pre',
              width: '100%',
            }}
          >
            {name}
          </Box>
        ) : null}
        {proxy ? (
          <Box
            sx={{
              color: '#78828C',
              fontSize: {
                xs: '12px',
                xsm: '14px',
              },
            }}
          >
            {substitutionString(proxy, 5, 5, '.')}
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
export default observer(TransferModalNamePart)
