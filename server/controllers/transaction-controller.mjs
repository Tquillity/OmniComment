// transaction-controller.mjs
import { transactionPool } from "../server.mjs";
import { wallet } from "../server.mjs";
import { blockchain } from "../server.mjs";
import Miner from "../models/Miner.mjs";
import { pubnubServer } from "../server.mjs";
import Wallet from "../models/Wallet.mjs";
import User from '../models/UserModel.mjs';

export const addTransaction = async (req, res, next) => {
  const { amount, recipient } = req.body;
  
  try {
    const user = await User.findById(req.user.id).select('+walletPrivateKey');
    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found',
      });
    }

    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Insufficient balance',
      });
    }

    const wallet = new Wallet();
    wallet.publicKey = user.walletPublicKey;
    wallet.keyPair = ellipticHash.keyFromPrivate(user.walletPrivateKey, 'hex');

    let transaction = transactionPool.transactionExist({
      address: wallet.publicKey,
    });

    if (transaction) {
      transaction.update({ sender: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });
    }

    user.balance -= amount;
    await user.save();

    transactionPool.addTransaction(transaction);
    pubnubServer.broadcastTransaction(transaction);

    res.status(201).json({ success: true, statusCode: 201, data: transaction });
  } catch (error) {
    next(error);
  }
};

export const getAllTransactions = (req, res, next) => {
  const transactions= transactionPool.getAllTransactions();
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

export const getWalletBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+walletPrivateKey');
    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found',
      });
    }
    res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        address: user.walletPublicKey,
        balance: user.balance,
      },
    });
  } catch (error) {
    next(error);
  }
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
