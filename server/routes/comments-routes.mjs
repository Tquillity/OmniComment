import express from 'express';
import {
  addComment,
  deleteComment,
  getComment,
  getComments,
  updateComment,
} from '../controllers/comments-controller.mjs';


const router = express.Router();

router.post('/', addComment);
router.delete('/:id', deleteComment);
router.get('/:id', getComment);
router.get('/', getComments);
router.put('/:id', updateComment);

export default router;