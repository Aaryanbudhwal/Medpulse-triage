# MedPulse — Emergency Bed & Doctor Booking Platform

MedPulse helps people find hospital beds and book doctor appointments without the waiting-room guesswork — and in a real emergency, get directions to the nearest hospital in one tap.

## The Problem

When someone needs a hospital bed urgently, they usually don't know:
- Which nearby hospitals actually have a bed free right now
- Where the closest hospital even is, especially in an unfamiliar area
- How to reach a doctor for a routine, non-emergency visit without a long wait

MedPulse solves all three in one platform.

## Features

### 🛏️ Reserve a Bed
Live ICU, general, ventilator, and oxygen bed availability across partner hospitals. Patients send a reservation request in minutes, flaggable as an emergency. Booking logic is transaction-safe — two people can't simultaneously claim the last available bed.

### 🩺 Book a Doctor
Search doctors by specialty, view open slots, and book an appointment time.

### 🗺️ Live Nearby Hospitals Map
- Uses the browser's live GPS location
- Pulls **real hospitals** near the user from OpenStreetMap's free Overpass API — not just demo data
- Shows partner hospitals with live bed counts (auto-refreshing every 15 seconds) alongside real-world hospitals with one-tap Google Maps directions
- Sorted by real distance from the user (Haversine formula)

### 🚨 Emergency SOS Button
One tap: gets the user's live location, finds the single nearest real hospital via Overpass, and opens turn-by-turn Google Maps directions instantly — built for the moment someone can't spare time to search.

### 🏥 Hospital & Doctor Admin Dashboards
Hospital admins manage bed inventory and incoming reservation requests. Doctors manage their appointment slots and bookings.

## Tech Stack

- **Framework:** Next.js (App Router, Turbopack)
- **Database:** PostgreSQL (hosted on Neon), queried via Kysely (type-safe SQL builder)
- **Auth:** NextAuth
- **Maps:** Leaflet + React-Leaflet with OpenStreetMap tiles (no paid API key required)
- **Real hospital data:** OpenStreetMap Overpass API (free, no key required)
- **Styling:** Tailwind CSS

## Running Locally

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — your PostgreSQL connection string (e.g. from [neon.tech](https://neon.tech))
   - `AUTH_SECRET` — generate with `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev
3. Apply the database schema (`db/schema.sql`) to your Postgres instance.
4. Seed demo data:
   ```
   npx tsx scripts/seed.ts
   ```
5. Start the dev server:
   ```
   npm run dev
   ```
6. Visit `http://localhost:3000`

### Demo accounts (after seeding)
- Patient: `patient@example.com` / `password123`
- Hospital admin: `hospital1@example.com` / `password123`
- Doctor: `doctor1@example.com` / `password123`

## What's Next

- Push/SMS notifications when a bed is confirmed
- Recurring doctor availability schedules
- Multiple admins per hospital
- Audit logging and rate limiting for production hardening
