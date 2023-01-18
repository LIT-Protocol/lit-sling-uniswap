import { useEffect, useState } from "react";
import { Button, Card, CardActions, CardContent, CardHeader, Stack, TextField, Typography } from "@mui/material";
import './actionCreator.css';
import truncateAddress from "../functions/truncateAddress";
import { LoadingButton } from "@mui/lab";
import assembleTrade from "../functions/assembleTrade";
import { ethers } from "ethers";
import { generateSwapExactInputSingleCalldata } from "../pkp-dex-sdk/external/uniswap/swapExactInputSingle";
import { generateApproveCalldata } from "../pkp-dex-sdk/external/erc20/approve";
import ERC20ABI from "../ABIs/erc20Abi.json";
import { getSwapCode } from "../litSellFactory/getSwapCode";

const providerUrl = 'https://polygon-mainnet.infura.io/v3/3a16fe149ab14c7995cdab5f2c1d616c';
const SWAP_ROUTER_ADDRESS = '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45';

function ActionCreator({pkp, provider, pkpWallet, authSig, tokenIn, tokenOut}) {
  const [ loading, setLoading ] = useState(false);
  const [ amountToSell, setAmountToSell ] = useState('');
  const [ textArea, setTextArea ] = useState('');
  const [ litActionText, setLitActionText ] = useState('');
  const [ tokenInAmount, setTokenInAmount ] = useState('');
  const [ tokenOutAmount, setTokenOutAmount ] = useState('');

  useEffect(() => {
    if (litActionText) {
      const prettify = prettifyText(litActionText);
      setTextArea(prettify);
    }
  }, [ litActionText ])

  // useEffect(() => {
  //   updateLitActionText();
  // }, [ textArea ])

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

  // const updateLitActionText = () => {
  //   try {
  //     console.log('textArea', textArea)
  //     const parsed = JSON.parse(textArea);
  //     setLitActionText(parsed);
  //     console.log('conditions updated');
  //   } catch (err) {
  //     console.log("Error parsing JSON:", err);
  //   }
  // }

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

    const tradeConfig = {
      swapRouterAddress: SWAP_ROUTER_ADDRESS,
      tokenIn: tokenIn,
      authSig: authSig,
      providerUrl: providerUrl,
      pkp: pkp,
      approveCalldata,
      exactInputSingleCalldata
    }

    // await assembleTrade(tradeConfig)
    const litSellCode = getSwapCode();

    console.log('litSellCode', litSellCode);
    setLitActionText(litSellCode);
  }

  return (
    <div className={'center fade-in'}>
      <Stack spacing={2} direction={'row'}>
        <Card className={'action-creator-form'}>
          <CardHeader title={`PKP: ${truncateAddress(pkp.address)}`}/>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant={'h6'}>Create a Lit Action</Typography>
              <div>
                <Typography variant={'body'}>Token In - {tokenInAmount} {tokenIn.symbol}</Typography>
                <textarea className={'action-creator-token-info'} disabled value={prettifyText(tokenIn)}/>
                <TextField className={'action-creator-textfield'} label={'Amount To Sell'} variant={'outlined'}
                           onChange={(e) => setAmountToSell(e.target.value)} value={amountToSell}/>
              </div>
              <div>
                <Typography variant={'body'}>Token Out - {tokenOutAmount} {tokenOut.symbol}</Typography>
                <textarea className={'action-creator-token-info'} disabled value={prettifyText(tokenOut)}/>
              </div>
            </Stack>
          </CardContent>
          <CardActions sx={{justifyContent: 'space-between', mx: 1}}>
            <LoadingButton disabled={!amountToSell} onClick={createAction} loading={loading} color={'secondary'}
                           variant={'outlined'}>Create
              Action</LoadingButton>
            {/*<LoadingButton loading={loading} color={'secondary'} variant={'outlined'}>Reset</LoadingButton>*/}
          </CardActions>
        </Card>
        <textarea className={'action-creator-textarea'} value={litActionText}/>
      </Stack>
    </div>
  )
}

export default ActionCreator;