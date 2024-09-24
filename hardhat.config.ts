import { HardhatUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-ethers";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const config: HardhatUserConfig = {
    solidity: "0.8.26",
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        }
    },
};

export default config;
