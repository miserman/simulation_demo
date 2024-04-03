'use client'
import {CssBaseline, ThemeProvider, createTheme} from '@mui/material'
import {StrictMode} from 'react'
import {Data} from './data'

const theme = createTheme({
  palette: {mode: 'dark', primary: {main: '#b393d3'}, success: {main: '#4986cb'}, error: {main: '#e0561c'}},
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
