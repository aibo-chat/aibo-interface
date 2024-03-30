import { observer } from 'mobx-react-lite'
import React from 'react'
import { Box } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import ConvertCardMessageLogo from '../../../../../public/res/svg/transfer/convert_card_message_logo.svg?react'
import SuccessSvg from '../../../../../public/aptos/Success.svg?react'
import LinkSvg from '../../../../../public/aptos/Link.svg?react'
import { getExplorerLink } from '../../../hooks/aptos/utils'

export interface ConvertCardResultData {
  from_amount: string
  from_symbol: string
  to_amount: string
  to_symbol: string
  transaction_fee_amount: string
  transaction_fee_symbol: string
  tx_hash: string
  exchange_rate: string
  network_name: string
}
interface IResultPartProps {
  orderDetail: ConvertCardResultData
}

const ResultPart: React.FC<IResultPartProps> = ({ orderDetail }) => (
  <Box
    sx={{
      width: '100%',
      backgroundColor: '#FFF',
      borderRadius: '0px 8px 8px 8px',
      padding: '7px 12px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '19px',
      }}
    >
      <ConvertCardMessageLogo
        style={{
          width: '130px',
          height: '20px',
        }}
      />
    </Box>
    <SuccessSvg
      style={{
        marginBottom: '12px',
      }}
    />
    <Box
      sx={{
        fontSize: '16px',
        fontWeight: 500,
        lineHeight: '20px',
        color: '#23282D',
        marginBottom: '16px',
      }}
    >
      Transaction success
    </Box>
    <Box
      sx={{
        width: '100%',
        padding: '10px 12px 12px',
        border: '1px solid #F0F5FA',
        borderRadius: '8px',
        backgroundColor: '#FAFAFA',
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        color: '#78828C',
        '& > div': {
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '12px',
          alignItems: 'center',
          '& > div:nth-child(2)': {
            fontWeight: 500,
            color: '#23282D',
          },
        },
      }}
    >
      <Box>
        <Box>Price</Box>
        <Box>
          {orderDetail?.exchange_rate ? (
            <>
              <Box
                component="span"
                sx={{
                  marginRight: '2px',
                }}
              >
                {new BigNumber(orderDetail.exchange_rate).isZero() ? 0 : 1}
              </Box>
              <Box
                component="span"
                sx={{
                  marginRight: '2px',
                }}
              >
                {orderDetail?.from_symbol}
              </Box>
              <Box
                component="span"
                sx={{
                  marginRight: '2px',
                }}
              >
                =
              </Box>
              <Box
                component="span"
                sx={{
                  marginRight: '2px',
                }}
              >
                {new BigNumber(orderDetail.exchange_rate).toFormat(4)}
              </Box>
              <Box component="span">{orderDetail?.to_symbol}</Box>
            </>
          ) : null}
        </Box>
      </Box>
      <Box>
        <Box>Transaction Fee</Box>
        <Box>
          <Box
            component="span"
            sx={{
              marginRight: '2px',
            }}
          >
            {new BigNumber(orderDetail?.transaction_fee_amount).toString()}
          </Box>
          <Box component="span">{orderDetail?.transaction_fee_symbol}</Box>
        </Box>
      </Box>
      <Box>
        <Box>Received</Box>
        <Box>
          <Box
            component="span"
            sx={{
              marginRight: '2px',
            }}
          >
            {new BigNumber(orderDetail?.to_amount).toString()}
          </Box>
          <Box component="span">{orderDetail?.to_symbol}</Box>
        </Box>
      </Box>
      <Box sx={{ marginBottom: 0 }}>
        <Box>Tx hash</Box>
        <a style={{ marginBottom: -2 }} target="_blank" href={getExplorerLink(orderDetail?.tx_hash, orderDetail?.network_name)} rel="noreferrer">
          <LinkSvg />
        </a>
      </Box>
    </Box>
  </Box>
)
export default observer(ResultPart)
