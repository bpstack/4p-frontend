# Four Points - Backend Architecture

> Private REST API for the Hotel Property Management System

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL_8-4479A1?style=flat&logo=mysql&logoColor=white)

This document describes the backend architecture. The backend repository is **private**.

---

## Tech Stack

| Technology             | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| **Node.js 20+**        | Runtime environment                        |
| **Express 5**          | Web framework (latest major version)       |
| **TypeScript**         | Type-safe development                      |
| **MySQL 8**            | Relational database                        |
| **Passport.js + JWT**  | Authentication (HttpOnly cookies)          |
| **Zod 4**              | Request validation & schema definitions    |
| **Cloudinary**         | Image and PDF cloud storage                |
| **Multer**             | File upload handling (multipart/form-data) |
| **Archiver**           | ZIP file generation for bulk downloads     |
| **node-cron**          | Scheduled background tasks                 |
| **nodemailer**         | Email notifications                        |
| **bcrypt**             | Password hashing (10 rounds)               |
| **express-rate-limit** | API rate limiting                          |
| **dayjs**              | Date manipulation & formatting             |
| **Axios**              | External API calls                         |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │   Routes    │ →  │ Controllers │ →  │Repositories │      │
│  │  (validation)    │  (business) │    │   (data)    │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
│         │                  │                  │             │
│         ↓                  ↓                  ↓             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Middlewares │    │  Services   │    │   Models    │      │
│  │ (auth, rate)│    │(notifications│   │  (types)    │      │
│  └─────────────┘    │  cron, etc) │    └─────────────┘      │
│                     └─────────────┘                         │
│                            │                                │
│                            ↓                                │
│                     ┌─────────────┐                         │
│                     │   MySQL 8   │                         │
│                     │ (40+ tables)│                         │
│                     └─────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## API Structure

### Authentication

```
POST   /api/auth/login          # Login with credentials
POST   /api/auth/logout         # Clear session
GET    /api/auth/me             # Get current user
POST   /api/auth/refresh        # Refresh access token
```

### Core Modules

| Module            | Base Route           | Operations                                         |
| ----------------- | -------------------- | -------------------------------------------------- |
| **Users**         | `/api/users`         | CRUD, avatar upload, role management               |
| **Groups**        | `/api/groups`        | Reservations, contacts, rooms, payments, history   |
| **Parking**       | `/api/parking`       | Spaces, bookings, check-in/out, rates, analytics   |
| **Logbooks**      | `/api/logbooks`      | Entries, comments, read tracking                   |
| **Cashier**       | `/api/cashier`       | Shifts, denominations, payments, vouchers, reports |
| **Maintenance**   | `/api/maintenance`   | Work orders, image uploads, status workflow        |
| **Blacklist**     | `/api/blacklist`     | Incidents, document verification                   |
| **Conciliation**  | `/api/conciliations` | Daily room counts, monthly summaries               |
| **Backoffice**    | `/api/backoffice`    | Invoices, suppliers, PDF uploads                   |
| **Messages**      | `/api/messages`      | Conversations, direct messages                     |
| **Notifications** | `/api/notifications` | Alerts, scheduled delivery                         |
| **Activity**      | `/api/activity`      | Dashboard feed, KPIs                               |
| **Departments**   | `/api/departments`   | Department management                              |

---

## Authentication & Security

### JWT Flow

- **Login**: Validate credentials → Generate tokens → Set HttpOnly cookies
- **Requests**: Read cookie → Verify JWT → Check role → Execute controller
- **Refresh**: Verify refresh token → Generate new access token → Update cookie

### Token Configuration

| Token   | Duration | Storage        |
| ------- | -------- | -------------- |
| Access  | 15 min   | HttpOnly cookie |
| Refresh | 7 days   | HttpOnly cookie |

### Security Measures

| Measure              | Implementation                    |
| -------------------- | --------------------------------- |
| XSS Protection       | HttpOnly cookies, no localStorage |
| CSRF Protection      | SameSite cookies, CORS whitelist  |
| SQL Injection        | Parameterized queries (mysql2)    |
| Rate Limiting        | 100 requests / 15 min per IP      |
| Password Hashing     | bcrypt (10 rounds)                |
| Input Validation     | Zod schemas on all endpoints      |
| Error Sanitization   | Generic errors in production      |

---

## Database Schema

### Core Tables (40+)

| Category          | Tables                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------- |
| **Auth**          | `users`, `refresh_tokens`                                                                          |
| **Groups**        | `group_reservations`, `group_contacts`, `group_rooms`, `group_payments`, `group_history`           |
| **Parking**       | `parking_spaces`, `parking_bookings`, `parking_rates`, `parking_levels`                            |
| **Logbooks**      | `logbook_entries`, `logbook_comments`, `logbook_reads`                                             |
| **Cashier**       | `cashier_shifts`, `cashier_denominations`, `cashier_payments`, `cashier_vouchers`, `cashier_daily` |
| **Maintenance**   | `maintenance_orders`, `maintenance_images`                                                         |
| **Blacklist**     | `blacklist_entries`, `blacklist_images`                                                            |
| **Conciliation**  | `conciliations`, `conciliation_monthly`                                                            |
| **Backoffice**    | `invoices`, `suppliers`                                                                            |
| **Messages**      | `conversations`, `messages`, `conversation_participants`                                           |
| **Notifications** | `notifications`, `notification_reads`                                                              |
| **System**        | `departments`, `activity_log`                                                                      |

### Key Relationships

```
users (1) ─────────────< (n) logbook_entries
users (1) ─────────────< (n) maintenance_orders
users (1) ─────────────< (n) cashier_shifts

group_reservations (1) ─< (n) group_contacts
group_reservations (1) ─< (n) group_rooms
group_reservations (1) ─< (n) group_payments
group_reservations (1) ─< (n) group_history

parking_spaces (1) ────< (n) parking_bookings
parking_levels (1) ────< (n) parking_spaces

departments (1) ───────< (n) logbook_entries
departments (1) ───────< (n) users
```

---

## Middlewares

| Middleware          | Purpose                               |
| ------------------- | ------------------------------------- |
| `authenticateToken` | Verify JWT, attach user to request    |
| `roleCheck`         | Validate user role permissions        |
| `rateLimiter`       | Prevent abuse (100 req/15min per IP)  |
| `demoRestriction`   | Block write operations for demo users |

---

## Demo Mode

Demo users can read all data but write operations are restricted to a whitelist:

| Route                      | Method | Reason             |
| -------------------------- | ------ | ------------------ |
| `/api/auth/logout`         | POST   | Session management |
| `/api/parking/bookings`    | POST   | Test booking flow  |
| `/api/logbooks/*/comments` | POST   | Test comments      |
| `/api/maintenance`         | POST   | Test work orders   |

All other write operations return `403 Forbidden`.

---

## Services

### Cron Jobs

| Job                  | Schedule      | Purpose                       |
| -------------------- | ------------- | ----------------------------- |
| Notification cleanup | Daily 3:00 AM | Remove old read notifications |
| Parking expiry check | Every 15 min  | Alert expiring bookings       |
| Session cleanup      | Daily 4:00 AM | Remove expired refresh tokens |

### File Handling

| Feature          | Technology          | Usage                                           |
| ---------------- | ------------------- | ----------------------------------------------- |
| Image Upload     | Multer + Cloudinary | Avatars, maintenance photos, blacklist evidence |
| PDF Upload       | Multer + Cloudinary | Invoice documents, contracts                    |
| ZIP Generation   | Archiver            | Bulk export of images/documents                 |
| Email Attachments| Nodemailer          | Reports, notifications with files               |

---

## Error Handling

```typescript
// Success response
{ "success": true, "data": { ... } }

// Error response
{ "success": false, "error": "Error message", "code": "ERROR_CODE" }
```

---

## File Structure

```
backend/
├── config/           # Environment, DB connection, date utils
├── controllers/      # Business logic by module
├── middlewares/      # Auth, rate limiting, demo restriction
├── models/           # Zod schemas + TypeScript types
├── repositories/     # SQL queries by module
├── routes/           # Express routers by module
├── services/         # Cron, notifications, email
├── validations/      # Request validation schemas
├── types/            # Express type extensions
└── index.ts          # Server entry point
```

---

## Deployment

| Service       | Provider   | Purpose              |
| ------------- | ---------- | -------------------- |
| Backend       | Render     | Auto-deploy from main|
| Database      | Aiven      | Managed MySQL 8      |
| Media Storage | Cloudinary | Images and PDFs      |

---

## Author

**Salvador Perez**

- GitHub: [@bpstack](https://github.com/bpstack)
- Email: contact.bpstack@gmail.com

---

<p align="center">
  Built with Express 5, TypeScript, and MySQL
</p>
