import { ethers } from 'ethers';

export class ERC20Handler {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private tokenAddress: string;

  constructor(tokenAddress: string, provider: ethers.JsonRpcProvider, signer: ethers.Wallet) {
    this.tokenAddress = tokenAddress;
    this.provider = provider;
    this.signer = signer;
  }

  async approve(spender: string, amount: ethers.BigNumberish): Promise<ethers.ContractTransactionResponse> {
    const tokenContract = new ethers.Contract(
      this.tokenAddress,
      ['function approve(address spender, uint256 amount) returns (bool)'],
      this.signer
    );
    return tokenContract.approve(spender, amount);
  }

  async estimateGasApprove(spender: string, amount: ethers.BigNumberish): Promise<bigint> {
    const tokenContract = new ethers.Contract(
      this.tokenAddress,
      ['function approve(address spender, uint256 amount) returns (bool)'],
      this.signer
    );
    try {
      const gasEstimate = await tokenContract.approve.estimateGas(spender, amount);
      return gasEstimate;
    } catch (error) {
      // Fallback gas estimate if simulation reverts (e.g., due to allowance checks)
      console.warn(`Gas estimation for approve failed:  Using fallback estimate.`);
      return BigInt(50000); // Typical gas cost for ERC-20 approve
    }
  }
}