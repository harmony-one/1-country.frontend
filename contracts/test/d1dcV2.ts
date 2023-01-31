import { expect } from "chai";
import { ethers, upgrades } from 'hardhat'

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import type { BigNumberish } from "@ethersproject/bignumber/lib/bignumber";

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

type address = string;
type uint32 = BigNumberish;
type uint256 = BigNumberish;

interface NameRecord {
  renter: address;
  timeUpdated: uint32;
  lastPrice: uint256;
  url: string;
  prev: string;
  next: string;
}

describe('D1DCV2', () => {
  let accounts: SignerWithAddress;
  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let john: SignerWithAddress;
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
    [deployer, alice, bob, john, revenueAccount] = accounts;

    // Initialize AddressRegistry Contract
    const AddressRegistry = await ethers.getContractFactory("AddressRegistry");
    addressRegistry = (await upgrades.deployProxy(AddressRegistry, [])) as AddressRegistry;

    // Initialize D1DCV2 contract
    const D1DCV2Factory = await ethers.getContractFactory("D1DCV2");
    d1dcV2 = (await upgrades.deployProxy(D1DCV2Factory, [addressRegistry.address, name, symbol, baseRentalPrice, rentalPeriod, priceMultiplier, john.address, telegramRevealPrice, emailRevealPrice, phoneRevealPrice])) as D1DCV2

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

  describe("initializeNames", () => {
    it("Should be able to add the existing names", async () => {
      const NameRecord1: NameRecord = {
        renter: alice.address,
        timeUpdated: 10001,
        lastPrice: 10001,
        url: "https://nameRecord1.1.country_url",
        prev: "",
        next: "",
      };

      const NameRecord2: NameRecord = {
        renter: bob.address,
        timeUpdated: 10002,
        lastPrice: 10002,
        url: "https://nameRecord2.1.country_url",
        prev: "",
        next: "",
      };

      const NameRecord3: NameRecord = {
        renter: john.address,
        timeUpdated: 10003,
        lastPrice: 10003,
        url: "https://nameRecord3.1.country_url",
        prev: "",
        next: "",
      };

      const NameRecords: NameRecord[] = [
        NameRecord1,
        NameRecord2,
        NameRecord3
      ];

      const Names: string[] = [
        "nameRecord1.1.country",
        "nameRecord2.1.country",
        "nameRecord3.1.country",
      ];

      const totalDomainPurchaseCounterBefore = await d1dcV2.totalDomainPurchaseCounter();

      // initializeNames
      await d1dcV2.initializeNames(Names, NameRecords);

      const totalDomainPurchaseCounterAfter = await d1dcV2.totalDomainPurchaseCounter();
      expect(totalDomainPurchaseCounterAfter).to.equal(totalDomainPurchaseCounterBefore.add(Names.length));
    });
  });

  describe("rent", () => {
    it("Should be able to mint the name", async () => {
      const totalDomainPurchaseCounterBefore = await d1dcV2.totalDomainPurchaseCounter();

      // rent
      await d1dcV2.connect(alice).rent(dotName, url, telegram, email, phone, { value: baseRentalPrice });

      const totalDomainPurchaseCounterAfter = await d1dcV2.totalDomainPurchaseCounter();
      expect(totalDomainPurchaseCounterAfter).to.equal(totalDomainPurchaseCounterBefore.add(1));
    });
  });

  describe("getOwnerTelegram", () => {
    beforeEach(async () => {
      await d1dcV2.connect(alice).rent(dotName, url, telegram, email, phone, { value: baseRentalPrice });
      await d1dcV2.connect(bob).requestTelegramReveal(dotName, { value: telegramRevealPrice });
    });

    it("Should be able to reveal the owner's telegram info", async () => {
      let telegramInfo = await d1dcV2.connect(bob).callStatic.getOwnerTelegram(dotName);
      expect(telegramInfo).to.equal(telegram);
    });

    it("Should be able to increase the totalOwnerInfoRevealCounter", async () => {
      let totalOwnerInfoRevealCounterBefore = await d1dcV2.totalOwnerInfoRevealCounter();

      // request the telegram info reveal
      await d1dcV2.connect(john).requestTelegramReveal(dotName, { value: telegramRevealPrice });

      let totalOwnerInfoRevealCounterAfter = await d1dcV2.totalOwnerInfoRevealCounter();
      expect(totalOwnerInfoRevealCounterAfter).to.equal(totalOwnerInfoRevealCounterBefore.add(1));

      // request the phone info reveal
      await d1dcV2.connect(john).requestPhoneReveal(dotName, { value: phoneRevealPrice });

      totalOwnerInfoRevealCounterAfter = await d1dcV2.totalOwnerInfoRevealCounter();
      expect(totalOwnerInfoRevealCounterAfter).to.equal(totalOwnerInfoRevealCounterBefore.add(2));

      // request the email info reveal
      await d1dcV2.connect(john).requestEmailReveal(dotName, { value: emailRevealPrice });

      totalOwnerInfoRevealCounterAfter = await d1dcV2.totalOwnerInfoRevealCounter();
      expect(totalOwnerInfoRevealCounterAfter).to.equal(totalOwnerInfoRevealCounterBefore.add(3));
    });

    it("Should be able to delete the reveal permission after the name is transferred", async () => {
      const totalOwnerInfoRevealCounterBefore = await d1dcV2.totalOwnerInfoRevealCounter();

      const tokenId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dotName));
      await d1dcV2.connect(alice)["safeTransferFrom(address,address,uint256)"](alice.address, john.address, tokenId);

      // check if telegram info was reset
      let telegramInfo = await d1dcV2.connect(john).callStatic.getOwnerTelegram(dotName);
      expect(telegramInfo).to.equal("");

      // check if the original owner can't reveal the current owner info
      await expect(d1dcV2.connect(alice).callStatic.getOwnerTelegram(dotName)).to.be.revertedWith("D1DC: no permission for telegram reveal");

      // check if the reveal permission was reset after the name is transferred
      await expect(d1dcV2.connect(bob).callStatic.getOwnerTelegram(dotName)).to.be.revertedWith("D1DC: no permission for telegram reveal");

      // check if totalOwnerInfoRevealCounter is not reset
      const totalOwnerInfoRevealCounterAfter = await d1dcV2.totalOwnerInfoRevealCounter();
      expect(totalOwnerInfoRevealCounterAfter).to.equal(totalOwnerInfoRevealCounterBefore);
    });
  });

  describe("addEmojiReaction", () => {
    beforeEach(async () => {
      await d1dcV2.connect(alice).rent(dotName, url, telegram, email, phone, { value: baseRentalPrice });
    });

    it("Should be able to add the emoji reaction", async () => {
      // check the old emoji reaction counter
      const tokenId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dotName));
      const emojiCounterBefore = await d1dcV2.emojiReactionCounters(tokenId, 0);
      const totalEmojiReactionCounterBefore = await d1dcV2.totalEmojiReactionCounter();

      // add emoji reaction
      await d1dcV2.connect(bob).addEmojiReaction(dotName, 0, { value: emojiPrice0 });

      // check the new emoji reaction counter
      const emojiCounterAfter = await d1dcV2.emojiReactionCounters(tokenId, 0);
      const totalEmojiReactionCounterAfter = await d1dcV2.totalEmojiReactionCounter();
      expect(emojiCounterAfter).to.equal(emojiCounterBefore.add(1));
      expect(totalEmojiReactionCounterAfter).to.equal(totalEmojiReactionCounterBefore.add(1));
    });

    it("should be able to reset emoji reaction counters after rent", async () => {
      const totalEmojiReactionCounterBefore = await d1dcV2.totalEmojiReactionCounter();

      // add emoji reaction
      const tokenId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dotName));

      await d1dcV2.connect(bob).addEmojiReaction(dotName, 0, { value: emojiPrice0 });
      await d1dcV2.connect(bob).addEmojiReaction(dotName, 1, { value: emojiPrice1 });
      await d1dcV2.connect(bob).addEmojiReaction(dotName, 2, { value: emojiPrice2 });

      // rent
      await d1dcV2.connect(bob).rent(dotName, url, telegram, email, phone, { value: baseRentalPrice * priceMultiplier });

      const totalEmojiReactionCounterAfter = await d1dcV2.totalEmojiReactionCounter();
      const emojiCounterAfter0 = await d1dcV2.emojiReactionCounters(tokenId, 0);
      const emojiCounterAfter1 = await d1dcV2.emojiReactionCounters(tokenId, 1);
      const emojiCounterAfter2 = await d1dcV2.emojiReactionCounters(tokenId, 2);
      expect(totalEmojiReactionCounterAfter).to.equal(totalEmojiReactionCounterBefore.add(3));
      expect(emojiCounterAfter0).to.equal(0);
      expect(emojiCounterAfter1).to.equal(0);
      expect(emojiCounterAfter2).to.equal(0);
    });
  });
});
