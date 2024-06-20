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

  //Describe tests related to creating transactions
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
});
