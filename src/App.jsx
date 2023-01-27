import React from 'react';
import { Route, Routes } from "react-router-dom";
import Main from "./Main";
import ExecuteAction from "./components/executeAction/ExecuteAction";
import { Link, Stack } from "@mui/material";
import LitLogo from './assets/litlogo.svg';
import './App.css';

// import PriceCheck from "./components/priceCheck/PriceCheck";


function App() {
  return (
    <div>
      <Stack spacing={3} direction={'row'} alignItems={'center'} justifyContent={'flex-end'} sx={{margin: '1em'}}>
        <Link className={'nav-link'} href={'https://explorer.litprotocol.com/mint-pkp'}
              target={'_blank'}>Mint a PKP</Link>
        <Link className={'nav-link'} href={'https://developer.litprotocol.com/SDK/Explanation/LitActions/helloWorld'}
              target={'_blank'}>Lit Actions Docs</Link>
        <a href={'https://litprotocol.com'} target={'_blank'} rel={'noreferrer'}>
          <img src={LitLogo} className={'nav-logo'}/>
        </a>
      </Stack>
      <Routes>
        <Route path={'/'} element={<Main/>}/>
        <Route path={"action"} element={<ExecuteAction/>}/>
        {/*<Route path={"pricing"} element={<PriceCheck/>}/>*/}
      </Routes>
    </div>
  )
}

export default App;
