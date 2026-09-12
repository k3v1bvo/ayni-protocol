/**
 * AYNI Protocol — Unlock Protocol (membresías token-gated)
 * Bounty Unlock Protocol — Token-Gated Portal ($250/$150)
 * Lock desplegado en Base Sepolia (testnet)
 */

import { createPublicClient, http, getAddress, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';

export const UNLOCK_NETWORK_ID = 84532; // Base Sepolia
export const UNLOCK_LOCK_ADDRESS = (process.env.NEXT_PUBLIC_UNLOCK_LOCK_ADDRESS || '') as Address;

// Direccion oficial del Unlock Factory/PublicLock deployer en Base Sepolia (@unlock-protocol/networks)
export const UNLOCK_FACTORY_ADDRESS = '0x259813B665C8f6074391028ef782e27B65840d89';

const PUBLIC_LOCK_ABI = [
  {
    inputs: [{ internalType: 'address', name: '_user', type: 'address' }],
    name: 'getHasValidKey',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'keyPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

/** Consulta on-chain si una wallet tiene una membresia valida (no expirada) en el Lock de AYNI */
export async function hasValidMembership(address: string): Promise<boolean> {
  if (!UNLOCK_LOCK_ADDRESS) return false;
  try {
    return await publicClient.readContract({
      address: UNLOCK_LOCK_ADDRESS,
      abi: PUBLIC_LOCK_ABI,
      functionName: 'getHasValidKey',
      args: [getAddress(address)],
    });
  } catch (error) {
    console.error('[Unlock] Error consultando getHasValidKey:', error);
    return false;
  }
}
