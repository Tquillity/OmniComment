import { it, describe, expect, beforeEach, vi } from 'vitest';
import Wallet from '../models/Wallet.mjs';
import { verifySignature } from '../utilities/crypto-lib.mjs';
import Transaction from '../models/Transaction.mjs';
import Blockchain from '../models/Blockchain.mjs';
import { INITIAL_BALANCE } from '../config/settings.mjs';

describe('Wallet', () => {
  let wallet; 

  beforeEach(() => {
    wallet = new Wallet();
  });

  describe('Properties', () => {
    it('should have a property named balance', () => {
      expect(wallet).toHaveProperty('balance');
    });

    it('should have a property named publicKey', () => {
      expect(wallet).toHaveProperty('publicKey');
    });
  });

  describe('Signing Process', () => {
    let data = 'test';

    it('should verify a signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data),
        })
      ).toBe(true);
    });

    it('should not verify an invalid signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data),
        })
      ).toBe(false);
    });
  });

  // Describe tests related to creating transactions
  describe('create transactions', () => {
    // test to ensure an error is thrown when the amount exceeds the wallet balance
    describe('and the amount is larger than the balance', () => {
      it('should throw an error', () => {
        expect(() => wallet.createTransaction({ amount: 999999, recipient:'Wrongela'})
        ).toThrow('Amount exceeds balance');
      });
    });

    // Test to ensure a valid transaction is created when the amount is valid
    describe('and the amount is valid', () => {
      let transaction, amount, recipient;

      beforeEach(() => {
        amount = 50;
        recipient = 'Angela';
        transaction = wallet.createTransaction({ amount, recipient });
      });

      // Test to ensure a Transaction object is created
      it('should create a Transaction object', () => {
        expect(transaction).toBeInstanceOf(Transaction);
      });

      // Test to ensure the wallet's inputmap matches the transaction's inputmap
      it('should match the wallet inputMap', () => {
        expect(transaction.inputMap.address).toEqual(wallet.publicKey);
      });

      // Test to ensure the amount is correctly output to the recipient
      it('should output the amount to the recipient', () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });

      // Test to ensure Wallet.calculateBalance is called when a blockchain is supplied
      describe('and a chain is supplied', () => {
        it('should call the Wallet.calculateBalance()', () => {
          const calculateBalanceMockFn = vi.fn();

          // Save the original calculateBalance method
          const originalCalculateBalance = Wallet.calculateBalance;
          // Replace calculateBalance with a mock function
          Wallet.calculateBalance = calculateBalanceMockFn;

          // Create a transaction with a blockchain supplied
          wallet.createTransaction({
            recipient: 'Angela',
            amount: 50,
            chain: new Blockchain(),
          });

          // Check if the mock function was called
          expect(calculateBalanceMockFn).toHaveBeenCalled();

          // Restore the original calculateBalance method
          Wallet.calculateBalance = originalCalculateBalance;
        });
      });
    });
  });

  // Describe tests related to calculating the wallet balance
  describe('calculate the balance', () => {
    let blockchain;

    // Before each test initialize a new blockchain
    beforeEach(() => {
      blockchain = new Blockchain();
    });

    // Test to ensure the initial balance is returned when there are no transactions for the wallet
    describe('and there is no output for the wallet', () => {
      it('should return the initial balace (starting balance)', () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey,
          })
        ).toEqual(INITIAL_BALANCE);
      });
    });

    // Test to ensure the balance is calculated correctly when there are transactions for the wallet
    describe('and there are outputs for the wallet', () => {
      let transactionOne, transactionTwo;

      // Before each test create transactions and add them to the blockchain
      beforeEach(() => {
        transactionOne = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 50,
        });

        transactionTwo = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 60,
        });

        blockchain.addBlock({ data: [transactionOne, transactionTwo] });
      });

      // Test to ensure the balance is calculated as the sum of all transactions for the wallet
      it('should calculate the sum of all outputs for the wallet', () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey,
          })
        ).toEqual(
          INITIAL_BALANCE +
            transactionOne.outputMap[wallet.publicKey] +
            transactionTwo.outputMap[wallet.publicKey]
        );
      });

      // Test to ensure the Balance is calculated correctly when the wallet has made a transaction
      describe('and the wallet has made a transaction', () => {
        let latestTransaction;

        // Before each test, create a transaction from the wallet and add it to the blockchain
        beforeEach(() => {
          latestTransaction = wallet.createTransaction({
            recipient: 'Angela',
            amount: 50,
          });

          blockchain.addBlock({ data: [latestTransaction] });
        });

        // Test to ensure the balance is calculated as the amount from the latest transaction
        it('should return the amount from the latest transaction', () => {
          expect(
            Wallet.calculateBalance({
              chain: blockchain.chain,
              address: wallet.publicKey,
            })
          ).toEqual(latestTransaction.outputMap[wallet.publicKey]);
        });

        // Test to ensure the balance is calculated correctly when there are transactions before and after the latest transaction
        describe('and there are outputs next and after the recent transaction', () => {
          let currentBlockTransaction, nextBlockTransaction;

          // Before each test, create additional transactions and add them to the blockchain
          beforeEach(() => {
            latestTransaction = wallet.createTransaction({
              recipient: 'Mikael',
              amount: 60,
            });

            // Create a reward transaction
            currentBlockTransaction = Transaction.transactionReward({
              miner: wallet,
            });

            // Add the transactions to a block in the blockchain
            blockchain.addBlock({
              data: [latestTransaction, currentBlockTransaction],
            });

            // Create a new transaction
            nextBlockTransaction = new Wallet().createTransaction({
              recipient: wallet.publicKey,
              amount: 70,
            });

            blockchain.addBlock({ data: [nextBlockTransaction] });
          });

          // Test to ensure the balance includes the amounts from the returned balance
          it('should include the amounts from the returned balance', () => {
            expect(
              Wallet.calculateBalance({
                chain: blockchain.chain,
                address: wallet.publicKey,
              })
            ).toEqual(
              latestTransaction.outputMap[wallet.publicKey] +
                currentBlockTransaction.outputMap[wallet.publicKey] +
                nextBlockTransaction.outputMap[wallet.publicKey]
            );
          });
        });
      });
    });
  });
});
