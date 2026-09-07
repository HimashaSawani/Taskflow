# TaskFlow — Production-Style Full-Stack Task Management Platform

[![Live App](https://img.shields.io/badge/Live%20Demo-TaskFlow%20Pro-indigo?style=for-the-badge&logo=vercel)](https://taskflow-brown-sigma.vercel.app)
[![API Status](https://img.shields.io/badge/API%20Server-Online-emerald?style=for-the-badge&logo=express)](https://taskflow-usiv.vercel.app/health)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?style=flat&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Live Production Deployment:**
> - 🌐 **Frontend Web App:** [https://taskflow-brown-sigma.vercel.app](https://taskflow-brown-sigma.vercel.app)
> - 🔌 **Backend REST API:** [https://taskflow-usiv.vercel.app](https://taskflow-usiv.vercel.app)
> - 🗄️ **Database:** MongoDB Atlas Cloud Cluster

---

### 🔑 Instant Evaluation & Demo Credentials

| Role | Work Email | Password | Access & Privileges |
| :--- | :--- | :--- | :--- |
| **👑 System Admin** | `admin@taskflow.com` | `AdminPassword123!` | System-wide governance, reassign any task, user directory & workloads, system audit feed. |
| **👤 Team Member** | `alex@taskflow.com` | `Password123!` | Kanban drag-and-drop, create unassigned tasks, claim eligible items, manage personal tasks. |

*(Note: 1-Click pre-fill buttons are also available directly on the login screen for instant evaluation).*

---

TaskFlow is a production-grade, full-stack Task Management SaaS application built with **Next.js (App Router)**, **Express.js**, **TypeScript**, and **MongoDB**. Designed with strict server-side **Role-Based Access Control (RBAC)**, it delivers a high-performance Kanban workflow with interactive drag-and-drop mechanics powered by `@dnd-kit`.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
  - [Authentication](#authentication)
  - [User Roles](#user-roles)
  - [Task Management](#task-management)
  - [Drag & Drop](#drag--drop)
  - [Bonus SaaS Features](#bonus-saas-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Installation](#installation)
  - [Clone repository](#clone-repository)
  - [Backend setup](#backend-setup)
  - [Frontend setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
  - [1. Seed Database](#1-seed-the-database)
  - [2. Start Backend](#2-start-backend-server)
  - [3. Start Frontend](#3-start-frontend-development-server)
- [Admin Account](#admin-account)
- [Deployment](#deployment)
  - [Frontend (Vercel)](#frontend-vercel)
  - [Backend (Render / Railway)](#backend-render--railway)
  - [Database (MongoDB Atlas)](#database-mongodb-atlas)
- [Screenshots & UI Showcase](#screenshots)
- [Security](#security)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## Overview

Modern engineering organizations require task coordination systems that combine frictionless user experience with rock-solid authorization boundaries. TaskFlow bridges that requirement by establishing two strictly segregated user experiences:

1. **Normal Team Members**: Focused workspace allowing members to view their tasks, create open tasks, claim unassigned items, edit their assignments, and transition cards through the Kanban pipeline (`TO DO` → `DOING` → `DONE`).
2. **Administrators**: Centralized governance command center providing system-wide task reassignment (Unassigned ⇄ User A ⇄ User B), user workload analytics, and elevated pipeline control.

TaskFlow enforces all authorization rules directly within the Express API middleware layer, ensuring zero reliance on client-side button hiding.

---

## Features

### Authentication
- **Secure Password Hashing**: Utilizes `bcryptjs` with 10 salt rounds.
- **Stateless JWT Tokens**: Signed using `jsonwebtoken` with 7-day expiration.
- **Client Session Management**: Axios interceptor automatically injects `Authorization: Bearer <token>` and handles 401 expiration redirects.
- **1-Click Demo Profiles**: Pre-configured switcher on the login page for instantaneous evaluation of both Admin and Normal User roles.

### User Roles
- **Normal User**:
  - Register & authenticate.
  - View personal tasks (assigned to them, created by them, or unassigned).
  - Create tasks (strictly forced to `assignedUser = null`).
  - Claim open unassigned tasks for themselves.
  - Drag and move assigned tasks between `TO DO`, `DOING`, and `DONE`.
  - **Restrictions**: Cannot view the user directory (`/api/users`), cannot assign tasks to other users, cannot reassign another user's task.
- **Administrator**:
  - Seeded securely through backend CLI script (`npm run seed:admin`); no public registration endpoint.
  - View all registered users and their completion metrics.
  - View all tasks across the entire company.
  - Dynamically reassign any task between team members or return to `Unassigned`.
  - Edit or delete any task.

### Task Management
- Real-time creation and inline updates for Task Title, Description, Pipeline Status, Priority, and Due Date.
- Dynamic filtering by search keywords, ownership scope (`All`, `My Tasks`, `Unassigned`), and priority level.
- Optimistic UI updates with automatic server rollback upon authorization error.

### Drag & Drop
- Implemented with `@dnd-kit/core` and `@dnd-kit/sortable`.
- Pointer sensor constraints (5px threshold) ensuring zero interference between card dragging and button clicks.
- Drag overlay with elevation, rotation, and opacity states.
- Instant persistence via `PATCH /api/tasks/:id/status`.

### Bonus SaaS Features
- ⭐ **Task Priority**: Visual color badges for `LOW` (Emerald), `MEDIUM` (Amber), and `HIGH` (Rose) with filter integration.
- ⭐ **Enhanced Due Dates**: Dynamic deadline calculator displaying `Due Oct 12 (X days left)`, `Due Today`, `⚠️ Overdue by X days`, and `✓ Completed`.
- ⭐ **Multi-Filter Toolbar**: Filter simultaneously by text search, status (`To Do`, `Doing`, `Done`), priority (`High`, `Medium`, `Low`), and assigned user (`All`, `Assigned to Me`, `Unassigned`, or team member) with a 1-click `Reset` button.
- ⭐ **Activity History Audit Log**: Chronological audit feed tracking actions (e.g., *"Himasha created task"*, *"Admin assigned task to Alex"*, *"Alex moved task from TO DO → DOING"*).
- ⭐ **6-Card Dashboard Metrics**: High-level statistical indicators (`Total Tasks`, `To Do`, `Doing`, `Done`, `High Priority`, and `Overdue`).
- ⭐ **In-App Notification Center**: Bell dropdown with unread badge counter alerting users about task assignments, approaching deadlines, and task completions with a *"Mark all read"* action.
- ⭐ **Dark / Light Mode Theme Switcher**: Sun/Moon toggle in the navigation bar with `localStorage` persistence and responsive dark theme styling.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Drag & Drop** | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| **Backend** | Node.js, Express.js, TypeScript, TSX |
| **Database** | MongoDB, Mongoose ORM (supports MongoDB Atlas and local memory server fallback) |
| **Authentication** | JWT (`jsonwebtoken`), `bcryptjs` |
| **Security** | `helmet` (HTTP headers), `cors`, `zod` input validation schemas |
| **Deployment** | Vercel (Frontend), Render / Railway (Backend), MongoDB Atlas (Database) |

---

## Architecture

```
                 Internet / Client Browser
                             │
                             ▼
                  ┌─────────────────────┐
                  │   Next.js 15 App    │
                  │  (Vercel Hosting)   │
                  │                     │
                  │  - Login / Register │
                  │  - Kanban Board     │
                  │  - Admin Hub        │
                  │  - Activity Drawer  │
                  └──────────┬──────────┘
                             │ HTTPS REST API + Bearer JWT
                             ▼
                  ┌─────────────────────┐
                  │ Express.js Backend  │
                  │  (Render / Railway) │
                  │                     │
                  │  - helmet() Headers │
                  │  - authenticate MW  │
                  │  - requireRole MW   │
                  │  - Zod Validation   │
                  │  - Tiered Services  │
                  └──────────┬──────────┘
                             │ Mongoose Connection
                             ▼
                  ┌─────────────────────┐
                  │    MongoDB Atlas    │
                  │                     │
                  │  - users collection │
                  │  - tasks collection │
                  │  - activities coll  │
                  └─────────────────────┘
```

---

## Database Schema

### User Schema (`models/User.ts`)
```typescript
{
  _id: ObjectId,
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // bcrypt hashed
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: Date,
  updatedAt: Date
}
```

### Task Schema (`models/Task.ts`)
```typescript
{
  _id: ObjectId,
  title: { type: String, required: true, maxlength: 120 },
  description: { type: String, required: true, maxlength: 2000 },
  status: { type: String, enum: ['TODO', 'DOING', 'DONE'], default: 'TODO' },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  dueDate: { type: Date, default: null },
  creator: { type: ObjectId, ref: 'User', required: true },
  assignedUser: { type: ObjectId, ref: 'User', default: null },
  createdAt: Date,
  updatedAt: Date
}
```

### Activity Schema (`models/Activity.ts`)
```typescript
{
  _id: ObjectId,
  user: { type: ObjectId, ref: 'User', required: true },
  task: { type: ObjectId, ref: 'Task', default: null },
  action: { type: String, enum: ['CREATED', 'STATUS_CHANGED', 'ASSIGNED', 'UPDATED', 'DELETED'] },
  message: { type: String, required: true },
  createdAt: Date
}
```

---

## API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register normal user (role forced to `user`) | Public |
| `POST` | `/api/auth/login` | Authenticate email & password, returns JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |

### Users (`/api/users`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | List all users with task statistics | **Admin Only** |
| `GET` | `/api/users/:id` | Get specific user by ID | **Admin Only** |

### Tasks (`/api/tasks`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Get tasks (Normal: own/unassigned, Admin: all) | Authenticated |
| `POST` | `/api/tasks` | Create task (Normal: assignedUser=null, Admin: any) | Authenticated |
| `GET` | `/api/tasks/:id` | Fetch single task details | Authenticated |
| `PUT` | `/api/tasks/:id` | Update title, description, priority, due date | Creator / Admin |
| `DELETE` | `/api/tasks/:id` | Delete task | Creator / Admin |
| `PATCH` | `/api/tasks/:id/status`| Update status (`TODO`, `DOING`, `DONE`) | Assignee / Admin |
| `PATCH` | `/api/tasks/:id/assign`| Assign/reassign task | Admin (any) / User (self-claim) |

### Activities (`/api/activities`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/activities` | List recent task lifecycle audit logs | Authenticated |

---

## Installation

### Clone repository
```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

### Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

### Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env.local
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000

# Administrator Seed Credentials
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@taskflow.com
ADMIN_PASSWORD=AdminPassword123!
```

> **Security Notice**: `.env` files are ignored by git in `.gitignore` and must never be committed to source control. Use `.env.example` as a template.

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Running Locally

### 1. Seed the Database
```bash
cd backend
npm run seed:admin
```
*Note: If `MONGODB_URI` is left blank, TaskFlow automatically starts an in-memory MongoDB instance for instantaneous zero-setup local execution.*

### 2. Start Backend Server
```bash
cd backend
npm run dev
```
Server runs at `http://localhost:5000` (Health Check: `http://localhost:5000/health`).

### 3. Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs at `http://localhost:3000`.

---

## Admin Account

Per assignment requirements, administrators cannot self-register through public forms. Administrators are created strictly via database seeding:

```bash
npm run seed:admin
```

- **Email**: `admin@taskflow.com`
- **Password**: `AdminPassword123!`
- **Role**: `admin`

Passwords are dynamically hashed using `bcrypt` prior to database insertion.

---

## Production Deployment Architecture

The application is deployed across high-availability serverless infrastructure:

- **Frontend Application**: Deployed on **Vercel** with Next.js App Router edge caching.
  - Live URL: [https://taskflow-brown-sigma.vercel.app](https://taskflow-brown-sigma.vercel.app)
  - Environment Variable: `NEXT_PUBLIC_API_URL=https://taskflow-usiv.vercel.app/api`
- **Backend API**: Deployed on **Vercel Serverless Functions** (`backend/vercel.json`).
  - Live URL: [https://taskflow-usiv.vercel.app](https://taskflow-usiv.vercel.app)
  - Health Endpoint: [https://taskflow-usiv.vercel.app/health](https://taskflow-usiv.vercel.app/health)
  - Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- **Database**: **MongoDB Atlas** M0 Cloud Cluster (High Availability, Automated Indexing).

---

## Automated QA & Verification Suite

TaskFlow includes an end-to-end automated test runner that verifies 13 distinct security, authorization, and mutation checkpoints against the live production environment:

```bash
# Run the automated QA test suite
node backend/test_production.js
```

### Test Coverage (13 / 13 Passing)
- `[01]` Server Root Endpoint Status
- `[02]` Admin Login (`admin@taskflow.com`)
- `[03]` Member Login (`alex@taskflow.com`)
- `[04]` Dynamic User Registration (New Member)
- `[05]` Fetch Kanban Tasks List (Authenticated)
- `[06]` Task Creation with Priority HIGH & Due Date
- `[07]` Member Self-Claims Unassigned Task (RBAC Check)
- `[08]` Drag-and-Drop Pipeline Progression (`TODO` ➔ `DOING` ➔ `DONE`)
- `[09]` Admin Dynamic Task Reassignment & Unassignment
- `[10]` Activity & Audit Log Stream Verification
- `[11]` Admin User Directory & Workload Analytics
- `[12]` Security Guard: Normal User Blocked from `/api/users` (403 Forbidden)
- `[13]` Task Cleanup & Deletion

---

## Screenshots & UI Showcase

![TaskFlow Kanban Board](frontend/public/project_flow_board.jpg)

### 1. User Kanban Workspace (`/dashboard`)
*Interactive `@dnd-kit` drag-and-drop task board with live statistics, priority badges, and dynamic due date countdowns.*

### 2. Administrator Command Center (`/admin`)
*System-wide pipeline metrics, user allocation tables, recent activity audit feed, and radio-button reassignment modal.*

### 3. User Directory (`/admin/users`)
*Administrative user registry showing individual workload metrics, assigned tasks, and completed tasks.*

### 4. Wireframe-Compliant Login (`/login`)
*Clean SaaS authentication card with 1-click Demo Autofill switcher for instantaneous evaluation of Admin and Member roles.*

---

## Security

1. **HTTP Security Headers**: Express leverages `helmet` to mitigate XSS, clickjacking, and MIME sniffing attacks.
2. **Strict Server-Side Authorization**:
   - Creating a task as a normal user strictly forces `assignedUser = null`.
   - Direct API requests to assign tasks to other users return `403 Forbidden`.
   - Direct API requests by normal users to access `/api/users` return `403 Forbidden`.
3. **Password Security**: Strong salting and hashing via `bcryptjs`.
4. **Input Sanitization & Validation**: Powered by `zod` schemas on all request payloads.
5. **CORS Policies**: Explicit origin verification restricting access to approved frontend domains.

---

## Future Improvements
- [ ] Real-time WebSocket notifications via Socket.io for collaborative live updates.
- [ ] Task file attachments uploaded to AWS S3 / Cloudinary.
- [ ] Email notifications for task assignments and upcoming due dates.
- [ ] Column customization (add custom pipelines e.g., `IN REVIEW`, `QA`).

---

