import express from 'express';
import { listBlock, lastBlock } from '../controllers/blockchain-controller.mjs';

const router = express.Router();

router.route('/').get(listBlock);
router.route('/lastBlock').get(lastBlock);

export default router;