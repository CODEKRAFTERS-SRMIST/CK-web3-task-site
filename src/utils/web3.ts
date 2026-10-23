/**
 * ponytail: Native EIP-1193 & Solana provider interfaces.
 * Zero external libraries needed. Uses standard window.ethereum and window.solana.
 */

export interface ConnectedWalletData {
  name: string;
  address: string;
  fullAddress: string;
  network: string;
  balance: string;
  chainId: number;
  signature?: string;
}

const NETWORK_MAP: Record<number, string> = {
  1: 'Ethereum Mainnet (Chain ID: 1)',
  11155111: 'Sepolia Testnet (Chain ID: 11155111)',
  137: 'Polygon PoS (Chain ID: 137)',
  8453: 'Base Mainnet (Chain ID: 8453)',
  42161: 'Arbitrum One (Chain ID: 42161)',
  10: 'Optimism Mainnet (Chain ID: 10)',
};

export function formatAddress(address: string): string {
  if (!address || address === 'Not Connected') return 'Not Connected';
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isEthereumAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).ethereum);
}

export function isSolanaAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).phantom?.solana || (window as any).solana);
}

export async function connectEVMWallet(walletName = 'MetaMask'): Promise<ConnectedWalletData> {
  const eth = typeof window !== 'undefined' ? (window as any).ethereum : null;
  if (!eth) {
    throw new Error(
      `${walletName} or compatible Web3 browser extension not detected. Please install ${walletName} from official site.`
    );
  }

  // Request account connection
  const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts authorized. Please approve the connection in your wallet.');
  }

  const rawAddress = accounts[0];
  const chainIdHex: string = await eth.request({ method: 'eth_chainId' });
  const chainId = parseInt(chainIdHex, 16) || 1;
  const network = NETWORK_MAP[chainId] || `EVM Chain ID: ${chainId}`;

  let balance = '0.00 ETH';
  try {
    const balanceHex: string = await eth.request({
      method: 'eth_getBalance',
      params: [rawAddress, 'latest'],
    });
    const wei = BigInt(balanceHex || '0');
    // Convert wei to ETH with 4 decimals
    const ethVal = Number(wei / 100000000000000n) / 10000;
    balance = `${ethVal.toFixed(4)} ETH`;
  } catch {
    balance = '0.00 ETH';
  }

  return {
    name: walletName,
    address: formatAddress(rawAddress),
    fullAddress: rawAddress,
    network,
    balance,
    chainId,
  };
}

export async function connectSolanaWallet(walletName = 'Phantom'): Promise<ConnectedWalletData> {
  const solana = typeof window !== 'undefined' ? (window as any).phantom?.solana || (window as any).solana : null;
  if (!solana) {
    throw new Error(
      `${walletName} extension not detected. Please install ${walletName} extension to connect.`
    );
  }

  const res = await solana.connect();
  const rawAddress = res.publicKey.toString();

  return {
    name: walletName,
    address: formatAddress(rawAddress),
    fullAddress: rawAddress,
    network: 'Solana Mainnet-Beta',
    balance: 'SOL Account Active',
    chainId: 101, // Solana Mainnet Cluster ID
  };
}

export async function signSIWEMessage(
  address: string,
  walletName: string
): Promise<string> {
  if (walletName === 'Phantom') {
    const solana = (window as any).phantom?.solana || (window as any).solana;
    if (!solana?.signMessage) throw new Error('Solana message signing not supported by provider.');
    const message = new TextEncoder().encode(
      `Sign in to CodeKrafters Web3 Guild\nAddress: ${address}\nTimestamp: ${new Date().toISOString()}`
    );
    const signed = await solana.signMessage(message, 'utf8');
    return Array.from(signed.signature as Uint8Array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  const eth = (window as any).ethereum;
  if (!eth) throw new Error('No Ethereum provider found for signing.');

  const nonce = Math.random().toString(36).slice(2, 10);
  const message = `Sign in to CodeKrafters Web3 Builder Guild\n\nDomain: codekrafters.network\nAddress: ${address}\nNonce: ${nonce}\nStatement: Authenticate builder passport and verifiable credentials.\nIssued At: ${new Date().toISOString()}`;

  // Encode UTF-8 message into hex for personal_sign
  const hexMessage =
    '0x' +
    Array.from(new TextEncoder().encode(message))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  const signature: string = await eth.request({
    method: 'personal_sign',
    params: [hexMessage, address],
  });

  return signature;
}
