# Online Complaint Management System (MERN)

A full-stack web application where students submit and track complaints, and administrators review, update and resolve them.

**Stack:** React (Vite) · Tailwind CSS · Lucide React · Node.js · Express · MongoDB (Mongoose) · JWT · bcrypt

---

## Features

**Student**
- Register / log in
- Submit a complaint (title, description, category, location, priority, optional image)
- Dashboard with total / pending / in-progress / resolved counts
- Search and filter complaints, view details, track status and admin remarks
- Edit or delete a complaint **only while it is Pending**
- Profile section

**Admin**
- Separate admin login tab
- Dashboard: total users, total complaints, pending, resolved, category breakdown, recent complaints
- View all complaints with search (title, user name or email) and category/status filters, with pagination
- View complaint details, **update status**, **add remarks**
- Delete inappropriate complaints

**Security**
- Passwords hashed with bcrypt; sessions via JWT
- Role-based authorization middleware (`user` / `admin`)
- Students can only access their own complaints
- Only admins can change complaint status
- Public registration can **never** create an admin (see "Create the first admin")
- Image uploads limited to JPG/PNG/WEBP/GIF, max 3 MB, stored with random file names

---

## Project structure

```
online-complaint-management/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # auth, complaint, admin logic
│   ├── middleware/               # auth (JWT + roles), upload (multer), error handler
│   ├── models/                   # User.js, Complaint.js
│   ├── routes/                   # authRoutes, complaintRoutes, adminRoutes
│   ├── scripts/seedAdmin.js      # creates the first admin
│   ├── uploads/                  # uploaded images
│   ├── utils/helpers.js
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/axios.js          # axios instance + JWT interceptor
│   │   ├── context/AuthContext.jsx
│   │   ├── components/           # reusable UI pieces
│   │   ├── layouts/DashboardLayout.jsx   # sidebar + header
│   │   └── pages/                # Login, Register, user/*, admin/*
│   ├── .env.example
│   └── vite.config.js
├── README.md
└── .gitignore
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- MongoDB, either:
  - installed locally ([MongoDB Community](https://www.mongodb.com/try/download/community)) and running, **or**
  - a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (copy its connection string)

---

## Installation and running

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # on Windows (cmd): copy .env.example .env
```

Open `backend/.env` and set at least:

| Variable | Meaning |
|---|---|
| `MONGO_URI` | MongoDB connection string (default works for a local MongoDB) |
| `JWT_SECRET` | A long random string. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Credentials for the first admin (password: 8+ characters) |

Create the first admin, then start the server:

```bash
npm run seed:admin
npm run dev                 # auto-restarts on changes (or: npm start)
```

The API runs at **http://localhost:5000**. Check it at http://localhost:5000/api/health.

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

In development, Vite proxies `/api` and `/uploads` to the backend, so no frontend configuration is needed. (`frontend/.env.example` is only for deploying the frontend and backend on different domains.)

---

## Create the first admin

Admin accounts cannot be created through the website. Instead:

1. Set `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` in `backend/.env`.
2. Run `npm run seed:admin` inside `backend/`.
3. Log in from the **Admin** tab on the login page.

The script is safe to run again: if the admin already exists nothing changes, and if the email belongs to an existing student that account is promoted to admin. After seeding you may remove `ADMIN_PASSWORD` from `.env`.

---

## Demo walkthrough

1. Register a student account at `/register` and submit a complaint (try attaching an image).
2. Check the student dashboard counts, search and filters.
3. Log out, then log in on the **Admin** tab with the seeded admin.
4. Open the complaint, change the status to *In Progress*, add a remark and save.
5. Log in as the student again: the new status and remark are visible, and the complaint can no longer be edited or deleted.

---

## API reference

All protected routes need the header `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a student `{ name, email, password }` |
| POST | `/api/auth/login` | Public | Login `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Logged in | Current user |

### Complaints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/complaints` | Student | Create (multipart/form-data, optional `image`) |
| GET | `/api/complaints` | Student | Own complaints. Query: `search`, `status`, `category`, `priority` |
| GET | `/api/complaints/stats` | Student | Counts for the dashboard |
| GET | `/api/complaints/:id` | Owner or admin | Complaint details |
| PUT | `/api/complaints/:id` | Owner | Edit (only while Pending) |
| DELETE | `/api/complaints/:id` | Owner (Pending only) or admin | Delete |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/complaints` | Admin | All complaints. Query: `search` (title/user), `category`, `status`, `priority`, `page`, `limit` |
| PUT | `/api/admin/complaints/:id/status` | Admin | `{ status, adminRemarks }` |
| GET | `/api/admin/dashboard` | Admin | Totals, category breakdown, recent complaints |

---

## Troubleshooting

- **"Cannot reach the server"**: the backend is not running, or is not on port 5000. If you change `PORT`, also update the proxy target in `frontend/vite.config.js`.
- **`MongooseServerSelectionError`**: MongoDB is not running or `MONGO_URI` is wrong. For Atlas, allow your IP address in *Network Access*.
- **`JWT_SECRET is not defined`**: you have not created `backend/.env` from `.env.example`.
- **Cannot log in as admin**: run `npm run seed:admin` in `backend/` and use the **Admin** tab.

## Production build

```bash
cd frontend && npm run build      # outputs frontend/dist
```

Host `dist/` on any static host, set `VITE_API_URL` and `VITE_FILE_URL` before building, and set `CLIENT_URL` in the backend `.env` to the frontend's URL.
