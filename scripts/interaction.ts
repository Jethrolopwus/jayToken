import { ethers } from "hardhat";

async function main() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy or get instances of the contracts
    const JayTokenFactory = await ethers.getContractFactory("JayToken");
    const jayToken = await JayTokenFactory.deploy("Jay Token", "JKT", 18, 1000000);
    const jayTokenAddress = await jayToken.getAddress();
    console.log(`JayToken deployed to: ${jayTokenAddress}`);

    const JayStakeFactory = await ethers.getContractFactory("JayStake");
    const jayStake = await JayStakeFactory.deploy();
    const jayStakeAddress = await jayStake.getAddress();
    console.log(`jayStake deployed to: ${jayStakeAddress}`);

    const JayStakingPoolFactory = await ethers.getContractFactory("JayStakingPool");
    const jayStakingPool = await JayStakingPoolFactory.deploy();
    const jayStakingPoolAddress = await jayStakingPool.getAddress();
    console.log(`JayStakingPool deployed to: ${jayStakingPoolAddress}`);

    // Interact with KingToken
    await jayToken.transfer(addr1.address, 100);
    console.log(`Transferred 100 tokens to ${addr1.address}`);

    const balance1 = await jayToken.balanceOf(addr1.address);
    console.log(`Addr1 Balance: ${balance1.toString()}`);

    // Approve tokens for staking
    await jayToken.approve(jayStakingPoolAddress, 50);
    console.log(`Approved 50 tokens for ${jayStakingPoolAddress}`);

    // Interact with JayStake
    await jayStake.mint(addr1.address, 1, 2, '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.4725 3.3675C16.9825 2.8775 16.1925 2.8775 15.7025 3.3675L7.29253 11.7775C6.90253 12.1675 6.90253 12.7975 7.29253 13.1875L15.7025 21.5975C16.1925 22.0875 16.9825 22.0875 17.4725 21.5975C17.9625 21.1075 17.9625 20.3175 17.4725 19.8275L10.1325 12.4875L17.4825 5.1375C17.9625 4.6475 17.9625 3.8575 17.4725 3.3675Z" fill="#FF2CDF"/></svg>');
    console.log(`Minted 2 tokens for ${addr1.address} with ID 1`);

    const balanceCollection = await jayStake.balanceOf(addr1.address, 1);
    console.log(`Addr1 Collection Balance: ${balanceCollection.toString()}`);

    // Add a staking pool
    await jayStakingPool.addPool(jayTokenAddress, ethers.parseUnits("1", 18));
    console.log(`Added staking pool for ${jayTokenAddress}`);

    // Stake tokens
    await jayStakingPool.stake(1, 50);
    console.log(`Staked 50 tokens in pool 1`);

    const stakedBalance = await jayStakingPool.getStakedBalance(1, addr1.address);
    console.log(`Addr1 Staked Balance: ${stakedBalance.toString()}`);

    // Withdraw tokens
    await jayStakingPool.withdraw(1, 25);
    console.log(`Withdrew 25 tokens from pool 1`);

    const updatedStakedBalance = await jayStakingPool.getStakedBalance(1, addr1.address);
    console.log(`Updated Addr1 Staked Balance: ${updatedStakedBalance.toString()}`);

    // Claim reward
    await jayStakingPool.claimReward(1);
    console.log(`Claimed rewards for pool 1`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
