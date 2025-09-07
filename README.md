# 🏋️‍♂️ Trainix — AI Fitness & Nutrition Platform

Trainix is a modern full-stack web application for personal fitness, progress analysis, and nutrition planning.  
It uses AI to analyze photos, generates individual workout and nutrition plans, stores measurements, sends notifications, and allows you to track your progress.

---

## 🚀 Live Demo

> ⚡️ Free Render server — cold start up to 3 minutes  
[👉 View Demo](https://trainix-beta.vercel.app/)

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Redux Toolkit, TanStack Query
- **Backend:** Express.js, MongoDB, JWT Auth, AWS S3, OpenAI API
- **Testing:** Jest, Playwright, Supertest
- **DevOps:** Docker, Render

---

## 📦 Features

- AI photo progress analysis
- Fitness and nutrition plan generation
- Body measurements and progress history
- Notifications and advice
- User authentication (JWT)
- Photo storage on AWS S3 with CDN CloudFront
- OpenAI integration with python api using 

---

## 📌 API Endpoints

- `POST /api/auth/login` — Login
- `POST /api/auth/register` — Register
- `GET /api/fitness-plan` — Get fitness plan
- `POST /api/fitness-plan` — Generate fitness plan
- `GET /api/nutrition-plan` — Get nutrition plan
- `POST /api/measurements` — Add measurements
- `GET /api/notifications` — Get notifications

---

## 🧪 Testing

- **Unit & Integration:** Jest
- **E2E:** Playwright
- **Backend API:** Supertest

Run tests:
```bash
# Frontend
npm run test --- not still working   # Jest
npx playwright test    # Playwright

# Backend
npm run test           # Jest & Supertest
```
---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/gaykun1/Trainix.git
cd Trainix
cd frontend && npm install
cd ../backend && npm install
```

### 2. Environment Variables

- Copy `.env.example` to `.env` in both `frontend/` and `backend/`
- Fill in your MongoDB URI, AWS keys, OpenAI API, JWT secret

### 3. Run Development Servers

**Frontend:**
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

**Backend:**
```bash
cd backend
npm run dev
```

---

## 🐳 Docker

```bash
cd backend
docker build -t trainix-backend .
docker run -p 5200:5200 trainix-backend
```

---

## 📄 License

This project is licensed under the [GNU GPL v3](LICENSE).

---

## 💡 Credits

Made with ❤️ by [gaykun1](https://github.com/gaykun1)
