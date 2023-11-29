import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  enum Options {
    NONE,
    ROCK,
    PAPER,
    SCISSORS,
  } //0, 1, 2, 3

  const DEFAULT_BID = ethers.parseEther("0.01");
  async function deployFixture() {
    const [owner, player1, player2] = await ethers.getSigners();

    const JoKenPo = await ethers.getContractFactory("JoKenPo");
    const joKenPo = await JoKenPo.deploy();

    return { joKenPo, owner, player1, player2 };
  }

  it("Should set the right unlockTime", async function () {
    const { joKenPo, owner, player1, player2 } = await loadFixture(
      deployFixture
    );

    const player1Instance = joKenPo.connect(player1);
    await player1Instance.play(Options.PAPER, { value: DEFAULT_BID });

    const player2Instance = joKenPo.connect(player2);
    await player2Instance.play(Options.ROCK, { value: DEFAULT_BID });

    const leaderboard = await joKenPo.getLeaderboard();

    expect(leaderboard.length).to.equal(1);
    expect(leaderboard[0].wallet).to.equal(player1.address);
    expect(leaderboard[0].wins).to.equal(1);
  });

  it("Should set bid", async () => {
    const { joKenPo, owner, player1, player2 } = await loadFixture(
      deployFixture
    );

    const newBid = ethers.parseEther("0.02");

    await joKenPo.setBid(newBid);

    const updateBid = await joKenPo.getBid();

    expect(updateBid).to.equal(newBid);
  });

  it("Should NOT set bid (owner)", async () => {
    const { joKenPo, owner, player1, player2 } = await loadFixture(
      deployFixture
    );

    const newBid = ethers.parseEther("0.02");
    const instance = joKenPo.connect(player1);

    expect(instance.setBid(newBid)).to.be.revertedWith(
      "You don't have this permission."
    );
  });

  it("Should NOT set bid (game in progress)", async () => {
    const { joKenPo, owner, player1, player2 } = await loadFixture(
      deployFixture
    );

    const instance = joKenPo.connect(player1);
    await instance.play(Options.PAPER, { value: DEFAULT_BID });

    const newBid = ethers.parseEther("0.02");
    expect(joKenPo.setBid(newBid)).to.be.revertedWith(
      "You don't have this permission."
    );
  });

  it("Should set commission", async () => {
    const { joKenPo, owner, player1, player2 } = await loadFixture(
      deployFixture
    );
    const newCommission = 11n;

    await joKenPo.setCommision(newCommission);
    const updatedCommission = await joKenPo.getCommission();

    expect(updatedCommission).to.equal(newCommission);
  });

  it("Should NOT set commission(game in progress)", async () => {
    const { joKenPo, owner, player1, player2 } = await loadFixture(
      deployFixture
    );

    const instance = joKenPo.connect(player1);
    await instance.play(Options.PAPER, { value: DEFAULT_BID });

    const newCommission = 11n;

    expect(joKenPo.setCommision(newCommission)).to.be.revertedWith(
      "You don't have this permission."
    );
  });
});
