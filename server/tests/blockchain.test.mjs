import { describe, it, expect, beforeEach, vi } from 'vitest';
import Block from '../models/Block.mjs';
import Blockchain from '../models/Blockchain.mjs';

describe('Blockchain', () => {
  let blockchain, blockchain2, originalChain;

  beforeEach(() => {
    blockchain = new Blockchain();
    blockchain2 = new Blockchain();
    originalChain = blockchain.chain;
  });

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