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

  // Static method to validate a transaction
  static validate(transaction) {
    const {
      inputMap: { address, amount, signature},
      outputMap, 
    } = transaction;

    // Calculate the total output amount
    const outputTotal = Object.values(outputMap).reduce(
      (total, amount) => total + amount
    );

    // Check if the input amount matched the output amount
    if (amount !== outputTotal) {
      return false;
    }

    // Verify the signature ti ensure the transaction is valid
    if(!verifySignature({ publicKey: address, data: outputMap, signature})) {
      return false;
    }

    return true;
  }

  // Method to update an existing transaction
  update({ sender, recipient, amount }) {
    // Check if the sender has enough funds
    if(amount > this.outputMap[sender.publicKey])
      throw new Error('Amount exceeds balance');

    // Update the recipient's balance in the outputMap
    if(!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    // Deduct the amount from the sender's balance in the outputMap
    this.outputMap[sender.publicKey] = this.outputMap[sender.publicKey] - amount;

    // Recreate the inputMap to reflect the updated outputMap
    this.inputMap = this.createinputMap({ sender, outputMap: this.outputMap });
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
