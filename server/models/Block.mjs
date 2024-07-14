// block.mjs
import hexToBinary from 'hex-to-binary';
import { GENESIS_DATA, MINE_RATE } from '../config/settings.mjs';
import { createHash } from '../utilities/crypto-lib.mjs';

export default class Block {
  constructor({ timestamp, lastHash, hash, nonce, difficulty, data }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.nonce = nonce;
    this.difficulty = difficulty;
    this.data = data;
  }

  static get genesis() {
    return new this(GENESIS_DATA);
  }

  static mineBlock({ lastBlock, data }) {
    const lastHash = lastBlock.hash;

    let { difficulty } = lastBlock;
    let hash, timestamp;
    let nonce = 0;

    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficultyLevel({ block: lastBlock, timestamp });
      hash = createHash(timestamp, lastHash, data, nonce, difficulty);
    } while (
      hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty)
    );

    return new this({
      timestamp,
      lastHash,
      hash,
      nonce,
      difficulty,
      data,
    });
  }

  static adjustDifficultyLevel({ block, timestamp }) {
    const { difficulty } = block;

    if (timestamp - block.timestamp > MINE_RATE) return difficulty - 1;

    return difficulty + 1;
  }
}
