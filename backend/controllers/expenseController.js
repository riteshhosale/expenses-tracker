import Expense from "../models/Expense.js";
import User from "../models/User.js";
import { predictExpense } from "../utils/predictor.js";
import { sendEmail } from "../utils/mailer.js";
import mongoose from "mongoose";
import { isConnected } from "../config/db.js";

const isValidDate = (val) => {
  const d = new Date(val);
  return !Number.isNaN(d.getTime());
};

const validateExpenseInput = ({ title, amount, category, date }) => {
  if (!title || !category) return "Title and category are required";
  const amt = Number(amount);
  if (Number.isNaN(amt) || amt < 0) return "Amount must be non-negative";
  if (date && !isValidDate(date)) return "Invalid date";
  return null;
};

const getExpenseFilter = (userId) => {
  const normalizedUserId = String(userId);
  if (mongoose.Types.ObjectId.isValid(normalizedUserId)) {
    return {
      $or: [
        { userId: normalizedUserId },
        { userId: new mongoose.Types.ObjectId(normalizedUserId) },
      ],
    };
  }

  return { userId: normalizedUserId };
};

const getMemoryStore = () => {
  if (!global.__memExpenses) global.__memExpenses = new Map();
  return global.__memExpenses;
};

const getMemoryUserById = (userId) => {
  if (!global.__memUsers) return null;

  const normalizedUserId = String(userId);
  for (const user of global.__memUsers.values()) {
    if (String(user._id) === normalizedUserId) {
      return user;
    }
  }

  return null;
};

const toExpenseRecord = (expense) => ({
  _id: expense._id,
  userId: String(expense.userId),
  title: expense.title,
  amount: Number(expense.amount),
  category: expense.category,
  date: expense.date ? new Date(expense.date) : new Date(),
});

const getMemoryExpenses = (userId) =>
  getMemoryStore().get(String(userId)) || [];

const saveMemoryExpense = (expense) => {
  const store = getMemoryStore();
  const userId = String(expense.userId);
  const current = store.get(userId) || [];
  store.set(userId, [...current, expense]);
};

export const addExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const validationError = validateExpenseInput({
      title,
      amount,
      category,
      date,
    });
    if (validationError)
      return res.status(400).json({ message: validationError });

    if (!isConnected()) {
      const expense = toExpenseRecord({
        _id: String(Date.now()) + Math.random().toString(36).slice(2, 8),
        userId: req.userId,
        title,
        amount: Number(amount),
        category,
        date: date ? new Date(date) : new Date(),
      });

      saveMemoryExpense(expense);

      const expenses = getMemoryExpenses(req.userId);
      const predicted = predictExpense(expenses);
      const user = getMemoryUserById(req.userId);
      if (user && predicted > user.monthlyLimit) {
        await sendEmail(
          user.email,
          `Alert: Your predicted expenses exceed your monthly limit of $${user.monthlyLimit}`,
        ).catch(() => null);
      }

      return res.status(201).json(expense);
    }

    const expense = new Expense({
      userId: String(req.userId),
      title,
      amount,
      category,
      date,
    });
    await expense.save();

    // Predict and send alert if needed
    const expenses = await Expense.find(getExpenseFilter(req.userId));
    const predicted = predictExpense(expenses);
    const user = await User.findById(req.userId);
    if (user && predicted > user.monthlyLimit) {
      await sendEmail(
        user.email,
        `Alert: Your predicted expenses exceed your monthly limit of $${user.monthlyLimit}`,
      );
    }
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    if (!isConnected()) {
      return res.json(getMemoryExpenses(req.userId));
    }

    const expenses = await Expense.find(getExpenseFilter(req.userId));
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date } = req.body;
    const validationError = validateExpenseInput({
      title,
      amount,
      category,
      date,
    });
    if (validationError)
      return res.status(400).json({ message: validationError });

    if (!isConnected()) {
      const store = getMemoryStore();
      const userExpenses = getMemoryExpenses(req.userId);
      const index = userExpenses.findIndex((expense) => expense._id === id);
      if (index < 0)
        return res.status(404).json({ message: "Expense not found" });

      const updatedExpense = {
        ...userExpenses[index],
        title,
        amount: Number(amount),
        category,
        date: date ? new Date(date) : new Date(userExpenses[index].date),
      };

      userExpenses.splice(index, 1, updatedExpense);
      store.set(String(req.userId), userExpenses);
      return res.json(updatedExpense);
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: id, ...getExpenseFilter(req.userId) },
      { title, amount, category, date },
      { new: true },
    );
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isConnected()) {
      const store = getMemoryStore();
      const userExpenses = getMemoryExpenses(req.userId);
      const nextExpenses = userExpenses.filter((expense) => expense._id !== id);
      if (nextExpenses.length === userExpenses.length) {
        return res.status(404).json({ message: "Expense not found" });
      }

      store.set(String(req.userId), nextExpenses);
      return res.json({ message: "Expense deleted" });
    }

    const removed = await Expense.findOneAndDelete({
      _id: id,
      ...getExpenseFilter(req.userId),
    });
    if (!removed) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrediction = async (req, res) => {
  try {
    const expenses = isConnected()
      ? await Expense.find(getExpenseFilter(req.userId))
      : getMemoryExpenses(req.userId);
    const predicted = predictExpense(expenses);
    res.json({ predicted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
