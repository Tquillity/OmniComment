import Transaction from './Transaction.mjs';

// Define and export the TransactionPool class
export default class TransactionPool {
  // Constructor to initialize the transaction pool with an empty transaction map
  constructor(){
    this.transactionMap = {};
  }

  // Method to add a transaction to the pool
  addTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }


  // Method to check if a transaction exists in the pool based on the senders address
  transactionExist({ address }) {
    // Convert the transaction Map to an array of transactions
    const transactions = Object.values(this.transactionMap);

    // Find and return the transaction that matches the sender's address
    return transactions.find(
      (transaction) => transaction.inputMap.address === address
    );
  }


  // Method to validate transactions in the pool
  validateTransactions() {
    // Filter and return only the valid transactions
    const validTransactions = Object.values(this.transactionMap).filter(
      (transaction) => Transaction.validate(transaction)
    );
    return validTransactions;
  }
}