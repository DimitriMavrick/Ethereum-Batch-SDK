import { ethers } from 'ethers';

interface Transaction {
  recipient: string;
  amount: string; // in ETH or token units
  tokenAddress?: string; // undefined for ETH, address for ERC-20
}

export class TransactionManager {
  private transactions: Transaction[] = [];

  addTransaction(recipient: string, amount: string, tokenAddress?: string) {
    this.transactions.push({ recipient, amount, tokenAddress });
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  clearTransactions() {
    this.transactions = [];
  }

  // Split transactions by type (ETH or ERC-20)
  splitByType(): { ethTxs: Transaction[], erc20Txs: Map<string, Transaction[]> } {
    const ethTxs: Transaction[] = [];
    const erc20Txs = new Map<string, Transaction[]>();

    for (const tx of this.transactions) {
      if (!tx.tokenAddress) {
        ethTxs.push(tx);
      } else {
        if (!erc20Txs.has(tx.tokenAddress)) {
          erc20Txs.set(tx.tokenAddress, []);
        }
        erc20Txs.get(tx.tokenAddress)!.push(tx);
      }
    }

    return { ethTxs, erc20Txs };
  }
}