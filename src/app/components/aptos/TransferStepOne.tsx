import { Box, Button, InputBase, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React from "react";
import { InputAmountBar } from "./InputBar";
import { AptosUserAssetData } from "../../hooks/aptos/type";
import { ImageJsonData } from "../../hooks/aptos/coin-map";
import { formatAmount } from "../../hooks/aptos/utils";

export function AptosTransferStepOne({
  handleNext,
  setToAddress,
  toAddress,
  sendAmount,
  setSendAmount,
  percentage,
  setPercentage,
  changeAmountByBar,
  handleSelectCoin,
  selectCoin,
  userHoldCoinList,
  selectCoinData
}: {
  handleNext: () => void;
  setToAddress: React.Dispatch<React.SetStateAction<string>>;
  toAddress: string;
  sendAmount: string;
  setSendAmount: React.Dispatch<React.SetStateAction<string>>;
  changeAmountByBar: (value: number) => void;
  percentage: number;
  setPercentage: React.Dispatch<React.SetStateAction<number>>;
  handleSelectCoin: (event: SelectChangeEvent) => void;
  selectCoin: string;
  userHoldCoinList: AptosUserAssetData[]
  selectCoinData: AptosUserAssetData
}) {
  return (
    <Box>

      <Box sx={{ mt: 4, fontSize: '14px' }}>
        <Box sx={{ mb: 2 }}>Network</Box>

        <Box sx={{
          borderRadius: '8px',
          px: 2,
          height: 36,
          border: '1px solid #F0F5FA',
          bgcolor: '#FAFAFA',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Box
            component={'img'}
            sx={{
              width: 20,
              height: 20,
            }}
            src="https://raw.githubusercontent.com/pontem-network/coins-registry/main/src/coins-logos/apt.svg"
            alt=""
          />
          <Box component={'span'} sx={{ ml: 2 }}>
            Aptos
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 4, fontSize: '14px' }}>
        <Box sx={{ mb: 2 }}>Token</Box>

        <Box sx={{
          borderRadius: '8px',
          height: 36,
          border: '1px solid #F0F5FA',
          bgcolor: '#FAFAFA'
        }}>
          <Select
            value={selectCoin}
            onChange={handleSelectCoin}
            variant="outlined"
            className="AssetInput__select"
            sx={{
              width: '100%',
              '&.AssetInput__select .MuiSelect-select': {
                py: 0,
                backgroundColor: 'transparent',
                pr: '16px !important',
                pl: 2,
                height: 36,
              },
              '&.AssetInput__select .MuiOutlinedInput-notchedOutline': { display: 'none' },
            }}
            renderValue={() => {
              return (
                <Box sx={{
                  color: '#78828C',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  height: 36,
                }}>
                  <Box
                    component={'img'}
                    src={ImageJsonData[selectCoinData.asset_type].logo_url}
                    sx={{
                      width: 20,
                      height: 20,
                    }}
                  />
                  <Box component={'span'} sx={{ fontSize: '14px', color: '#23282D', ml: 2 }}>
                    {selectCoinData.metadata.symbol}
                  </Box>
                  <Box component={'span'} sx={{ ml: 2 }}>
                    {selectCoinData.metadata.name}
                  </Box>
                  {/* <Box component={'span'} sx={{ ml: 2 }}>
                    {formatAmount(selectCoinData)}
                  </Box> */}
                </Box>
              )
            }}
          >
            {userHoldCoinList.map((token, index) => (
              <MenuItem
                key={index}
                value={token.asset_type}
                sx={{
                  color: '#78828C',
                  fontSize: '12px',
                }}>
                <Box
                  component={'img'}
                  src={ImageJsonData[token.asset_type].logo_url}
                  sx={{
                    width: 20,
                    height: 20,
                  }}
                />
                <Box component={'span'} sx={{ fontSize: '14px', color: '#23282D', ml: 2 }}>
                  {token.metadata.symbol}
                </Box>
                <Box component={'span'} sx={{ ml: 2 }}>
                  {token.metadata.name}
                </Box>
                <Box component={'span'} sx={{ ml: 'auto' }}>
                  {formatAmount(token)}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      <Box sx={{ mt: 4, fontSize: '14px', mb: 2, }}>
        <Box sx={{ mb: 2 }}>Amount</Box>

        <Box sx={{
          borderRadius: '8px',
          px: 2,
          height: 36,
          border: '1px solid #F0F5FA',
          bgcolor: '#FAFAFA'
        }}>
          <InputBase
            fullWidth
            sx={{ height: 36 }}
            type="number"
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
          />
        </Box>
      </Box>

      <InputAmountBar
        percentage={percentage}
        setPercentage={setPercentage}
        changeAmountByBar={changeAmountByBar}
      />

      <Box sx={{ mt: 8, fontSize: '14px' }}>
        <Box sx={{ mb: 2 }}>Address</Box>

        <Box sx={{
          borderRadius: '8px',
          px: 2,
          height: 36,
          border: '1px solid #F0F5FA',
          bgcolor: '#FAFAFA'
        }}>
          <InputBase
            fullWidth
            sx={{ height: 36 }}
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', mt: 6 }}>
        <Button sx={{
          bgcolor: '#25B1FF',
          borderRadius: '8px',
          height: 34,
          width: 150,
          color: '#fff',
          fontSize: '14px',
          m: 'auto',
          fontWeight: 700,
          ':hover': {
            bgcolor: '#25B1FF',
            opacity: '.8',
          }
        }} onClick={handleNext}>
          Next
        </Button>
      </Box>

    </Box>
  )
}