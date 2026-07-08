import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "./config/env.js";
import { connectDB } from "./db.js";
import User from "./models/User.js";
import Expense from "./models/Expense.js";

async function seed() {
  const ok = await connectDB();
  if (!ok) {
    console.warn(
      "⚠️ DB unavailable — attempting to seed via running server HTTP endpoints (in-memory fallback)",
    );
    // try to register and add expenses via the running server (fallback mode)
    const base = process.env.BACKEND_URL || "http://localhost:3000";
    const password = "password";
    const registerRes = await fetch(`${base}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password,
        monthlyLimit: 500,
      }),
    }).catch((e) => null);
    if (registerRes && registerRes.status === 201)
      console.log("✅ Registered test user via server");
    else if (registerRes && registerRes.status === 400)
      console.log("ℹ️ Test user already exists (server)");
    else
      console.log(
        "ℹ️ Register endpoint not available or failed — continuing to login attempt",
      );

    const loginRes = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password }),
    }).catch((e) => null);
    if (!loginRes) {
      console.error(
        "❌ Cannot reach running server to seed in-memory data. Start the server and try again.",
      );
      process.exit(1);
    }
    if (loginRes.status !== 200) {
      const txt = await loginRes.text().catch(() => null);
      console.error("❌ Login via server failed:", loginRes.status, txt);
      process.exit(1);
    }
    const loginJson = await loginRes.json();
    const token = loginJson.token;
    if (!token) {
      console.error("❌ Server did not return a token");
      process.exit(1);
    }

    const samples = [
      { title: "Coffee", amount: 3.5, category: "Food" },
      { title: "Groceries", amount: 45.2, category: "Food" },
      { title: "Uber", amount: 12.0, category: "Transport" },
    ];
    for (const s of samples) {
      await fetch(`${base}/api/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(s),
      }).catch(() => null);
    }
    console.log(
      "✅ Seeded sample expenses via running server. Use this token for API requests:",
    );
    console.log(token);
    process.exit(0);
  }

  const email = "test@example.com";
  let user = await User.findOne({ email });
  if (!user) {
    const hashed = await bcrypt.hash("password", 10);
    user = await User.create({
      name: "Test User",
      email,
      password: hashed,
      monthlyLimit: 500,
    });
    console.log("✅ Created test user:", email);
  } else {
    console.log("ℹ️ Test user already exists:", email);
  }

  // Remove existing sample expenses for clarity
  await Expense.deleteMany({ userId: user._id });

  const samples = [
    { title: "Coffee", amount: 3.5, category: "Food", date: new Date() },
    { title: "Groceries", amount: 45.2, category: "Food", date: new Date() },
    { title: "Uber", amount: 12.0, category: "Transport", date: new Date() },
    {
      title: "Movie",
      amount: 11.0,
      category: "Entertainment",
      date: new Date(),
    },
    {
      title: "Subscription",
      amount: 9.99,
      category: "Services",
      date: new Date(),
    },
  ];

  for (const s of samples) {
    await Expense.create({ userId: user._id, ...s });
  }
  console.log(`✅ Added ${samples.length} sample expenses for ${email}`);

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: "7d" },
  );
  console.log(
    "\nUse this JWT for authenticated requests (Bearer <token> header):\n",
  );
  console.log(token);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
