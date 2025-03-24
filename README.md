# Ethereum Batch SDK

A TypeScript library for batching Ethereum transactions, supporting both native ETH and ERC-20 tokens. The SDK integrates with an open-source batching contract, provides gas estimation, and ensures a user-friendly developer experience.

## Features
- Batch ETH and ERC-20 transactions in a single transaction to save gas.
- Accurate gas estimation for cost optimization.
- Support for dynamic ERC-20 token decimals.
- Comprehensive error handling and input validation.
- Well-documented API with examples.

## Installation
```bash
npm install ethereum-batch-sdk

npx hardhat node: Starts the local network.
npx hardhat run scripts/deploy.js --network hardhat: Deploys the contract.
npx hardhat run examples/example.js --network hardhat: Runs the SDK example.