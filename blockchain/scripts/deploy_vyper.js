const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Deploy the NFTMarketplace contract first
  console.log("Deploying NFTMarketplace contract...");
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed();
  console.log(`NFTMarketplace deployed to: ${nftMarketplace.address}`);

  // Deploy the NFT contract, passing the marketplace address as constructor argument
  console.log("Deploying NFT contract...");
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(nftMarketplace.address);
  await nft.deployed();
  console.log(`NFT deployed to: ${nft.address}`);

  // Write the contract addresses to the env file for the frontend
  const envConfigPath = path.join(__dirname, "../../frontend/.env.local");
  const envConfig = `NEXT_PUBLIC_MARKETPLACE_ADDRESS=${nftMarketplace.address}
NEXT_PUBLIC_NFT_ADDRESS=${nft.address}
`;

  fs.writeFileSync(envConfigPath, envConfig);
  console.log(`Contract addresses written to ${envConfigPath}`);

  console.log("Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 