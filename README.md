# LeadFlow AI ⚡
> **Smart CRM & Sales Workflow Platform for Manufacturing Teams**

LeadFlow AI is an enterprise-grade, premium Full-Stack MERN SaaS CRM engineered specifically for Manufacturing Business Development Associate (BDA) teams. Inspired by standard-setting tools like Linear, HubSpot, and Notion, it replaces generic admin grids with premium glassmorphic interfaces, responsive drawer navigation, custom Framer Motion animations, real-time BDA performance scorecards, draggable pipelines, and rule-based AI recommendations.

---

## 🌟 Premium Capabilities

### 1. Unified Dashboard Center
* **Live Counter Metrics**: Glassmorphic widgets displaying active leads, closed contracts, won contract volumes, and conversion metrics.
* **AI-Driven Recommendation Engine**: A server-side heuristics engine parsing pipelines to issue urgent sales tasks (e.g. idle high-value steel accounts, overdue follow-ups, conversion optimizations).
* **Interactive Data Visualizations**: Recharts Area charts tracking monthly sales velocity and Bar charts mapping volumetric stage distributions (New -> Won).
* **Activity Audit Streams**: Collaborative timeline detailing recent actions across pipelines.

### 2. JWT Access Gatekeeper
* **Role Enforcement Layer**: Dedicated views for BDA Employees, Team Leaders, and Administrators.
* **Security Standards**: Encrypted credentials (using BCrypt) and JWT validations stored in secure HTTP-only cookies.
* **1-Click Recruiter Fast-Login**: Seamless, single-tap credential shortcuts to test different role dashboards instantly.

### 3. Draggable Kanban Pipelines
* **Fluid Card Movement**: Custom HTML5 Drag & Drop integrated with Framer Motion layout transitions. Cards slide out of the way and snap cleanly into columns.
* **Visual Alert Cues**: High, Medium, and Low priority flames alongside BDA assignments and deal tags.
* **Automatic Statistics Syncer**: Moving leads immediately recalculates sales metrics, active pipelines, and BDA productivity indexes.

### 4. BDA Collaboration Directory
* **Client History Audits**: Detailed side-drawers for every lead record tracking communication histories.
* **Inline Discussion Threads**: Built-in messaging panels enabling associates to collaborate on orders.
* **CSV Export Engine**: Instantly downloads structured pipelines in standard CSV formats.

### 5. Task checklists
* **Follow-up Trackers**: Dynamic checklists categorized by priority.
* **Overdue Warnings**: Highlights missed deadlines to maintain pipeline velocity.

---

## 🛠️ Technical Stack

| Component | Framework / Library |
| :--- | :--- |
| **Frontend** | React.js (Vite), Tailwind CSS v3, Framer Motion, Recharts, Axios, React Hot Toast, Lucide Icons |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose ODM), JSON Web Tokens (JWT), BcryptJS, Cookie Parser |
| **Deploy Ready** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database Cloud) |

---

## 📂 Project Architecture

```
Mern_Stack_Project/
├── client/                      # Vite + React Frontend
│   ├── src/
│   │   ├── assets/              # Static vector shapes
│   │   ├── components/          # Reusable UI (Modals, Loaders, Sidebar, Navbar)
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── layouts/             # DashboardLayout (Route protection & navigation)
│   │   ├── pages/               # Dashboard, Kanban, LeadsTable, Tasks, TeamHub, Settings
│   │   ├── index.css            # Tailwind directives, Glassmorphism, scrollbars
│   │   ├── main.jsx             # DOM Bootstrapper
│   │   └── App.jsx              # Routes tree & role protectors
│   ├── tailwind.config.js       # Dark class setups & colors
│   └── postcss.config.js        
├── server/                      # Node.js + Express MVC Backend
│   ├── config/                  # MongoDB database pooling
│   ├── controllers/             # Auth, Leads, Tasks, Team, Analytics
│   ├── middleware/              # JWT validations & Role authorization guards
│   ├── models/                  # User, Lead, Task, Activity, Notification, Comment Schemas
│   ├── routes/                  # Modular express routing sub-paths
│   ├── scripts/                 # seed.js (Real-world manufacturing mock data seeder)
│   ├── app.js                   # Express middlewares & routes mapping
│   ├── server.js                # Server listener port runner
│   └── .env                     # Configuration keys
```

---

## 🚀 Installation & Local Launch

### Prerequisites
* **Node.js** (v16.x or newer recommended)
* **MongoDB** (Local Service running or a MongoDB Atlas Cloud URI)

### Step 1: Configure Environment Variables
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/leadflow-ai
JWT_SECRET=leadflow_secret_key_12345
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Step 2: Set up & Boot Backend Server
Open your terminal inside the `server/` directory and execute:
```bash
# Install dependencies
npm install

# Seed the database with high-end manufacturing leads and BDA accounts
npm run seed

# Launch developer dev server (using nodemon)
npm run dev
```

### Step 3: Set up & Boot Frontend Client
Open a second terminal inside the `client/` directory and execute:
```bash
# Install dependencies
npm install

# Start developer server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🔑 Recruiter Fast-Login Accounts
Our database seeder pre-fills three accounts to help you evaluate the application across different access levels:

| Role | Email | Password | Scope Access |
| :--- | :--- | :--- | :--- |
| **Senior BDA Associate** | `bda@leadflow.com` | `password123` | Personal assigned pipelines, Kanban moves, Task lists, Personal stats |
| **Sales Team Leader** | `leader@leadflow.com` | `password123` | Global lead listings, BDA allocations, Team directories, recalculate scores |
| **Managing Director/Admin** | `admin@leadflow.com` | `password123` | Global controls, remove team accounts, CRUD setups, CSV backups |

---

## 📡 Primary REST API Routes

### 🔓 Public Auth Enpoints
* `POST /api/auth/register` - Create BDA account
* `POST /api/auth/login` - Authenticate & retrieve secure JWT cookies

### 🔐 Protected Workspace Enpoints (Requires Bearer Token or Cookie JWT)
* `GET /api/auth/me` - Retrieve active profile session details
* `PUT /api/auth/updatedetails` - Update name, email, avatar image
* `PUT /api/auth/updatepassword` - Modify account credentials
* `GET /api/leads` - Search, filter, and compile lead records
* `POST /api/leads` - Add sales lead (BDA autosets as owner)
* `PUT /api/leads/:id` - Edit lead detail parameters (e.g. status pipelines)
* `DELETE /api/leads/:id` - Delete record (*Restricted: Leader/Admin only*)
* `GET /api/leads/export/csv` - Exporter engine
* `POST /api/leads/:id/comments` - Post update on lead thread
* `GET /api/tasks` - Filter follow-ups and due schedules
* `POST /api/tasks` - Add task (triggers notification alerts)
* `PUT /api/tasks/:id` - Toggle complete or update assignee
* `GET /api/team` - List BDA directories
* `POST /api/team` - Register new associate (*Restricted: Leader/Admin only*)
* `DELETE /api/team/:id` - Deactivate staff account (*Restricted: Admin only*)
* `PUT /api/team/:id/recalculate` - Force refresh of BDA index scores
* `GET /api/analytics/dashboard` - Visual chart pipelines and smart AI insights

---

## 🌐 Cloud Deployment Instructions

### Frontend (Vercel)
1. Install Vercel CLI or link your Git repository to Vercel.
2. Set the **Build Command** to `npm run build` and **Output Directory** to `dist`.
3. Add the Environment Variable `VITE_API_URL` pointing to your deployed backend URL.

### Backend (Render / Heroku)
1. Link your repository containing the `server/` directory.
2. Set **Root Directory** as `server`.
3. Set **Start Command** as `npm start`.
4. Inject your environment variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`) inside the Service Variables settings.
