import { expect } from "chai";
import { ethers, upgrades } from 'hardhat'

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";

import type { AddressRegistry, D1DCV2, VanityURL } from "../typechain-types"

const name = '.1.country'
const symbol = 'D1DCV2'
const baseRentalPrice = 100
const rentalPeriod = 90
const priceMultiplier = 2
const telegramRevealPrice = 10
const emailRevealPrice = 100
const phoneRevealPrice = 100
const emojiPrice0 = 1;
const emojiPrice1 = 10;
const emojiPrice2 = 100;
const urlUpdatePrice = ethers.utils.parseEther("1");

async function getTimestamp(): Promise<any> {
  const blockNumber = await ethers.provider.send('eth_blockNumber', []);
  const block = await ethers.provider.send('eth_getBlockByNumber', [blockNumber, false]);
  return block.timestamp;
}

describe('VanityURL', () => {
  let accounts: SignerWithAddress;
  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let revenueAccount: SignerWithAddress;

  let addressRegistry: AddressRegistry;
  let d1dcV2: D1DCV2;
  let vanityURL: VanityURL;

  let dotName = "all.1.country";
  let url = "https://all.1.country_url";
  let telegram = "telegram";
  let email = "email";
  let phone = "phone";

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    [deployer, alice, bob, revenueAccount] = accounts;

    // Initialize AddressRegistry Contract
    const AddressRegistry = await ethers.getContractFactory("AddressRegistry");
    addressRegistry = (await upgrades.deployProxy(AddressRegistry, [])) as AddressRegistry;

    // Initialize D1DCV2 contract
    const D1DCV2Factory = await ethers.getContractFactory("D1DCV2");
    d1dcV2 = (await upgrades.deployProxy(D1DCV2Factory, [addressRegistry.address, name, symbol, baseRentalPrice, rentalPeriod, priceMultiplier, revenueAccount.address, telegramRevealPrice, emailRevealPrice, phoneRevealPrice])) as D1DCV2

    // Initialize VanityURL contract
    const VanityURL = await ethers.getContractFactory("VanityURL");
    vanityURL = (await upgrades.deployProxy(VanityURL, [addressRegistry.address, urlUpdatePrice, revenueAccount.address])) as VanityURL;

    // Register the contract addresses to AddressRegistry
    await addressRegistry.setD1DCV2(d1dcV2.address);
    await addressRegistry.setVanityURL(vanityURL.address);

    // Set the emoji prices
    await d1dcV2.setEmojiPrice(0, emojiPrice0);
    await d1dcV2.setEmojiPrice(1, emojiPrice1);
    await d1dcV2.setEmojiPrice(2, emojiPrice2);

    // Set the url update price
    await vanityURL.updateURLUpdatePrice(urlUpdatePrice);
  });

  describe("setRevenueAccount", () => {
    it("Should be able set the revenue account", async () => {
      expect(await vanityURL.revenueAccount()).to.equal(revenueAccount.address);
      
      await vanityURL.setRevenueAccount(alice.address);

      expect(await vanityURL.revenueAccount()).to.equal(alice.address);
    });

    it("Should revert if the caller is not owner", async () => {
      await expect(vanityURL.connect(alice).setRevenueAccount(alice.address)).to.be.reverted;
    });
  });

  describe("setNameOwnerUpdateAt", () => {
    beforeEach(async () => {
      await d1dcV2.connect(alice).rent(dotName, url, telegram, email, phone, { value: baseRentalPrice });
    });

    it("Should be able to update the timestamp the name owner was changed", async () => {
      const tokenId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dotName));
      const ownerUpdateAtBefore = await vanityURL.nameOwnerUpdateAt(tokenId);

      expect(ownerUpdateAtBefore).to.equal(await getTimestamp());

      // transfer the NFT
      await d1dcV2.connect(alice)["safeTransferFrom(address,address,uint256)"](alice.address, bob.address, tokenId);

      const ownerUpdateAtAfter = await vanityURL.nameOwnerUpdateAt(tokenId);
      expect(ownerUpdateAtAfter).to.equal(await getTimestamp());
    });

    it("Should revert if the caller is not D1DCV2 contract", async () => {
      const tokenId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dotName));

      await expect(vanityURL.setNameOwnerUpdateAt(tokenId)).to.be.revertedWith("VanityURL: only D1DCV2");
    });
  });

  describe("setNewURL", () => {
    const tokenId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dotName));
    const aliasName = "aliasName";
    const url = "url";

    beforeEach(async () => {
      await d1dcV2.connect(alice).rent(dotName, url, telegram, email, phone, { value: baseRentalPrice });
    });

    it("Should be ale to set a new URL", async () => {
      expect(await vanityURL.vanityURLs(tokenId, aliasName)).to.equal("");
      expect(await vanityURL.vanityURLUpdatedAt(tokenId, aliasName)).to.equal(0);

      // set a new URL
      await vanityURL.connect(alice).setNewURL(dotName, aliasName, url, { value: urlUpdatePrice });

      expect(await vanityURL.vanityURLs(tokenId, aliasName)).to.equal(url);
      expect(await vanityURL.vanityURLUpdatedAt(tokenId, aliasName)).to.equal(await getTimestamp());
    });

    it("Should revert if the caller is not the name owner", async () => {
      await expect(vanityURL.setNewURL(dotName, aliasName, url, { value: urlUpdatePrice })).to.be.revertedWith("VanityURL: only D1DCV2 name owner");
    });

    it("Should revert if the URL already exists", async () => {
      // set a new URL
      await vanityURL.connect(alice).setNewURL(dotName, aliasName, url, { value: urlUpdatePrice });

      // set the URL twice
      await expect(vanityURL.connect(alice).setNewURL(dotName, aliasName, url, { value: urlUpdatePrice })).to.be.revertedWith("VanityURL: url already exists");
    });

    it("Should revert if the payment is insufficient", async () => {
      await expect(vanityURL.connect(alice).setNewURL(dotName, aliasName, url, { value: urlUpdatePrice.sub(1) })).to.be.revertedWith("VanityURL: insufficient payment");
    });
  });

  describe("deleteURL", () => {
    const tokenId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dotName));
    const aliasName = "aliasName";
    const url = "url";

    beforeEach(async () => {
      await d1dcV2.connect(alice).rent(dotName, url, telegram, email, phone, { value: baseRentalPrice });
      await vanityURL.connect(alice).setNewURL(dotName, aliasName, url, { value: urlUpdatePrice });
    });

    it("Should be able to delete the URL", async () => {
      const urlBefore = await vanityURL.vanityURLs(tokenId, aliasName);
      const urlUpdateAtBefore = await vanityURL.vanityURLUpdatedAt(tokenId, aliasName);
      expect(urlBefore).to.equal(url);
      
      // delete the URL
      await vanityURL.connect(alice).deleteURL(dotName, aliasName);

      const urlAfter = await vanityURL.vanityURLs(tokenId, aliasName);
      const urlUpdateAtAfter = await vanityURL.vanityURLUpdatedAt(tokenId, aliasName);
      expect(urlAfter).to.equal("");
      expect(urlUpdateAtAfter).to.equal(await getTimestamp());
    });

    it("Should revert if the caller is not the name owner", async () => {
      await expect(vanityURL.deleteURL(dotName, aliasName)).to.be.revertedWith("VanityURL: only D1DCV2 name owner");
    });

    it("Should revert if the URL to delete doesn't exist", async () => {
      const newAliasName = "newAliasName";
      await expect(vanityURL.connect(alice).deleteURL(dotName, newAliasName)).to.be.revertedWith("VanityURL: invalid URL");
    });
  });

  describe("updateURL", () => {
    const tokenId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dotName));
    const aliasName = "aliasName";
    const url = "url";

    beforeEach(async () => {
      await d1dcV2.connect(alice).rent(dotName, url, telegram, email, phone, { value: baseRentalPrice });
      await vanityURL.connect(alice).setNewURL(dotName, aliasName, url, { value: urlUpdatePrice });
    });
  
    it("Should be able to update the existing URL", async () => {
      const urlBefore = await vanityURL.vanityURLs(tokenId, aliasName);
      const urlUpdateAtBefore = await vanityURL.vanityURLUpdatedAt(tokenId, aliasName);
      expect(urlBefore).to.equal(url);

      // update the URL
      const newURL = "newURL";
      await vanityURL.connect(alice).updateURL(dotName, aliasName, newURL);

      const urlAfter = await vanityURL.vanityURLs(tokenId, aliasName);
      const urlUpdateAtAfter = await vanityURL.vanityURLUpdatedAt(tokenId, aliasName);
      expect(urlAfter).to.equal(newURL);
      expect(urlUpdateAtAfter).to.equal(await getTimestamp());
    });

    it("Should revert if the caller is not the name owner", async () => {
      const newURL = "newURL";
      await expect(vanityURL.updateURL(dotName, aliasName, newURL)).to.be.revertedWith("VanityURL: only D1DCV2 name owner");
    });

    it("Should revert if the URL to update is invalid", async () => {
      // transfer the NFT
      await d1dcV2.connect(alice)["safeTransferFrom(address,address,uint256)"](alice.address, bob.address, tokenId);

      const newURL = "newURL";
      await expect(vanityURL.connect(bob).updateURL(dotName, aliasName, newURL)).to.be.revertedWith("VanityURL: invalid URL");
    });
  });

  describe("withdraw", () => {
    const tokenId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dotName));
    const aliasName = "aliasName";
    const url = "url";

    beforeEach(async () => {
      await d1dcV2.connect(alice).rent(dotName, url, telegram, email, phone, { value: baseRentalPrice });
      await vanityURL.connect(alice).setNewURL(dotName, aliasName, url, { value: urlUpdatePrice });
    });

    it("should be able to withdraw ONE tokens", async () => {
      const revenueAccountBalanceBefore = await ethers.provider.getBalance(revenueAccount.address);
      
      // withdraw ONE tokens
      await vanityURL.connect(revenueAccount).withdraw();

      const revenueAccountBalanceAfter = await ethers.provider.getBalance(revenueAccount.address);
      expect(revenueAccountBalanceAfter).gt(revenueAccountBalanceBefore);
    });

    it("Should revert if the caller is not the owner or revenue account", async () => {
      await expect(vanityURL.connect(alice).withdraw()).to.be.revertedWith("D1DC: must be owner or revenue account");
    });
  });
});
