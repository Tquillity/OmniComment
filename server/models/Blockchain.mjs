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

  // Instance method to replace the current chain with a new chain
  replaceChain(chain, shouldValidate, callback) { 
    // Check if the new chain is longer than the current chain
    if (chain.length <= this.chain.length) return;
    
    // Validate the new chain
    if (!Blockchain.validateChain(chain)) return;

    // Validate transaction data if specified
    if (shouldValidate && !this.validateTransactionData({ chain })) return;

    // Execute callback if provided
    if (callback) callback();

    // Replace the current chain with the new chain
    this.chain = chain;
  }

  // Instance method to validate transaction data in the chain
  validateTransactionData({ chain }) {
    // Iterate through each block in the chain starting from the second block
    for(let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set();
      let counter = 0;

      // Iterate through each transaction in the block
      for (let transaction of block.data) {
        // Check if the transaction is a reward transaction
        if (transaction.inputMap.address === REWARD_ADDRESS.address) {
          counter++;

          // There should be only one reward transaction per block
          if (counter > 1) return false;

          // The reward transaction should have the correct mining reward amount
          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) 
            return false;
        } else {
          if (!Transaction.validate(transaction)) {
            return false;
          }

          // Ensure each transactoin is unique in the block
          if (transactionSet.has(transaction)) {
            return false;
          } else {
            transactionSet.add(transaction);
          }
        }
      }
    }

    // Return true if all transactoins are valid
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