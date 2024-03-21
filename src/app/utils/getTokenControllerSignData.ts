import Web3 from 'web3'
import { L2_TOKEN_CONTROLLER_V2_ADDRESS, L2_WEB3_URL, PUBLIC_PROXY_ADMIN } from '../../constant'
import TOKEN_CONTROLLER_ABI from '../../abis/TokenController.json'

export const getTypeDataV2 = (message: any, chainId: string) => ({
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    ExecTransaction: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
      { name: 'operation', type: 'uint8' },
      { name: 'nonce', type: 'uint256' },
    ],
  },
  primaryType: 'ExecTransaction',
  domain: {
    name: 'Defed Wallet',
    version: '1',
    chainId: chainId || '1',
    verifyingContract: PUBLIC_PROXY_ADMIN,
  },
  message,
})
export const interestRateMode = 2
export default function getTokenControllerSignData() {
  const web3 = new Web3(L2_WEB3_URL)
  const tokenContract = new web3.eth.Contract(TOKEN_CONTROLLER_ABI as any, L2_TOKEN_CONTROLLER_V2_ADDRESS)

  const withdraw = (vtokenAddress: string, amount: string, toAddress: string) =>
    // @ts-ignore
    tokenContract.methods.withdraw(vtokenAddress, amount, toAddress).encodeABI()

  const tranferInner = (vtokenAddress: string, amount: string, toAddress: string) =>
    // @ts-ignore
    tokenContract.methods.transfer(vtokenAddress, amount, toAddress).encodeABI()

  // @ts-ignore
  const transferMsg = (vtokenAddress: string, amount: string, toAddress: string, deadLine: number) => tokenContract.methods.transferMsg(vtokenAddress, amount, toAddress, deadLine).encodeABI()

  const tranferInnerCredit = (vtokenAddress: string, amount: string, toAddress: string) =>
    // @ts-ignore
    tokenContract.methods.transferCredit(vtokenAddress, amount, toAddress, interestRateMode).encodeABI()

  const transferCreditMsg = (vtokenAddress: string, amount: string, toAddress: string, deadLine: number) =>
    // @ts-ignore
    tokenContract.methods.transferCreditMsg(vtokenAddress, amount, toAddress, interestRateMode, deadLine).encodeABI()

  const borrowInner = (vtokenAddress: string, amount: string) =>
    // @ts-ignore
    tokenContract.methods.borrow(vtokenAddress, amount, interestRateMode).encodeABI()

  const directRepay = (vtokenAddress: string, amount: string) =>
    // @ts-ignore
    tokenContract.methods.repay(vtokenAddress, amount, interestRateMode).encodeABI()

  return { withdraw, tranferInner, transferMsg, tranferInnerCredit, transferCreditMsg, borrowInner, directRepay }
}
