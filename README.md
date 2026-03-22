# 💪 True Fitness — Gym Fee Management System

A mobile-first gym fee tracking app. No cloud setup needed — everything runs locally.

---

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React + Vite + Tailwind CSS       |
| Backend    | Node.js + Express                 |
| Database   | SQLite (single file, zero config) |
| Auth       | JWT (stays logged in 30 days)     |

---

## 🚀 Quick Start

### Step 1 — Install server dependencies
```bash
cd server
npm install
```

### Step 2 — Install client dependencies
```bash
cd ../client
npm install
```

### Step 3 — Start the server
Open a terminal:
```bash
cd server
npm run dev
```
Server starts at → http://localhost:5000

### Step 4 — Start the frontend
Open another terminal:
```bash
cd client
npm run dev
```
App opens at → http://localhost:5173

---

## 🔑 Default Login

| Field    | Value                       |
|----------|-----------------------------|
| Email    | trainer@truefitness.com     |
| Password | trainer123                  |

---

## 📱 Features

- ✅ Trainer login with JWT (stays logged in 30 days)
- ✅ Dashboard: total members, active, revenue, pending count, revenue chart
- ✅ Add / Edit / Delete members
- ✅ Search members by name or phone
- ✅ Filter by: All / Paid / Pending / Overdue
- ✅ Auto-calculates next due date based on plan (monthly/quarterly/yearly)
- ✅ One-tap "Mark as paid" — updates due date automatically
- ✅ Full payment history per member
- ✅ Status auto-updates: Paid ✅ Pending ⏳ Overdue ⚠️
- ✅ Dark blue mobile-first UI

---

## 📁 Project Structure

```
true-fitness/
├── server/          ← Node.js + Express backend
│   ├── index.js     ← Entry point
│   ├── db.js        ← SQLite setup + seed
│   ├── routes/      ← auth, members, payments, dashboard
│   └── middleware/  ← JWT auth guard
│
└── client/          ← React frontend
    └── src/
        ├── pages/   ← Login, Dashboard, Members, AddMember, EditMember, MemberDetail
        ├── components/ ← Layout, StatusBadge, StatCard
        ├── context/ ← AuthContext
        └── api/     ← Axios instance
```

---

## 🗄️ Database

SQLite file is created automatically at `server/truefitness.db` on first run.
No setup needed. To reset everything, just delete that file and restart the server.

---

## 💡 Tips

- The database file `truefitness.db` is your data — back it up to keep data safe
- To change the default trainer password, update it in `server/db.js` before first run
- For production, change `JWT_SECRET` in `server/.env` to a long random string
