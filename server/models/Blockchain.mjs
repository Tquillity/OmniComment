// Blockchain.mjs
import { MINING_REWARD } from '../config/settings.mjs';
import { createHash } from '../utilities/crypto-lib.mjs';
import Block from './Block.mjs';
import Transaction from './Transaction.mjs';
import BlockModel from '../models/BlockModel.mjs';
import User from '../models/UserModel.mjs';

export default class Blockchain {
  constructor() {
    this.chain = [Block.genesis];
    this.initializeChain();
  }

  async initializeChain() {
    const blocks = await BlockModel.find().sort('timestamp');
    if (blocks.length === 0) {
      await this.saveBlock(this.chain[0]);
    } else {
      this.chain = blocks.map(block => new Block(block));
    }
  }

  async addBlock({ data }) {
    const newBlock = Block.mineBlock({
      lastBlock: this.chain.at(-1),
      data: data,
    });
    this.chain.push(newBlock);
    await this.saveBlock(newBlock);
    return newBlock;
  }

  async saveBlock(block) {
    const blockData = {
      hash: block.hash,
      lastHash: block.lastHash,
      timestamp: block.timestamp,
      nonce: block.nonce,
      difficulty: block.difficulty,
      data: block.data
    };
    await BlockModel.create(blockData);
  }

  
  replaceChain(chain, shouldValidate, callback) { 
    if (chain.length <= this.chain.length) return;
    
    if (!Blockchain.validateChain(chain)) return;

    if (shouldValidate && !this.validateTransactionData({ chain })) return;

    if (callback) callback();

    this.chain = chain;
  }

  async validateTransactionData({ chain }) {
    const rewardUser = await User.findOne({ role: 'reward' });
    if (!rewardUser) {
      throw new Error('Reward user not found');
    }

    for(let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set();
      let counter = 0;

      for (let transaction of block.data) {
        if (transaction.inputMap.address === rewardUser.walletPublicKey) {
          counter++;

          if (counter > 1) return false;

          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) 
            return false;
        } else {
          if (!Transaction.validate(transaction)) {
            return false;
          }

          if (transactionSet.has(transaction)) {
            return false;
          } else {
            transactionSet.add(transaction);
          }
        }
      }
    }

    return true;
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