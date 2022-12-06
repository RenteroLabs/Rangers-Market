import { createTheme } from '@mui/material'

// Material UI theme global config
const AppTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#000032',
      paper: '#1a1a46',
    },
  },
  typography: {
    fontFamily: 'Poppins',
    fontSize: 12,
    fontWeightLight: 300,
    htmlFontSize: 12,
  },
})

export default AppTheme