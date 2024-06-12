import {GENESIS_DATA, MINE_RATE } from '../config/settings.mjs';

export default class Block {
  constructor({ timestamp, lastHash,hash, nonce, difficulty, data }) {
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

}
