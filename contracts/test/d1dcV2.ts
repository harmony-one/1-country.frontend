import { expect } from "chai";
import { ethers, upgrades } from 'hardhat'

import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";

import type { D1DCV2 } from "../typechain-types"

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

describe('D1DCV2', () => {
  let accounts: SignerWithAddress;
  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let john: SignerWithAddress;
  let d1dcV2: D1DCV2;

  let dotName = "all.1.country";
  let url = "https://all.1.country_url";
  let telegram = "telegram";
  let email = "email";
  let phone = "phone";

  before(async () => {
    accounts = await ethers.getSigners();
    [deployer, alice, bob, john] = accounts;

    // Initialize D1DCV2 contract
    const D1DCV2Factory = await ethers.getContractFactory("D1DCV2");
    d1dcV2 = (await upgrades.deployProxy(D1DCV2Factory, [name, symbol, baseRentalPrice, rentalPeriod, priceMultiplier, john.address, telegramRevealPrice, emailRevealPrice, phoneRevealPrice])) as D1DCV2

    // Set the emoji prices
    await d1dcV2.setEmojiPrice(0, emojiPrice0);
    await d1dcV2.setEmojiPrice(1, emojiPrice1);
    await d1dcV2.setEmojiPrice(2, emojiPrice2);
  });

  describe("rent", () => {
    it("Should be able mint the name", async () => {
      await d1dcV2.connect(alice).rent(dotName, url, telegram, email, phone, { value: baseRentalPrice });
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

    it("Should be delete the reveal permission after the name is transferred", async () => {
      const tokenId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dotName));
      await d1dcV2.connect(alice)["safeTransferFrom(address,address,uint256)"](alice.address, john.address, tokenId);

      // check if telegram info was reset
      let telegramInfo = await d1dcV2.connect(john).callStatic.getOwnerTelegram(dotName);
      expect(telegramInfo).to.equal("");
      // check if the original owner can't reveal the current owner info
      await expect(d1dcV2.connect(alice).callStatic.getOwnerTelegram(dotName)).to.be.revertedWith("D1DC: no permission for telegram reveal");
      // check if the reveal permission was reset after the name is transferred
      await expect(d1dcV2.connect(bob).callStatic.getOwnerTelegram(dotName)).to.be.revertedWith("D1DC: no permission for telegram reveal");
    });
  });

  describe("addEmojiReaction", () => {
    beforeEach(async () => {
      await d1dcV2.connect(alice).rent(dotName, url, telegram, email, phone, { value: baseRentalPrice });
    });

    it("Should be ale to add the emoji reaction", async () => {
      // check the old emoji reaction counter
      const tokenId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(dotName));
      const emojiCounterBefore = await d1dcV2.emojiReactionCounters(tokenId, 0);

      await d1dcV2.connect(bob).addEmojiReaction(dotName, 0, { value: emojiPrice0 });

      // check the new emoji reaction counter
      const emojiCounterAfter = await d1dcV2.emojiReactionCounters(tokenId, 0);
      expect(emojiCounterAfter).to.equal(emojiCounterBefore.add(1));
    });
  });
});
