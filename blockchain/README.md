# NFT Marketplace Vyper Contracts

This directory contains Vyper contracts for the NFT Marketplace. The contracts implement an ERC721 token standard for NFTs and a marketplace where users can list, buy, and sell these NFTs.

## Contracts

1. `NFT.vy` - An ERC721 compliant contract for creating NFTs with URI storage
2. `NFTMarketplace.vy` - A marketplace contract for listing, buying, and selling NFTs

## Requirements

- [Vyper](https://vyper.readthedocs.io/en/stable/installing-vyper.html) (v0.3.7 or later)
- [Hardhat](https://hardhat.org/) with the [hardhat-vyper plugin](https://github.com/nomiclabs/hardhat/tree/master/packages/hardhat-vyper)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update your `hardhat.config.js` to include Vyper support:
```js
require("@nomiclabs/hardhat-vyper");
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.7",
  vyper: {
    version: "0.3.7",
  },
  networks: {
    hardhat: {
      chainId: 1337
    }
  }
};
```

3. Compile the contracts:
```bash
npx hardhat compile
```

## Deployment

Deploy the contracts to a local network:

```bash
npx hardhat node
npx hardhat run scripts/deploy_vyper.js --network localhost
```

This will:
1. Deploy the NFTMarketplace contract
2. Deploy the NFT contract with the marketplace address as constructor argument
3. Write the contract addresses to the frontend `.env.local` file

## Connecting to the Frontend

The deployment script automatically updates the frontend configuration file with the new contract addresses. After deployment, the frontend will use the deployed Vyper contract addresses.

## Contract Features

### NFT Contract
- Mint new NFTs with metadata URI
- Transfer NFTs between addresses
- Approve addresses to transfer specific NFTs
- Set approval for all NFTs owned by an address

### NFT Marketplace Contract
- List NFTs for sale with a specified price
- Buy NFTs listed on the marketplace
- Update the price of listed NFTs
- Get all available listings
- Get listings by seller or owner
- Resell previously purchased NFTs
