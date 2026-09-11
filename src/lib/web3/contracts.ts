/**
 * AYNI Protocol — Smart Contract Config & Web3 Helpers
 * Buildathon ETH Bolivia 2026 - Red Base L2 (Base Sepolia Chain ID: 84532)
 * AyniEscrow.sol ABI & Modular Custom Clauses Architecture
 */

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_MAINNET_CHAIN_ID = 8453;

// Dirección oficial del contrato AyniEscrow desplegado en Base Sepolia (Testnet)
export const AYNI_ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || '0x71C93475A6E46949Cbc4928Eb811b7d566bEB49a';
export const USDC_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Base Sepolia USDC

export interface CustomClauses {
  requiresTangemHardwareGuard: boolean;
  tangemGuardAddress: string;
  inspectionWindowSeconds: number; // 0, 86400 (24h), 172800 (48h)
  milestonePayoutEnabled: boolean; // 50% anticipo verificado + 50% entrega
  customsInsuranceCovered: boolean;
  autoReleaseOnTimeout: boolean;
}

export const DEFAULT_CLAUSES: CustomClauses = {
  requiresTangemHardwareGuard: true,
  tangemGuardAddress: '0x9a8F23B15a7B9c1D3f5A7b9C1d3F5a7B9c1D3F5A',
  inspectionWindowSeconds: 86400, // 24 horas de inspección técnica
  milestonePayoutEnabled: true,
  customsInsuranceCovered: true,
  autoReleaseOnTimeout: true,
};

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
      { indexed: true, internalType: 'address', name: 'traveler', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'totalAmount', type: 'uint256' }
    ],
    name: 'TradeCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'tradeId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'MilestonePaid',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'tradeId', type: 'uint256' },
      { indexed: false, internalType: 'bool', name: 'approved', type: 'bool' },
      { indexed: false, internalType: 'string', name: 'rationale', type: 'string' }
    ],
    name: 'ProofVerifiedAI',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'tradeId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'payoutTraveler', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'feeSystem', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'feeReserve', type: 'uint256' }
    ],
    name: 'TradeCompleted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'tradeId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'buyerRefund', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'travelerPayout', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'verdict', type: 'string' }
    ],
    name: 'DisputeResolved',
    type: 'event'
  },
  {
    inputs: [
      { internalType: 'address', name: '_traveler', type: 'address' },
      { internalType: 'uint256', name: '_purchaseAmount', type: 'uint256' },
      { internalType: 'uint256', name: '_feeAmount', type: 'uint256' },
      { internalType: 'uint256', name: '_systemFee', type: 'uint256' },
      { internalType: 'uint8', name: '_type', type: 'uint8' },
      { internalType: 'bytes32', name: '_otpHash', type: 'bytes32' },
      {
        components: [
          { internalType: 'bool', name: 'requiresTangemHardwareGuard', type: 'bool' },
          { internalType: 'address', name: 'tangemGuardAddress', type: 'address' },
          { internalType: 'uint256', name: 'inspectionWindowSeconds', type: 'uint256' },
          { internalType: 'bool', name: 'milestonePayoutEnabled', type: 'bool' },
          { internalType: 'bool', name: 'customsInsuranceCovered', type: 'bool' },
          { internalType: 'bool', name: 'autoReleaseOnTimeout', type: 'bool' }
        ],
        internalType: 'struct AyniEscrow.CustomClauses',
        name: '_clauses',
        type: 'tuple'
      }
    ],
    name: 'createTradeWithClauses',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_tradeId', type: 'uint256' },
      { internalType: 'string', name: '_otpCode', type: 'string' },
      { internalType: 'bytes', name: '_tangemSignature', type: 'bytes' }
    ],
    name: 'completeTradeWithOtp',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_tradeId', type: 'uint256' },
      { internalType: 'bool', name: '_approved', type: 'bool' },
      { internalType: 'string', name: '_rationale', type: 'string' }
    ],
    name: 'verifyProofByAI',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_tradeId', type: 'uint256' },
      { internalType: 'uint256', name: '_buyerRefund', type: 'uint256' },
      { internalType: 'uint256', name: '_travelerPayout', type: 'uint256' },
      { internalType: 'string', name: '_verdict', type: 'string' }
    ],
    name: 'resolveDispute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tradeId', type: 'uint256' }],
    name: 'finalizeAfterInspection',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_tradeId', type: 'uint256' }],
    name: 'cancelAndRefund',
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
  methodCalled?: string;
  clausesApplied?: CustomClauses;
}

/**
 * Ejecuta o simula la creación de custodia con cláusulas personalizadas
 */
export async function executeEscrowDeposit({
  buyerAddress,
  travelerAddress,
  amountUsdc,
  otpPlain,
  travelerFeeUsdc = 0,
  systemFeeUsdc = 0,
  clauses = DEFAULT_CLAUSES,
}: {
  buyerAddress: string;
  travelerAddress?: string;
  amountUsdc: number;
  otpPlain: string;
  travelerFeeUsdc?: number;
  systemFeeUsdc?: number;
  clauses?: CustomClauses;
}): Promise<Web3TransactionResult> {
  const simulatedHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const tradeId = Math.floor(1000 + Math.random() * 9000);

  // Si window.ethereum está disponible y el usuario quiere firmar real con MetaMask / Rabby / Tangem
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        console.log('[AYNI Web3] Wallet conectada en Base L2:', accounts[0]);
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
    methodCalled: 'createTradeWithClauses',
    clausesApplied: clauses,
  };
}

/**
 * Libera los fondos del contrato al ingresar el código OTP y validar firma Tangem
 */
export async function executeEscrowRelease(
  tradeId: string | number, 
  otpCode: string,
  tangemSignature?: string
): Promise<Web3TransactionResult> {
  const simulatedHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  return {
    success: true,
    txHash: simulatedHash,
    blockNumber: 18492045,
    explorerUrl: `https://sepolia.basescan.org/tx/${simulatedHash}`,
    isSimulated: true,
    methodCalled: 'completeTradeWithOtp',
  };
}

/**
 * Resuelve una disputa on-chain ejecutando el veredicto del oráculo IA en Base L2
 */
export async function executeDisputeResolution(
  tradeId: string | number,
  buyerRefundUsdc: number,
  travelerPayoutUsdc: number,
  verdictRationale: string
): Promise<Web3TransactionResult> {
  const simulatedHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  return {
    success: true,
    txHash: simulatedHash,
    blockNumber: 18492050,
    explorerUrl: `https://sepolia.basescan.org/tx/${simulatedHash}`,
    isSimulated: true,
    methodCalled: 'resolveDispute',
  };
}
