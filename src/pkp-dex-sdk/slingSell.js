import { ethers } from "ethers";
import abi from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { Token } from "@uniswap/sdk-core";
// @ts-ignore
import { getMessage, sendSignedTransaction } from "./client/transactionUtils";
import { arrayify, joinSignature } from "@ethersproject/bytes";
import { runGetSignatureShare } from "./client/runGetSignatureShare";
import { generateApproveCalldata } from "./external/erc20/approve";
import { generateSwapExactInputSingleCalldata } from "./external/uniswap/swapExactInputSingle";
import { serialize } from "@ethersproject/transactions";

const IUniswapV3PoolABI = abi.abi;
// const SWAP_ROUTER_ADDRESS = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const SWAP_ROUTER_ADDRESS = '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45';

export default class SlingSell {
  tokenInInfo;
  tokenOutInfo;
  _tokenIn;
  _tokenOut;
  _tokenInPrice;
  _tokenOutPrice;
  _contract0;
  _contract1;
  router;
  provider;
  signer;
  address;
  publicKey;
  poolAddress;
  poolContract;
  authSig;
  amountToSell;
  quoterContract;

  constructor(config) {
    this.provider = new ethers.providers.JsonRpcProvider('https://polygon-mainnet.infura.io/v3/3a16fe149ab14c7995cdab5f2c1d616c');
    this.tokenInInfo = config.tokenIn;
    this.tokenOutInfo = config.tokenOut;
    this._tokenInPrice = null;
    this._tokenOutPrice = null;
    this._tokenIn = new Token(this.tokenInInfo.chainId, this.tokenInInfo.address, this.tokenInInfo.decimals, this.tokenInInfo.symbol, this.tokenInInfo.name)
    this._tokenOut = new Token(this.tokenOutInfo.chainId, this.tokenOutInfo.address, this.tokenOutInfo.decimals, this.tokenOutInfo.symbol, this.tokenOutInfo.name)
    this.poolAddress = config.poolAddress;
    this.amountToSell = config.amountToSell;
    this.address = config.address;
    this.signer = config.signer;
    this.publicKey = config.publicKey;
    this.authSig = config.authSig;

    this.launchPad(config.tokenIn.address, this.tokenInInfo.address, this.amountToSell)
  }

  async launchPad(tokenAddress, spender, amountToSell) {
    const amount = ethers.utils.parseUnits(amountToSell, this.tokenInInfo.decimals).toString();
    console.log('amount', amount)
    const swapParams = {
      tokenIn: this.tokenInInfo.address,
      tokenOut: this.tokenOutInfo.address,
      fee: 3000,
      recipient: this.address,
      deadline: Math.floor(Date.now() / 1000) + 60 * 20,
      amountIn: ethers.utils.parseUnits(amountToSell, this.tokenInInfo.decimals).toString(),
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0
    }
    console.log('swapParams', swapParams)
    const nonce = await this.provider.getTransactionCount(this.address)
    console.log('nonce', nonce)

    const approveRes = await this.executeApprove(tokenAddress, SWAP_ROUTER_ADDRESS, amountToSell);
    await approveRes.wait();
    console.log('executeApprove', approveRes)
    const swapRes = await this.executeUniswapV3SwapExactInputSingle(SWAP_ROUTER_ADDRESS, swapParams)
    console.log('')
    const resRes = await swapRes.wait()
    console.log('resRes', resRes)
  }

  /// Signs and sends an arbitrary transaction with the PKP
  async pkpSignAndSendTransaction(tx, label) {
    const message = arrayify(getMessage(tx));
    console.log('message', message)

    const {signatures} = await runGetSignatureShare(this.authSig, message, this.publicKey, label);

    const encodedSignature = joinSignature({
      r: "0x" + signatures[label].r,
      s: "0x" + signatures[label].s,
      recoveryParam: signatures[label].recid
    });

    return await sendSignedTransaction(serialize(tx, encodedSignature), this.provider);
  }

  /// Approves an address (usually a DEX contract) to transfer tokens belonging to the PKP
  async executeApprove(tokenAddress, spender, amountToSell) {
    const amount = ethers.utils.parseUnits(amountToSell, this.tokenInInfo.decimals);
    console.log('amount', amount.toString())
    const longAmount = amount.toString();

    const tx = {
      to: tokenAddress,
      nonce: await this.provider.getTransactionCount(this.address),
      value: 0,
      gasPrice: await this.provider.getGasPrice(),
      gasLimit: 150000,
      chainId: (await this.provider.getNetwork()).chainId,
      data: generateApproveCalldata(spender, longAmount)
    }

    console.log('executeApprove - tx', tx)

    return await this.pkpSignAndSendTransaction(tx, "approveTx");
  }

  /// Executes a UniswapV3 exactInputSingle swap transaction.
  async executeUniswapV3SwapExactInputSingle(swapRouterAddress, exactInputSingleParams) {
    const tx = {
      to: swapRouterAddress,
      nonce: await this.provider.getTransactionCount(this.address),
      value: 0,
      gasPrice: await this.provider.getGasPrice(),
      gasLimit: 500000,
      chainId: (await this.provider.getNetwork()).chainId,
      data: generateSwapExactInputSingleCalldata(exactInputSingleParams)
    };
    console.log('executeUniswapV3SwapExactInputSingle - tx', tx)

    return await this.pkpSignAndSendTransaction(tx, "exactInputSingleTx");
  }
}