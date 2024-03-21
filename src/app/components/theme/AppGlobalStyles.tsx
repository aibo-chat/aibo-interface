import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'
import React, { ReactNode, useMemo } from 'react'
import { getDesignTokens, getThemedComponents } from '../../utils/theme'

/**
 * Main Layout component which wrapps around the whole app
 * @param param0
 * @returns
 */
export function AppGlobalStyles({ children }: { children: ReactNode }) {
  const theme = useMemo(() => {
    const themeCreate = createTheme(getDesignTokens())
    return deepmerge(themeCreate, getThemedComponents(themeCreate))
  }, [])

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
