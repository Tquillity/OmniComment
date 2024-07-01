import express from 'express';
import { register, login, getMe } from '../controllers/auth-controller.mjs';

const router = express.Router();

//router.route('/register').post(register); Alternate way to write the below line
router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);

export default router;