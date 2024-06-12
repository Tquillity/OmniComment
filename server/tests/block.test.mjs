import { it, describe, expect, beforeEach } from 'vitest';
import Block from '../models/block.mjs';

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






});