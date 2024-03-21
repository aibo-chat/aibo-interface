import { PaletteColor, Theme, ThemeOptions } from '@mui/material'
import { createTheme } from '@mui/material/styles'

import React from 'react'

const theme = createTheme()
const {
  typography: { pxToRem },
} = theme

const FONT = 'var(--font-secondary)'

interface TypographyCustomVariants {
  display1: React.CSSProperties
  subheader1: React.CSSProperties
  subheader2: React.CSSProperties
  description: React.CSSProperties
  buttonL: React.CSSProperties
  buttonM: React.CSSProperties
  buttonS: React.CSSProperties
  helperText: React.CSSProperties
  tooltip: React.CSSProperties
  main21: React.CSSProperties
  secondary21: React.CSSProperties
  main16: React.CSSProperties
  secondary16: React.CSSProperties
  main14: React.CSSProperties
  secondary14: React.CSSProperties
  main12: React.CSSProperties
  secondary12: React.CSSProperties
  main24: React.CSSProperties
  secondary24: React.CSSProperties
  main66: React.CSSProperties
  main20: React.CSSProperties
  landing24: React.CSSProperties
  landing20: React.CSSProperties
  footer12: React.CSSProperties
}

declare module '@mui/material/styles' {
  type TypographyVariants = TypographyCustomVariants

  // allow configuration using `createTheme`
  type TypographyVariantsOptions = TypographyCustomVariants

  interface BreakpointOverrides {
    xsm: true
    xxl: true
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    display1: true
    subheader1: true
    subheader2: true
    description: true
    buttonL: true
    buttonM: true
    buttonS: true
    helperText: true
    tooltip: true
    main21: true
    secondary21: true
    main16: true
    secondary16: true
    main14: true
    secondary14: true
    main12: true
    secondary12: true
    footer12: true
    main24: true
    secondary24: true
    main66: true
    main20: true
    landing24: true
    landing20: true
    h5: false
    h6: false
    subtitle1: false
    subtitle2: false
    body1: false
    body2: false
    button: false
    overline: false
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    surface: true
    gradient: true
    light: true
    gold: true
    purple: true
    purpletext: true
    goldtext: true
    acc_outlined: true
    activity_go: true
    dex: true
  }
}

export const CommonScrollBarCSS = {
  '&::-webkit-scrollbar': {
    width: '6px',
    borderRadius: '4px',
    backgroundColor: '#FAFAFA',
  },
  '&::-webkit-scrollbar-thumb': {
    width: '6px',
    borderRadius: '4px',
    backgroundColor: '#AAB4BE',
  },
}
export const getDesignTokens = (mode = 'light') => {
  const getColor = (lightColor: string, darkColor: string) => (mode === 'dark' ? darkColor : lightColor)

  return {
    breakpoints: {
      keys: ['xs', 'xsm', 'sm', 'md', 'lg', 'xl', 'xxl'],
      values: { xs: 0, xsm: 640, sm: 760, md: 960, lg: 1280, xl: 1440, xxl: 1600 },
    },
    palette: {
      mode,
      primary: {
        main: getColor('#141416', '#EAEBEF'),
        light: getColor('#62677B', '#F1F1F3'),
        dark: getColor('#292E41', '#D2D4DC'),
      },
      secondary: {
        main: getColor('#FF607B', '#F48FB1'),
        light: getColor('#FF607B', '#F6A5C0'),
        dark: getColor('#B34356', '#AA647B'),
      },
      error: {
        main: getColor('#FF3B30', '#F44336'),
        light: getColor('#D26666', '#E57373'),
        dark: getColor('#BC0000', '#D32F2F'),
        '100': getColor('#FF3B30', '#FBB4AF'), // for alert text
        '200': getColor('#F9EBEB', '#2E0C0A'), // for alert background
      },
      warning: {
        main: getColor('#F89F1A', '#FFA726'),
        light: getColor('#FFCE00', '#FFB74D'),
        dark: getColor('#C67F15', '#F57C00'),
        '100': getColor('#63400A', '#FFDCA8'), // for alert text
        '200': getColor('#FEF5E8', '#301E04'), // for alert background
      },
      info: {
        main: getColor('#0062D2', '#29B6F6'),
        light: getColor('#0062D2', '#4FC3F7'),
        dark: getColor('#002754', '#0288D1'),
        '100': getColor('#002754', '#A9E2FB'), // for alert text
        '200': getColor('#E5EFFB', '#071F2E'), // for alert background
      },
      success: {
        main: getColor('#4CAF50', '#66BB6A'),
        light: getColor('#90FF95', '#90FF95'),
        dark: getColor('#318435', '#388E3C'),
        '100': getColor('#1C4B1E', '#C2E4C3'), // for alert text
        '200': getColor('#ECF8ED', '#0A130B'), // for alert background
      },
      text: {
        primary: getColor('#141414', '#141414'),
        secondary: getColor('#23262F', '#23262F'),
        disabled: getColor('#D2D4DC', '#62677B'),
        muted: getColor('#78828C', '#78828C'),
        light: getColor('#ffffff', '#ffffff'),
        link: getColor('#00B2FF', '#00B2FF'),
      },
      // background: {
      //   default: getColor('#F1F1F3', '#1B2030'),
      //   paper: getColor('#FFFFFF', '#292E41'),
      //   surface: getColor('#F7F7F9', '#383D51'),
      //   header: getColor('#2B2D3C', '#1B2030'),
      // },
      divider: getColor('#E6EBF0', '#E6EBF0'),
      action: {
        active: getColor('#8E92A3', '#EBEBEF8F'),
        hover: getColor('#F1F1F3', '#EBEBEF14'),
        selected: getColor('#EAEBEF', '#EBEBEF29'),
        disabled: getColor('#BBBECA', '#EBEBEF4D'),
        disabledBackground: getColor('#EAEBEF', '#EBEBEF1F'),
        focus: getColor('#F1F1F3', '#EBEBEF1F'),
      },
    },
    spacing: 4,
    typography: {
      fontFamily: FONT,
      h5: undefined,
      h6: undefined,
      subtitle1: undefined,
      subtitle2: undefined,
      body1: undefined,
      body2: undefined,
      button: undefined,
      overline: undefined,
      display1: {
        fontFamily: FONT,
        fontWeight: 700,
        letterSpacing: pxToRem(0.25),
        lineHeight: '123.5%',
        fontSize: pxToRem(32),
      },
      h1: {
        fontFamily: FONT,
        fontWeight: 700,
        letterSpacing: pxToRem(0.25),
        lineHeight: '123.5%',
        fontSize: pxToRem(28),
      },
      h2: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: 'unset',
        lineHeight: '133.4%',
        fontSize: pxToRem(21),
      },
      h3: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: '160%',
        fontSize: pxToRem(18),
      },
      h4: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(24),
        fontSize: pxToRem(16),
      },
      subheader1: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(20),
        fontSize: pxToRem(14),
      },
      subheader2: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(16),
        fontSize: pxToRem(12),
      },
      description: {
        fontFamily: FONT,
        fontWeight: 400,
        letterSpacing: pxToRem(0.15),
        lineHeight: '143%',
        fontSize: pxToRem(14),
      },
      caption: {
        fontFamily: FONT,
        fontWeight: 400,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(16),
        fontSize: pxToRem(12),
      },
      buttonL: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.46),
        lineHeight: pxToRem(24),
        fontSize: pxToRem(16),
      },
      buttonM: {
        fontFamily: FONT,
        fontWeight: 500,
        lineHeight: pxToRem(24),
        fontSize: pxToRem(14),
      },
      buttonS: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.46),
        lineHeight: pxToRem(20),
        textTransform: 'uppercase',
        fontSize: pxToRem(10),
      },
      helperText: {
        fontFamily: FONT,
        fontWeight: 400,
        letterSpacing: pxToRem(0.4),
        lineHeight: pxToRem(12),
        fontSize: pxToRem(10),
      },
      tooltip: {
        fontFamily: FONT,
        fontWeight: 400,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(16),
        fontSize: pxToRem(12),
      },
      main21: {
        fontFamily: FONT,
        fontWeight: 800,
        lineHeight: '133.4%',
        fontSize: pxToRem(21),
      },
      secondary21: {
        fontFamily: FONT,
        fontWeight: 500,
        lineHeight: '133.4%',
        fontSize: pxToRem(21),
      },
      main16: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(24),
        fontSize: pxToRem(16),
      },
      secondary16: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(24),
        fontSize: pxToRem(16),
      },
      main14: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(20),
        fontSize: pxToRem(14),
      },
      secondary14: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(20),
        fontSize: pxToRem(14),
      },
      main12: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(16),
        fontSize: pxToRem(12),
      },
      secondary12: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(16),
        fontSize: pxToRem(12),
      },
      footer12: {
        fontFamily: FONT,
        fontWeight: 300,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(20),
        fontSize: pxToRem(12),
      },
      main24: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(30),
        fontSize: pxToRem(22),
      },
      secondary24: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(20),
        fontSize: pxToRem(24),
      },
      main66: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(91),
        fontSize: pxToRem(66),
      },
      main20: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(30),
        fontSize: pxToRem(20),
      },
      landing24: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(36),
        fontSize: pxToRem(24),
      },
      landing20: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(30),
        fontSize: pxToRem(20),
      },
    },
  } as ThemeOptions
}

export function getThemedComponents(theme: Theme) {
  return {
    components: {
      MuiSkeleton: {
        styleOverrides: {
          root: {
            transform: 'unset',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputLabel-root': {
              color: '#AAB4BE !important',
            },
            '& .MuiFilledInput-root': {
              borderRadius: '12px',
              border: '1px solid #E6EBF0',
              backgroundColor: 'transparent !important',
              '&.Mui-focused': {
                borderColor: '#3375F5',
              },
              '&.Mui-error': {
                borderColor: '#FF4940',
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.divider,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderWidth: '1.5px',
              borderColor: theme.palette.divider,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '1.5px',
              borderColor: '#3375F5',
            },
          },
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          fontFamily: 'var(--font-secondary)',
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: '90px',
            '&.Mui-disabled': {
              opacity: '0.3',
              backgroundColor: '#4685FF',
              color: '#ffffff',
            },
          },
        },
        variants: [
          {
            props: { variant: 'surface' },
            style: {
              color: theme.palette.common.white,
              backgroundColor: '#4685FF',
              '&:hover, &.Mui-focusVisible': {
                backgroundColor: '#4685FF',
                opacity: '0.8',
              },
            },
          },
          {
            props: { variant: 'dex' },
            style: {
              color: theme.palette.common.white,
              backgroundColor: '#4685FF',
              '&:hover, &.Mui-focusVisible': {
                backgroundColor: '#4685FF',
                opacity: '0.8',
              },
              '&.Mui-disabled': {
                opacity: 1,
                backgroundColor: '#E4EDFF',
                color: '#5EA8FF',
              },
            },
          },
          {
            props: { variant: 'light' },
            style: {
              color: '#00C8FF',
              backgroundColor: '#ffffff',
              '&:hover, &.Mui-focusVisible': {
                backgroundColor: '#ffffff',
                opacity: '0.9',
              },
            },
          },
          {
            props: { variant: 'contained' },
            style: {
              color: '#78828C',
              background: '#F0F5FA',
              '&:hover, &.Mui-focusVisible': {
                background: '#F0F5FA',
                opacity: '0.8',
              },
            },
          },
          {
            props: { variant: 'gradient' },
            style: {
              color: theme.palette.text.primary,
              background: 'rgba(255, 255, 255, 0.5)',
              transition: 'all 0.2s ease',
              '&:hover, &.Mui-focusVisible': {
                background: 'rgba(255, 255, 255, 0.5)',
                opacity: '0.9',
              },
            },
          },
          {
            props: { variant: 'text' },
            style: {
              color: '#3375F5',
              '&:hover, &.Mui-focusVisible': {
                opacity: '0.8',
                background: 'unset',
              },
            },
          },
          {
            props: { color: 'primary', variant: 'outlined' },
            style: {
              background: '#FFFFFF',
              borderColor: '#E6E8EC',
              '&:hover, &.Mui-focusVisible': {
                background: '#FFFFFF',
                opacity: '0.8',
              },
            },
          },
          // {
          //   props: { variant: 'outlined' },
          //   style: {
          //     background: 'transparent',
          //     borderColor: '#4685FF',
          //     color: '#4685FF',
          //     '&:hover, &.Mui-focusVisible': {
          //       borderColor: '#4685FF',
          //       background: 'transparent',
          //       opacity: '0.8',
          //     },
          //   },
          // },
          {
            props: { variant: 'gold' },
            style: {
              color: '#F60030',
              background: 'linear-gradient(274deg, #FFC04A 8.13%, #FEE4B8 95.79%)',
              boxShadow: 'inset 5px 2px 6px 1px #FFE9BF, inset -2px -6px 8px -2px #FFC65B',
              '&:hover, &.Mui-focusVisible': {
                opacity: '0.9',
              },
              '&.Mui-disabled': {
                boxShadow: 'unset',
                background: 'linear-gradient(274deg, #FFE6B7 8.13%, #FEE4B8 95.79%)',
                opacity: '0.8',
              },
            },
          },
          {
            props: { variant: 'purple' },
            style: {
              color: '#ffffff',
              background: 'linear-gradient(274deg, #4D2AFE 8.13%, #8A60F8 95.79%)',
              boxShadow: 'inset 1px 1px 1px #EBB3FF, inset 5px 2px 6px 1px rgba(188, 156, 255, 0.33), inset -4px -6px 5px -5px rgba(248, 228, 255, 0.8), inset -3px -4px 11px #1C00C9',
              '&:hover, &.Mui-focusVisible': {
                opacity: '0.9',
              },
              '&.Mui-disabled': {
                boxShadow: 'unset',
                background: 'linear-gradient(268.79deg, #A08DFF 4.3%, #B79CFF 95.7%)',
                opacity: '0.5',
              },
            },
          },
          {
            props: { variant: 'purpletext' },
            style: {
              color: '#ffffff',
              '&:hover, &.Mui-focusVisible': {
                opacity: '0.8',
              },
            },
          },
          {
            props: { variant: 'goldtext' },
            style: {
              color: '#ffffff',
              '&:hover, &.Mui-focusVisible': {
                opacity: '0.8',
              },
            },
          },
          {
            props: { variant: 'acc_outlined' },
            style: {
              background: 'transparent',
              borderColor: '#4685FF',
              border: '1px solid',
              lineHeight: 1.0,
              fontSize: 10,
              textTransform: 'none',
              color: '#4685FF',
              padding: '10px 10px',
              '&:hover, &.Mui-focusVisible': {
                borderColor: '#4685FF',
                background: '#FFFFFF',
                opacity: '0.8',
              },
            },
          },
          {
            props: { variant: 'activity_go' },
            style: {
              color: '#4685FF',
              backgroundColor: '#FFFFFF',
              '&:hover, &.Mui-focusVisible': {
                backgroundColor: '#FFFFFF',
                opacity: '0.8',
              },
            },
          },
        ],
      },
      MuiTypography: {
        defaultProps: {
          variant: 'description',
          variantMapping: {
            display1: 'h1',
            h1: 'h1',
            h2: 'h2',
            h3: 'h3',
            h4: 'h4',
            subheader1: 'p',
            subheader2: 'p',
            caption: 'p',
            description: 'p',
            buttonL: 'p',
            buttonM: 'p',
            buttonS: 'p',
            main12: 'p',
            main14: 'p',
            main16: 'p',
            main21: 'p',
            main24: 'p',
            secondary12: 'p',
            secondary14: 'p',
            secondary16: 'p',
            secondary21: 'p',
            secondary24: 'p',
            main66: 'p',
            main20: 'p',
            landing24: 'p',
            landing20: 'p',
            footer12: 'p',
            helperText: 'span',
            tooltip: 'span',
          },
        },
      },
      MuiLink: {
        defaultProps: {
          variant: 'description',
        },
      },
      MuiMenu: {
        defaultProps: {
          PaperProps: {
            elevation: 0,
            variant: 'outlined',
            style: {
              minWidth: 240,
              marginTop: '4px',
            },
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            '.MuiMenuItem-root+.MuiDivider-root, .MuiDivider-root': {
              marginTop: '4px',
              marginBottom: '4px',
            },
          },
          padding: {
            paddingTop: '4px',
            paddingBottom: '4px',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            padding: '12px 16px',
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: theme.palette.primary.light,
            minWidth: 'unset !important',
            marginRight: '12px',
          },
        },
      },

      MuiContainer: {
        styleOverrides: {
          root: {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            paddingBottom: '39px',
            [theme.breakpoints.up('xs')]: {
              paddingLeft: '20px',
              paddingRight: '20px',
            },
            // [theme.breakpoints.up('xsm')]: {
            //   paddingLeft: '20px',
            //   paddingRight: '20px',
            // },
            // [theme.breakpoints.up('sm')]: {
            //   paddingLeft: '48px',
            //   paddingRight: '48px',
            // },
            // [theme.breakpoints.up('md')]: {
            //   paddingLeft: '96px',
            //   paddingRight: '96px',
            // },
            // [theme.breakpoints.up('lg')]: {
            //   paddingLeft: '20px',
            //   paddingRight: '20px',
            // },
            [theme.breakpoints.up('xl')]: {
              maxWidth: 'unset',
              paddingLeft: '24px',
              paddingRight: '24px',
            },
            [theme.breakpoints.up('xxl')]: {
              paddingLeft: 0,
              paddingRight: 0,
              maxWidth: '1440px',
            },
          },
        },
      },
      MuiIcon: {
        variants: [
          {
            props: { fontSize: 'large' },
            style: {
              fontSize: pxToRem(32),
            },
          },
        ],
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderRadius: '10px!important',
            padding: '8px 12px',
            ...theme.typography.caption,
            alignItems: 'flex-start',
            '.MuiAlert-message': {
              padding: 0,
              paddingTop: '2px',
              paddingBottom: '2px',
            },
            '.MuiAlert-icon': {
              padding: 0,
              opacity: 1,
              '.MuiSvgIcon-root': {
                fontSize: pxToRem(20),
              },
            },
            a: {
              ...theme.typography.caption,
              fontWeight: 500,
              textDecoration: 'underline',
              '&:hover': {
                textDecoration: 'none',
              },
            },
            '.MuiButton-text': {
              ...theme.typography.caption,
              fontWeight: 500,
              textDecoration: 'underline',
              padding: 0,
              margin: 0,
              minWidth: 'unset',
              '&:hover': {
                textDecoration: 'none',
                background: 'transparent',
              },
            },
          },
        },
        defaultProps: {},
        variants: [
          {
            props: { severity: 'error' },
            style: {
              color: theme.palette.error['100' as keyof PaletteColor],
              background: theme.palette.error['200' as keyof PaletteColor],
              a: {
                color: theme.palette.error['100' as keyof PaletteColor],
              },
              '.MuiButton-text': {
                color: theme.palette.error['100' as keyof PaletteColor],
              },
            },
          },
          {
            props: { severity: 'info' },
            style: {
              color: theme.palette.info['100' as keyof PaletteColor],
              background: theme.palette.info['200' as keyof PaletteColor],
              a: {
                color: theme.palette.info['100' as keyof PaletteColor],
              },
              '.MuiButton-text': {
                color: theme.palette.info['100' as keyof PaletteColor],
              },
            },
          },
          {
            props: { severity: 'success' },
            style: {
              color: theme.palette.success['100' as keyof PaletteColor],
              background: theme.palette.success['200' as keyof PaletteColor],
              a: {
                color: theme.palette.success['100' as keyof PaletteColor],
              },
              '.MuiButton-text': {
                color: theme.palette.success['100' as keyof PaletteColor],
              },
            },
          },
          {
            props: { severity: 'warning' },
            style: {
              color: theme.palette.warning['100' as keyof PaletteColor],
              background: theme.palette.warning['200' as keyof PaletteColor],
              a: {
                color: theme.palette.warning['100' as keyof PaletteColor],
              },
              '.MuiButton-text': {
                color: theme.palette.warning['100' as keyof PaletteColor],
              },
            },
          },
        ],
      },
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            [theme.breakpoints.down('lg')]: {
              height: 'fill-available',
            },
          },
          body: {
            [theme.breakpoints.down('lg')]: {
              height: 'fill-available',
            },
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: pxToRem(16),
            '> div:first-of-type': {
              // first div
              [theme.breakpoints.up('lg')]: {
                minHeight: '100vh',
              },
              [theme.breakpoints.down('lg')]: {
                height: 'fill-available',
              },
              // display: 'flex',
              // flexDirection: 'column',
              // backgroundColor: '#F0F5FA',
            },
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            '.MuiPaginationItem-root.Mui-selected': {
              background: 'unset',
              color: '#4685FF',
            },
            '.MuiPaginationItem-root': {
              background: 'unset',
              fontSize: '16px',
              borderRadius: '50%',
              border: 'none',
              color: '#78828C',
            },
            // '.MuiPaginationItem-previousNext': {
            //   background: '#4685FF',
            //   color: '#ffffff',
            //   width: '40px',
            //   height: '40px',
            // },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: '#EBF0F5 !important',
            },
          },
        },
      },
    },
  } as ThemeOptions
}
export const PxToRem = pxToRem
