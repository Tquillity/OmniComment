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

  

}