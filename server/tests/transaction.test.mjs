import { it, describe, expect, beforeEach } from 'vitest';
import Transaction from '../models/Transaction.mjs';
import Wallet from '../models/Wallet.mjs';
import { verifySignature } from '../utilities/crypto-lib.mjs';
import { MINING_REWARD, REWARD_ADDRESS } from '../config/settings.mjs';

describe('Transaction', () => {
  let transaction, sender, recipient, amount; // variables needed in test

  // Before each test, initiate a sender wallet, recipient amount
  beforeEach(() => {
    sender = new Wallet();
    recipient = 'Mikael';
    amount = 11;
    transaction = new Transaction({ sender, recipient, amount });
  });

  // Describe tests related to the propertie of the transaction
  describe('Properties', () => {
    // Test to check if the transaction has an id property
    it('should have a property named id', () => {
      expect(transaction).toHaveProperty('id');
    });
  });

  // Describe tests related to the output map of the transaction
  describe ('OutputMap', () => {
    // Test to check if the transaction has an outputMap property
    it('should have a property named outputMap', () => {
      expect(transaction).toHaveProperty('outputMap');
    });

    // Test to check if the outputMap contains the recipient's balance
    it('should output the recipients balance', () => {
      expect(transaction.outputMap[recipient]).toEqual(amount);
    });

    // Test to check if the outputMap displays the sender's balance after transaction
    it('should display the senders balance', () => {
      expect(transaction.outputMap[sender.publicKey]).toEqual(sender.balance - amount);
    });
  });

  // Describe the tests related to the input map of the transaction
  describe('inputMap', () => {
    // Test to check if the transaction has an inputMap property
    it('should have a property named inputMap', () => {
      expect(transaction).toHaveProperty('inputMap');
    });

    // Test to check if the inputMap has a timestamp property
    it('should have a property named timestamp', () => {
      expect(transaction.inputMap).toHaveProperty('timestamp');
    });

    // Test to check if the inputMap sets the amount to the sender's balance
    it('should set the amount to the sender balance', () => {
      expect(transaction.inputMap.amount).toEqual(sender.balance);
    });

    // Test to check if the inputMap sets the address to the sender's public key
    it('should set the address value to the senders publicKey', () => {
      expect(transaction.inputMap.address).toEqual(sender.publicKey);
    });

    // Test to check if the inputMap is signed correctly
    it('should sign the inputMap', () => {
      expect(
        verifySignature({
          publicKey: sender.publicKey,
          data: transaction.outputMap,
          signature: transaction.inputMap.signature,
        })
      ).toBe(true);
    });
  });

  // describe tests related to transaction validation
  describe('validate transaction', () => {
    // Test to check if a valid transaction is correctly validated
    describe('when the transaction is valid', () => {
      it('should return true', () => {
        expect(Transaction.validate(transaction)).toBe(true);
      });
    });

    // Test to check if an invalid transactoin is correctly identified
    describe('when the transaction is invalid', () => {
      // Test to check if an invalid outputMap is identified
      describe('and the transaction outputMap value is invalid', () => {
        it('should return false', () => {
          transaction.outputMap[sender.publicKey] = 1337;
          expect(Transaction.validate(transaction)).toBe(false);
        });
      });

      // Test to check if an invalid inputMap is identified 
      describe('and the transaction inputMap signature is invalid', () => {
        it('should return false', () => {
          transaction.inputMap.signature = new Wallet().sign('data');
          expect(Transaction.validate(transaction)).toBe(false);
        });
      });
    });
  });



});