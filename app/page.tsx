'use client'
import {CssBaseline, ThemeProvider, createTheme} from '@mui/material'
import {StrictMode} from 'react'
import {Data} from './data'

const theme = createTheme({
  palette: {mode: 'dark', background: {default: '#000'}, primary: {main: '#d9ccff'}},
})

export default function Home() {
  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Data />
      </ThemeProvider>
    </StrictMode>
  )
}
