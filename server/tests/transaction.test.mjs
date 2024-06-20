import { it, describe, expect, beforeEach } from 'vitest';
import Transactions from '../models/Transaction.mjs';
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
    transaction = new Transactions({ sender, recipient, amount });
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


});