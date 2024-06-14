import { describe, it, expect, beforeEach, vi } from 'vitest';
import Block from '../models/Block.mjs';
import Blockchain from '../models/Blockchain.mjs';
import { createHash } from '../utilities/crypto-lib.mjs';

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
});