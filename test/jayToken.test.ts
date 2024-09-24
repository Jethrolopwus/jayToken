import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import "@nomicfoundation/hardhat-chai-matchers";

describe("JayToken", function () {
    let jayToken: Contract;
    const initialSupply = ethers.parseUnits("1000000", 18);

    beforeEach(async function () {
        const JayToken = await ethers.getContractFactory("JayToken");
        jayToken = await JayToken.deploy("JayToken", "JTK", 18, 1000000);
    });

    it("should have the correct name and symbol", async function () {
        expect(await jayToken.name()).to.equal("JayToken");
        expect(await jayToken.symbol()).to.equal("JTK");
    });

    it("should assign the total supply to the owner", async function () {
        const [owner] = await ethers.getSigners();
        
        const balance = await jayToken.balanceOf(owner.address);
        expect(balance).to.equal(initialSupply);
    });

    it("should transfer tokens correctly", async function () {
        const [owner, addr1] = await ethers.getSigners();
        await jayToken.transfer(addr1.address, ethers.parseUnits("100", 18));
        expect(await jayToken.balanceOf(addr1.address)).to.equal(ethers.parseUnits("100", 18));
    });

    it("should emit Transfer event on transfer", async function () {
        const [owner, addr1] = await ethers.getSigners();
        await expect(jayToken.transfer(addr1.address, ethers.parseUnits("100", 18)))
            .to.emit(jayToken, "Transfer")
            .withArgs(owner.address, addr1.address, ethers.parseUnits("100", 18));
    });

    it("should fail if insufficient balance for transfer", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const excessiveAmount = ethers.parseUnits("1000001", 18);

        await expect(jayToken.transfer(addr1.address, excessiveAmount))
            .to.be.revertedWith("Not enough tokens");
    });


    it("should fail to transfer more tokens than available", async function () {
        const [owner, addr1] = await ethers.getSigners();
        await jayToken.transfer(addr1.address, ethers.parseUnits("100", 18));
        await expect(jayToken.connect(addr1).transfer(owner.address, ethers.parseUnits("200", 18)))
            .to.be.revertedWith("Not enough tokens");
    });
});
