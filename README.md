# Akshara Sales Management System

A premium, modern Sales Operating System and CRM built for real-time transaction tracking, customer relationships, employee evaluations, dynamic calendar scheduling, and detailed reporting exports.

---

## 📁 Repository Structure

```text
├── backend
│   ├── config
│   │   └── env.js
│   ├── controllers
│   │   ├── authController.js
│   │   ├── backupController.js
│   │   ├── employeeController.js
│   │   ├── expenseController.js
│   │   ├── inventoryController.js
│   │   ├── salesController.js
│   │   └── userController.js
│   ├── middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── routes
│   │   ├── auth.js
│   │   ├── backupRoutes.js
│   │   ├── employees.js
│   │   ├── expenseRoutes.js
│   │   ├── inventoryroutes.js
│   │   ├── reports.js
│   │   ├── sales.js
│   │   └── users.js
│   ├── db.js
│   ├── index.js
│   ├── seed.dev.js
│   └── seed.prod.js
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── hooks
│   │   ├── pages
│   │   ├── services
│   │   ├── styles
│   │   └── utils
│   ├── index.html
│   └── vite.config.js
├── SECURITY_CHANGELOG.md
├── package.json
└── vercel.json
```

---

## 🚀 Key Features

* **Real-time Sales Tracking**: Log, edit, and delete transactions with instant synchronization.
* **Live Inventory Sync**: Updates to sales quantities dynamically deduct and adjust stock levels.
* **Interactive Calendar**: View schedules, follow-ups, and meetings in Month, Week, Day, and List views.
* **Dynamic Notifications**: Real-time alerts for low stock levels and pending client payments.
* **Interactive Dashboard**: Clean financial cards, dynamic performance widgets, and analytics charts.
* **Exports & Downloads**: Compile reports and customer accounts into Excel, CSV, or Print/PDF formats.
* **Backup & Restore**: Easily download a full snapshot of the database as a JSON file and restore it instantly via secure file upload.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite, TailwindCSS, Lucide Icons, Recharts, Axios, Date-fns)
* **Backend**: Node.js & Express (Zod schema validation, RESTful architecture, modular routing, error handler middleware)
* **Database**: Turso & SQLite (Edge SQLite database client with batch transaction executions)

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the `backend/` directory with the following keys:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_openssl_rand_hex_32
JWT_EXPIRES_IN=24h
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
TURSO_DB_URL=file:sales.db
TURSO_AUTH_TOKEN=replace_if_using_turso_cloud
SEED_ADMIN_PASSWORD=replace_with_secure_admin_password
```

---

## 💻 Local Development

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/saivarshithmaddala-sudo/sos.git
   cd sos
   ```

2. **Install Dependencies**:
   Install dependencies concurrently across workspace folders:
   ```bash
   npm install && npm install --prefix backend && npm install --prefix frontend
   ```

3. **Start the Application**:
   Launch both backend and frontend development servers in concurrent mode:
   ```bash
   npm start
   ```
   * **Frontend URL**: `http://localhost:5173`
   * **Backend URL**: `http://localhost:5000`

---

## ☁️ Vercel Deployment

This project is fully configured for deployment on **Vercel** via the root `vercel.json` file.

To deploy:
1. Link your repository to a new Vercel Project.
2. Add your environment variables (`JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, `TURSO_DB_URL`, `TURSO_AUTH_TOKEN`, `SEED_ADMIN_PASSWORD`) in Vercel.
3. Click **Deploy**. Vercel will build the frontend React assets and host the backend serverless Express functions automatically.
