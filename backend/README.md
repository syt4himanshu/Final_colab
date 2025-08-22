## Student Mentor Allocation System - Backend

### Prerequisites
- Node.js 18+
- MySQL 8+

### Setup
1. Copy environment
```
cp .env.example .env
```
Edit `.env` with your DB credentials and JWT secrets.

2. Install dependencies
```
npm install
```

3. Create database and tables
- Create database `student_mentor` (or the name in `DB_NAME`)
- Run SQL schema:
```
mysql -u <user> -p <password> <DB_NAME> < sql/schema.sql
```

4. Start
```
npm run dev
```
Server listens on `PORT` (default 5000).

### APIs
- Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/change-password`, `GET /api/auth/verify-token`
- Users (admin): `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`, `POST /api/users/bulk-upload` (multipart `file`)
- Teachers: `GET /api/teachers`, `GET /api/teachers/:id`, `GET /api/teachers/:id/students`, `PUT /api/teachers/:id`
- Students: `GET /api/students`, `GET /api/students/:id`, `PUT /api/students/:id`, `GET /api/students/unallocated`
- Allocations: `POST /api/allocations/auto-allocate`, `GET /api/allocations/summary`, `POST /api/allocations/manual`, `DELETE /api/allocations/:id`, `GET /api/allocations/export`

### Security
- Helmet, CORS, rate limiting, CSRF (except `/api/auth/*`), XSS clean
- JWT access/refresh tokens

### Notes
- Bulk upload expects a simple Excel sheet with headers: `uid`, `role`, `password` (optional). Missing passwords default to UID.
