import { describe, it, expect, beforeEach, vi } from 'vitest';
import Block from '../models/Block.mjs';
import Blockchain from '../models/Blockchain.mjs';
import { createHash } from '../utilities/crypto-lib.mjs';
import Wallet from '../models/Wallet.mjs';
import Transaction from '../models/Transaction.mjs';

describe('Blockchain', () => {
  let blockchain, blockchain2, originalChain;

  beforeEach(() => {
    blockchain = new Blockchain();
    blockchain2 = new Blockchain();
    originalChain = blockchain.chain;
  });

  describe('Blockchain properties', () => { // Describe for code collaps and readability
    // Test to verify that the blockchain has the property "chain"
    it('Should have a property named "chain"', () => {
      expect(blockchain).toHaveProperty('chain');
    });

    // Test to verify that the chain is of the type Array
    it('Should have a property chain of type Array', () => {
      expect(blockchain.chain).toBeInstanceOf(Array);
    });

    // Test to verify that the chain starts with the genesis block
    it('Should start with the genesis block as the first block', () => {
      expect(blockchain.chain.at(0)).toEqual(Block.genesis);
    });

    // Test to verify that the chain can be updated and added to
    it('Should add a new block to the chain', () => {
      const data = 'new block';
      blockchain.addBlock({ data: data });

      expect(blockchain.chain.at(-1).data).toEqual(data);
    });
  });

  describe('Validate chain', () => {
    // Validate the genesis block
    describe('when the chain does not start with the correct genesis block', () => {
      it('Should return false', () => {
        blockchain.chain[0] = { data: 'fake-genesis' };
        expect(Blockchain.validateChain(blockchain.chain)).toBe(false);
      });
    });


    describe('when the chain starts with the genesis block and has multiple blocks...', () => {
      beforeEach(() => {
        blockchain.addBlock({ data: 'Test text 1' });
        blockchain.addBlock({ data: 'Test text 2' });
        blockchain.addBlock({ data: 'Test text 3' });
      });

      describe('...and a lastHash reference has changed', () => {
        it('Should return false', () => {
          blockchain.chain[1].lastHash = 'broken-lastHash';
          expect(Blockchain.validateChain(blockchain.chain)).toBe(false);
        });
      });

      describe('...and the chain contains a block with invalid data', () => {
        it('Should return false', () => {
          blockchain.chain[2].data = 'broken-data';
          expect(Blockchain.validateChain(blockchain.chain)).toBe(false);
        });
      });

      describe('...and the chain contains a block with jumped difficulty', () => {
        it('Should return false', () => {
          const lastBlock = blockchain.chain.at(-1);
          const lastHash = lastBlock.hash;
          const timestamp = Date.now();
          const nonce = 0 ;
          const difficulty = lastBlock.difficulty - 4;
          const data = [];
          const hash = createHash(timestamp, lastHash, nonce, difficulty, data);

          const block = new Block({
            timestamp,
            lastHash,
            hash,
            nonce,
            difficulty,
            data,
          })

          blockchain.chain.push(block);

          expect(Blockchain.validateChain(blockchain.chain)).toBe(false);
        });

        describe('The chain is valid', () => {
          it('Should return true', () => {
            expect(Blockchain.validateChain(blockchain.chain)).toBe(true);
          });
        });
      });

    });
  });

  // Tests for the replaceChain method
  describe('Replace chain', () => {
    // Tests for scenarios when the new chain is shorter than the current chain
    describe('when the new chain is shorter', () => {
        it('should not replace the chain', () => {
            // Modify blockchain2 to be shorter and attempt to replace the current chain
            blockchain2.chain[0] = { info: 'chain' };
            blockchain.replaceChain(blockchain2.chain);

            // Check that the original chain has not been replaced
            expect(blockchain.chain).toEqual(originalChain);
        });
    });

    // Tests for scenarios when the new chain is longer than the current chain
    describe('when the new chain is longer', () => {
        beforeEach(() => {
            // Add blocks to blockchain2 to make it longer
            blockchain2.addBlock({ data: 'Test text 4' });
            blockchain2.addBlock({ data: 'Test text 5' });
            blockchain2.addBlock({ data: 'Test text 6' });
        });

        // Tests for scenarios when the new chain is invalid
        describe('and the chain is invalid', () => {
            it('should not replace the chain', () => {
                // Incorrect hash of one block in blockchain2 to make it invalid
                blockchain2.chain[1].hash = 'dummy-hash';
                blockchain.replaceChain(blockchain2.chain);

                // Check that the original chain has not been replaced
                expect(blockchain.chain).toEqual(originalChain);
            });
        });

        // Tests for scenarios when the new chain is valid
        describe('and the chain is valid', () => {
            it('should replace the chain', () => {
                // Replace the current chain with the valid new chain
                blockchain.replaceChain(blockchain2.chain);

                // Check that the current chain has been replaced by the new chain
                expect(blockchain.chain).toBe(blockchain2.chain);
            });
        });
    });

    // Tests for scenarios when the shouldValidate flag is true
    describe('and the shouldValidate flag is true', () => {
        it('should call validateTransactionData()', () => {
            // Create a mock function for validateTransactionData
            const validateTransactionDataMockFn = vi.fn();

            // Replace the validateTransactionData method with the mock function
            blockchain.validateTransactionData = validateTransactionDataMockFn;

            // Add a block to blockchain2 to ensure it's longer
            blockchain2.addBlock({ data: 'LONGER' });

            // Replace the current chain with blockchain2 and set shouldValidate to true
            blockchain.replaceChain(blockchain2.chain, true);

            // Check that the validateTransactionData method was called
            expect(validateTransactionDataMockFn).toHaveBeenCalled();
        });
    });
  });

  // Tests for the validateTransactionData method
  describe('Validate Transaction data', () => {
  let transaction, transactionReward, wallet;

  // Before each test, create a new wallet and transactions
  beforeEach(() => {
    wallet = new Wallet(); // Initialize a new wallet
    // Create a regular transaction from the wallet
    transaction = wallet.createTransaction({ recipient: 'Mikael', amount: 7 });
    // Create a mining reward transaction for the wallet
    transactionReward = Transaction.transactionReward({ miner: wallet });
  });

  // Tests for scenarios where the transaction data is valid
  describe('and the transaction data is valid', () => {
    it('should return true', () => {
      // Add a new block with valid transaction data to blockchain2
      blockchain2.addBlock({ data: [transaction, transactionReward] });

      // Validate the transaction data in blockchain2
      expect(
        blockchain.validateTransactionData({ chain: blockchain2.chain })
      ).toBe(true);
    });
  });

  // Tests for scenarios where there are multiple rewards in a block
  describe('and there are multiple rewards', () => {
    it('should return false', () => {
      // Add a new block with multiple reward transactions to blockchain2
      blockchain2.addBlock({
        data: [transaction, transactionReward, transactionReward],
      });

      // Validate the transaction data in blockchain2
      expect(
        blockchain.validateTransactionData({ chain: blockchain2.chain })
      ).toBe(false);
    });
  });

  // Tests for scenarios where a transaction's outputMap is incorrectly formatted
  describe('and the transaction data consists of at least one incorrectly formatted outputMap', () => {
    it('should return false', () => {
      // Changed transaction outputMap to make it invalid
      transaction.outputMap[wallet.publicKey] = 555555;

      // Add a new block with the tampered transaction to blockchain2
      blockchain2.addBlock({ data: [transaction, transactionReward] });

      // Validate the transaction data in blockchain2
      expect(
        blockchain.validateTransactionData({ chain: blockchain2.chain })
      ).toBe(false);
    });
  });

  // Tests for scenarios where a block contains identical transactions
  describe('and a block contains identical transactions', () => {
    it('should return false', () => {
      // Add a new block with identical transactions to blockchain2
      blockchain2.addBlock({
        data: [
          transaction,
          transaction,
          transaction,
          transaction,
          transactionReward,
        ],
      });

      // Validate the transaction data in blockchain2
      expect(
        blockchain.validateTransactionData({ chain: blockchain2.chain })
      ).toBe(false);
    });
  });
  });
});