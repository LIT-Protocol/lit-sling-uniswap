import { useEffect, useState } from "react";
import { Button, Card, CardActions, CardContent, CardHeader, Stack, TextField, Typography } from "@mui/material";
import './ActionCreator.css';
import truncateAddress from "../../helpers/truncateAddress";
import { LoadingButton } from "@mui/lab";
import executableSwapCode from "../../litSellFactory/executableSwapCode";
import { ethers } from "ethers";
import { generateSwapExactInputSingleCalldata } from "../../helpers/swapExactInputSingle";
import { generateApproveCalldata } from "../../helpers/approve";
import ERC20ABI from "../../ABIs/erc20Abi.json";
import { getSwapCode } from "../../litSellFactory/getSwapCode";
import { refactoredSwapCode } from "../../litSellFactory/refactoredSwapCode";
import { joinAndSignTx } from "../../helpers/joinAndSignTx";
import LitJsSdk from "lit-js-sdk";

const providerUrl = 'https://polygon-mainnet.infura.io/v3/3a16fe149ab14c7995cdab5f2c1d616c';
const SWAP_ROUTER_ADDRESS = '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45';

function ActionCreator({pkp, provider, pkpWallet, authSig}) {
  const [ loading, setLoading ] = useState(false);
  const [ amountToSell, setAmountToSell ] = useState('');
  const [ textArea, setTextArea ] = useState('');
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
    if (litActionText) {
      const prettify = prettifyText(litActionText);
      setTextArea(prettify);
    }
  }, [ litActionText ])

  useEffect(() => {
    getCurrencyAmounts(pkp.address);
  }, [])

  const prettifyText = (text) => {
    return JSON.stringify(text, undefined, 4);
  }

  const getCurrencyAmounts = async (address) => {
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
      console.log('error getting token amounts', err);
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
    console.log('gasPrice.toString()', gasPrice._hex);

    const tradeConfig = {
      swapRouterAddress: SWAP_ROUTER_ADDRESS,
      tokenIn: tokenIn,
      authSig: authSig,
      providerUrl: providerUrl,
      pkp: pkp,
      chainId,
      gasPrice: gasPrice._hex,
      approveCalldata,
      exactInputSingleCalldata,
      nonceCount
    }

    setJsParams(tradeConfig);
    const litSellCode = refactoredSwapCode();
    // console.log('litSellCode', litSellCode);
    setLitJsParamsText(prettifyText(tradeConfig));
    setLitActionText(litSellCode);
  }

  const executeAction = async () => {
    setLoading(true);
    setOutput('');
    let litNodeClient;
    try {
      litNodeClient = new LitJsSdk.LitNodeClient({litNetwork: "serrano", debug: false});
      await litNodeClient.connect();
    } catch (err) {
      console.log('Unable to connect to network', err);
      setOutput('Unable to connect to network' + prettifyText(err));
      return;
    }

    if (!litNodeClient) {
      console.log('LitNodeClient was not instantiated');
      setOutput('LitNodeClient was not instantiated');
      return;
    }

    let executeRes;
    try {
      executeRes = await litNodeClient.executeJs({
        code: refactoredSwapCode(),
        authSig,
        jsParams: jsParams,
      });
      console.log('executeRes', executeRes);
    } catch (err) {
      console.log('Unable to execute code', err);
      setOutput('Unable to execute code' + prettifyText(err));
      setLoading(false);
      return;
    }

    // will only fire if both approve and swap transactions are sent back
    if (executeRes.response && Object.keys(executeRes.response).length > 0) {
      const signedApproveTx = joinAndSignTx({litActionRes: executeRes, key: 'approveTx'});
      const signedExactInputSingleTx = joinAndSignTx({litActionRes: executeRes, key: 'exactInputSingleTx'});

      let signedApproveTxRes;
      let signedExactInputSingleTxRes;
      try {
        console.log('Sending signedApproveTx');
        signedApproveTxRes = await provider.sendTransaction(signedApproveTx);
        await signedApproveTxRes.wait();
        signedExactInputSingleTxRes = await provider.sendTransaction(signedExactInputSingleTx);
        await signedExactInputSingleTxRes.wait();
        setOutput(prettifyText(signedExactInputSingleTxRes));
      } catch (err) {
        setOutput('Error sending transactions' + prettifyText(err));
      }
    }
    setLoading(false);
    getCurrencyAmounts(pkp.address);

  }

  return (
    <div className={'center fade-in'}>
      <Stack spacing={2}>
        <Stack spacing={2} direction={'row'}>
          <Card className={'action-creator-form'}>
            <CardHeader title={`PKP: ${truncateAddress(pkp.address)}`}/>
            <CardContent className={'action-creator-input'}>
              <Stack spacing={2}>
                <Typography variant={'h6'}>Create a Lit Action</Typography>
                <div>
                  <Typography variant={'body'}>Token In - {tokenInAmount} {tokenIn.symbol}</Typography>
                  <textarea className={'action-creator-token-info'} value={prettifyText(tokenIn)}
                            onChange={(e) => setTokenIn(e.target.value)}/>
                  <TextField className={'action-creator-textfield'} label={'Amount To Sell'} variant={'outlined'}
                             onChange={(e) => setAmountToSell(e.target.value)} value={amountToSell}/>
                </div>
                <div>
                  <Typography variant={'body'}>Token Out - {tokenOutAmount} {tokenOut.symbol}</Typography>
                  <textarea className={'action-creator-token-info'} value={prettifyText(tokenOut)}
                            onChange={(e) => setTokenOut(e.target.value)}/>
                </div>
              </Stack>
            </CardContent>
            <CardActions sx={{justifyContent: 'space-between'}}>
              <LoadingButton disabled={!amountToSell} onClick={createAction} loading={loading} color={'secondary'}
                             variant={'outlined'}>Create
                Action</LoadingButton>
              <LoadingButton disabled={!litActionText} onClick={executeAction} loading={loading} color={'secondary'}
                             variant={'outlined'}>Run
                Action</LoadingButton>
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