// comments-routes.mjs
import express from 'express';
import {
  addComment,
  deleteComment,
  getComment,
  getComments,
  updateComment,
} from '../controllers/comments-controller.mjs';
import { protect } from '../middleware/authorization.mjs';

const router = express.Router();

router.post('/', protect, addComment);
router.delete('/:id', deleteComment);
router.get('/:id', getComment);
router.get('/', getComments);
router.put('/:id', updateComment);

export default router;