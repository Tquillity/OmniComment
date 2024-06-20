import { INITIAL_BALANCE } from '../config/settings.mjs';
import { ellipticHash, createHash } from '../utilities/crypto-lib.mjs';
import Transaction from './Transaction.mjs';

export default class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ellipticHash.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  // Static method to calculate the balance of a wallet based on the blockchain
  static calculateBalance({ chain, address }) {
    let total = 0;
    let hasAddedTransaction = false;

    // Iterate through each blick in the blockchain from latest to earliest
    for (let i = chain.length -1; i > 0; i--) {
      const block = chain[i];

      // Iterate through each transaction in the block
      for (let transaction of block.data) {
        if (transaction.inputMap.address === address) {
          hasAddedTransaction = true;
        }

        const value = transaction.outputMap[address];

        if (value) {
          total += value;
        }
      }

      if(hasAddedTransaction) break;
    }

    return hasAddedTransaction ? total : INITIAL_BALANCE + total;
  }

  // Method to create a transaction
  createTransaction({ recipient, amount, chain }) {
    // Recalculate the balance if the blockchain is provided
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey,
      });
    }

    // Throw an error if the amount exceeds the balance
    if (amount > this.balance) throw new Error('Amount exceeds balance');

    return new Transaction({ sender: this, recipient, amount });
  }

  // method to sign data using the wallet's private key
  sign(data) {
    return this.keyPair.sign(createHash(data));
  }
}