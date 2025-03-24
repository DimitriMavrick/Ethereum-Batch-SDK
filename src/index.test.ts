// import { ethers } from 'ethers';
// import { EthereumBatchSDK } from './index';

// // Mock the provider and signer for testing
// const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545'); // Use a local test node (e.g., Hardhat)
// const wallet = ethers.Wallet.createRandom();
// const signer = wallet.connect(provider);

// // Mock batching contract ABI
// const BATCHING_CONTRACT_ABI = [
//   {
//     "name": "multiSend",
//     "type": "function",
//     "inputs": [
//       { "name": "recipients", "type": "address[]" },
//       { "name": "amounts", "type": "uint256[]" }
//     ],
//     "outputs": [],
//     "stateMutability": "payable"
//   },
//   {
//     "name": "multiSendERC20",
//     "type": "function",
//     "inputs": [
//       { "name": "token", "type": "address" },
//       { "name": "recipients", "type": "address[]" },
//       { "name": "amounts", "type": "uint256[]" }
//     ],
//     "outputs": [],
//     "stateMutability": "nonpayable"
//   }
// ];

// describe('EthereumBatchSDK', () => {
//   let sdk: EthereumBatchSDK;

//   beforeEach(() => {
//     sdk = new EthereumBatchSDK(
//       'http://localhost:8545', // Use a local test node
//       wallet.privateKey,
//       '0xBatchingContractAddress', // Replace with actual deployed contract address
//       BATCHING_CONTRACT_ABI
//     );
//   });

//   test('should add ETH transaction', () => {
//     sdk.addTransaction('0xRecipient1', '1.0');
//     const transactions = sdk.transactionManager.getTransactions();
//     expect(transactions).toHaveLength(1);
//     expect(transactions[0]).toEqual({
//       recipient: '0xRecipient1',
//       amount: '1.0',
//       tokenAddress: undefined,
//     });
//   });

//   test('should add ERC-20 transaction', () => {
//     sdk.addTransaction('0xRecipient1', '100.0', '0xTokenAddress');
//     const transactions = sdk.transactionManager.getTransactions();
//     expect(transactions).toHaveLength(1);
//     expect(transactions[0]).toEqual({
//       recipient: '0xRecipient1',
//       amount: '100.0',
//       tokenAddress: '0xTokenAddress',
//     });
//   });

//   test('should throw error for invalid recipient address', () => {
//     expect(() => sdk.addTransaction('invalid-address', '1.0')).toThrow('Invalid recipient address');
//   });

//   test('should throw error for invalid amount', () => {
//     expect(() => sdk.addTransaction('0xRecipient1', 'invalid-amount')).toThrow('Invalid amount');
//   });

//   test('should throw error for invalid token address', () => {
//     expect(() => sdk.addTransaction('0xRecipient1', '100.0', 'invalid-token-address')).toThrow('Invalid token address');
//   });

//   // Add more tests for batchTransactions and estimateGas
//   // These tests require a deployed batching contract and a test network (e.g., Hardhat)
//   // Example:
//   /*
//   test('should batch ETH transactions', async () => {
//     sdk.addTransaction('0xRecipient1', '1.0');
//     sdk.addTransaction('0xRecipient2', '0.5');
//     const receipts = await sdk.batchTransactions();
//     expect(receipts).toHaveLength(1); // One transaction for ETH batch
//   });
//   */
// });