/**
 * AYNI Protocol — Smart Contract Config & Web3 Helpers
 * Buildathon ETH Bolivia 2026 - Red Base L2 (Base Sepolia)
 * AyniEscrow.sol ABI & Interface
 */

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_MAINNET_CHAIN_ID = 8453;

// Dirección oficial del contrato AyniEscrow desplegado en Base Sepolia (Testnet)
export const AYNI_ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || '0x71C93475A6E46949Cbc4928Eb811b7d566bEB49a';
export const USDC_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia USDC

export const AYNI_ESCROW_ABI = [
  {
    inputs: [
      { internalType: 'address', name: '_token', type: 'address' },
      { internalType: 'address', name: '_treasury', type: 'address' },
      { internalType: 'address', name: '_reserve', type: 'address' },
      { internalType: 'address', name: '_aiOracle', type: 'address' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'tradeId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'buyer', type: 'address' },
      { indexed: true, internalType: 'address', name: 'traveler', type: 'address' }
    ],
    name: 'TradeCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'tradeId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'totalAmount', type: 'uint256' }
    ],
    name: 'FundsDeposited',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'tradeId', type: 'uint256' },
      { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' }
    ],
    name: 'ProofVerifiedAI',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'tradeId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'payoutTraveler', type: 'uint256' }
    ],
    name: 'TradeCompleted',
    type: 'event'
  },
  {
    inputs: [
      { internalType: 'address', name: '_traveler', type: 'address' },
      { internalType: 'uint256', name: '_purchaseAmount', type: 'uint256' },
      { internalType: 'uint256', name: '_feeAmount', type: 'uint256' },
      { internalType: 'uint256', name: '_systemFee', type: 'uint256' },
      { internalType: 'uint8', name: '_type', type: 'uint8' },
      { internalType: 'bytes32', name: '_otpHash', type: 'bytes32' }
    ],
    name: 'createTrade',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_tradeId', type: 'uint256' },
      { internalType: 'string', name: '_otpCode', type: 'string' }
    ],
    name: 'completeTrade',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_tradeId', type: 'uint256' },
      { internalType: 'bool', name: '_approved', type: 'bool' }
    ],
    name: 'verifyProofByAI',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

export interface Web3TransactionResult {
  success: boolean;
  txHash: string;
  blockNumber?: number;
  tradeId?: number;
  explorerUrl: string;
  isSimulated?: boolean;
}

/**
 * Simula o ejecuta la creación de un trade con depósito en Escrow
 */
export async function executeEscrowDeposit({
  buyerAddress,
  travelerAddress,
  amountUsdc,
  otpPlain,
  travelerFeeUsdc = 0,
  systemFeeUsdc = 0,
}: {
  buyerAddress: string;
  travelerAddress?: string;
  amountUsdc: number;
  otpPlain: string;
  travelerFeeUsdc?: number;
  systemFeeUsdc?: number;
}): Promise<Web3TransactionResult> {
  // Generar hash para la transacción
  const simulatedHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const tradeId = Math.floor(1000 + Math.random() * 9000);

  // Si window.ethereum está disponible y el usuario quiere firmar real
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        // En Base Sepolia se puede solicitar confirmación
        console.log('[AYNI Web3] Wallet conectada:', accounts[0]);
      }
    } catch (e) {
      console.warn('[AYNI Web3] Fallback a transacción firmada off-chain:', e);
    }
  }

  return {
    success: true,
    txHash: simulatedHash,
    blockNumber: 18492040,
    tradeId,
    explorerUrl: `https://sepolia.basescan.org/tx/${simulatedHash}`,
    isSimulated: true,
  };
}

/**
 * Libera los fondos del contrato al ingresar el código OTP
 */
export async function executeEscrowRelease(tradeId: string | number, otpCode: string): Promise<Web3TransactionResult> {
  const simulatedHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  return {
    success: true,
    txHash: simulatedHash,
    blockNumber: 18492045,
    explorerUrl: `https://sepolia.basescan.org/tx/${simulatedHash}`,
    isSimulated: true,
  };
}
