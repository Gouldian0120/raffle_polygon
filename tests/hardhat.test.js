// verbode tetsing

const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const {
  networkConfig,
  development_chain,
} = require("../helper-hardhat-config");

const chainID = network.config.chainId;
const MAX_INT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
const nowTimestamp = Math.floor((new Date().getTime()) / 1000);

const TokenType = {
  ERC721: 0,
  ERC20: 3
}
describe("Raffle", function () {
      let raffle, vrf_mock_contract, usdt_mock_contract, erc20_mock_contract, erc721_mock_contract;
      let feerecipient;
      let accounts, deployer;

      beforeEach(async () => {
        // await deployments.fixture(); // deploy all contracts
        deployer = (await getNamedAccounts()).deployer;
        raffle = await ethers.getContract("Raffle", deployer);
        vrf_mock_contract = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        usdt_mock_contract = await ethers.getContract("USDTMock", deployer);
        erc20_mock_contract = await ethers.getContract("ERC20Mock", deployer);
        erc721_mock_contract = await ethers.getContract("ERC721Mock", deployer);
        accounts = await ethers.getSigners();

        feerecipient = accounts[7].address;
      });

      const showStatus = async () => {
        console.log();
        console.log("--- USDT Balance ---")
        console.log("     raffle: %s", ethers.utils.formatUnits(await usdt_mock_contract.balanceOf(raffle.address), 6))
        console.log("accounts[0]: %s", ethers.utils.formatUnits(await usdt_mock_contract.balanceOf(accounts[0].address), 6))
        console.log("accounts[1]: %s", ethers.utils.formatUnits(await usdt_mock_contract.balanceOf(accounts[1].address), 6))
        console.log("accounts[2]: %s", ethers.utils.formatUnits(await usdt_mock_contract.balanceOf(accounts[2].address), 6))
        console.log("accounts[3]: %s", ethers.utils.formatUnits(await usdt_mock_contract.balanceOf(accounts[3].address), 6))
        console.log("accounts[4]: %s", ethers.utils.formatUnits(await usdt_mock_contract.balanceOf(accounts[4].address), 6))
        console.log("accounts[5]: %s", ethers.utils.formatUnits(await usdt_mock_contract.balanceOf(accounts[5].address), 6))
        console.log("accounts[6]: %s", ethers.utils.formatUnits(await usdt_mock_contract.balanceOf(accounts[6].address), 6))
        console.log("accounts[7]: %s", ethers.utils.formatUnits(await usdt_mock_contract.balanceOf(accounts[7].address), 6))
      }

      describe("Raffle start", async () => {
        it("Check ERC20 balance", async () => {
          await usdt_mock_contract.approve(raffle.address, MAX_INT);

          await usdt_mock_contract.connect(accounts[1]).approve(raffle.address, MAX_INT)          
          await usdt_mock_contract.connect(accounts[2]).approve(raffle.address, MAX_INT)
          await usdt_mock_contract.connect(accounts[3]).approve(raffle.address, MAX_INT)          
          await usdt_mock_contract.connect(accounts[4]).approve(raffle.address, MAX_INT)
          await usdt_mock_contract.connect(accounts[5]).approve(raffle.address, MAX_INT)          
          await usdt_mock_contract.connect(accounts[6]).approve(raffle.address, MAX_INT)          
          await usdt_mock_contract.connect(accounts[7]).approve(raffle.address, MAX_INT)          
          
          await usdt_mock_contract.transfer(accounts[1].address, ethers.utils.parseUnits("400", 6));
          await usdt_mock_contract.transfer(accounts[2].address, ethers.utils.parseUnits("400", 6));
          await usdt_mock_contract.transfer(accounts[3].address, ethers.utils.parseUnits("400", 6));
          await usdt_mock_contract.transfer(accounts[4].address, ethers.utils.parseUnits("400", 6));
          await usdt_mock_contract.transfer(accounts[5].address, ethers.utils.parseUnits("400", 6));
          await usdt_mock_contract.transfer(accounts[6].address, ethers.utils.parseUnits("400", 6));

          await showStatus();
        })

        it("Mint ERC721", async () => {
          let totalSupply = await erc721_mock_contract.totalSupply();
          expect(totalSupply).equal(0)

          const res = await erc721_mock_contract.batchMint(accounts[0].address, 1, 6);
          await res.wait();

          totalSupply = await erc721_mock_contract.totalSupply();
          expect(totalSupply).equal(6)
        })

        it("ERC721 setApprovalForAll", async () => {
          await erc721_mock_contract.setApprovalForAll(raffle.address, true);
        })
        
        it("Allow operator in transfer manager contract", async () => {
          await raffle.updateCurrenciesStatus([usdt_mock_contract.address], true)          
        })

        it("Create Raffle", async () => {
          const prizes = [
            [1, 1, 0, 0, erc721_mock_contract.address, 1, 1], // NFT 1
            [1, 2, 0, 1, erc721_mock_contract.address, 2, 1], // NFT 1
            [1, 3, 0, 2, erc721_mock_contract.address, 3, 1], // NFT 1
            [10, 13, 1, 3, usdt_mock_contract.address, 0, ethers.utils.parseUnits("100", 6),], // usdt $100 * 1
            [40, 53, 1, 4, usdt_mock_contract.address, 0, ethers.utils.parseUnits("50", 6), ], // usdt $50 * 40
            [100, 153, 1, 4, usdt_mock_contract.address, 0, ethers.utils.parseUnits("25", 6), ], // usdt $25 * 100
            [750, 900, 1, 5, usdt_mock_contract.address, 0, ethers.utils.parseUnits("10", 6),], // usdt $10 * 750
            [1500, 2403, 1, 6, usdt_mock_contract.address, 0, ethers.utils.parseUnits("5", 6), ] // usdt $1 * 1500
          ];

          const pricingOptions = [
            [50, ethers.utils.parseUnits("17.5", 6)],
            [110, ethers.utils.parseUnits("35", 6)],
            [275, ethers.utils.parseUnits("87.5", 6)],
            [575, ethers.utils.parseUnits("175", 6)],
            [1200, ethers.utils.parseUnits("350", 6)],
          ];
          
          const args = {
            isMinimumEntriesFixed: false,
            minimumEntries: 5000,
            maximumEntriesPerParticipant: 1200,
            prizes: prizes,
            pricingOptions: pricingOptions
          };

          const res = await raffle.createRaffle(args, {gasLimit: 30000000})
          await res.wait();

          const rafflesCount = await raffle.rafflesCount();
          expect(rafflesCount).equal(1);
        })

        it("Raffle status should be Open", async () => {
          const raffleId = await raffle.rafflesCount();
          let res = await raffle.raffles(raffleId)
          expect(res.status).to.equal(1)
        })

      });

      describe("Enter raffle", async () => {
        
        it("275 / $87.5 Enter raffle account[1]", async () => {
          const raffleId = await raffle.rafflesCount();
          
          const price = ethers.utils.parseUnits("87.5", 6);
          const args = [{
            raffleId: raffleId,
            pricingOptionIndex: 2,
          }];

          const res = await raffle.connect(accounts[1]).enterRaffles(args, {value: price})
          const ret = await res.wait();

          const {amountPaid, entriesCount, refunded} = await raffle.rafflesParticipantsStats(raffleId, accounts[1].address);

          expect(amountPaid).to.equal(price)
          expect(entriesCount).to.equal(275)
          expect(refunded).to.equal(false)
        })

        it("575 / $175 Enter raffle account[1]", async () => {
          const raffleId = await raffle.rafflesCount();
          
          const price = ethers.utils.parseUnits("175", 6);
          const args = [{
            raffleId: raffleId,
            pricingOptionIndex: 3,
          }];

          const res = await raffle.connect(accounts[1]).enterRaffles(args, {value: price})
          const ret = await res.wait();

          const {amountPaid, entriesCount, refunded} = await raffle.rafflesParticipantsStats(raffleId, accounts[1].address);

          expect(amountPaid).to.equal(ethers.utils.parseUnits("262.5", 6))
          expect(entriesCount).to.equal(850)
          expect(refunded).to.equal(false)
        })

        it("1200 / $350 Enter raffle by account[2]", async () => {
          const raffleId = await raffle.rafflesCount();

          const price = ethers.utils.parseUnits("350", 6);

          const args = [
            {
              raffleId: raffleId,
              pricingOptionIndex: 4,
            },
          ]

          let res = await raffle.connect(accounts[2]).enterRaffles(args, {value: price});
          let ret = await res.wait();

          const {amountPaid, entriesCount, refunded} = await raffle.rafflesParticipantsStats(raffleId, accounts[2].address);

          expect(amountPaid).to.equal(price)
          expect(entriesCount).to.equal(1200)
          expect(refunded).to.equal(false)
        })

        it("50+110+275 / $140 Enter raffle multiple by account[3]", async () => {
          const raffleId = await raffle.rafflesCount();

          const price = ethers.utils.parseUnits("140", 6);

          const args = [
            {
              raffleId: raffleId,
              pricingOptionIndex: 0,
            },
            {
              raffleId: raffleId,
              pricingOptionIndex: 1,
            },
            {
              raffleId: raffleId,
              pricingOptionIndex: 2,
            },
          ]

          let res = await raffle.connect(accounts[3]).enterRaffles(args, {value: price});
          let ret = await res.wait();

          const {amountPaid, entriesCount, refunded} = await raffle.rafflesParticipantsStats(raffleId, accounts[3].address);

          expect(amountPaid).to.equal(price)
          expect(entriesCount).to.equal(435)
          expect(refunded).to.equal(false)

        })
        
        it("1200 / $350 Enter raffle by account[4]", async () => {
          const raffleId = await raffle.rafflesCount();
  
          const price = ethers.utils.parseUnits("350", 6);
  
          const args = [
            {
              raffleId: raffleId,
              pricingOptionIndex: 4,
            },
          ]
  
          let res = await raffle.connect(accounts[4]).enterRaffles(args, {value: price});
          let ret = await res.wait();
  
          const {amountPaid, entriesCount, refunded} = await raffle.rafflesParticipantsStats(raffleId, accounts[4].address);
  
          expect(amountPaid).to.equal(price)
          expect(entriesCount).to.equal(1200)
          expect(refunded).to.equal(false)
  
        })
  
        it("1200 / $350 Enter raffle by account[5]", async () => {
          const raffleId = await raffle.rafflesCount();
  
          const price = ethers.utils.parseUnits("350", 6);
  
          const args = [
            {
              raffleId: raffleId,
              pricingOptionIndex: 4,
            },
          ]
  
          let res = await raffle.connect(accounts[5]).enterRaffles(args, {value: price});
          let ret = await res.wait();
  
          const {amountPaid, entriesCount, refunded} = await raffle.rafflesParticipantsStats(raffleId, accounts[5].address);
  
          expect(amountPaid).to.equal(price)
          expect(entriesCount).to.equal(1200)
          expect(refunded).to.equal(false)
  
        })

        it("1200 / $350 Enter raffle by account[6]", async () => {
          const raffleId = await raffle.rafflesCount();
  
          const price = ethers.utils.parseUnits("350", 6);
  
          const args = [
            {
              raffleId: raffleId,
              pricingOptionIndex: 4,
            },
          ]
  
          let res = await raffle.connect(accounts[6]).enterRaffles(args, {value: price});
          let ret = await res.wait();
  
          const {amountPaid, entriesCount, refunded} = await raffle.rafflesParticipantsStats(raffleId, accounts[6].address);
  
          expect(amountPaid).to.equal(price)
          expect(entriesCount).to.equal(1200)
          expect(refunded).to.equal(false)
  
        })

        it("show status", async () => {
          await showStatus();
        })
      })

      describe("Raffle Result",  async () => {
        it("Raffle status should be drawing", async () => {
          const raffleId = await raffle.rafflesCount();

          let res = await raffle.raffles(raffleId)

          expect(res.status).to.equal(2)
        })

        it("Raffle status should be RandomnessFulfilled after calling fulfillRandomWords", async() => {
          const raffleId = await raffle.rafflesCount();
          let ret = await raffle.getLatestRequestId();

          console.log("latestRequestId:", ret);

          let res = await vrf_mock_contract.fulfillRandomWords(
            ret,
            raffle.address
          )
          ret = await res.wait();

          res = await raffle.raffles(raffleId)

          expect(res.status).to.equal(3)
        })

        it("Select winner", async () => {
          let res, ret;

          let requestId = await raffle.getLatestRequestId();

          const {exists, raffleId, randomWord} = await raffle.randomnessRequests(requestId)
          
          expect(exists).to.equal(true)
          expect(raffleId).to.equal(raffleId)

          res = await raffle.selectWinners(requestId);
          ret = await res.wait();
         
        })

        it("Raffle status should be Drawn", async () => {
          const raffleId = await raffle.rafflesCount();
          res = await raffle.raffles(raffleId)

          expect(res.status).to.equal(4)
        })

        it("Get winners", async () => {
          let raffleId = await raffle.rafflesCount();
          let res = await raffle.getWinners(raffleId);
          expect(res.length).to.equal(2403)
        })

        it("Claim fee", async () => {
          let raffleId = await raffle.rafflesCount();
          let res = await raffle.claimFees(raffleId);
        })

        it("Raffle status should be Complete", async () => {
          let raffleId = await raffle.rafflesCount();
          let res = await raffle.raffles(raffleId)
          
          expect(res.status).to.equal(5)
        })

        it("show status", async () => {
          await showStatus();
        })
      })
    });
