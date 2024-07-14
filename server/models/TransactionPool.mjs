// TransactionPool.mjs
import Transaction from './Transaction.mjs';

export default class TransactionPool {
  constructor(){
    this.transactionMap = {};
  }

  addTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  clearBlockTransactions({ chain }) {
    for (let i = 1; i < chain.length; i++) {

      const block = chain[i];
    
      for (let transaction of block.data) {
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
        }
      }
    }
  }

  clearTransactions() {
    this.transactionsMap = {};
  }

  getAllTransactions(){
    return Object.values(this.transactionMap);
  }

  replaceTransactionMap(transactionMap) {
    this.transactionMap = transactionMap;
  }

  transactionExist({ address }) {
    const transactions = Object.values(this.transactionMap);

    return transactions.find(
      (transaction) => transaction.inputMap.address === address
    );
  }

  validateTransactions() {
    const validTransactions = Object.values(this.transactionMap).filter(
      (transaction) => Transaction.validate(transaction)
    );
    return validTransactions;
  }
}