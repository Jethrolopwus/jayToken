import { ethers } from "hardhat";

async function main() {
    const JayToken = await ethers.getContractFactory("JayToken");
    const jayToken = await JayToken.deploy("JayToken", "JTK", 18, 1000000);

    console.log("JayToken deployed to:", await jayToken.getAddress());

    const JayStake = await ethers.getContractFactory("JayStake");
    const jayStake = await JayStake.deploy();

    console.log("JayStake deployed to:", await jayStake.getAddress());

    console.log("Minting an NFT...");
    const svg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.4725 3.3675C16.9825 2.8775 16.1925 2.8775 15.7025 3.3675L7.29253 11.7775C6.90253 12.1675 6.90253 12.7975 7.29253 13.1875L15.7025 21.5975C16.1925 22.0875 16.9825 22.0875 17.4725 21.5975C17.9625 21.1075 17.9625 20.3175 17.4725 19.8275L10.1325 12.4875L17.4825 5.1375C17.9625 4.6475 17.9625 3.8575 17.4725 3.3675Z" fill="#FF2CDF"/></svg>';
    const mintTx = await jayStake.mint("0x21726d1CBf49479CA2bc6E7688c6c591C0981F08", 1, 1, svg);
    await mintTx.wait();

    console.log("Initial NFT minted!");

    // Fetch and log the token URI for the minted NFT
    const tokenURI = await jayStake.uri(1);
    console.log("Token URI for minted NFT:", tokenURI);

    const JayStakingPool = await ethers.getContractFactory("JayStakingPool");
    const jayStakingPool = await JayStakingPool.deploy();

    console.log("JayStakingPool deployed to:", await jayStakingPool.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
