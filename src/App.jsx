import React, { useEffect, useState } from 'react';
import './App.css';
import ActionCreator from "./components/actionCreator";
import { ethers } from "ethers";
import { Button, CircularProgress, Typography } from "@mui/material";
import PkpDisplay from "./components/pkpDisplay";
import { loadUserPkps } from "./functions/loadUserPkps";
import { createPkpWallet } from "./functions/createPkpWallet";
import ERC20ABI from "./ABIs/erc20Abi.json";

function App() {
  const [ provider, setProvider ] = useState(null);
  const [ loading, setLoading ] = useState(true);
  const [ userPkps, setUserPkps ] = useState(null);
  const [ selectedPkp, setSelectedPkp ] = useState(null);
  const [ pkpWallet, setPkpWallet ] = useState(null);
  const [ authSig, setAuthSig ] = useState(null);
  const [ errorObject, setErrorObject ] = useState(null);

  // tokens are locked in, but can be set to whatever you want
  const [ tokenIn, setTokenIn ] = useState({
    chainId: 137,
    decimals: 18,
    address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    symbol: 'WMATIC',
    name: 'Wrapped Matic'
  })
  const [ tokenOut, setToken1 ] = useState({
    chainId: 137,
    decimals: 6,
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    symbol: 'USDC',
    name: 'USD//C'
  })

  useEffect(() => {
    getProvider()
  }, [])

  // create signer once a pkp is selected
  useEffect(() => {
    if (!!selectedPkp) {
      makePkpWallet(selectedPkp)
    }
  }, [ selectedPkp ])

  // get provider
  const getProvider = () => {
    const polygonProvider = new ethers.providers.JsonRpcProvider('https://polygon-mainnet.infura.io/v3/3a16fe149ab14c7995cdab5f2c1d616c');
    setProvider(polygonProvider);
    setLoading(false);
  }

  // get list of user pkps
  const getPkps = async () => {
    setUserPkps([]);
    setSelectedPkp(null)
    setLoading(true)
    try {
      const loadPkpRes = await loadUserPkps();
      setUserPkps(loadPkpRes.tokenObjs);
      setAuthSig(loadPkpRes.authSig);
    } catch (err) {
      console.log('err', err);
    }
    setLoading(false);
  }

  // make pkp signer once user selectes a pkp
  const makePkpWallet = async (pkpData) => {
    setLoading(true);
    setSelectedPkp(pkpData);
    let pkpWalletRes;
    try {
      pkpWalletRes = await createPkpWallet(pkpData, "https://polygon-mainnet.g.alchemy.com/v2/FE1hoZCnj1juphC10dRbTiz3xjapaZho");
      setPkpWallet(pkpWalletRes);
    } catch (err) {
      console.log('Error creating PKP wallet', err);
      setErrorObject({
        message: 'Error creating PKP wallet'
      })
    }
    setLoading(false);
  }

  if (errorObject) {
    return (
      <div className="center">
        <Typography sx={{color: '#fff'}} variant={'h5'}>{errorObject.message}</Typography>
      </div>
    )
  }

  if (loading === true) {
    return (
      <div className="App">
        <CircularProgress sx={{position: 'absolute', top: '48%', right: '50%', transform: 'translate(50%,-50%)'}}/>
      </div>
    )
  }

  if (!!pkpWallet) {
    return (
      <div className="App">
        <ActionCreator provider={provider}
                       pkp={selectedPkp}
                       pkpWallet={pkpWallet}
                       authSig={authSig}
                       tokenIn={tokenIn}
                       tokenOut={tokenOut}/>
      </div>
    )
  }

  if (!!userPkps) {
    if (userPkps.length) {
      return (
        <PkpDisplay pkps={userPkps} setSelectedPkp={setSelectedPkp} walletAddress={authSig.address}/>
      )
    } else {
      return (
        <div className={'center'}>No PKPs found. Make one before using this demo</div>
      )
    }
  }

  return (
    <div className={'center'}>
      <Button className={'fade-in'} sx={{m: 2}} variant={'outlined'} onClick={() => getPkps()}>Get User Pkps</Button>
    </div>
  );
}

export default App;