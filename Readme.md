<div align="center">

#  Vicharanshala — Crowd-Sourced FAQ Generation Platform

**A community-driven FAQ platform where users can ask questions, share answers, and help build a searchable knowledge base together.**

*Search. Ask. Answer. Improve*

---

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub Stars](https://img.shields.io/github/stars/aftab-ansari2005/Vicharanshala-FAQ-Generation?style=social)](https://github.com/aftab-ansari2005/Vicharanshala-FAQ-Generation)

</div>

---

## 📖 Table of Contents

- [Project Description](#-project-description)
- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Installation Guide](#-installation-guide)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [User Workflow](#-user-workflow)
- [Admin Workflow](#-admin-workflow)
- [Future Enhancements](#-future-enhancements)
- [Security Considerations](#-security-considerations)
- [Performance Optimizations](#-performance-optimizations)
- [Deployment Guide](#-deployment-guide)
- [Contributing](#-contributing)
- [Code of Conduct](#-code-of-conduct)
- [License](#-license)
- [Authors](#-authors)
- [Acknowledgements](#-acknowledgements)

---

##  Project Description

**Vicharanshala** (विचारशाला — *"House of Thoughts"* in Sanskrit) is a community-driven FAQ platform built to help people ask questions, share knowledge, and find answers more easily.

Instead of relying on a single administrator to manage all content, Vicharanshala allows the community to contribute, improve, and organize information together. Users can ask questions, post answers, vote on helpful content, and discover relevant discussions through search and recommendations.

The platform is designed for developer communities, educational groups, open-source projects, and any organization that wants a structured and searchable knowledge base.

To make content discovery more useful, Vicharanshala tracks search activity and user engagement. Features like **Popular Right Now** highlight topics that people are actively searching for, helping users find relevant information faster.

The project includes authentication, moderation tools, full-text search, role-based access control, analytics, and a complete admin dashboard, making it suitable for both learning purposes and real-world deployments.


---

##  Problem Statement

Most FAQ systems suffer from the same fundamental flaws:

| Problem | Impact |
|---|---|
|  **Admin bottleneck** | Only one person maintains FAQs; knowledge goes stale |
|  **Undiscoverable content** | Great answers get buried; no signal of what's actually useful |
|  **No quality signal** | All FAQs look equal regardless of accuracy or helpfulness |
|  **Poor organization** | FAQs aren't categorized, tagged, or searchable |
|  **No community ownership** | Users can't improve answers or flag outdated content |

---

##  Solution Overview

Vicharanshala solves these problems through:

- **Collective authorship** — any user can ask and answer questions
- **Reputation-weighted votes** — community upvotes/downvotes surface the best content
- **Search-signal ranking** — the "Popular Right Now" section uses real search frequency data from the past 7 days, not just recency
- **Multi-signal trending score** — a composite algorithm combining votes, views, search clicks, answers, and time-decay
- **Admin + moderator controls** — a full dashboard for content governance
- **MongoDB full-text search** — sub-50ms search across titles, descriptions, and tags with weighted scoring

---

## Key Features

### User Features

* JWT-based authentication with access and refresh tokens
* User profiles with avatar, bio, and reputation
* Reputation system based on community interactions
* Track questions asked and answers contributed

### FAQ Management

* Create and edit FAQs using Markdown
* Organize content with categories and tags
* Filter questions by category or tags
* Question status management for moderation

### Search & Discovery

* Full-text search powered by MongoDB
* Popular and trending questions based on user activity
* Search history for logged-in users
* Filter and sort content by relevance, popularity, views, and more
* Report unanswered searches to highlight missing topics

### Community Interaction

* Upvote and downvote questions and answers
* Accept answers to mark the best solution
* Community-driven ranking of content

### Moderation & Administration

* Admin dashboard for platform management
* Role-based access control (User, Moderator, Admin)
* Soft-delete functionality for content moderation
* Moderator tools for editing and managing questions

### Analytics

* Platform-wide statistics and activity tracking
* Trending search queries
* Search click tracking
* Question views and engagement metrics

---

## Screenshots

Screenshots will be added soon.

Run the project locally using:

```bash
npm run dev
```

| Page            | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| Home            | Search interface, popular questions, and most-voted content |
| Search          | Full-text search results and filters                        |
| Question Detail | Question discussion, answers, voting, and related content   |
| Browse FAQs     | Browse questions by category, tags, and sorting options     |
| Profile         | User profile, reputation, and contribution history          |
| Admin Dashboard | Statistics, user management, and moderation tools           |

---


##  System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (React + Vite)               │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐   │
│  │  Pages   │  │Components│  │  Services (Axios)    │   │
│  │ HomePage │  │QuestionCard│ │  questionsApi       │   │
│  │ SearchPg │  │SearchBar  │ │  searchApi          │   │
│  │ AdminDash│  │VoteButtons│ │  authApi            │   │
│  └──────────┘  └──────────┘  └─────────────────────┘   │
│                    Zustand Store + React Query           │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP (REST API)
┌─────────────────────▼───────────────────────────────────┐
│                  SERVER (Express + TypeScript)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Auth    │  │Questions │  │  Search  │              │
│  │  Module  │  │  Module  │  │  Module  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Votes   │  │ Answers  │  │  Admin   │              │
│  │  Module  │  │  Module  │  │  Module  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│         Helmet · CORS · Rate Limiting · JWT              │
└─────────────────────┬───────────────────────────────────┘
                      │ Mongoose ODM
┌─────────────────────▼───────────────────────────────────┐
│                  MongoDB (Atlas or Local)                │
│   Collections: users · questions · answers              │
│                votes · categories · searchlogs          │
│                unansweredsearches · notifications        │
│                                                          │
│   Indexes: $text (questions), trendingScore,            │
│            searchClickCount, voteScore, createdAt       │
└─────────────────────────────────────────────────────────┘
```

---

##  Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19 | UI framework |
| [TypeScript](https://typescriptlang.org) | ~6.0 | Type safety |
| [Vite](https://vitejs.dev) | 8 | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | 3.4 | Utility-first styling |
| [Framer Motion](https://framer.motion.com) | 12 | Animations & transitions |
| [TanStack Query](https://tanstack.com/query) | 5 | Server state, caching |
| [Zustand](https://zustand-demo.pmnd.rs) | 5 | Client-side global state |
| [React Router DOM](https://reactrouter.com) | 6 | Client-side routing |
| [Axios](https://axios-http.com) | 1 | HTTP client |
| [React Hook Form](https://react-hook-form.com) | 7 | Form management |
| [Zod](https://zod.dev) | 4 | Schema validation |
| [Lucide React](https://lucide.dev) | latest | Icon library |
| [date-fns](https://date-fns.org) | 4 | Date formatting |
| [react-markdown](https://remarkjs.github.io/react-markdown) | 10 | Markdown rendering |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org) | 20 | Runtime |
| [Express.js](https://expressjs.com) | 4 | Web framework |
| [TypeScript](https://typescriptlang.org) | 5 | Type safety |
| [MongoDB](https://mongodb.com) | 7 | NoSQL database |
| [Mongoose](https://mongoosejs.com) | 8 | ODM |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9 | JWT auth |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 2 | Password hashing |
| [Helmet](https://helmetjs.github.io) | 7 | HTTP security headers |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | 7 | API rate limiting |
| [express-mongo-sanitize](https://github.com/fiznool/express-mongo-sanitize) | 2 | NoSQL injection protection |
| [express-validator](https://express-validator.github.io) | 7 | Input validation |
| [Multer](https://github.com/expressjs/multer) | 1 | File upload handling |
| [Morgan](https://github.com/expressjs/morgan) | 1 | HTTP request logging |

### DevOps & Tooling

| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Containerised local development |
| Nodemon + ts-node | Hot-reload dev server |
| ESLint | Code quality |
| Concurrently | Run client + server in parallel |

---

## 📁 Folder Structure

```
Vicharanshala-FAQ-Generation/
│
├── 📄 package.json              # Root scripts (dev, seed, build)
├── 📄 docker-compose.yml        # Full-stack Docker config
├── 📄 start.sh                  # One-command local startup
├── 📄 .gitignore
│
├── 📂 client/                   # React frontend (Vite)
│   ├── 📄 index.html
│   ├── 📄 vite.config.ts
│   ├── 📄 tailwind.config.js
│   └── 📂 src/
│       ├── 📄 App.tsx           # Router setup
│       ├── 📄 main.tsx          # Entry point
│       ├── 📄 index.css         # Global styles + design tokens
│       │
│       ├── 📂 components/
│       │   ├── answers/         # AnswerForm
│       │   ├── auth/            # AuthModal (login/signup)
│       │   ├── common/          # Skeletons, EmptyState, SectionHeader
│       │   ├── layout/          # Navbar, Footer, PageLayout
│       │   ├── questions/       # QuestionCard
│       │   ├── search/          # SearchBar
│       │   └── votes/           # VoteButtons
│       │
│       ├── 📂 pages/
│       │   ├── HomePage.tsx         # Hero + Popular Right Now + Most Voted
│       │   ├── SearchPage.tsx       # Full-text search results
│       │   ├── QuestionDetailPage.tsx
│       │   ├── QuestionsPage.tsx    # Browse + filter
│       │   ├── AskQuestionPage.tsx
│       │   ├── CategoriesPage.tsx
│       │   ├── CategoryDetailPage.tsx
│       │   ├── ProfilePage.tsx
│       │   ├── CommunityPage.tsx
│       │   └── AdminDashboard.tsx
│       │
│       ├── 📂 services/         # Axios API clients
│       │   ├── questions.service.ts
│       │   ├── answers.service.ts
│       │   ├── search.service.ts
│       │   ├── auth.service.ts
│       │   ├── categories.service.ts
│       │   └── admin.service.ts
│       │
│       ├── 📂 store/
│       │   ├── authStore.ts     # Zustand auth state
│       │   └── uiStore.ts       # Modal / UI state
│       │
│       └── 📂 types/
│           └── index.ts         # Shared TypeScript interfaces
│
└── 📂 server/                   # Node.js + Express backend
    ├── 📄 package.json
    ├── 📄 tsconfig.json
    ├── 📄 .env.example
    └── 📂 src/
        ├── 📄 index.ts          # Express app bootstrap
        │
        ├── 📂 config/
        │   ├── db.ts            # MongoDB connection
        │   └── storage.ts       # Multer / file upload config
        │
        ├── 📂 middlewares/
        │   ├── auth.middleware.ts    # JWT verification
        │   └── error.middleware.ts   # Global error handling
        │
        ├── 📂 models/
        │   ├── User.ts
        │   ├── Question.ts          # + searchClickCount + trendingScore
        │   ├── Answer.ts
        │   ├── Vote.ts
        │   ├── Category.ts
        │   ├── SearchLog.ts         # + UnansweredSearch
        │   └── Notification.ts
        │
        ├── 📂 modules/              # Feature modules (controller + routes)
        │   ├── auth/
        │   ├── users/
        │   ├── questions/           # + getMostSearched + recordSearchClick
        │   ├── answers/
        │   ├── votes/
        │   ├── categories/
        │   ├── search/
        │   ├── admin/
        │   └── recommendations/
        │
        ├── 📂 utils/
        │   ├── helpers.ts           # Pagination, success response
        │   └── jwt.ts               # Token generation / verification
        │
        └── 📂 scripts/
            ├── seed.ts              # General seed (users, categories, questions)
            └── seed-vins-faqs.ts    # Domain-specific FAQ seed
```

---

##  Installation Guide

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) `>= 20.x`
- [npm](https://www.npmjs.com/) `>= 10.x`
- [MongoDB](https://www.mongodb.com/) `>= 7.x` (local) **or** a [MongoDB Atlas](https://cloud.mongodb.com) connection string
- [Git](https://git-scm.com/)
- *(Optional)* [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 1. Clone the Repository

```bash
git clone https://github.com/aftab-ansari2005/Vicharanshala-FAQ-Generation.git
cd Vicharanshala-FAQ-Generation
```

### 2. Install All Dependencies

```bash
npm run install:all
```

This installs dependencies for the root, `server/`, and `client/` in one command.

---

##  Environment Variables

### Server — `server/.env`

Copy the example file and fill in your values:

```bash
cp server/.env.example server/.env
```

```env
# ─── Server ───────────────────────────────────────────
PORT=5001
NODE_ENV=development

# ─── Database ─────────────────────────────────────────
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/samagama
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/samagama

# ─── JWT ──────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ─── CORS ─────────────────────────────────────────────
CLIENT_URL=http://localhost:5173

# ─── File Upload ──────────────────────────────────────
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### Client — `client/.env`

```env
VITE_API_URL=/api/v1
VITE_APP_NAME=Vicharanshala
VITE_APP_DESCRIPTION=The intelligent, community-driven FAQ platform
```

>  **Never commit `.env` files.** They are excluded by `.gitignore`.

---

##  Running Locally

### Option A — One Command (Recommended)

```bash
# From project root
npm run dev
```

This runs the backend and frontend concurrently using `concurrently`.

| Service | URL |
|---|---|
|  Frontend | http://localhost:5173 |
|  Backend API | http://localhost:5001/api/v1 |
|  Health Check | http://localhost:5001/health |

### Option B — Seed the Database

After the server starts, populate it with sample data:

```bash
# Seed default users, categories, and 8 sample questions
npm run seed

# Seed additional domain-specific FAQs
npm run seed:vins

# Run both seeds
npm run seed:all
```

**Seeded credentials:**

| Role | Email | Password |
|---|---|---|
| 🔴 Admin | `admin@samagama.dev` | `admin123` |
| 🟡 Moderator | `mod@samagama.dev` | `mod123` |
| 🟢 User | `user@samagama.dev` | `user123` |

### Option C — Docker Compose

```bash
docker compose up --build
```

This starts MongoDB, the Express server, and the Vite client — all in isolated containers with health checks and volume mounts for hot-reload.

```bash
# Stop all containers
docker compose down

# Wipe data volumes too
docker compose down -v
```

---

##  API Endpoints

Base URL: `http://localhost:5001/api/v1`

### Authentication

| Method | Endpoint         | Auth Required | Description                                       |
| ------ | ---------------- | ------------- | ------------------------------------------------- |
| `POST` | `/auth/register` | No            | Create a new user account                         |
| `POST` | `/auth/login`    | No            | Sign in and receive access and refresh tokens     |
| `POST` | `/auth/refresh`  | No            | Generate a new access token using a refresh token |
| `POST` | `/auth/logout`   | Yes           | End the current user session                      |
| `GET`  | `/auth/me`       | Yes           | Retrieve details of the authenticated user        |


### Questions

| Method   | Endpoint                      | Auth Required | Description                                                                  |
| -------- | ----------------------------- | ------------- | ---------------------------------------------------------------------------- |
| `GET`    | `/questions`                  | Optional      | Retrieve a list of questions with filtering, sorting, and pagination support |
| `POST`   | `/questions`                  | Yes           | Create a new question                                                        |
| `GET`    | `/questions/trending`         | No            | Get questions sorted by trending score                                       |
| `GET`    | `/questions/popular`          | No            | Get questions sorted by vote score                                           |
| `GET`    | `/questions/most-searched`    | No            | Retrieve questions based on search frequency from the last 7 days            |
| `GET`    | `/questions/:id`              | Optional      | Retrieve details of a specific question                                      |
| `PATCH`  | `/questions/:id`              | Yes           | Update a question (owner or moderator only)                                  |
| `DELETE` | `/questions/:id`              | Yes           | Soft-delete a question                                                       |
| `GET`    | `/questions/:id/related`      | No            | Retrieve related questions based on category and tags                        |
| `POST`   | `/questions/:id/view`         | No            | Record a question view                                                       |
| `POST`   | `/questions/:id/search-click` | No            | Record a click from search results                                           |


**Query parameters for `GET /questions`:**

```
?sort=recent|popular|trending|views|unanswered
?category=<slug-or-id>
?tags=react,typescript
?page=1&limit=10
```

### Answers

| Method   | Endpoint                        | Auth Required | Description                                       |
| -------- | ------------------------------- | ------------- | ------------------------------------------------- |
| `GET`    | `/answers/question/:questionId` | No            | Retrieve all answers for a specific question      |
| `POST`   | `/answers`                      | Yes           | Submit a new answer                               |
| `PATCH`  | `/answers/:id/accept`           | Yes           | Mark an answer as accepted (question author only) |
| `DELETE` | `/answers/:id`                  | Yes           | Delete an answer (owner or moderator only)        |

### Votes

| Method | Endpoint              | Auth Required | Description                                    |
| ------ | --------------------- | ------------- | ---------------------------------------------- |
| `POST` | `/votes/question/:id` | Yes           | Upvote or downvote a question                  |
| `GET`  | `/votes/question/:id` | Yes           | Retrieve the current user's vote on a question |
| `POST` | `/votes/answer/:id`   | Yes           | Upvote or downvote an answer                   |


### Search

| Method | Endpoint                    | Auth Required | Description                                                     |
| ------ | --------------------------- | ------------- | --------------------------------------------------------------- |
| `GET`  | `/search?q=...`             | Optional      | Perform a full-text search across questions and related content |
| `GET`  | `/search/trending`          | No            | Retrieve the most searched queries from the last 7 days         |
| `GET`  | `/search/recent`            | Yes           | Retrieve the authenticated user's recent search history         |
| `POST` | `/search/report-unanswered` | Optional      | Report a search query that returned no relevant results         |

### Categories

| Method  | Endpoint            | Auth Required | Description                                   |
| ------- | ------------------- | ------------- | --------------------------------------------- |
| `GET`   | `/categories`       | No            | Retrieve all available categories             |
| `GET`   | `/categories/:slug` | No            | Retrieve details of a category using its slug |
| `POST`  | `/categories`       | Admin         | Create a new category                         |
| `PATCH` | `/categories/:id`   | Admin         | Update an existing category                   |

### Admin

| Method | Endpoint            | Auth Required | Description                                      |
| ------ | ------------------- | ------------- | ------------------------------------------------ |
| `GET`  | `/admin/stats`      | Admin         | Retrieve platform-wide statistics and metrics    |
| `GET`  | `/admin/unanswered` | Admin         | View unanswered search queries reported by users |
| `GET`  | `/admin/users`      | Admin         | Retrieve a list of registered users              |


**Example — Search Request:**

```bash
curl "http://localhost:5001/api/v1/search?q=jwt+refresh+token&page=1&limit=5"
```

**Example — Create Question:**

```bash
curl -X POST http://localhost:5001/api/v1/questions \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How do I implement JWT refresh token rotation?",
    "description": "## Problem\n\nI need to implement...",
    "categoryId": "<category_id>",
    "tags": ["jwt", "nodejs", "security"]
  }'
```

---

##  Database Schema

### `users`

| Field | Type | Notes |
|---|---|---|
| `username` | String | Unique, indexed |
| `email` | String | Unique, indexed |
| `passwordHash` | String | bcrypt, 12 rounds |
| `role` | Enum | `user \| moderator \| admin` |
| `reputation` | Number | Increases with upvotes |
| `bio` | String | Profile bio |
| `avatar` | String | URL or filename |
| `questionCount` | Number | Denormalized counter |
| `answerCount` | Number | Denormalized counter |
| `createdAt` | Date | Auto |

### `questions`

| Field | Type | Notes |
|---|---|---|
| `title` | String | 10–300 chars |
| `description` | String | Markdown, 20–10,000 chars |
| `category` | ObjectId | Ref: Category |
| `tags` | [String] | Max 5 |
| `author` | ObjectId | Ref: User |
| `upvotes` | Number | Counter |
| `downvotes` | Number | Counter |
| `voteScore` | Number | `upvotes − downvotes` |
| `viewCount` | Number | Total page visits |
| `clickCount` | Number | Total clicks |
| `searchClickCount` | Number | Clicks from search results |
| `answerCount` | Number | Denormalized |
| `trendingScore` | Number | Composite ranking score |
| `status` | Enum | `open \| closed \| deleted` |

**Indexes:** `$text(title,description,tags)`, `trendingScore`, `voteScore`, `searchClickCount`, `createdAt`, `category+status`

### `searchlogs`

| Field | Type | Notes |
|---|---|---|
| `query` | String | Lowercased search term |
| `userId` | ObjectId | Optional, ref: User |
| `resultsCount` | Number | How many results were returned |
| `createdAt` | Date | Used for time-window aggregation |

### `answers`

| Field | Type | Notes |
|---|---|---|
| `questionId` | ObjectId | Ref: Question |
| `content` | String | Markdown |
| `author` | ObjectId | Ref: User |
| `upvotes` | Number | |
| `downvotes` | Number | |
| `voteScore` | Number | |
| `isAccepted` | Boolean | Accepted by question author |

---

##  User Workflow

```
1. Register / Login
        │
        ▼
2. Search for a question
        │
        ├── Found? ──► Click result (search-click tracked) ──► Read & Vote
        │
        └── Not Found? ──► Report Unanswered OR Ask a New Question
                                                    │
                                                    ▼
                                        3. Post Question (title + markdown description + category + tags)
                                                    │
                                                    ▼
                                        4. Community answers the question
                                                    │
                                                    ▼
                                        5. Upvote the best answer
                                                    │
                                                    ▼
                                        6. Question author accepts best answer ✓
```

---

##  Admin Workflow

```
Admin Dashboard
      │
      ├── View site stats (questions, answers, users, votes)
      │
      ├── View top unanswered searches → create missing FAQs
      │
      ├── Manage users → promote to moderator / ban
      │
      └── Moderate questions → close, delete, or edit
```

---

## Future Enhancements

| Feature                      | Priority | Description                                                        |
| ---------------------------- | -------- | ------------------------------------------------------------------ |
| AI-Assisted FAQ Suggestions  | High     | Suggest possible answers for unanswered questions using AI models  |
| Duplicate Question Detection | High     | Identify similar questions before they are posted                  |
| Real-Time Notifications      | Medium   | Notify users about answers, votes, and activity updates            |
| Multi-Language Support       | Medium   | Support content in multiple languages, including Hindi and English |
| Gamification                 | Medium   | Introduce badges, achievements, and contribution milestones        |
| Import / Export              | Low      | Export and import FAQ data in CSV or JSON format                   |
| Dark Mode                    | Low      | Add a theme switch for light and dark modes                        |
| FAQ Collections              | Low      | Organize related FAQs into curated topic-based collections         |
| Mobile Application           | Future   | Dedicated mobile app built on the existing API                     |


---

##  Security Considerations

The platform implements multiple layers of defense:

| Layer | Mechanism |
|---|---|
| **Auth** | JWT access (15m) + HttpOnly refresh cookie (7d) with rotation |
| **Password** | bcrypt with 12 salt rounds |
| **Rate Limiting** | 200 req/15min global · 10 req/15min for auth endpoints |
| **Injection** | `express-mongo-sanitize` blocks `$` and `.` in request bodies |
| **XSS** | `xss-clean` middleware + Helmet CSP headers |
| **CORS** | Allowlist-based origin validation |
| **Input Validation** | `express-validator` on all mutation endpoints |
| **HTTP Headers** | `helmet` sets X-Frame-Options, HSTS, X-Content-Type-Options |
| **File Uploads** | Multer with MIME type allowlist + 5MB size cap |

---

##  Performance Optimizations

| Optimization | Details |
|---|---|
| **MongoDB Indexes** | Compound + single field indexes on all hot query paths |
| **Text Search Weights** | Title (×10), Tags (×5), Description (×1) for relevance tuning |
| **TanStack Query Caching** | 5–10 min stale-time for trending/popular data |
| **Denormalized Counters** | `answerCount`, `questionCount` stored on documents (no aggregation on read) |
| **Async Score Updates** | `trendingScore` recomputed asynchronously after view/click events |
| **Lean Queries** | `.lean()` used on all read-heavy list endpoints (plain JS objects, no Mongoose overhead) |
| **Pagination** | All list endpoints paginated — default 10, max configurable |
| **Recency Decay** | Exponential decay `e^(-0.1 × ageInDays)` prevents old questions from permanently dominating trending |

---

##  Deployment Guide

### Deploy with Docker (any VPS / Cloud VM)

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Clone the repo
git clone https://github.com/aftab-ansari2005/Vicharanshala-FAQ-Generation.git
cd Vicharanshala-FAQ-Generation

# 3. Set production env vars
cp server/.env.example server/.env
# Edit server/.env with your MongoDB Atlas URI, strong JWT secrets, etc.

# 4. Start with Docker Compose
docker compose up -d --build

# 5. Check status
docker compose ps
docker compose logs -f server
```

### Deploy Backend to Railway / Render

1. Connect your GitHub repo
2. Set **root directory** → `server/`
3. Set **build command** → `npm run build`
4. Set **start command** → `npm start`
5. Add all env vars from `server/.env.example`

### Deploy Frontend to Vercel / Netlify

1. Connect your GitHub repo
2. Set **root directory** → `client/`
3. Set **build command** → `npm run build`
4. Set **output directory** → `dist/`
5. Add env var: `VITE_API_URL=https://your-backend-url/api/v1`

### Using MongoDB Atlas

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/samagama?retryWrites=true&w=majority
```

---

##  Contributing

Contributions are what make open-source communities thrive. Any contribution is **greatly appreciated**.

### Workflow

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/<your-username>/Vicharanshala-FAQ-Generation.git
cd Vicharanshala-FAQ-Generation

# 3. Create a feature branch
git checkout -b feat/your-feature-name

# 4. Install dependencies
npm run install:all

# 5. Make your changes & test locally
npm run dev

# 6. Commit using Conventional Commits format
git commit -m "feat: add bookmark FAQ functionality"

# 7. Push to your fork
git push origin feat/your-feature-name

# 8. Open a Pull Request on GitHub
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, no logic change |
| `refactor:` | Code change that's neither fix nor feature |
| `test:` | Adding/updating tests |
| `chore:` | Build process, deps, config |

### How to Contribute

We welcome contributions of all kinds. Here are a few ways you can help:

* Fix bugs and improve existing functionality
* Work on features listed in the [Future Enhancements](#future-enhancements) section
* Improve documentation and project guides
* Add translations and language support
* Enhance the user interface and user experience
* Write or improve test coverage
* Refactor code to improve readability and maintainability

Every contribution, whether big or small, helps make the project better.


---

##  Code of Conduct

This project follows the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct.

**In summary:**
- Be respectful and inclusive
- No harassment, discrimination, or personal attacks
- Constructive criticism only
- Report violations to the maintainers

---

##  License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Vicharanshala Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

See [LICENSE](LICENSE) for the full text.

---

##  Acknowledgements

- [MongoDB](https://www.mongodb.com) — for the excellent `$text` search and aggregation pipeline that powers the "most searched" algorithm
- [TanStack Query](https://tanstack.com/query) — for making server-state management feel effortless
- [Framer Motion](https://www.framer.com/motion/) — for the smooth animations
- [Tailwind CSS](https://tailwindcss.com) — for rapid, consistent UI development
- [Lucide Icons](https://lucide.dev) — for the beautiful icon set
- The open-source community — for making tools like these freely available

---

<div align="center">

**Built with ❤️ as a community knowledge platform**

*If this project helped you, please consider giving it a ⭐ on GitHub!*

[![GitHub Stars](https://img.shields.io/github/stars/aftab-ansari2005/Vicharanshala-FAQ-Generation?style=social)](https://github.com/aftab-ansari2005/Vicharanshala-FAQ-Generation)

</div>
