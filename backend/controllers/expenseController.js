import Expense from '../models/Expense.js';
import User from '../models/User.js';
import { predictExpense } from '../utils/predictor.js';
import { sendEmail } from '../utils/mailer.js';

const isValidDate = (val) => {
  const d = new Date(val);
  return !Number.isNaN(d.getTime());
};

const validateExpenseInput = ({ title, amount, category, date }) => {
  if (!title || !category) return 'Title and category are required';
  const amt = Number(amount);
  if (Number.isNaN(amt) || amt < 0) return 'Amount must be non-negative';
  if (date && !isValidDate(date)) return 'Invalid date';
  return null;
};

export const addExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const validationError = validateExpenseInput({ title, amount, category, date });
    if (validationError) return res.status(400).json({ message: validationError });
    const expense = new Expense({ userId: req.userId, title, amount, category, date });
    await expense.save();

    // Predict and send alert if needed
    const expenses = await Expense.find({ userId: req.userId });
    const predicted = predictExpense(expenses);
    const user = await User.findById(req.userId);
    if (predicted > user.monthlyLimit) {
      await sendEmail(user.email, `Alert: Your predicted expenses exceed your monthly limit of $${user.monthlyLimit}`);
    }
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date } = req.body;
    const validationError = validateExpenseInput({ title, amount, category, date });
    if (validationError) return res.status(400).json({ message: validationError });
    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { title, amount, category, date },
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Expense.findOneAndDelete({ _id: id, userId: req.userId });
    if (!removed) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrediction = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });
    const predicted = predictExpense(expenses);
    res.json({ predicted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
