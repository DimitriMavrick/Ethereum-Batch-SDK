import hre from 'hardhat';
import { EthereumBatchSDK } from '../src/index';
import { ERC20Handler } from '../src/erc20Handler';

const multiSendArtifact = require('../artifacts/contracts/MultiSend.sol/MultiSend.json');
const multiSendAbi = multiSendArtifact.abi;

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy MockERC20
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20", deployer);
  const mockERC20 = await MockERC20.deploy(hre.ethers.parseUnits("1000000", 18));
  await mockERC20.waitForDeployment();
  const mockERC20Address = mockERC20.target;
  console.log("MockERC20 deployed to:", mockERC20Address);

  // Deploy MultiSend
  const MultiSend = await hre.ethers.getContractFactory("MultiSend", deployer);
  const multiSend = await MultiSend.deploy();
  await multiSend.waitForDeployment();
  const multiSendAddress = multiSend.target;
  console.log("MultiSend deployed to:", multiSendAddress);

  // Initialize SDK
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Hardhat default Account #0
  const sdk = new EthereumBatchSDK(hre.ethers.provider, privateKey, multiSendAddress, multiSendAbi);

  // Pre-approve MultiSend to spend 1000 tokens (more than needed) from the signer
  const erc20Handler = new ERC20Handler(mockERC20Address, hre.ethers.provider, new hre.ethers.Wallet(privateKey, hre.ethers.provider));
  const approvalAmount = hre.ethers.parseUnits("1000", 18); // Approve 1000 tokens
  console.log(`Approving ${multiSendAddress} to spend ${hre.ethers.formatUnits(approvalAmount, 18)} tokens...`);
  const approvalTx = await erc20Handler.approve(multiSendAddress, approvalAmount);
  await approvalTx.wait();
  console.log("Approval transaction hash:", approvalTx.hash);

  // Add transaction to batch
  const recipient = "0x38cf05afdEBea6c9B58f1b96AC99c42b37E19921";
  sdk.addTransaction(recipient, "100.0", mockERC20Address);
  console.log(`Transaction added: 100 tokens to ${recipient} using MockERC20: ${mockERC20Address}`);

  // Estimate gas
  const estimatedGas = await sdk.estimateGas();
  console.log("Estimated gas for batch:", estimatedGas.toString());

  // Get gas price
  const gasPrice = await sdk.getGasPrice();
  console.log("Current gas price:", gasPrice.toString());

  // Calculate total gas cost
  const totalGasCost = estimatedGas * gasPrice;
  console.log("Total estimated gas cost (wei):", totalGasCost.toString());
  console.log("Total estimated gas cost (ETH):", hre.ethers.formatEther(totalGasCost));

  // Execute batch transaction
  console.log("Executing batch transaction...");
  const receipts = await sdk.batchTransactions();
  console.log("Batch transaction receipts:", receipts);

  // Verify results
  const tokenContract = await hre.ethers.getContractAt("MockERC20", mockERC20Address, deployer);
  const decimals = await tokenContract.decimals();
  console.log("Decimals:", decimals.toString());

  const recipientBalance = await tokenContract.balanceOf(recipient);
  console.log(`Recipient balance after batch: ${hre.ethers.formatUnits(recipientBalance, decimals)} tokens`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});