import React, { useState } from 'react'
import {
  ButtonBase,
  checkboxClasses,
  menuClasses,
  MenuItem,
  menuItemClasses,
  MenuItemProps,
  outlinedInputClasses,
  Select,
  selectClasses,
  SelectProps,
  styled,
  Switch,
  SwitchProps,
  TextField,
  TextFieldProps,
  useTheme,
} from '@mui/material'
import { NumericFormat, NumericFormatProps } from 'react-number-format'
import SelectIcon from '../../../../public/res/svg/common/common_outline_select_icon.svg?react'

export interface IGroupChatSelectProps extends SelectProps {
  data: Array<any>
  renderItem: (value: any, index: number) => React.ReactNode
  extraContent?: () => React.ReactElement | null
}
const StyledSelect = styled(({ children, ...props }: SelectProps) => <Select {...props}>{children}</Select>)(({}) => ({
  borderRadius: '8px',
  [`& .${selectClasses.select}`]: {
    padding: '3px 24px 3px 4px',
    paddingRight: `24px !important`,
    borderRadius: '8px',
    border: '1px solid #E6EBF0',
    '&:focus': {
      borderRadius: '8px',
    },
  },
  [`& .${selectClasses.icon}`]: {
    right: '0',
  },
  [`& .${outlinedInputClasses.notchedOutline}`]: {
    padding: 0,
    border: 'none',
  },
}))
export const GroupChatSelect: React.FC<IGroupChatSelectProps> = (props) => {
  const { data, renderItem, sx, extraContent, ...selectProps } = props
  const [open, setOpen] = useState(false)
  return (
    <StyledSelect
      MenuProps={{
        PaperProps: {
          sx: {
            padding: '8px 4px',
            minWidth: 'unset !important',
            boxShadow: 'none',
            border: '1px solid #EEE',
            borderRadius: '8px',
            marginTop: '3px',
            [`& .${checkboxClasses.checked}`]: {
              color: '#4685FF !important',
            },
            [`& .${menuClasses.list}`]: {
              paddingTop: 0,
              paddingBottom: 0,
            },
            [`& .${menuItemClasses.root}.${menuItemClasses.selected}`]: {
              backgroundColor: '#FFF',
            },
            [`& .${menuItemClasses.root}.${menuItemClasses.selected}:hover`]: {
              backgroundColor: '#F5F6F9',
            },
          },
        },
      }}
      IconComponent={() => (
        <ButtonBase
          sx={{
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            right: '4px',
            '&:hover': {
              backgroundColor: '#F5F6F9',
            },
          }}
          onClick={() => {
            if (!data?.length) return
            setOpen(true)
          }}
        >
          <SelectIcon
            style={{
              fill: '#6E757C',
            }}
          />
        </ButtonBase>
      )}
      multiple={false}
      open={open}
      onOpen={() => {
        if (!data?.length) return
        setOpen(true)
      }}
      onClose={() => {
        setOpen(false)
      }}
      displayEmpty
      {...selectProps}
      sx={{
        [`& .${selectClasses.icon}`]: {
          color: open ? '#4685FF' : '#78828C',
        },
        ...sx,
      }}
    >
      {extraContent ? extraContent() : null}
      {data.map((value, index) => renderItem(value, index))}
    </StyledSelect>
  )
}

export const GroupChatMenuItem = styled(({ children, ...props }: MenuItemProps) => <MenuItem {...props}>{children}</MenuItem>)(({}) => ({
  padding: '8px',
  color: '#474746',
  fontSize: '14px',
  fontWeight: 500,
  borderRadius: '8px',
  lineHeight: '24px',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: '#F4F4F4',
  },
}))

export const GroupChatTextField = styled((props: TextFieldProps) => <TextField {...props} />)(({}) => ({
  [`& .${outlinedInputClasses.root}`]: {
    borderRadius: '16px',
    padding: '16px',
  },
  [`& .${outlinedInputClasses.input}`]: {
    padding: 0,
  },
  [`& .${outlinedInputClasses.input}::placeholder`]: {
    opacity: 1,
    color: '#BFC6CD',
    fontSize: '14px',
  },
}))
interface IGroupChatSwitchProps extends SwitchProps {
  checkedColor?: string
  unCheckedColor?: string
}
export const GroupChatSwitch: React.FC<IGroupChatSwitchProps> = ({ sx, checkedColor, unCheckedColor, ...props }) => {
  const theme = useTheme()
  return (
    <Switch
      sx={{
        width: '54px',
        height: '28px',
        padding: 0,
        borderRadius: '20px',
        '& .MuiSwitch-switchBase': {
          padding: 0,
          margin: '1px',
          transitionDuration: '300ms',
          '&.Mui-checked': {
            transform: 'translateX(26px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: checkedColor || '#00D0B7',
              opacity: 1,
              border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: 0.5,
            },
          },
          '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: checkedColor || '#00D0B7',
            border: '6px solid #fff',
          },
          '&.Mui-disabled .MuiSwitch-thumb': {
            color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
          },
          '&.Mui-disabled + .MuiSwitch-track': {
            opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
          },
        },
        '& .MuiSwitch-thumb': {
          boxSizing: 'border-box',
          width: '26px',
          height: '26px',
        },
        '& .MuiSwitch-track': {
          borderRadius: '13px',
          backgroundColor: unCheckedColor || '#BFC6CD',
          opacity: 1,
          transition: theme.transitions.create(['background-color'], {
            duration: 500,
          }),
        },
        ...sx,
      }}
      focusVisibleClassName=".Mui-focusVisible"
      disableRipple
      {...props}
    />
  )
}
interface NumberFormatCustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
  value: string
  decimalScale: number
}
export const GroupChatNumberFormatCustom = React.forwardRef<NumericFormatProps, NumberFormatCustomProps>((props, ref) => {
  const { onChange, decimalScale, ...other } = props
  return (
    <NumericFormat
      getInputRef={ref}
      onValueChange={(values) => {
        if (values.value !== props.value)
          onChange({
            target: {
              name: props.name,
              value: values.value || '',
            },
          })
      }}
      thousandSeparator
      valueIsNumericString
      decimalScale={decimalScale}
      allowNegative={false}
      {...other}
    />
  )
})
