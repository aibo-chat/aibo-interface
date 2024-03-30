import { observer } from 'mobx-react-lite'
import React from 'react'
import { Box } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import ArrowIcon from '../../../../../public/res/svg/transfer/common_outlined_arrow_down_v2.svg?react'
import { IConvertTokenList } from '../../../hooks/aptos/useConvert'

interface IStepTwoProps {
  fromToken?: IConvertTokenList
  toToken?: IConvertTokenList
  fromAmount: string
  toAmount: string
  exchangeRate: string
  feeAmount: string
  feeSymbol: string
}

const StepTwo: React.FC<IStepTwoProps> = ({ fromToken, fromAmount, toToken, toAmount, exchangeRate, feeAmount, feeSymbol }) => (
  <Box
    sx={{
      width: '100%',
      height: '250px',
      marginTop: '12px',
      boxSizing: 'border-box',
    }}
  >
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
      }}
    >
      <Box
        component="img"
        src={fromToken?.logoURI}
        sx={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          flexShrink: 0,
        }}
      />
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          margin: '0 12px',
          fontSize: '20px',
          fontWeight: 500,
          lineHeight: '28px',
          color: '#23282D',
        }}
      >
        {new BigNumber(fromAmount).toFormat(4)}
      </Box>
      <Box
        sx={{
          fontSize: '20px',
          fontWeight: 500,
          lineHeight: '24px',
          color: '#23282D',
        }}
      >
        {fromToken?.symbol}
      </Box>
    </Box>
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 17px',
        margin: '4px 0',
      }}
    >
      <ArrowIcon />
    </Box>
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
      }}
    >
      <Box
        component="img"
        src={toToken?.logoURI}
        sx={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          flexShrink: 0,
        }}
      />
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          margin: '0 12px',
          fontSize: '20px',
          fontWeight: 500,
          lineHeight: '28px',
          color: '#23282D',
        }}
      >
        {new BigNumber(toAmount).toFormat(4)}
      </Box>
      <Box
        sx={{
          fontSize: '20px',
          fontWeight: 500,
          lineHeight: '24px',
          color: '#23282D',
          marginBottom: '12px',
        }}
      >
        {toToken?.symbol}
      </Box>
    </Box>
    <Box
      sx={{
        mt: 4,
        width: '100%',
        border: '1px solid #F0F5FA',
        borderRadius: '8px',
        backgroundColor: '#FAFAFA',
        padding: '12px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <Box
          sx={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#78828C',
          }}
        >
          Price
        </Box>
        <Box
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '20px',
            color: '#23282D',
          }}
        >
          {fromToken && toToken ? (
            <>
              <Box
                component="span"
                sx={{
                  marginRight: '2px',
                }}
              >
                {new BigNumber(exchangeRate).isZero() ? 0 : 1}
              </Box>
              <Box
                component="span"
                sx={{
                  marginRight: '2px',
                }}
              >
                {fromToken.symbol}
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
                {exchangeRate}
              </Box>
              <Box component="span">{toToken.symbol}</Box>
            </>
          ) : null}
        </Box>
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <Box
          sx={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#78828C',
          }}
        >
          Transaction Fee
        </Box>
        <Box
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '20px',
            color: '#23282D',
          }}
        >
          <>
            <Box
              component="span"
              sx={{
                marginRight: '2px',
              }}
            >
              {new BigNumber(feeAmount).toFormat(4)}
            </Box>
            <Box component="span">{feeSymbol}</Box>
          </>
        </Box>
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#78828C',
          }}
        >
          Minimum received
        </Box>
        <Box
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '20px',
            color: '#23282D',
          }}
        >
          {toToken ? (
            <>
              <Box
                component="span"
                sx={{
                  marginRight: '2px',
                }}
              >
                {toAmount}
              </Box>
              <Box component="span">{toToken.symbol}</Box>
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  </Box>
)
export default observer(StepTwo)
