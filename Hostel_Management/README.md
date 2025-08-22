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
   git clone https://github.com/nikhileshwar-perumalla/Hostel_Management.git
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

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

