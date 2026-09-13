# MedPulse — Hospital Bed Reservations & Doctor Appointments

A full-stack healthcare platform with two independent modules under one roof:

- **Bed reservation** — ICU, general, ventilator, and oxygen beds, with live availability, patient requests, and a hospital admin dashboard to approve/reject/discharge.
- **Doctor appointments** — local doctor search, open time slots, patient booking, and a doctor dashboard to manage availability and appointments.

Roles: **Patient**, **Hospital Admin**, **Doctor**. Everyone signs up from the same `/register` page; the form adapts to the role you pick.

## Stack

- **Next.js 16** (App Router, TypeScript) + Tailwind CSS v4
- **PostgreSQL** via **Kysely** (type-safe SQL query builder) + `pg` — no ORM binary/engine dependency
- **NextAuth v5** — credentials login, JWT sessions, role-based route protection (`proxy.ts`)
- **Server Actions** for all writes (no hand-rolled REST API needed)

> **Why Kysely instead of Prisma?** Prisma's CLI downloads a native "engine" binary from its own CDN on `generate`/`migrate`, which isn't reachable from network-restricted environments (like the one this was built in). Kysely + `pg` needs nothing but npm packages, and TypeScript types are generated directly from your live schema — fully working, no build-time network dependency. If you'd rather use Prisma on your own machine (which has normal internet access), the SQL schema in `db/schema.sql` maps directly to a Prisma schema if you want to switch later.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Postgres database** — locally, or a free hosted one (Neon, Supabase, Railway all work).

3. **Set environment variables** — copy `.env.example` to `.env` and fill in:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   AUTH_SECRET="generate with: openssl rand -base64 32"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Apply the schema**
   ```bash
   psql "$DATABASE_URL" -f db/schema.sql
   ```

5. **Generate Kysely types from your database** (only needed if you change the schema)
   ```bash
   npx kysely-codegen --url "$DATABASE_URL" --out-file lib/db/types.generated.ts --camel-case
   ```

6. **Seed demo data** (optional but recommended for trying it out)
   ```bash
   npx tsx scripts/seed.ts
   ```
   This creates two hospitals, three doctors, a patient, and some demo reservations/appointments. All demo accounts use password `password123`:

   | Role | Email |
   |---|---|
   | Patient | patient@example.com |
   | Hospital admin (Sunrise, Ghaziabad) | hospital1@example.com |
   | Hospital admin (Apex Care, Noida) | hospital2@example.com |
   | Doctor (Cardiologist) | doctor1@example.com |
   | Doctor (Dermatologist) | doctor2@example.com |
   | Doctor (Pediatrician) | doctor3@example.com |

7. **Run it**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

## Project structure

```
app/
  page.tsx                   Landing page (two-module split)
  login/, register/          Auth pages
  dashboard/                 Role-based redirect after login
  beds/                      Module 1: bed reservation
    page.tsx                   Browse/search hospitals
    [hospitalId]/page.tsx      Hospital detail + reserve
    reservations/page.tsx      Patient's reservations
    admin/page.tsx             Hospital admin dashboard
  doctors/                   Module 2: doctor appointments
    page.tsx                   Browse/search doctors
    [doctorId]/page.tsx        Doctor detail + book
    appointments/page.tsx      Patient's appointments
    admin/page.tsx             Doctor dashboard
  api/auth/[...nextauth]/     NextAuth route handler
lib/
  db/                        Kysely client + generated types
  auth.ts                    NextAuth config
  data/                      Read-only data access functions
  actions/                   Server actions (all writes)
components/                  Shared UI
db/schema.sql                Full SQL schema
scripts/seed.ts              Demo data
proxy.ts                     Route protection (Next.js 16's replacement for middleware.ts)
```

## How availability stays correct under concurrent requests

Both booking flows use a single conditional `UPDATE ... WHERE available_count > 0` (beds) or `WHERE is_booked = false` (doctor slots) inside a transaction, and check whether a row was actually affected before inserting the reservation/appointment. If two people click "reserve" on the last bed at the same instant, only one `UPDATE` will affect a row — the other gets a clean "no longer available" error instead of double-booking.

## What's genuinely production-ready vs. what you'd want to add next

**Solid as-is:** schema, auth, role-based access, race-condition-safe booking logic, both full booking flows end-to-end.

**Worth adding before real hospitals/doctors use this:**
- Email/SMS notifications on booking/confirmation (Twilio, Resend, etc.)
- Geolocation-based "nearest hospital/doctor" search (Google Maps or Leaflet + OpenStreetMap)
- Multiple admins per hospital (currently one admin account per hospital)
- Recurring weekly availability for doctors (currently they add explicit date/time blocks — works fine, just more manual)
- Audit logging on admin actions (who confirmed/rejected what, when)
- Rate limiting on registration/login

## Deployment

Works on Vercel (or any Node host) + any hosted Postgres:
1. Push this to a GitHub repo.
2. Import into Vercel.
3. Set `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` (your production URL) as environment variables.
4. Apply `db/schema.sql` to your production database once, before first deploy.
