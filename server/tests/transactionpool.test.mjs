import { it, describe, expect, beforeEach } from 'vitest';
import Transaction from '../models/Transaction.mjs';
import Wallet from '../models/Wallet.mjs';
import TransactionPool from '../models/TransactionPool.mjs';
import Blockchain from '../models/Blockchain.mjs';

// Describe the TransactionPool test suite
describe('TransactionPool', () => {
  // Define variables for transaction pool, transaction and sender wallet
  let transactionPool, transaction, sender;
  sender = new Wallet();

  // Before each test, create a new transaction and transaction pool
  beforeEach(() => {
    transaction = new Transaction({
      sender,
      recipient: 'Mikael',
      amount: 50,
    });
    transactionPool = new TransactionPool();
  });

  // Test the properties of the transaction pool
  describe('properties', () => {
    it('should have a property named transactionMap', () => {
      expect(transactionPool).toHaveProperty('transactionMap');
    });
  });

  // Test the addTransaction method
  describe('addTransaction()', () => {
    it('should add a transaction to the transaction pool', () => {
      transactionPool.addTransaction( transaction );
      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });

  // Test the transactionExist method
  describe('transactionExist()', () => {
    it('should returna a transaction based on its address', () => {
      transactionPool.addTransaction(transaction);
      expect(transactionPool.transactionExist({ address: sender.publicKey })).toBe(transaction);
    });
  });



}); // End of TransactionPool test suite