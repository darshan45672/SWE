# 🧠 SWE Project Management Application

A modern, full-stack **project management platform** featuring **kanban boards**, **real-time chat**, **AI assistance**, and **team collaboration** — designed to streamline software project workflows.

---

## 🚀 Features

- 🧩 **Workspaces & Projects** – Organize work into teams and projects.
- 📋 **Kanban Boards** – Manage issues visually with drag-and-drop functionality.
- 🧠 **AI Assistant (Gemini)** – Get task summaries, project insights, and instant help using Google Gemini.
- 💬 **Real-Time Chat** – Communicate with your team instantly within projects.
- 🔔 **Notifications** – Stay up to date with real-time system alerts and updates.
- 🧾 **Issue Tracking** – Create, assign, and monitor issues by type, priority, and status.
- 🔐 **User Authentication** – Secure login, registration, and two-factor authentication.
- 📧 **Email Integration** – Verification, password reset, and project notifications.
- 👥 **Role-Based Access Control** – Manage workspace permissions and member access.
- 📱 **Responsive UI** – Built with **Next.js** and **Tailwind CSS** for a seamless experience across devices.

---

## 🧰 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB (via Prisma ORM) |
| **Real-Time** | Socket.IO |
| **AI Integration** | Google Gemini API |
| **Email Service** | Nodemailer (Mailtrap for dev) |
| **Authentication** | JWT, Two-Factor Auth (2FA) |
| **Containerization** | Docker, Docker Compose |

---

## ⚙️ Getting Started

### 🧾 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)  
- npm or yarn  
- [MongoDB](https://www.mongodb.com/) (local or Atlas Cloud)  
- [Mailtrap](https://mailtrap.io/) account (for testing emails)  

---

### 🏗️ Setup Instructions

#### 1. Clone the Repository

```bash
git clone https://github.com/darshan45672/SWE.git
cd SWE
```


### ⚙️ Configure Environment Variables

Copy `.env.example` → `.env` in **both** `backend/` and `frontend/` directories.

#### Example: `backend/.env`

```env
DATABASE_URL="mongodb://localhost:27017/swe?retryWrites=true&w=majority&replicaSet=rs0"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
API_VERSION=v1

# SMTP Configuration
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
EMAIL_FROM_NAME=ProjectManager
EMAIL_FROM_ADDRESS=noreply@projectmanager.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key
```


#### Example: `frontend/.env`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```


### 🧩 3. Install Dependencies

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd frontend
npm install
```

### 🗄️ 4. Database Setup

Ensure MongoDB is running locally or update your `DATABASE_URL` for a cloud instance.

> 💡 **Optional:** For local replica set configuration, run the provided `init-replica-set.js` script inside the `backend/` directory.

Your application should now be live at:

- **Frontend:** [http://localhost:3000](http://localhost:3000)  
- **Backend API:** [http://localhost:3001](http://localhost:3001)

### 🧩 Project Structure

SWE/
├── backend/       # Express API, Prisma ORM, Socket.IO, AI, Email
│   ├── src/
│   ├── prisma/
│   └── ...
└── frontend/      # Next.js App, React Components, UI, API Integrations
    ├── app/
    ├── components/
    └── ...

### 🌐 API Overview

Once the server is running, you’ll see logs similar to:
✅ AI Service initialized with Gemini and MCP tools
[dotenv@17.2.3] injecting env (0) from .env
✅ Socket.IO initialized
🚀 Server running on http://localhost:3001

📡 API available at http://localhost:3001/api/v1

💬 Socket.IO available at http://localhost:3001


###🧠 AI Assistant (Gemini)

The AI Assistant is powered by Google Gemini API, offering:

Task and project summaries

Q&A on specific project issues

Insightful suggestions for improvement and planning

⚠️ Make sure to set your valid GEMINI_API_KEY in .env for this to work.


### 🐳 Docker Setup (Optional)

You can run the entire stack using Docker:

```bash
docker-compose up --build
This will start:

Backend at port 3001

Frontend at port 3000

MongoDB instance (if configured in docker-compose.yml)
```

🏥 Health check at http://localhost:3001/health

🔍 Environment: development
