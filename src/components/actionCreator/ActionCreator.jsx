import { useEffect, useState } from "react";
import { Card, CardActions, CardContent, Stack, TextField, Typography } from "@mui/material";
import './ActionCreator.css';
import { LoadingButton } from "@mui/lab";
import { ethers } from "ethers";
import { generateSwapExactInputSingleCalldata } from "../../helpers/swapExactInputSingle";
import { generateApproveCalldata } from "../../helpers/approve";
import ERC20ABI from "../../ABIs/erc20Abi.json";
import { refactoredSwapCode } from "../../litSellFactory/refactoredSwapCode";
import LitTokenSelect from "../litTokenSelect/LitTokenSelect";
import LitJsSdk from "lit-js-sdk";
import { joinAndSignTx } from "../../helpers/joinAndSignTx";
import { longerTruncateAddress } from "../../helpers/truncateAddress";

// const providerUrl = 'https://polygon-mainnet.infura.io/v3/3a16fe149ab14c7995cdab5f2c1d616c';
const SWAP_ROUTER_ADDRESS = '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45';

function ActionCreator({pkp, provider, pkpWallet, authSig}) {
  const [ loading, setLoading ] = useState(false);
  const [ amountToSell, setAmountToSell ] = useState('1');
  const [ litActionText, setLitActionText ] = useState('');
  const [ litJsParamsText, setLitJsParamsText ] = useState('');
  const [ tokenInAmount, setTokenInAmount ] = useState('');
  const [ tokenOutAmount, setTokenOutAmount ] = useState('');
  const [ jsParams, setJsParams ] = useState(null);
  const [ output, setOutput ] = useState('');

  // can be set to whatever you want
  const [ tokenIn, setTokenIn ] = useState({
    chainId: 137,
    decimals: 18,
    address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    symbol: 'WMATIC',
    name: 'Wrapped Matic'
  })
  const [ tokenOut, setTokenOut ] = useState({
    chainId: 137,
    decimals: 6,
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    symbol: 'USDC',
    name: 'USD//C'
  })

  useEffect(() => {
    console.log('[Lit Swap Playground] - Update tokenIn:', tokenIn);
    setTokenInAmount('--');
    getCurrencyAmounts(pkp.address, 'tokenIn');
  }, [ tokenIn ])

  useEffect(() => {
    console.log('[Lit Swap Playground] - Update tokenOut:', tokenOut);
    setTokenOutAmount('--');
    getCurrencyAmounts(pkp.address, 'tokenOut');
  }, [ tokenOut ])

  const prettifyText = (text) => {
    return JSON.stringify(text, undefined, 4);
  }

  const getCurrencyAmounts = async (address, tokenType = null) => {
    setLoading(true);
    try {
      const contract0 = new ethers.Contract(tokenIn.address, ERC20ABI, provider);
      const contract1 = new ethers.Contract(tokenOut.address, ERC20ABI, provider);
      const tokenInBalance = await contract0.balanceOf(address);
      const tokenOutBalance = await contract1.balanceOf(address);
      const tokenInReadable = ethers.utils.formatUnits(tokenInBalance, tokenIn.decimals)
      const tokenOutReadable = ethers.utils.formatUnits(tokenOutBalance, tokenOut.decimals)
      setTokenInAmount(tokenInReadable);
      setTokenOutAmount(tokenOutReadable);
    } catch (err) {
      console.log('[Lit Swap Playground] - Error getting token amounts:', err);
      if (tokenType === 'tokenIn') {
        setTokenInAmount('error getting token');
      } else if (tokenType === 'tokenOut') {
        setTokenOutAmount('error getting token');
      }
    }
    setLoading(false);
  }

  const createAction = async () => {
    const exactInputSingleParams = {
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      fee: 3000,
      recipient: pkp.address,
      amountIn: ethers.utils.parseUnits(amountToSell, tokenIn.decimals).toString(),
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0
    }

    const approveCalldata = generateApproveCalldata(SWAP_ROUTER_ADDRESS, exactInputSingleParams.amountIn);
    const exactInputSingleCalldata = generateSwapExactInputSingleCalldata(exactInputSingleParams);

    const gasPrice = await provider.getGasPrice();
    const chainId = tokenIn.chainId;
    const nonceCount = await provider.getTransactionCount(pkp.address);

    const jsParamsHolder = {
      swapRouterAddress: SWAP_ROUTER_ADDRESS,
      tokenIn: tokenIn,
      pkp: pkp,
      chainId,
      gasPrice: gasPrice._hex,
      nonceCount,
      approveCalldata,
      exactInputSingleCalldata,
    }

    setJsParams(jsParamsHolder);
    const litSellCode = refactoredSwapCode();
    setLitJsParamsText(prettifyText(jsParamsHolder));
    setLitActionText(litSellCode);
  }

  const executeAction = async () => {
    setLoading(true);
    setOutput('');

    // all in one execution
    // await executeSwap({
    //   tokenIn,
    //   tokenOut,
    //   pkp,
    //   provider,
    //   amountToSell,
    //   authSig
    // })

    // original execution.  1/2 lit action 1/2 regular
    let litNodeClient;
    try {
      litNodeClient = new LitJsSdk.LitNodeClient({litNetwork: "serrano", debug: false});
      await litNodeClient.connect();
    } catch (err) {
      console.log('[Lit Swap Playground] - Error connecting to network', err);
      setOutput('Unable to connect to network' + prettifyText(err));
      return;
    }

    if (!litNodeClient) {
      console.log('[Lit Swap Playground] - LitNodeClient was not instantiated');
      setOutput('LitNodeClient was not instantiated');
      return;
    }

    let litActionRes;
    try {
      litActionRes = await litNodeClient.executeJs({
        code: refactoredSwapCode(),
        authSig,
        jsParams: jsParams,
      });
      console.log('[Lit Swap Playground] - Lit action resolution:', litActionRes);
    } catch (err) {
      console.log('[Lit Swap Playground] - Unable to execute code', err);
      setOutput('Unable to execute code' + prettifyText(err));
      setLoading(false);
      return;
    }

    // will only fire if two transactions are returned
    if (litActionRes.response && Object.keys(litActionRes.response).length === 2) {
      const signedApproveTx = joinAndSignTx({litActionRes: litActionRes, key: 'approveTx'});
      const signedExactInputSingleTx = joinAndSignTx({litActionRes: litActionRes, key: 'exactInputSingleTx'});

      let signedApproveTxRes;
      let signedExactInputSingleTxRes;

      // send the transactions
      try {
        console.log('[Lit Swap Playground] - Sending signedApproveTx:', signedApproveTx);
        signedApproveTxRes = await provider.sendTransaction(signedApproveTx);
        await signedApproveTxRes.wait();
        console.log('[Lit Swap Playground] - signedApproveTxRes:', signedApproveTxRes);
        console.log('[Lit Swap Playground] - Sending signedExactInputSingleTx');
        signedExactInputSingleTxRes = await provider.sendTransaction(signedExactInputSingleTx);
        await signedExactInputSingleTxRes.wait();
        setOutput(prettifyText(signedExactInputSingleTxRes));
        console.log('[Lit Swap Playground] - signedExactInputSingleTxRes:', signedExactInputSingleTxRes);
      } catch (err) {
        setOutput('[Lit Swap Playground] - Error sending transactions' + prettifyText(err));
      }
    }
    setLoading(false);
    getCurrencyAmounts(pkp.address);

  }

  return (
    <div className={'center fade-in action-creator-container'}>
      <Stack spacing={2}>
        <Stack spacing={2} direction={'row'}>
          <Card className={'action-creator-form'}>
            {/*<CardHeader title={`PKP: ${truncateAddress(pkp.address)}`}/>*/}
            <CardContent className={'action-creator-input'}>
              <Stack spacing={2}>
                <Typography variant={'h5'}>{`PKP: ${longerTruncateAddress(pkp.address)}`}</Typography>
                <Typography variant={'h6'}>Create a Lit Action</Typography>
                <Typography color={'error'}> Polygon only. Execute swaps at your own risk.</Typography>
                <Stack spacing={1}>
                  <Typography
                    variant={'body'}>{tokenIn && tokenInAmount ? `Token In - ${tokenInAmount} ${tokenIn.symbol}` : 'No token selected'}</Typography>
                  <LitTokenSelect setSelectedToken={setTokenIn}/>
                  <textarea className={'action-creator-token-info'} value={prettifyText(tokenIn)}
                            onChange={(e) => setTokenIn(e.target.value)}/>
                  <TextField className={'action-creator-textfield'} label={'Amount To Sell'} variant={'outlined'}
                             onChange={(e) => setAmountToSell(e.target.value)} value={amountToSell}/>
                </Stack>
                <Stack spacing={1}>
                  <Typography
                    variant={'body'}>{tokenOut && tokenOutAmount ? `Token Out - ${tokenOutAmount} ${tokenOut.symbol}` : 'No token selected'}</Typography>
                  <LitTokenSelect setSelectedToken={setTokenOut}/>
                  <textarea className={'action-creator-token-info'} value={prettifyText(tokenOut)}
                            onChange={(e) => setTokenOut(e.target.value)}/>
                </Stack>
                <LoadingButton disabled={!amountToSell} onClick={createAction} loading={loading} color={'secondary'}
                               variant={'outlined'}>Create
                  Action</LoadingButton>
              </Stack>
            </CardContent>
            <CardActions sx={{backgroundColor: '#0a132d', justifyContent: 'space-between'}}>
              <Stack sx={{width: '100%'}}>
                <LoadingButton disabled={!litActionText} onClick={executeAction} loading={loading} color={'secondary'}
                               variant={'outlined'}>Run
                  Action</LoadingButton>
              </Stack>
            </CardActions>
          </Card>
          <Stack spacing={2} direction={'column'} sx={{width: '100%'}}>
            <Typography color={'primary'} variant={'body1'}>JS Params Preview</Typography>
            <textarea className={'action-creator-js-params'} value={litJsParamsText} onChange={(e) => true}/>
            <Typography color={'primary'} variant={'body1'}>Lit Action Preview</Typography>
            <textarea className={'action-creator-textarea'} value={litActionText} onChange={(e) => true}/>
          </Stack>
        </Stack>
        <div className={'action-creator-output-container'}>
          <Typography color={'primary'} variant={'body1'}>Lit Action Output</Typography>
          <textarea className={'action-creator-output'} value={output} onChange={(e) => true}/>
        </div>
      </Stack>
    </div>
  )
}

export default ActionCreator;