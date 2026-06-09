# Hostel & Mess Management System - Implementation Checklist

## Step 1: Project scaffolding
- [ ] Create `hostel-mess-system/` folder structure: `frontend/` and `backend/`
- [x] Initialize React (Vite) in `frontend/`
- [x] Initialize Node/Express app in `backend/`


## Step 2: Backend (Express + MongoDB)
- [ ] Add `package.json`, `server.js` (or `src/index.js`), and Mongo connection via Mongoose
- [ ] Implement Mongoose models: `Student`, `MessPlan`, `Billing`
- [ ] Implement JWT admin auth and middleware
- [ ] Implement routes:
  - [ ] `GET/POST/PUT/DELETE /api/students`
  - [ ] `GET/POST/PUT/DELETE /api/mess-plans`
  - [ ] `GET/POST/PUT/DELETE /api/billing` and student billing history query

## Step 3: Frontend (React + Tailwind + Router)
- [ ] Add TailwindCSS and base styling
- [ ] Create React Router routes: Dashboard, Student Registration, Room Allocation, Mess Plan Management, Billing
- [ ] Create required components:
  - [ ] `StudentForm`
  - [ ] `StudentList`
  - [ ] `MessPlanForm`
  - [ ] `MessPlanList`
  - [ ] `BillingPage`
- [ ] Implement API client (fetch/axios) + JWT handling
- [ ] Implement form validation + responsive UI

## Step 4: Integration
- [ ] Dashboard fetches summary and renders
- [ ] Student CRUD works end-to-end
- [ ] Room Allocation updates roomNo (and occupancy behavior if you add it)
- [ ] Mess Plan CRUD works end-to-end
- [ ] Billing page shows billing history per student

## Step 5: Run & verify
- [ ] Add env examples (.env.example) for backend
- [ ] Run backend locally and confirm APIs
- [ ] Run frontend and confirm UI + JWT flow
- [ ] Basic testing of CRUD + protected routes

