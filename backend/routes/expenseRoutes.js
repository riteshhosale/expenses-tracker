import express from 'express';
import { addExpense, getExpenses, updateExpense, deleteExpense, getPrediction } from '../controllers/expenseController.js';
import auth from '../middleware/authMiddleware.js';


const router = express.Router();
router.use(auth);
router.post('/', addExpense);
router.get('/', getExpenses);
router.get('/predict', getPrediction);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);


export default router;