# Akshara Sales Management System

A premium, modern Sales Operating System and CRM built for real-time transaction tracking, customer relationships, employee evaluations, dynamic calendar scheduling, and detailed reporting exports.

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
* **Backend**: Node.js & Express (RESTful architecture, modular routing, error handler middleware)
* **Database**: Turso (Edge SQLite database client with batch transaction executions)

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the `backend/` directory with the following keys:

```env
PORT=5000
NODE_ENV=production

# Authentication Settings
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$78IE4m4G23EhAEZ3MpgjiOvy21qu9nY2QZE1NKMwmNeKGwTNzbugm
JWT_SECRET=supersecretjwtkey
JWT_EXPIRES_IN=1h

# Turso Database Configuration
TURSO_DB_URL=your_turso_db_connection_url
TURSO_AUTH_TOKEN=your_turso_authorization_token
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
2. Add your environment variables (`TURSO_DB_URL`, `TURSO_AUTH_TOKEN`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`) in Vercel.
3. Click **Deploy**. Vercel will build the frontend React assets and host the backend serverless Express functions automatically.
