import { INITIAL_BALANCE } from '../config/settings.mjs';
import { ellipticHash, createHash } from '../utilities/crypto-lib.mjs';
import Transaction from './Transaction.mjs';

export default class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ellipticHash.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }


  sign(data) {
    return this.keyPair.sign(createHash(data));
  }
}