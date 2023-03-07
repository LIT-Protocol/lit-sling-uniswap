import React, { useEffect } from 'react';
import { Button, CircularProgress, Typography } from "@mui/material";
import { loadUserPkps } from "./helpers/loadUserPkps";
import { ethers } from "ethers";
import { createPkpWallet } from "./helpers/createPkpWallet";
import ActionCreator from "./components/actionCreator/ActionCreator";
import PkpDisplay from "./components/pkpDisplay/PkpDisplay";
import './Main.css';
import { useRecoilState } from "recoil";
import {
  authSigState,
  errorObjectState,
  loadingState,
  pkpWalletState,
  providerState,
  selectedPkpState,
  userPkpsState
} from "./context/appContext";

function Main() {
  const [ loading, setLoading ] = useRecoilState(loadingState);
  const [ provider, setProvider ] = useRecoilState(providerState);
  const [ userPkps, setUserPkps ] = useRecoilState(userPkpsState);
  const [ selectedPkp, setSelectedPkp ] = useRecoilState(selectedPkpState);
  const [ pkpWallet, setPkpWallet ] = useRecoilState(pkpWalletState);
  const [ authSig, setAuthSig ] = useRecoilState(errorObjectState);
  const [ errorObject, setErrorObject ] = useRecoilState(authSigState);

  useEffect(() => {
    const currentTime = Date.now();
    const lastLogin = localStorage.getItem('lit-last-login');
    if (!!lastLogin && parseInt(lastLogin) < currentTime) {
      localStorage.removeItem('lit-auth-signature');
    }
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
      const aDayAhead = Date.now() + 86400000;
      localStorage.setItem('lit-login-time', aDayAhead.toString());
      console.log('[Lit Swap Playground] - Main - getPkps', loadPkpRes);
    } catch (err) {
      console.log('err', err);
    }
    setLoading(false);
  }

  // make pkp signer once user selects a pkp
  const makePkpWallet = async (pkpData) => {
    setLoading(true);
    console.log('[Lit Swap Playground] - Main - makePkpWallet', pkpData);
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

  // displays error
  if (errorObject) {
    return (
      <div className="center">
        <Typography sx={{color: '#fff'}} variant={'h5'}>{errorObject.message}</Typography>
      </div>
    )
  }


  // loading icon
  if (loading === true) {
    return (
      <div className="App">
        <CircularProgress sx={{position: 'absolute', top: '48%', right: '50%', transform: 'translate(50%,-50%)'}}/>
      </div>
    )
  }

  // the lit action playground
  if (!!pkpWallet && !!selectedPkp) {
    return (
      <div className="App">
        <ActionCreator provider={provider}
                       pkp={selectedPkp}
                       pkpWallet={pkpWallet}
                       authSig={authSig}/>
      </div>
    )
  }

  // pkp selection screen
  if (!!userPkps) {
    if (userPkps.length) {
      return (
        <PkpDisplay pkps={userPkps} setSelectedPkp={setSelectedPkp} walletAddress={authSig.address}/>
      )
    } else {
      return (
        <div className={'absolute-center'}>No PKPs found. Make one before using this demo</div>
      )
    }
  }

  // connects users wallet
  return (
    <div className={'absolute-center'}>
      <Button className={'fade-in'} sx={{m: 2}} variant={'outlined'} onClick={() => getPkps()}>Get User Pkps</Button>
    </div>
  );
}

export default Main;
