
import hexToBinary from 'hex-to-binary';
import { it, describe, expect, beforeEach } from 'vitest';
import { createHash } from '../utilities/crypto-lib.mjs';
import Block from '../models/block.mjs';
import { GENESIS_DATA } from '../config/settings.mjs';

describe('Block', () => {
  const timestamp = Date.now();
  const lastHash = '0';
  const hash = '0';
  const nonce = 1;
  const difficulty = 1;
  const data = { amount: 100, sender: 'Mikael', recipient: 'Angela' };

  const block = new Block({
    timestamp: timestamp,
    lastHash: lastHash,
    hash: hash,
    nonce: nonce,
    difficulty: difficulty,
    data: data,
  });

  // Tests to verify that the block object has the expected properties and values
  describe('Properties', () => {
    it('Should have the properties timestamp, lastHash, hash, nonce, difficulty, and data', () => {
      expect(block).toHaveProperty('timestamp');
      expect(block).toHaveProperty('lastHash');
      expect(block).toHaveProperty('hash');
      expect(block).toHaveProperty('nonce');
      expect(block).toHaveProperty('difficulty');
      expect(block).toHaveProperty('data');
    });

    it('Should have the correct values for the properties', () => {
      expect(block.timestamp).toEqual(timestamp);
      expect(block.lastHash).toEqual(lastHash);
      expect(block.hash).toEqual(hash);
      expect(block.nonce).toEqual(nonce);
      expect(block.difficulty).toEqual(difficulty);
      expect(block.data).toEqual(data);
    });
  });

  // Tests to verify the correctnes of the genesis block and its data 
  describe('Genesis block', () => {
    const genesisBlock = Block.genesis;

    it('Should return an instance of the Block class', () => {
      expect(genesisBlock).toBeInstanceOf(Block);
    });

    it('Should return the genesis data', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  })

  // Tests to verify the properties and correctness of a newly mined block
  describe('mineBlock() function',() => {
    let lastBlock, data, minedBlock;

    beforeEach(() => {
      lastBlock = Block.genesis;
      data = { message: 'Test Block' };
      minedBlock = Block.mineBlock({ lastBlock, data });
    });

    it('Should return an instance of the Block class', () => {
      expect(minedBlock).toBeInstanceOf(Block);
    });

    it('Should add a timestamp', () => {
      expect(minedBlock.timestamp).not.toBeUndefined();
    });

    it('Should set the lastHash to the hash of the lastBlock hash', () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });

    it('Should set the data', () => {
      expect(minedBlock.data).toEqual(data);
    });

    it('Should produce a hash that matches the difficulty criteria', () => {
      expect(
        hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)
      ).toEqual('0'.repeat(minedBlock.difficulty));
    });

    it('Should produce a hash based on correct inputMap', () => {
      expect(minedBlock.hash).toEqual(
        createHash(
          minedBlock.timestamp,
          minedBlock.lastHash,
          minedBlock.nonce,
          minedBlock.difficulty,
          data
        )
      );
    });
  });





});