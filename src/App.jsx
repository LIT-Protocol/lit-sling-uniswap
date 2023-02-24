import React from 'react';
import { Route, Routes } from "react-router-dom";
import Main from "./Main";
import ExecuteAction from "./components/executeAction/ExecuteAction";
import { createTheme, Link, Stack, ThemeProvider, Typography } from "@mui/material";
import LitLogo from './assets/litlogo.svg';
import './App.css';

// import PriceCheck from "./components/priceCheck/PriceCheck";
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#fff',

    },
    typography: {
      fontFamily: [
        "Figtree", "Space Grotesk", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "sans-serif"
      ].join(','),
    }
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <div className={'app-container'}>
        <Stack spacing={3} direction={'row'} alignItems={'center'} justifyContent={'space-between'}
               sx={{padding: '1em'}}>
          <Stack spacing={3} direction={'row'} alignItems={'center'} justifyContent={'flex-end'}>
            <a href={'https://litprotocol.com'} target={'_blank'} rel={'noreferrer'}>
              <img src={LitLogo} className={'nav-logo'}/>
            </a>
            <Typography sx={{color: '#fff'}} variant={'h6'}><strong>Lit Action Swap Playground</strong></Typography>
          </Stack>
          <Stack spacing={3} direction={'row'} alignItems={'center'} justifyContent={'flex-end'}>
            <Link className={'nav-link'} href={'https://explorer.litprotocol.com/mint-pkp'}
                  target={'_blank'}>Mint a PKP</Link>
            <Link className={'nav-link'}
                  href={'https://developer.litprotocol.com/SDK/Explanation/LitActions/helloWorld'}
                  target={'_blank'}>Lit Actions Docs</Link>
          </Stack>
          {/*<Stack spacing={3} direction={'row'} alignItems={'center'} justifyContent={'flex-end'}>*/}
          {/*</Stack>*/}
        </Stack>
        <Routes>
          <Route path={'/'} element={<Main/>}/>
          <Route path={"action"} element={<ExecuteAction/>}/>
          {/*<Route path={"pricing"} element={<PriceCheck/>}/>*/}
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App;
