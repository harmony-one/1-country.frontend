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
  });
});
