# Hostel Management System

A full-stack web application for managing hostel allocations, rooms, and users. Built with React (frontend), Node.js/Express (backend), and MongoDB (database).

## Features

- **User Authentication**: Register, login, and JWT-based session management
- **Admin Dashboard**: Manage users, rooms, and allocations
- **Student Dashboard**: View room allocation and available rooms
- **Room Management**: Add, edit, and delete rooms
- **Allocation Management**: Assign rooms to students, view allocations
- **Responsive UI**: Built with Tailwind CSS

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB (local or Atlas)

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/sahithkasam/hostel-management-system.git
   cd Hostel_Management
   ```
2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```
3. **Configure environment variables**
   - Create a `.env` file in the `server/` directory:
     ```env
     MONGODB_URI=mongodb://localhost:27017/hostel_management
     JWT_SECRET=your_jwt_secret
     PORT=5001
     ```

### Running the App
1. **Start MongoDB** (if running locally)
2. **Start development servers**
   ```bash
   npm run dev
   ```
   - Frontend: [http://localhost:5173](http://localhost:5173) (or next available port)
   - Backend: [http://localhost:5001](http://localhost:5001)

## Project Structure
```
Hostel_Management/
├── server/           # Backend (Node.js/Express)
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── middleware/   # Auth middleware
│   └── server.js     # Main server file
├── src/              # Frontend (React)
│   ├── components/   # React components
│   ├── contexts/     # React context providers
│   └── main.jsx      # Entry point
├── .env              # Environment variables (not committed)
├── .gitignore        # Git ignore file
├── package.json      # Project metadata
└── README.md         # Project documentation
```

## Usage
- **Admin**: Log in to manage users, rooms, and allocations
- **Student**: Register and view your room allocation

## 🤖 AI Hostel Assistant

An LLM-powered chat assistant embedded in the portal that lets users query hostel data using natural language.

### Setup

Add your Groq API key to `server/.env`:
```env
GROQ_API_KEY=your_key_here
```
Create an API key at [console.groq.com](https://console.groq.com/).

### Features
- **Floating chat widget** (bottom-right corner) — available on all authenticated pages
- **Role-aware responses**: Students see only their own data; Admins see hostel-wide data
- **Safety guardrails**: prompt-injection and data-leak attempts are detected and blocked
- **FAQ fallback**: rule-based fallback answers are returned when the model is unavailable
- **Confidence + source metadata**: each AI response includes confidence and source for transparency
- **Verify-first UX**: frontend shows confidence/source cues to encourage user verification
- **Audit trail**: detailed AI logs include confidence, source, extracted params, and safety flags
- **Supported intents**:
  | Intent | Description |
  |---|---|
  | `FIND_VACANT_ROOMS` | List available rooms (admin only) |
  | `VIEW_ALLOCATION` | Check room allocation details |
  | `PENDING_FEES` | View estimated outstanding rent |
  | `MAINTENANCE_REQUEST` | Get guidance on raising a maintenance issue |
  | `GENERAL_INFO` | Hostel policy and contact info |

### Architecture

```
POST /api/ai/chat
  ↓  auth middleware (JWT)
   ↓  aiService.analyseSafety()    ← blocks unsafe/prompt-injection queries
   ↓  aiService.detectIntent()     ← Groq model returns structured intent JSON
  ↓  whitelist check              ← intent must be in ALLOWED_INTENTS
  ↓  queryService.executeIntent() ← safe Mongoose queries, role-scoped
   ↓  aiService.generateResponse() ← Groq — human-readable reply
   ↓  aiService.getFaqFallback()   ← fallback path when AI fails
   ↓  AiQueryLog.create()          ← audit log written to MongoDB
   ↓  { reply, intent, confidence, source, params, safetyFlags }
```

### Security
- **Prompt injection guard**: input sanitised and capped at 500 characters before reaching LLM
- **Whitelist enforcement**: intent is validated both inside `aiService` and in the route handler
- **Role scoping**: students are hard-scoped to their own `userId` in `queryService` (not by LLM)
- **No raw query execution**: Mongoose models with explicit field selects are used exclusively
- **Audit logging**: every query logged to `aiquerylogs` collection with response metadata for review
- **Rate limiting**: 20 requests per user per 15-minute window

### Project Structure (new files)
```
server/
├── models/AiQueryLog.js       ← Audit log schema
├── routes/ai.js               ← POST /api/ai/chat
└── services/
   ├── aiService.js           ← Groq integration, prompt templates, safety, fallback
    └── queryService.js        ← Intent → safe MongoDB query mapper
src/components/ai/
├── AiChat.jsx                 ← Floating chat widget + AI metadata handling
└── ChatMessage.jsx            ← Message bubble with intent/confidence/source display
```

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

