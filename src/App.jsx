import React, { Fragment, useState } from 'react';
import { Route, Routes } from "react-router-dom";
import Main from "./Main";
import { Button, createTheme, Link, Menu, MenuItem, Stack, ThemeProvider, Typography } from "@mui/material";
import LitLogo from './assets/litlogo.svg';
import './App.css';
import { useRecoilState } from "recoil";
import { authSigState, selectedPkpState, userPkpsState } from "./context/appContext";
import { ArrowDropDown } from "@mui/icons-material";
import { longerTruncateAddress, truncateAddress } from "./helpers/truncateAddress";

// import PriceCheck from "./components/priceCheck/PriceCheck";
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#fff',
    },
    // secondary: {
    //   main: '#0a132d'
    // },
    typography: {
      fontFamily: [
        "Figtree", "Space Grotesk", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "sans-serif"
      ].join(','),
    }
  },
});

function App() {
  const [ userPkps, setUserPkps ] = useRecoilState(userPkpsState);
  const [ selectedPkp, setSelectedPkp ] = useRecoilState(selectedPkpState);
  const [ authSig, setAuthSig ] = useRecoilState(authSigState);

  const [ anchorEl, setAnchorEl ] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const choosePkp = (pkp) => {
    setSelectedPkp(pkp);
    handleClose()
  }

  const logout = () => {
    handleClose()
    setSelectedPkp(null)
    setUserPkps(null)
    setAuthSig(null)
    localStorage.removeItem('lit-auth-signature');
  }

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
            {!!selectedPkp && (
              <Fragment>
                <Button
                  id="basic-button"
                  color={'secondary'}
                  // sx={{backgroundColor: '#0a132d', color: '#fff'}}
                  onClick={handleClick}
                  variant={'contained'}
                  endIcon={<ArrowDropDown/>}
                >
                  Selected PKP: {truncateAddress(selectedPkp.address)}
                </Button>
                <Menu
                  id="basic-menu"
                  color={'secondary'}
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                >
                  {userPkps.map((pkp, i) => (
                    <MenuItem key={i}
                              onClick={() => choosePkp(pkp)}>{longerTruncateAddress(pkp.address)}</MenuItem>
                  ))}
                  <MenuItem onClick={logout}>Logout</MenuItem>
                </Menu>
              </Fragment>
            )}
          </Stack>
          {/*<Stack spacing={3} direction={'row'} alignItems={'center'} justifyContent={'flex-end'}>*/}
          {/*</Stack>*/}
        </Stack>
        <Routes>
          <Route path={'/'} element={<Main/>}/>
          {/*<Route path={"action"} element={<ExecuteAction/>}/>*/}
          {/*<Route path={"pricing"} element={<PriceCheck/>}/>*/}
        </Routes>
      </div>
    </ThemeProvider>
  )
}

export default App;
