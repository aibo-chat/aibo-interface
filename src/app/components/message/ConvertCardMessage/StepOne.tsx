import { observer } from 'mobx-react-lite'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { Box, ButtonBase, ClickAwayListener, InputBase, Tooltip } from '@mui/material'
import { BigNumber } from 'bignumber.js'
import { NumberFormatCustom } from '../../TransferModal/components/TransferModalInput'
import ArrowDownIcon from '../../../../../public/res/svg/common/common_outlined_arrow_down.svg?react'
import ExchangeIcon from '../../../../../public/res/svg/common/common_outlined_exchange_icon_v2.svg?react'
import { IConvertTokenList } from '../../../hooks/aptos/useConvert'

interface IStepOneProps {
  fromToken?: IConvertTokenList
  fromTokenList: Array<IConvertTokenList>
  setFromToken: (token?: IConvertTokenList) => void
  toToken?: IConvertTokenList
  toTokenList: Array<IConvertTokenList>
  setToToken: (token?: IConvertTokenList) => void
  fromAmount: string
  setFromAmount: Dispatch<SetStateAction<string>>
  toAmount: string
  exchangeRate: string
  route: Array<string | undefined>
}

interface IMySelectProps {
  selectedToken?: IConvertTokenList
  tokenList: Array<IConvertTokenList>
  setSelectedToken: (token?: IConvertTokenList) => void
}
const MySelect: React.FC<IMySelectProps> = ({ selectedToken, tokenList, setSelectedToken }) => {
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false)
  return (
    <Tooltip
      open={tooltipOpen}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -20],
              },
            },
          ],
        },
      }}
      PopperProps={{
        sx: {
          '& .MuiTooltip-tooltip': {
            backgroundColor: '#FAFAFA',
            boxShadow: '0px 8px 24px -6px rgba(0, 0, 0, 0.16), 0px 0px 1px rgba(0, 0, 0, 0.4)',
            color: '#323C46',
            fontSize: '12px',
            borderRadius: '8px',
            padding: '0px',
            lineHeight: '16px',
            maxWidth: '1000px',
          },
        },
      }}
      placement="bottom"
      title={
        <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
          <Box
            sx={{
              width: '130px',
              maxHeight: '200px',
              padding: '4px 0',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {tokenList?.map((token, index) => (
              <ButtonBase
                key={token.address}
                sx={{
                  width: '100%',
                  height: '28px',
                  marginBottom: index === tokenList.length - 1 ? 0 : '4px',
                }}
                onClick={() => {
                  setSelectedToken(token)
                  setTooltipOpen(false)
                }}
              >
                <Box
                  component="img"
                  src={token.logoURI}
                  sx={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    margin: '0 4px',
                    flexShrink: 0,
                  }}
                />
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '24px',
                    color: '#23282D',
                    fontFamily: 'var(--font-secondary)',
                    whiteSpace: 'pre',
                  }}
                >
                  {token.symbol}
                </Box>
              </ButtonBase>
            ))}
          </Box>
        </ClickAwayListener>
      }
    >
      <ButtonBase
        sx={{
          width: '130px',
          height: '28px',
          borderRadius: '14px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
        onClick={() => {
          setTooltipOpen((prevState) => !prevState)
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {selectedToken ? (
            <>
              <Box
                component="img"
                src={selectedToken.logoURI}
                sx={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  margin: '0 4px',
                  flexShrink: 0,
                }}
              />
              <Box
                sx={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '18px',
                  fontWeight: 500,
                  lineHeight: '24px',
                  color: '#23282D',
                }}
              >
                {selectedToken.symbol}
              </Box>
            </>
          ) : null}
        </Box>
        <Box
          sx={{
            width: '16px',
            height: '16px',
            flexShrink: 0,
            marginRight: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(${tooltipOpen ? 180 : 0}deg)`,
          }}
        >
          <ArrowDownIcon
            style={{
              width: '100%',
              height: '100%',
              stroke: '#78828C',
            }}
          />
        </Box>
      </ButtonBase>
    </Tooltip>
  )
}
const StepOne: React.FC<IStepOneProps> = ({ fromToken, fromAmount, setFromAmount, fromTokenList, setFromToken, toToken, toAmount, toTokenList, setToToken, exchangeRate, route }) => {

  const exChangeToken = () => {
    setFromToken(toToken)
    setToToken(fromToken)
  }

  return (
    <Box
      sx={{
        width: '100%',
        marginTop: '8px',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <ButtonBase
        sx={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          backgroundColor: '#FFFFFF',
          position: 'absolute',
          top: '74px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        onClick={exChangeToken}
      >
        <ExchangeIcon
          style={{
            width: '18px',
            height: '18px',
            stroke: '#25BEFF',
          }}
        />
      </ButtonBase>
      <Box
        sx={{
          width: '100%',
          padding: '0 12px',
          borderRadius: '8px',
          backgroundColor: '#FAFAFA',
          border: '1px solid #F0F5FA',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '78px',
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#78828C',
            marginBottom: '6px',
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              marginRight: '8px',
            }}
          >
            From
          </Box>
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Box component="span" sx={{ marginRight: '2px' }}>
              Balance:
            </Box>
            <Box component="span" sx={{ marginRight: '2px' }}>
              {fromToken?.balance}
            </Box>
            <Box component="span">{fromToken?.symbol}</Box>
          </Box>
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <InputBase
            sx={{
              '.MuiInputBase-input': { p: 0 },
              fontSize: '20px',
              fontWeight: 500,
              color: '#23282D',
              lineHeight: '28px',
            }}
            fullWidth
            placeholder="0.00"
            disabled={false}
            value={fromAmount}
            autoFocus={false}
            onChange={(e) => {
              setFromAmount(e.target.value)
            }}
            inputProps={{
              decimalScale: 4,
              'aria-label': 'amount input',
              isAllowed: (values: { floatValue: number }) => {
                const { floatValue } = values
                if (floatValue === undefined) {
                  return true
                }
                return floatValue >= 0
              },
            }}
            inputComponent={NumberFormatCustom as any}
          />
          <MySelect selectedToken={fromToken} tokenList={fromTokenList} setSelectedToken={setFromToken} />
        </Box>
      </Box>
      <Box
        sx={{
          width: '100%',
          padding: '0 12px',
          borderRadius: '8px',
          backgroundColor: '#FAFAFA',
          border: '1px solid #F0F5FA',
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '78px',
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#78828C',
            marginBottom: '6px',
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              marginRight: '8px',
            }}
          >
            To
          </Box>
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Box component="span" sx={{ marginRight: '2px' }}>
              Balance:
            </Box>
            <Box component="span" sx={{ marginRight: '2px' }}>
              {toToken?.balance}
            </Box>
            <Box component="span">{toToken?.symbol}</Box>
          </Box>
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              fontSize: '20px',
              fontWeight: 500,
              color: '#23282D',
              lineHeight: '28px',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {toAmount}
          </Box>
          <MySelect selectedToken={toToken} tokenList={toTokenList} setSelectedToken={setToToken} />
        </Box>
      </Box>
      <Box
        sx={{
          width: '100%',
          border: '1px solid #F0F5FA',
          height: '72px',
          borderRadius: '8px',
          padding: '0 12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '20px',
          color: '#78828C',
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            height: '20px',
            marginBottom: '10px',
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
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>Route</Box>
          <Box
            sx={{
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '24px',
              color: '#23282D',
            }}
          >
            {route?.map((singleRoute, index) => (
              <Box
                key={index}
                component="span"
                sx={{
                  marginRight: index === route.length - 1 ? 0 : '4px',
                }}
              >{`${singleRoute}${index === route.length - 1 ? '' : ' >'}`}</Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
export default observer(StepOne)
