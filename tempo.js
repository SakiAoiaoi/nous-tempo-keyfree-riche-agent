import "dotenv/config";
import { createPublicClient, createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const erc20Abi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
];

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`.env に ${name} がありません`);
  }

  return value;
}

export async function sendTempoPayment(amount = "0.01") {
  const rpcUrl = requireEnv("RPC_URL");
  const privateKey = requireEnv("PRIVATE_KEY");
  const tokenAddress = requireEnv("TOKEN_ADDRESS");
  const toAddress = requireEnv("PIGGYBANK_ADDRESS");
  const tokenDecimals = Number(requireEnv("TOKEN_DECIMALS"));

  const account = privateKeyToAccount(
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
  );

  const tempoChain = {
    id: 4321,
    name: "Tempo",
    nativeCurrency: {
      name: "Tempo ETH",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: [rpcUrl]
      }
    }
  };

  const publicClient = createPublicClient({
    chain: tempoChain,
    transport: http(rpcUrl)
  });

  const walletClient = createWalletClient({
    account,
    chain: tempoChain,
    transport: http(rpcUrl)
  });

  const tokenAmount = parseUnits(amount, tokenDecimals);

  const txHash = await walletClient.writeContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "transfer",
    args: [toAddress, tokenAmount]
  });

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash
  });

  return {
    chain: "Tempo",
    amount,
    token: process.env.TOKEN_SYMBOL || "USDC.e",
    txHash,
    blockNumber: receipt.blockNumber.toString()
  };
}
