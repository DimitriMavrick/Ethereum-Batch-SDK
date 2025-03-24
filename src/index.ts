import { ethers } from 'ethers';
import { BatchingContract } from './batchingContract';
import { TransactionManager } from './transactionManager';
import { GasEstimator } from './gasEstimator';
import { ERC20Handler } from './erc20Handler';

export class EthereumBatchSDK {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private batchingContract: BatchingContract;
  private transactionManager: TransactionManager;
  private gasEstimator: GasEstimator;

  constructor(
    provider: ethers.JsonRpcProvider,
    privateKey: string,
    batchingContractAddress: string,
    batchingContractAbi: any
  ) {
    this.provider = provider;
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.batchingContract = new BatchingContract(
      batchingContractAddress,
      batchingContractAbi,
      this.provider,
      this.signer
    );
    this.transactionManager = new TransactionManager();
    this.gasEstimator = new GasEstimator(this.provider, this.batchingContract);
  }

  addTransaction(recipient: string, amount: string, tokenAddress?: string) {
    if (!ethers.isAddress(recipient)) throw new Error('Invalid recipient address');
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) throw new Error('Invalid amount');
    if (tokenAddress && !ethers.isAddress(tokenAddress)) throw new Error('Invalid token address');
    this.transactionManager.addTransaction(recipient, amount, tokenAddress);
  }

  async batchTransactions(): Promise<ethers.TransactionReceipt[]> {
    const receipts: ethers.TransactionReceipt[] = [];
    const { ethTxs, erc20Txs } = this.transactionManager.splitByType();
  
    try {
      if (ethTxs.length > 0) {
        const recipients = ethTxs.map(tx => tx.recipient);
        const amounts = ethTxs.map(tx => ethers.parseEther(tx.amount).toString());
        const ethTx = await this.batchingContract.multiSend(recipients, amounts);
        const receipt = await this.provider.getTransactionReceipt(ethTx.hash);
        if (receipt) receipts.push(receipt);
      }
  
      for (const [tokenAddress, txs] of erc20Txs) {
        const erc20Handler = new ERC20Handler(tokenAddress, this.provider, this.signer);
        const totalAmount = txs.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toString();
  
        const decimals = await new ethers.Contract(tokenAddress, [
          'function decimals() view returns (uint8)',
        ], this.provider).decimals();
        const totalAmountInUnits = ethers.parseUnits(totalAmount, decimals);
  
        // Check existing allowance before approving
        const signerAddress = await this.signer.getAddress();
        const allowance = await new ethers.Contract(tokenAddress, [
          'function allowance(address owner, address spender) view returns (uint256)',
        ], this.provider).allowance(signerAddress, this.batchingContract.getContractAddress());
  
        if (allowance < totalAmountInUnits) {
          const approvalTx = await erc20Handler.approve(this.batchingContract.getContractAddress(), totalAmountInUnits);
          const approvalReceipt = await this.provider.getTransactionReceipt(approvalTx.hash);
          if (approvalReceipt) receipts.push(approvalReceipt);
        } else {
          console.log(`Allowance of ${ethers.formatUnits(allowance, decimals)} tokens is sufficient, skipping approval`);
        }
  
        const recipients = txs.map(tx => tx.recipient);
        const amounts = txs.map(tx => ethers.parseUnits(tx.amount, decimals).toString());
        const erc20Tx = await this.batchingContract.multiSendERC20(tokenAddress, recipients, amounts);
        const receipt = await this.provider.getTransactionReceipt(erc20Tx.hash);
        if (receipt) receipts.push(receipt);
      }
  
      this.transactionManager.clearTransactions();
      return receipts;
    } catch (error: any) {
      throw new Error(`Failed to batch transactions: ${error.message || error}`);
    }
  }

  async estimateGas(): Promise<bigint> {
    let totalGas = BigInt(0);
    const { ethTxs, erc20Txs } = this.transactionManager.splitByType();
  
    try {
      if (ethTxs.length > 0) {
        const recipients = ethTxs.map(tx => tx.recipient);
        const amounts = ethTxs.map(tx => ethers.parseEther(tx.amount).toString());
        const ethGas = await this.gasEstimator.estimateGas(recipients, amounts);
        totalGas += ethGas;
      }
  
      for (const [tokenAddress, txs] of erc20Txs) {
        const erc20Handler = new ERC20Handler(tokenAddress, this.provider, this.signer);
        const decimals = await new ethers.Contract(tokenAddress, [
          'function decimals() view returns (uint8)',
        ], this.provider).decimals();
  
        const totalAmount = txs.reduce((sum, tx) => sum + parseFloat(tx.amount), 0).toString();
        const signerAddress = await this.signer.getAddress();
        const allowance = await new ethers.Contract(tokenAddress, [
          'function allowance(address owner, address spender) view returns (uint256)',
        ], this.provider).allowance(signerAddress, this.batchingContract.getContractAddress());
  
        const amountInUnits = ethers.parseUnits(totalAmount, decimals);
        if (allowance < amountInUnits) {
          const approvalGas = await erc20Handler.estimateGasApprove(
            this.batchingContract.getContractAddress(),
            amountInUnits
          );
          totalGas += approvalGas;
        }
  
        const recipients = txs.map(tx => tx.recipient);
        const amounts = txs.map(tx => ethers.parseUnits(tx.amount, decimals).toString());
        const erc20Gas = await this.batchingContract.estimateGasERC20(
          tokenAddress,
          recipients,
          amounts
        );
        totalGas += erc20Gas;
      }
  
      return totalGas;
    } catch (error: any) {
      throw new Error(`Failed to estimate gas: ${error.message || error}`);
    }
  }

  async getGasPrice(): Promise<bigint> {
    return this.gasEstimator.getGasPrice();
  }
}