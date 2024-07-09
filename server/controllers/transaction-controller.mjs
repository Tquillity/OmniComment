import { transactionPool } from "../server.mjs";
import { wallet } from "../server.mjs";
import { blockchain } from "../server.mjs";
import Miner from "../models/Miner.mjs";
import { pubnubServer } from "../server.mjs";
import Wallet from "../models/Wallet.mjs";

export const addTransaction = (req, res, next) => {
  const { amount, recipient } = req.body;

  let transaction = transactionPool.transactionExist({
    address: wallet.publicKey,
  });

  try {
    if (transaction) {
      transaction.update({ sender: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, statusCode: 400, message: error.message });
  }

  transactionPool.addTransaction(transaction);
  pubnubServer.broadcastTransaction(transaction);

  res.status(201).json({
    success: true,
    statusCode: 201,
    data: {
      _id: transaction.id,
      ...transaction
    }
  });
};

export const getAllTransactions = (req, res, next) => {
  const transactions= transactionPool.getAllTransactions();

  if(req.query.since) {
    const sinceTimestamp = parseInt(req.query.since);
    transactions = transactions.filter(transaction =>
      transaction.inputMap.timestamp > sinceTimestamp
    );  
  }

  res
  .status(200)
  .json({
    success: true,
    statusCode: 200,
    data: transactions,
  });
};

export const getTransactionPool = (req, res, next) => {
  res
    .status(200)
    .json({
      success: true,
      statusCode: 200,
      data: transactionPool.transactionMap,
    });
};


export const getWalletBalance = (req, res, next) => {
  const address = wallet.publicKey;
  const balance = Wallet.calculateBalance({ chain: blockchain, address });

  res
    .status(200)
    .json({
      success: true,
      statusCode: 200,
      data: { address: address, balance: balance },
    });
};

export const mineTransactions = (res, req, next) => {
  const miner = new Miner({
    blockchain,
    transactionPool,
    wallet,
    pubsub: pubnubServer,
  });

  miner.mineTransaction();

  res
    .status(200)
    .json({ success: true, statusCode: 200, data: "Mining successful" });
};
