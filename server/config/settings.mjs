// settings.mjs
export const MINE_RATE = 30000;
export const INITIAL_BALANCE = 1000;
export const MINING_REWARD = 50;
export const INITIAL_DIFFICULTY = 15;

export const GENESIS_DATA = {
  timestamp: 1,
  lastHash: '0',
  hash: '0',
  difficulty : INITIAL_DIFFICULTY,
  nonce: 1337,
  data: [],
};