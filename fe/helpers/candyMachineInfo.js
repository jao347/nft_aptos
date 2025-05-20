export const collectionName = 'Ninja NFT Studio'; // Case sensitive!
export const MaxMint = 3;
export const COLLECTION_SIZE = 100;

// To remove the background of the dapp to a solid color just delete the "collectionCoverUrl" url below
// Any hosted image can be used - jpeg, gif, png
export const collectionCoverUrl = '/nin1.png';
export const collectionBackgroundUrl = '/bg-ninja.jpg';

export const mode = 'dev'; // "dev" or "test" or "mainnet"
export let NODE_URL;
export const CONTRACT_ADDRESS =
  '0x642551b0c74dd23fb5a00acaf4798b3f701b255b9fadb072fd0e63575be70ba2';
let FAUCET_URL;

if (mode == 'dev') {
  NODE_URL = 'https://fullnode.devnet.aptoslabs.com/v1';
  FAUCET_URL = 'https://faucet.devnet.aptoslabs.com';
} else if (mode === 'test') {
  NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1';
  FAUCET_URL = 'https://faucet.testnet.aptoslabs.com';
} else {
  NODE_URL = 'https://fullnode.mainnet.aptoslabs.com/v1';
  FAUCET_URL = null;
}
