import { MINING_REWARD, REWARD_ADDRESS } from '../config/settings.mjs';
import { createHash } from '../utilities/crypto-lib.mjs';
import Block from './Block.mjs';
import Transaction from './Transaction.mjs';

export default class Blockchain {
  constructor() {
    this.chain = [Block.genesis];
  }

  // Function to add a new block to the chain
  addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain.at(-1),
      data: data,
    });
    this.chain.push(newBlock);
    return newBlock;
  }


  static validateChain(chain) {
    if (JSON.stringify(chain.at(0)) !== JSON.stringify(Block.genesis)) return false;

    for (let i = 1; i < chain.length; i++) {
      const { timestamp, lastHash, hash, nonce, difficulty, data } = chain.at(i);
      const currentLastHash = chain[i -1].hash;
      const lastDifficulty = chain[i - 1].difficulty;

      if (lastHash !== currentLastHash) return false;

      if ( Math.abs(lastDifficulty - difficulty) > 1 ) return false;

      const validHash = createHash(
        timestamp,
        lastHash,
        nonce,
        difficulty,
        data
      );
      if (hash !== validHash) return false;
    }
    return true;
  } 
}