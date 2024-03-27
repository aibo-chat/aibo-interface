import { Box, Slider, SxProps, Theme, styled } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import React from "react";

const FixedPercent = [
  { key: '0', value: 0, labelX: 0 },
  { key: '25%', value: 25 },
  { key: '50%', value: 50 },
  { key: '75%', value: 75 },
  { key: 'Max', value: 100, labelX: -100 }
]

const marks = [
  {
    value: 0,
  },
  {
    value: 25,
  },
  {
    value: 50,
  },
  {
    value: 75,
  },
  {
    value: 100,
  },
];

const PrettoSlider = styled(Slider)({
  height: 2,
  padding: '16px 0!important',
  '& .MuiSlider-track': {
    border: 'none',
    background: '#25B1FF',
  },
  '& .MuiSlider-rail': {
    backgroundColor: '#EBF0F5',
  },
  '& .MuiSlider-mark': {
    width: 2,
    height: 10,
    backgroundColor: '#EBF0F5',
  },
  '& .MuiSlider-thumb': {
    height: 10,
    width: 2,
    backgroundColor: '#25B1FF',
    borderRadius: '4px',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&::before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    fontSize: 10,
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    background: '#25B1FF',
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&::before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
});

export function InputAmountBar({
  sx,
  percentage,
  changeAmountByBar
}: {
  sx?: SxProps<Theme>
  percentage: number
  changeAmountByBar: (value: number) => void
}) {

  const handleChange = (event: Event, value: number | number[]) => {
    changeAmountByBar(value as number)
  }

  return (
    <Box>
      <PrettoSlider
        valueLabelDisplay="auto"
        aria-label="pretto slider"
        value={percentage}
        onChange={handleChange}
        size="small"
        marks={marks}
        valueLabelFormat={(x) => `${x}%`}
      />

      <Box sx={{
        display: 'flex',
        color: '#25B1FF',
        fontSize: '14px',
        position: 'relative',
        mt: '-7px',
      }}>
        {FixedPercent.map((item, index) => (
          <Box
            sx={{
              position: 'absolute',
              transform: `translateX(${item.labelX ?? -50}%)`,
              ml: `${item.value}%`,
              cursor: 'pointer',
            }}
            key={index}
            onClick={() => {
              changeAmountByBar(item.value)
            }}
          >
            {item.key}
          </Box>
        ))}
      </Box>
    </Box>
  )
}