import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val || '');

export const register = async (req, res) => {
  try {
    const { name, email, password, monthlyLimit } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });
    if (!isEmail(email)) return res.status(400).json({ message: 'Invalid email' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    const limitVal = Number(monthlyLimit ?? 0);
    if (Number.isNaN(limitVal) || limitVal < 0) return res.status(400).json({ message: 'monthlyLimit must be non-negative' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, monthlyLimit: limitVal });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    if (!isEmail(email)) return res.status(400).json({ message: 'Invalid email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, monthlyLimit: user.monthlyLimit } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
