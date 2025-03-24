import { ethers } from 'ethers';

export class BatchingContract {
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;

  constructor(
    address: string,
    abi: any,
    provider: ethers.JsonRpcProvider,
    signer: ethers.Wallet
  ) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(address, abi, this.signer);
  }

  getContractAddress(): string {
    return this.contract.target as string;
  }

  async multiSend(recipients: string[], amounts: string[]): Promise<ethers.ContractTransactionResponse> {
    return this.contract.multiSend(recipients, amounts, {
      value: amounts.reduce((sum, amt) => sum + BigInt(amt), BigInt(0)),
    });
  }

  async multiSendERC20(
    token: string,
    recipients: string[],
    amounts: string[]
  ): Promise<ethers.ContractTransactionResponse> {
    return this.contract.multiSendERC20(token, recipients, amounts);
  }

  async estimateGasERC20(
    token: string,
    recipients: string[],
    amounts: string[]
  ): Promise<bigint> {
    const gasEstimate = await this.contract.multiSendERC20.estimateGas(token, recipients, amounts);
    return gasEstimate;
  }

  // New method for estimating gas for multiSend
  async estimateGasMultiSend(recipients: string[], amounts: string[]): Promise<bigint> {
    const gasEstimate = await this.contract.multiSend.estimateGas(recipients, amounts, {
      value: amounts.reduce((sum, amt) => sum + BigInt(amt), BigInt(0)),
    });
    return gasEstimate;
  }
}