# 💰 Expenses Tracker

A full-stack expense tracking application with intelligent prediction features and email alerts. Built with React and Node.js, this application helps users monitor their spending habits and stay within budget.

## ✨ Features

- **User Authentication**: Secure registration and login with JWT authentication
- **Expense Management**: Add, update, delete, and view all your expenses
- **Smart Predictions**: AI-powered expense prediction using linear regression to forecast future spending
- **Budget Alerts**: Automatic email notifications when predicted expenses exceed your monthly limit
- **Category Tracking**: Organize expenses by categories for better insights
- **Modern UI**: Built with React 19 and Vite for fast, responsive user experience
- **Full-Stack Application**: RESTful API backend with MongoDB database

## 🚀 Tech Stack

### Frontend

- **React 19.2.0** - Latest React with React Compiler enabled
- **Vite** - Lightning-fast build tool and dev server
- **React Router DOM** - Client-side routing
- **ESLint** - Code quality and consistency

### Backend

- **Node.js** with **Express** - RESTful API server
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email notifications
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
expenses-tracker/
├── client/               # React frontend
│   ├── src/
│   │   ├── utils/       # API utilities
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── backend/             # Express backend
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Predictor & mailer utilities
│   ├── app.js          # Server entry point
│   └── package.json
│
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB instance (local or cloud)
- Gmail account (for email notifications)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/riteshhosale/expenses-tracker.git
   cd expenses-tracker
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend` directory:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   FRONTEND_ORIGIN=http://localhost:5173
   ```

3. **Frontend Setup**

   ```bash
   cd ../client
   npm install
   ```

   Create a `.env` file in the `client` directory (optional):

   ```env
   VITE_API_BASE=http://localhost:5000
   ```

## 🚀 Running the Application

### Development Mode

1. **Start the backend server**

   ```bash
   cd backend
   npm run dev
   ```

   Server will run on `http://localhost:5000`

2. **Start the frontend** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```
   Client will run on `http://localhost:5173`

### Production Build

1. **Build the frontend**

   ```bash
   cd client
   npm run build
   ```

2. **Start the backend** (serves both API and frontend)
   ```bash
   cd backend
   npm start
   ```

## Deployment Notes (Fixing "Failed to fetch")

If your app works locally but shows **"Failed to fetch"** after deploy, it is usually one of these:

1. Frontend is calling the wrong API URL.
2. Backend CORS does not allow your deployed frontend domain.

Set these environment variables in production:

- Backend (`backend/.env` or hosting provider env):

  ```env
  FRONTEND_ORIGIN=https://your-frontend-domain.com
  # or multiple domains:
  FRONTEND_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
  ```

- Frontend (`client/.env.production` or hosting provider env):
  ```env
  VITE_API_BASE=https://your-backend-domain.com
  ```

Notes:

- If frontend and backend are hosted on the same domain, `VITE_API_BASE` can be omitted.
- If they are on different domains, `VITE_API_BASE` must point to backend, and backend CORS must allow frontend origin.

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### Expenses (Protected Routes)

- `GET /api/expenses` - Get all expenses for logged-in user
- `POST /api/expenses` - Add a new expense
- `PUT /api/expenses/:id` - Update an expense
- `DELETE /api/expenses/:id` - Delete an expense
- `GET /api/expenses/prediction` - Get predicted future expenses

## 🧠 Smart Prediction Algorithm

The application uses a linear regression-based algorithm to predict future expenses:

- Groups expenses by month
- Calculates trend using historical data
- Provides prediction with 5% cushion for budgeting
- Automatically alerts users when predictions exceed monthly limits

## 📧 Email Notifications

Users receive automatic email alerts when:

- Predicted monthly expenses exceed their set budget limit
- Configurable via environment variables for Gmail SMTP

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes with middleware
- Input validation on all endpoints
- Environment variable configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Ritesh Hosale**

- GitHub: [@riteshhosale](https://github.com/riteshhosale)

---

⭐ Star this repository if you find it helpful!
