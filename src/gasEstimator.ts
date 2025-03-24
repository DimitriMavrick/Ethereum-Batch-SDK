import { ethers } from 'ethers';
import { BatchingContract } from './batchingContract';

export class GasEstimator {
  private provider: ethers.JsonRpcProvider;
  private batchingContract: BatchingContract;

  constructor(provider: ethers.JsonRpcProvider, batchingContract: BatchingContract) {
    this.provider = provider;
    this.batchingContract = batchingContract;
  }

  async estimateGas(recipients: string[], amounts: string[]): Promise<bigint> {
    const gasEstimate = await this.batchingContract.estimateGasMultiSend(recipients, amounts);
    return gasEstimate;
  }

  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice ?? BigInt(2000000000); // Fallback to 2 Gwei if null
  }
}