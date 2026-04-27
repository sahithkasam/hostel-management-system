# 🏨 Hostel Management System — Complete Project Explanation

> A full-stack web app to manage hostel rooms, students, and allocations.  
> **Tech Stack:** React · Vite · Node.js · Express · MongoDB · JWT

---

## 📦 1. What is This Project?

This is a **Hostel Management System** — a web application where:
- An **Admin** can manage rooms, students, and assign rooms to students
- A **Student** can register, log in and view their assigned room

The app has **two separate parts** running at the same time:

| Part | Technology | Runs on |
|------|-----------|---------|
| **Frontend** (what the user sees) | React + Vite | `http://localhost:5173` |
| **Backend** (business logic + database) | Node.js + Express | `http://localhost:5001` |
| **Database** (stores all data) | MongoDB | `mongodb://localhost:27017` |

---

## 🗂️ 2. Project Structure (Overview)

```
hostel-management-system-main/
└── Hostel_Management/
    ├── src/                    ← Frontend (React)
    │   ├── App.jsx             ← Root component, routing
    │   ├── main.jsx            ← Entry point 
    │   ├── contexts/
    │   │   └── AuthContext.jsx ← Global auth state
    │   └── components/
    │       ├── auth/           ← Login & Register pages
    │       ├── layout/         ← Shared navbar/sidebar
    │       ├── admin/          ← Admin dashboard pages
    │       └── student/        ← Student dashboard page
    └── server/                 ← Backend (Node.js)
        ├── server.js           ← Main server file
        ├── models/             ← Database schemas
        │   ├── User.js
        │   ├── Room.js
      │   ├── Allocation.js
      │   └── AiQueryLog.js
        ├── routes/             ← API endpoints
        │   ├── auth.js
        │   ├── users.js
        │   ├── rooms.js
      │   ├── allocations.js
      │   └── ai.js
      ├── services/
      │   ├── aiService.js    ← Groq integration + safety + fallback
      │   └── queryService.js ← Intent-to-query mapper
        └── middleware/
            └── auth.js         ← Token verification
```

---

## 🔧 3. Technologies Used — What They Do

### **React** (Frontend UI library)
- Builds the visible part of the app (buttons, forms, tables)
- Works with **components** — reusable pieces of UI
- Uses **state** to keep track of data (e.g., who is logged in)

### **Vite** (Build tool)
- A super-fast development server for React
- When you run `npm run dev`, Vite serves the frontend at port `5173`
- Much faster than older tools like Webpack

### **React Router DOM** (Frontend navigation)
- Adds page routes like `/login`, `/admin`, `/` without reloading the page
- Example: going to `/login` shows the Login component

### **Tailwind CSS** (Styling)
- A utility-first CSS framework
- Instead of writing `.button { color: blue }`, you write `className="text-blue-500"` directly in JSX

### **Lucide React** (Icons)
- A library of clean SVG icons used in the UI

### **Axios** (HTTP client for Frontend)
- Used to send API requests from the frontend to the backend
- Example: when you log in, Axios sends `POST /api/auth/login` to the server

### **Node.js** (Backend runtime)
- Runs JavaScript on the server (outside of a browser)
- Powers the backend of this app

### **Express.js** (Backend web framework)  
- A lightweight framework to define API routes
- Example: `app.use('/api/auth', authRoutes)` connects all auth endpoints

### **MongoDB** (Database)
- A NoSQL database that stores data in JSON-like documents
- Stores users, rooms, and allocations

### **Mongoose** (MongoDB ODM)
- A library that gives MongoDB a structure (schema)
- Defines what fields each document must have
- Example: A User must have `name`, `email`, `password`, and `role`

### **JWT — JSON Web Token** (Authentication)
- After login, the server generates a special token signed with a secret key
- This token is stored in the browser (`localStorage`)
- Every future request from the frontend sends this token in the `Authorization` header
- The server verifies the token — if valid, it knows who the user is

### **bcryptjs** (Password Security)
- Hashes passwords before saving them to the database
- Never stores plain-text passwords
- On login, it compares the entered password with the stored hash

### **dotenv** (Environment Variables)
- Reads sensitive config (like MongoDB URI and JWT secret) from a [.env](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/.env) file
- Keeps secrets out of the code

### **concurrently** (Dev tool)
- Runs both the frontend (`vite`) and backend (`node/nodemon`) together with one command: `npm run dev`

### **nodemon** (Dev tool)
- Automatically restarts the backend server when you edit a file

---

## 🗄️ 4. Database Models (MongoDB Schemas)

### **User Model** ([server/models/User.js](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/models/User.js))
Stores everyone who uses the system.

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Full name |
| `email` | String | Unique, used to log in |
| `password` | String | Hashed by bcrypt |
| `role` | String | `'admin'` or `'student'` |
| `studentId` | String | Unique student ID (students only) |
| `phone` | String | Phone number |
| `address` | String | Home address |
| `isActive` | Boolean | Can be deactivated by admin |
| `roomAllocation` | ObjectId | Reference to a `Room` document |

> **Special behavior**: Before saving, the `pre('save')` hook automatically hashes the password using bcrypt.

### **Room Model** ([server/models/Room.js](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/models/Room.js))
Stores all hostel rooms.

| Field | Type | Description |
|-------|------|-------------|
| `roomNumber` | String | Unique room identifier (e.g., `"101"`) |
| `floor` | Number | Which floor |
| `capacity` | Number | Max students (1–4) |
| `currentOccupancy` | Number | How many currently living there |
| `roomType` | String | `single` / `double` / `triple` / `quad` |
| `amenities` | String[] | e.g., `["AC", "WiFi", "Attached Bathroom"]` |
| `monthlyRent` | Number | Rent in rupees/month |
| `isActive` | Boolean | Whether room is usable |
| `residents` | ObjectId[] | Array of User IDs living in this room |

> **Virtual fields**: `isAvailable` (true if occupancy < capacity), `availableSpots` (capacity - occupancy) — computed, not stored in DB.

### **Allocation Model** ([server/models/Allocation.js](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/models/Allocation.js))
Records every room assignment made by the admin.

| Field | Type | Description |
|-------|------|-------------|
| `student` | ObjectId | Reference to a `User` |
| `room` | ObjectId | Reference to a `Room` |
| `allocatedBy` | ObjectId | Admin who made the allocation |
| `allocatedDate` | Date | When it was allocated |
| `status` | String | `active` / `vacated` / `suspended` |
| `startDate` | Date | When student moves in |
| `endDate` | Date | When student moves out |
| `monthlyRent` | Number | Rent at time of allocation |
| `notes` | String | Any extra notes |

---

## 🔌 5. How Frontend Connects to Backend

The connection is simple: **HTTP API calls using Axios**.

```
Browser (React on :5173)
        |
        | Axios: POST http://localhost:5001/api/auth/login
        |
Express Server (Node.js on :5001)
        |
        | Mongoose query
        |
MongoDB (27017)
```

### Authorization Header Flow

```
1. User logs in → Server returns a JWT token
2. Token saved in localStorage
3. Axios is configured: axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
4. Every future API call automatically includes the token in the header
5. The backend middleware reads and verifies this token on every protected route
```

---

## 🛣️ 6. Backend API Routes

### Auth Routes (`/api/auth`)

| Method | Endpoint | Protection | What it does |
|--------|----------|-----------|-------------|
| `POST` | `/api/auth/register` | None | Create a new user account |
| `POST` | `/api/auth/login` | None | Log in, returns JWT token |
| `GET`  | `/api/auth/me` | [auth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#4-25) | Get currently logged-in user profile |

### User Routes (`/api/users`)

| Method | Endpoint | Protection | What it does |
|--------|----------|-----------|-------------|
| `GET` | `/api/users` | [adminAuth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#26-38) | List all users (with search & pagination) |
| `GET` | `/api/users/:id` | [adminAuth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#26-38) | Get one user by ID |
| `PUT` | `/api/users/:id` | [adminAuth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#26-38) | Update user info |
| `DELETE` | `/api/users/:id` | [adminAuth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#26-38) | Delete a user |

### Room Routes (`/api/rooms`)

| Method | Endpoint | Protection | What it does |
|--------|----------|-----------|-------------|
| `GET` | `/api/rooms` | [auth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#4-25) | List rooms (filter by type, floor, availability) |
| `POST` | `/api/rooms` | [adminAuth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#26-38) | Create a new room |
| `PUT` | `/api/rooms/:id` | [adminAuth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#26-38) | Update room details |
| `GET` | `/api/rooms/:id` | [auth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#4-25) | Get one room with its residents |

### Allocation Routes (`/api/allocations`)

| Method | Endpoint | Protection | What it does |
|--------|----------|-----------|-------------|
| `GET` | `/api/allocations` | [adminAuth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#26-38) | List all allocations |
| `POST` | `/api/allocations` | [adminAuth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#26-38) | Assign a room to a student |
| `PUT` | `/api/allocations/:id` | [adminAuth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#26-38) | Update allocation (vacate, suspend) |
| `GET` | `/api/allocations/my-allocation` | [auth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#4-25) | Student views their own allocation |

---

## 🔐 7. Authentication & Middleware

### Two middleware functions in [server/middleware/auth.js](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js):

**[auth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#4-25)** (any logged-in user):
1. Reads the `Authorization: Bearer <token>` header
2. Verifies the JWT token using `JWT_SECRET`
3. Looks up the user in the database
4. Attaches the user object to `req.user`
5. Calls `next()` to continue to the route handler

**[adminAuth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#26-38)** (admins only):
1. Runs [auth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#4-25) first
2. Then checks if `req.user.role === 'admin'`
3. If not admin → 403 Forbidden
4. If admin → passes through to route handler

### Token Expiration
- JWT tokens expire after **7 days** (`expiresIn: '7d'`)
- If a 401 error is returned, the Axios interceptor in [AuthContext.jsx](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/contexts/AuthContext.jsx) automatically calls [logout()](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/contexts/AuthContext.jsx#97-102), clearing the token and redirecting to login

---

## ⚛️ 8. Frontend Architecture

### Entry Point Flow

```
index.html
  └── main.jsx           (mounts React app)
        └── App.jsx       (Router + AuthProvider wrapper)
              └── AppRoutes  (defines URL routes)
                    ├── /login     → Login.jsx
                    ├── /register  → Register.jsx
                    └── /          → Layout.jsx
                                        ├── AdminDashboard.jsx  (if admin)
                                        └── StudentDashboard.jsx (if student)
```

### [AuthContext.jsx](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/contexts/AuthContext.jsx) — Global Auth State
- A **React Context** that wraps the entire app
- Provides `user`, `loading`, [login()](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/contexts/AuthContext.jsx#58-78), [register()](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/contexts/AuthContext.jsx#79-96), [logout()](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/contexts/AuthContext.jsx#97-102) to any component
- On app load, it checks `localStorage` for a saved token and verifies it with `/api/auth/me`
- Any component can call `const { user } = useAuth()` to know who is logged in

### [App.jsx](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/App.jsx) — Routing & Route Protection
- Uses **React Router** to define URL-to-component mappings
- **[ProtectedRoute](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/App.jsx#10-31)** component: wraps pages that require login. If not logged in → redirect to `/login`. If wrong role → redirect to `/unauthorized`

### Admin Components (`src/components/admin/`)

| File | What it does |
|------|-------------|
| [AdminDashboard.jsx](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/components/admin/AdminDashboard.jsx) | Overview stats: total rooms, students, active allocations |
| [RoomManagement.jsx](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/components/admin/RoomManagement.jsx) | Add, edit, filter and list all rooms in a table |
| [UserManagement.jsx](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/components/admin/UserManagement.jsx) | List students, search, activate/deactivate, delete |
| [AllocationManagement.jsx](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/components/admin/AllocationManagement.jsx) | Assign rooms to students, vacate allocations, view history |

### Student Components (`src/components/student/`)

| File | What it does |
|------|-------------|
| [StudentDashboard.jsx](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/components/student/StudentDashboard.jsx) | Shows student's allocated room details, amenities, rent. Also shows available rooms if no allocation yet |

### Auth Components (`src/components/auth/`)

| File | What it does |
|------|-------------|
| [Login.jsx](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/components/auth/Login.jsx) | Email + password login form |
| [Register.jsx](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/components/auth/Register.jsx) | Sign-up form with name, email, password, student ID, phone, address |

### Layout Component ([src/components/layout/Layout.jsx](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/components/layout/Layout.jsx))
- Provides the **sidebar/navbar** that wraps all protected pages
- Has a logout button
- Shows different menu items based on user role (admin vs student)

---

## 🔄 9. Complete Request-Response Flow Example

### Scenario: Admin assigns a room to a student

```
1. Admin clicks "Allocate Room" in AllocationManagement.jsx

2. React sends:
   POST http://localhost:5001/api/allocations
   Headers: { Authorization: "Bearer <token>" }
   Body: { studentId, roomId, startDate, monthlyRent, notes }

3. Express receives the request → hits adminAuth middleware:
   - Reads token from header
   - Verifies token with JWT_SECRET
   - Finds user in MongoDB
   - Checks role === 'admin'
   - Calls next()

4. Route handler (allocations.js) runs:
   - Finds the student and room in MongoDB
   - Checks room is not full
   - Checks student has no existing allocation
   - Creates new Allocation document
   - Updates Room: currentOccupancy++, adds student to residents[]
   - Updates User: sets roomAllocation = roomId
   - Saves all three documents

5. Server responds: 201 Created + allocation object

6. React updates the UI to show the new allocation in the table
```

---

## ⚙️ 10. How to Run the Project

```bash
# In terminal, inside Hostel_Management/
npm run dev
```

This single command (using **concurrently**) starts:
- **Backend**: `nodemon server/server.js` on port `5001`
- **Frontend**: `vite` on port `5173`

**Environment variables** are set in [server/.env](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/.env):
```
MONGODB_URI=mongodb://localhost:27017/hostel_management
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
PORT=5001
```

---

## 📊 11. Relationships Between Data

```
User (student)
  └── roomAllocation ──────────────────→ Room
                                          └── residents[] → [User, User, ...]

Allocation
  ├── student ─────────────────────────→ User
  ├── room ────────────────────────────→ Room
  └── allocatedBy ─────────────────────→ User (the admin)
```

This is **referential integrity via ObjectId references** in MongoDB — when you query allocations, Mongoose `.populate()` replaces the ObjectId with the actual document.

---

## 🧠 12. Key Concepts Summary

| Concept | How it's used here |
|---------|-------------------|
| **JWT Authentication** | Token issued on login, sent on every request, verified by middleware |
| **Role-based access** | [auth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#4-25) (any user) vs [adminAuth](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/middleware/auth.js#26-38) (admins only) middleware |
| **React Context** | `AuthContext` provides login state globally without prop drilling |
| **Protected Routes** | [ProtectedRoute](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/App.jsx#10-31) component prevents unauthorized page access |
| **Mongoose populate** | Replaces ObjectId refs with actual documents in query results |
| **Password hashing** | bcrypt hashes password before DB save, compares on login |
| **Pagination** | All list APIs support `page` & `limit` query params |
| **Virtual fields** | `isAvailable` and `availableSpots` on Room are computed, not stored |

---

## 🤖 13. AI Assistant Architecture (Groq)

This project includes an AI chat assistant for hostel-related queries.

### Where AI Lives

| File | Responsibility |
|------|----------------|
| [server/routes/ai.js](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/routes/ai.js) | Main chat endpoint (`POST /api/ai/chat`) |
| [server/services/aiService.js](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/services/aiService.js) | Groq model calls, prompt design, safety analysis, FAQ fallback |
| [server/services/queryService.js](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/services/queryService.js) | Runs safe, role-scoped DB queries for allowed intents |
| [server/models/AiQueryLog.js](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/server/models/AiQueryLog.js) | Audit log for every AI request/response |
| [src/components/ai/AiChat.jsx](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/components/ai/AiChat.jsx) | Floating chat widget UI |
| [src/components/ai/ChatMessage.jsx](file:///Users/user/Documents/projects/hostel-management-system-main/Hostel_Management/src/components/ai/ChatMessage.jsx) | Chat bubble rendering + metadata badges |

### AI Request Flow

```
Client (AiChat.jsx)
   → POST /api/ai/chat
      → auth middleware (JWT)
      → aiService.analyseSafety()      (prompt injection / data leak checks)
      → aiService.detectIntent()       (Groq returns structured intent JSON)
      → whitelist enforcement          (ALLOWED_INTENTS)
      → queryService.executeIntent()   (safe MongoDB query)
      → aiService.generateResponse()   (human-readable answer)
      → fallback: aiService.getFaqFallback() when model fails
      → AiQueryLog.create()            (audit metadata)
   ← { reply, intent, confidence, source, params, safetyFlags }
```

### AI Quality Features Added

- **Fallback answers** when AI model is down using cached FAQ rules
- **Prompt-injection and leakage checks** before model call
- **Confidence score** in response payload (`0.0` to `1.0`)
- **Source metadata** (`AI_MODEL`, `FAQ_RULE`, `FAQ_CACHE`, `SAFETY_GUARD`)
- **Audit traceability** with intent, params, safety flags, confidence, source

### Why This Design is Safe

- The model never executes DB queries directly.
- Only whitelisted intents are accepted.
- Student queries are restricted to student-owned scope.
- Unsafe prompts are blocked and logged.
- Fallback keeps assistant useful during model outages.
