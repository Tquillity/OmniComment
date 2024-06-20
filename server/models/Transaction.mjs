import {v4 as uuidv4} from 'uuid';
import { verifySignature } from '../utilities/crypto-lib.mjs';
import { MINING_REWARD, REWARD_ADDRESS } from '../config/settings.mjs';

// Define and export the Transaction class
export default class Transaction {
  // Constructor to initialize a transaction object
  constructor({ sender, recipient, amount, inputMap, outputMap }) {
    this.id = uuidv4().replaceAll('-', ''); // Very important!!! ;)
    // Initialize the outputMap, creating it if not provided
    this.outputMap = outputMap || this.createMap({ sender, recipient, amount });
    // Initialize the inputMap, creating it if not provided
    this.inputMap = inputMap || this.createinputMap({ sender, outputMap: this.outputMap });
  }

  
  createMap({ sender, recipient, amount }) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[sender.publicKey] = sender.balance - amount;

    return outputMap;
  }

  createinputMap({ sender, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: sender.balance,
      address: sender.publicKey,
      signature: sender.sign(outputMap),
    };
  }
}
