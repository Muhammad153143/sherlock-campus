# SherLock - Complete Setup Guide for New Windows System

## Prerequisites - Install These First

### 1. Node.js (v18 or higher)
Download from: https://nodejs.org/
- Download LTS version
- Run installer, click Next through all steps
- Verify: Open CMD and type `node --version`

### 2. Python (v3.10 or higher)
Download from: https://www.python.org/downloads/
- **IMPORTANT**: Check "Add Python to PATH" during installation
- Verify: Open CMD and type `python --version`

### 3. MongoDB
Download from: https://www.mongodb.com/try/download/community
- Install MongoDB Community Server
- Start MongoDB service (it usually starts automatically)
- Verify: Open CMD and type `mongod --version`

---

## Project Setup Steps

### Step 1: Install Backend Dependencies
```cmd
cd sherlock_\backend
npm install
```

### Step 2: Install AI Service Dependencies
```cmd
cd sherlock_\ai_service
pip install -r requirements.txt
```

### Step 3: Create Admin User (First Time Only)
```cmd
cd sherlock_\backend
node seed.js
```
This creates: **Username:** `admin` | **Password:** `Admin@123`

### Step 4: Configure Email (Optional)
Edit `backend\.env` file:
- Replace `EMAIL_USER` with your Gmail
- Replace `EMAIL_PASS` with your Gmail App Password
- (Get App Password from Google Account > Security > 2-Step Verification > App Passwords)

---

## Starting the Application

### Option A: Use Startup Script (Recommended)
Double-click `start_all.bat` in the project folder.

### Option B: Manual Start (Two Terminals)

**Terminal 1 - AI Service:**
```cmd
cd sherlock_\ai_service
python app.py
```

**Terminal 2 - Backend:**
```cmd
cd sherlock_\backend
node server.js
```

---

## Verify Everything Works

1. Open browser: http://localhost:5000
2. Admin Login: http://localhost:5000/admin-login.html
   - Username: `admin`
   - Password: `Admin@123`

---

## Troubleshooting

### Error: "Cannot find module..."
```cmd
cd backend
npm install
```

### Error: "ECONNREFUSED" for AI Service
Make sure AI service is running:
```cmd
cd ai_service
python app.py
```

### Error: "MongoDB connection failed"
1. Make sure MongoDB is installed
2. Start MongoDB service:
   - Press Win+R, type `services.msc`
   - Find "MongoDB Server", click Start

### Error: "python is not recognized"
- Reinstall Python with "Add to PATH" checked
- Or use full path: `C:\Python310\python.exe app.py`

---

## Quick Commands Summary

| Task | Command |
|------|---------|
| Install backend deps | `cd backend && npm install` |
| Install AI deps | `cd ai_service && pip install -r requirements.txt` |
| Create admin | `cd backend && node seed.js` |
| Start AI service | `cd ai_service && python app.py` |
| Start backend | `cd backend && node server.js` |
| Start both | Double-click `start_all.bat` |

---

## System Requirements
- Windows 10/11
- Node.js v18+
- Python 3.10+
- MongoDB 6.0+
- 4GB RAM minimum
- Internet connection (for email features)
