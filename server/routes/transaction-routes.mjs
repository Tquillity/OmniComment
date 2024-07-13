import express from 'express';
import  {
  addTransaction,
  getAllTransactions,
  getTransactionPool,
  getWalletBalance,
  mineTransactions,
} from '../controllers/transaction-controller.mjs';
import { protect } from '../middleware/authorization.mjs';

const router = express.Router();

router.route('/transaction').post(addTransaction);
router.route('/transactions').get(getTransactionPool);
router.route('/mine').get(mineTransactions);
router.route('/transactions/all').get(getAllTransactions);
router.get('/info', protect, getWalletBalance);


export default router;