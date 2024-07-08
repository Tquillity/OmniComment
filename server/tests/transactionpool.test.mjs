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

  // Test the validTransactions method
  describe('validTransactions method', () => {
    let transactions;

    // Before each test, create multiple transactions and add them to the pool
    beforeEach(() => {
      transactions = [];

      for (let i = 0; i < 10; i++) {
        transaction = new Transaction({
          sender,
          recipient: 'Mikael',
          amount: 50,
        });

        // Introducing invalid transactions
        if (i % 3 === 0) {
          transaction.inputMap.amount = 1010;
        } else if (i % 3 === 1) {
          transaction.inputMap.signature = new Wallet().sign('no-good');
        } else { 
          transactions.push(transaction);
        }

        transactionPool.addTransaction(transaction);
      }
    });

    // Test to ensure only valid transactions are returned
    it('should return valid transactions', () => {
      expect(transactionPool.validateTransactions()).toStrictEqual(transactions);
    });
  });

  // Test the clearTransactions method
  describe('clearTransactions()', () => {
    it('should clear the transactionPool', () => {
      transactionPool.clearTransactions();
      expect(transactionPool.transactionMap).toEqual({});
    });
  });

  // Test the clearBlockTransactions method
  describe('clearBlockTransactions method', () => {
    it('should clear the pool of existing blockchain transactions', () => {
      const blockchain = new Blockchain();
      const expectedMap = {}; // Map to store expected transactions after clearing

      // Create fake transactions and add them to the blockchain and transaction pool
      for (let i = 0; i < 20; i++) {
        const transaction = new Wallet().createTransaction({
          recipient: 'Mikael',
          amount: 7,
        });

        transactionPool.addTransaction(transaction);

        if (i % 2 === 0) {
          blockchain.addBlock({ data: [transaction] });
        } else {
          expectedMap[transaction.id] = transaction;
        }
      }

      // Clear transactions that are already in the blockchain
      transactionPool.clearBlockTransactions({ chain: blockchain.chain });

      // Check if the transaction pool contains only the expected transactions
      expect(transactionPool.transactionMap).toEqual(expectedMap);
    });
  });

  // Test the replaceTransactionMap method
  describe('replaceTransactionMap method', () => {
    it('should replace the transaction map', () => {
      const newTransactionPool = new TransactionPool();
      const newTransaction = new Transaction({
        sender,
        recipient: 'Angela',
        amount: 11,
      });
      const newTransactionMap = { [newTransaction.id]: newTransaction };

      // Replace the transaction map with the new map
      newTransactionPool.replaceTransactionMap(newTransactionMap);

      // Check if the transaction map has been replaced
      expect(newTransactionPool.transactionMap).toEqual(newTransactionMap);
    });
  });

  describe('getAllTransactions method', () => {
    it('Should return an arrau of all transactions', () => {
      const transaction1 = new Transaction({
        sender,
        recipient: 'Angela',
        amount: 100,
      });
      const transaction2 = new Transaction({
        sender,
        recipient: 'Mikael',
        amount: 50,
      });

      transactionPool.addTransaction(transaction1);
      transactionPool.addTransaction(transaction2);

      const transactions = transactionPool.getAllTransactions();

      expect(transactions).toEqual([transaction1, transaction2]);
    });
  });
});