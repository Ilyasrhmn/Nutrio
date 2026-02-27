import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * TypeScript deploy script using viem.
 * Usage: pnpm --filter contracts deploy:local
 *
 * This script deploys contracts to a local Anvil node.
 * Make sure `anvil` is running before executing this script.
 */
async function main() {
  const privateKey = (process.env["DEPLOYER_PRIVATE_KEY"] ??
    // Default Anvil account #0
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80") as `0x${string}`;

  const account = privateKeyToAccount(privateKey);

  const publicClient = createPublicClient({
    chain: foundry,
    transport: http("http://127.0.0.1:8545"),
  });

  const walletClient = createWalletClient({
    account,
    chain: foundry,
    transport: http("http://127.0.0.1:8545"),
  });

  console.log(`Deploying from: ${account.address}`);

  const balance = await publicClient.getBalance({
    address: account.address,
  });
  console.log(`Balance: ${balance} wei`);

  // TODO: Deploy contracts here using viem
  // Example:
  // const hash = await walletClient.deployContract({
  //   abi: counterAbi,
  //   bytecode: counterBytecode,
  // });
  // const receipt = await publicClient.waitForTransactionReceipt({ hash });
  // console.log(`Contract deployed at: ${receipt.contractAddress}`);

  console.log("Deploy script completed. Add your deployment logic above.");
}

main().catch(console.error);
