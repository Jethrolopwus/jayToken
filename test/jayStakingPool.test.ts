const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JayStakingPool Contract", function () {
  let jayToken, jayStakingPool, jayTokenAddress, jayStakingPoolAddress, owner, user1, user2;
  const poolRewardRate = ethers.parseUnits("1", 18);

  beforeEach(async function () {
    const JayToken = await ethers.getContractFactory("JayToken");
    jayToken = await JayToken.deploy("JayToken", "JTK", 18, 1000000);
    jayTokenAddress = await jayToken.getAddress();

    const JayStakingPool = await ethers.getContractFactory("JayStakingPool");
    jayStakingPool = await JayStakingPool.deploy();
    jayStakingPoolAddress = await jayStakingPool.getAddress();

    [owner, user1, user2] = await ethers.getSigners();

    await jayToken.mint(user1.address, ethers.parseUnits("1000", 18));
    await jayToken.mint(user2.address, ethers.parseUnits("1000", 18));
  });

  describe("Pool management", function () {
    it("Should allow owner to add a new pool", async function () {
      await jayStakingPool.addPool(jayTokenAddress, poolRewardRate);
      const pool = await jayStakingPool.pools(1);
      expect(pool.stakingToken).to.equal(jayTokenAddress);
      expect(pool.rewardRate).to.equal(poolRewardRate);
    });

    it("Should not allow non-owner to add a new pool", async function () {
      await expect(jayStakingPool.connect(user1).addPool(jayTokenAddress, poolRewardRate)).to.be.revertedWith(
        "Error: You are not the owner"
      );
    });
  });

  describe("Staking", function () {
    beforeEach(async function () {
      await jayStakingPool.addPool(jayTokenAddress, poolRewardRate);
    });

    it("Should allow user to stake tokens", async function () {
      const stakeAmount = ethers.parseUnits("100", 18);
      const allowanceAmount = ethers.parseUnits("200", 18);

      await jayToken.connect(user1).approve(jayStakingPoolAddress, allowanceAmount);
      const allowance = await jayToken.allowance(user1.address, jayStakingPoolAddress);

      await jayStakingPool.connect(user1).stake(1, stakeAmount);

      const stakedBalance = await jayStakingPool.getStakedBalance(1, user1.address);
      expect(stakedBalance).to.equal(stakeAmount);

      const totalStaked = await jayStakingPool.pools(1).then((pool) => pool.totalStaked);
      expect(totalStaked).to.equal(stakeAmount);

      await expect(jayStakingPool.connect(user1).stake(1, stakeAmount))
        .to.emit(jayStakingPool, "Staked")
        .withArgs(user1.address, 1, stakeAmount);
    });

    it("Should allow user to withdraw staked tokens", async function () {
        const stakeAmount = ethers.parseUnits("100", 18);

        await jayToken.connect(user1).approve(jayStakingPoolAddress, stakeAmount);
        await jayStakingPool.connect(user1).stake(1, stakeAmount);

        const withdrawAmount = ethers.parseUnits("50", 18);
        await jayStakingPool.connect(user1).withdraw(1, withdrawAmount);

        const stakedBalance = await jayStakingPool.getStakedBalance(1, user1.address);

        const expectedBalance = stakeAmount-withdrawAmount;
        expect(stakedBalance).to.equal(expectedBalance);

        await expect(jayStakingPool.connect(user1).withdraw(1, withdrawAmount))
            .to.emit(jayStakingPool, "Withdrawn")
            .withArgs(user1.address, 1, withdrawAmount);
    });
  });

  describe("Reward Claiming", function () {
    beforeEach(async function () {
      await jayStakingPool.addPool(jayTokenAddress, poolRewardRate);
    });

    it("Should calculate rewards for a staker", async function () {
      const stakeAmount = ethers.parseUnits("100", 18);

      await jayToken.connect(user1).approve(jayStakingPoolAddress, stakeAmount);
      await jayStakingPool.connect(user1).stake(1, stakeAmount);

      await ethers.provider.send("evm_mine", []);

      const reward = await jayStakingPool.calculateReward(1, user1.address);
      expect(reward).to.be.gt(0);
    });

    it("Should mint an NFT as reward upon claim", async function () {
        const stakeAmount = ethers.parseUnits("100", 18);

        await jayToken.connect(user1).approve(jayStakingPoolAddress, stakeAmount);
        await jayStakingPool.connect(user1).stake(1, stakeAmount);

        await ethers.provider.send("evm_increaseTime", [3600]);
        await ethers.provider.send("evm_mine", []);

        const claim = await jayStakingPool.connect(user1).claimReward(1);

        const uri = await jayStakingPool.uri(1);

        await expect(jayStakingPool.connect(user1).claimReward(1))
            .to.emit(jayStakingPool, "RewardClaimed")
            .withArgs(user1.address, 2, 100000000000000000000n);
    });
  });
});
