import { expect } from 'chai';
import { ethers } from 'hardhat';
import { AddressZero } from "@ethersproject/constants";
import { JayStake } from '../typechain/jayStake';

describe('JayStake', () => {
  let jayStake: JayStake;
  let owner: string;
  let user1: string;
  let user2: string;

  beforeEach(async () => {
    const JayStakeFactory = await ethers.getContractFactory('JayStake');
    jayStake = await JayStakeFactory.deploy();

    [owner, user1, user2] = await ethers.getSigners();
  });

  describe('balanceOf', () => {
    it('should return 0 for non-existent token', async () => {
      const balance = await jayStake.balanceOf(user1.address, 1);
      expect(balance).to.equal(0);
    });

    it('should return correct balance after minting', async () => {
      await jayStake.mint(user1.address, 1, 10, 'metadata');
      const balance = await jayStake.balanceOf(user1.address, 1);
      expect(balance).to.equal(10);
    });
  });

  describe('balanceOfBatch', () => {
    it('should return correct balances for multiple tokens', async () => {
      await jayStake.mint(user1.address, 1, 10, 'metadata');
      await jayStake.mint(user1.address, 2, 20, 'metadata');
      const balances = await jayStake.balanceOfBatch([user1.address, user1.address], [1, 2]);
      expect(balances).to.deep.equal([10, 20]);
    });
  });

  describe('setApprovalForAll', () => {
    it('should emit ApprovalForAll event', async () => {
      await expect(jayStake.setApprovalForAll(user2.address, true))
        .to.emit(jayStake, 'ApprovalForAll')
        .withArgs(owner, user2.address, true);
    });

    it('should update operator approval', async () => {
      await jayStake.setApprovalForAll(user2.address, true);
      const isApproved = await jayStake.isApprovedForAll(owner, user2.address);
      expect(isApproved).to.equal(true);
    });
  });

  describe('mint', () => {
    it('should emit TransferSingle event', async () => {
      await expect(jayStake.mint(user1.address, 1, 10, 'metadata'))
        .to.emit(jayStake, 'TransferSingle')
        .withArgs(owner, AddressZero, user1.address, 1, 10);
    });

    it('should update token metadata', async () => {
      await jayStake.mint(user1.address, 1, 10, 'metadata');
      const metadata = await jayStake.tokenMetadata(1);
      expect(metadata).to.equal('metadata');
    });
  });

  describe('mintBatch', () => {
    it('should emit TransferBatch event', async () => {
      await expect(jayStake.mintBatch(user1.address, [1, 2], [10, 20], ['metadata1', 'metadata2']))
        .to.emit(jayStake, 'TransferBatch')
        .withArgs(owner, AddressZero, user1.address, [1, 2], [10, 20]);
    });

    it('should update token metadata for multiple tokens', async () => {
      await jayStake.mintBatch(user1.address, [1, 2], [10, 20], ['metadata1', 'metadata2']);
      const metadata1 = await jayStake.tokenMetadata(1);
      const metadata2 = await jayStake.tokenMetadata(2);
      expect(metadata1).to.equal('metadata1');
      expect(metadata2).to.equal('metadata2');
    });
  });

  describe('safeTransferFrom', () => {
    it('should emit TransferSingle event', async () => {
      await jayStake.mint(user1.address, 1, 10, 'metadata');
      await jayStake.connect(user1).setApprovalForAll(user2.address, true);
      await expect(jayStake.connect(user2).safeTransferFrom(user1.address, user2.address, 1, 5))
        .to.emit(jayStake, 'TransferSingle')
        .withArgs(user2.address, user1.address, user2.address, 1, 5);
    });

    it('should update token balance', async () => {
      await jayStake.mint(user1.address, 1, 10, 'metadata');
      await jayStake.connect(user1).setApprovalForAll(user2.address, true);
      await jayStake.connect(user2).safeTransferFrom(user1.address, user2.address, 1, 5);
      const balance = await jayStake.balanceOf(user1.address, 1);
      expect(balance).to.equal(5);
    });
  });

  describe('uri', () => {
    it('should return correct URI for token', async () => {
      await jayStake.mint(user1.address, 1, 10, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#0000FF"/></svg>');
      const uri = await jayStake.uri(1);
      // console.log(await jayStake.balanceOf(user1.address, 1));
      expect(uri).to.contain('data:application/json;base64,');
    });
  });
});