# 🏥 Mr. Compounder: The Digital Queue Master

**Domain:** `mrcompounder.com` | **Status:** MVP Complete (Dashboard Ready) | **Version:** 1.0.0

---

## 🎯 1. Project Overview: The Digital Solution to Chaos

**Mr. Compounder** (formerly Clinic Line) is a modern, multi-tenant Vertical SaaS platform designed to eliminate chaos and inefficiency in unorganized local healthcare clinics across India. We convert crowded, shouting-filled waiting rooms into silent, professional, and smooth patient-flow systems.

**The Core Problem:** Paper-based queuing leads to high staff stress, patient dissatisfaction, and revenue loss from walkaways.

**The Solution:** A zero-hardware, web-only system that anchors the patient journey to their mobile phone number.

---

## 💡 2. Key Features (MVP v1.0)

Mr. Compounder is built to solve the **Compounder's (Staff)** stress and the **Patient's** uncertainty:

* **Zero-Hardware Check-in:** Patients use a simple QR code scan linked to a unique clinic URL (`mrcompounder.com/clinic_slug`).
* **Pre-Booking Verification:** Securely verifies patient identity against the pre-booked list using their phone number.
* **Real-Time Dashboard:** Compounder's control center to manage the entire queue.
* **"Call Next" Control:** Single-button action to advance the queue and trigger patient alerts.
* **Multi-Tenant Architecture:** Built to scale seamlessly, ensuring strict data isolation between clinics.

---

## 🧱 3. Technology Stack

This project leverages a highly efficient and scalable serverless architecture for rapid deployment and low maintenance.

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend/App** | Next.js (React) / TypeScript | Optimal for fast development, security, and performance. |
| **Backend/DB** | Supabase (PostgreSQL) | Centralized, secure multi-tenant database with built-in Authentication and Realtime features. |
| **Styling** | Tailwind CSS (or similar utility-first CSS) | For rapid, professional, and consistent UI development. |
| **Deployment** | Vercel | Seamless integration and deployment pipeline for Next.js. |

---

## 🌐 4. Architecture and Data Flow

The platform uses a single-instance, multi-tenant approach:

* **Multi-Tenancy:** Data for all clinics resides in one Supabase instance, but **Row-Level Security (RLS)** is strictly enforced to ensure clinic isolation. A compounder can *only* access their own clinic's data.
* **Data Anchor:** The patient's **Phone Number** is the primary key used to verify check-in against the pre-booked list.
* **Real-Time Core:** The `clinics.current_token` field is the source of truth, updated by the Compounder and instantly broadcast to all patient status pages via Supabase Realtime functionality.

---

## ⚙️ 5. Local Setup and Installation

Follow these steps to get a local development environment running:

### Prerequisites
* Node.js (v18+)
* pnpm (recommended) or npm
* A Supabase project instance

### 5.1 Clone the Repository

```bash
git clone [YOUR_REPO_URL]
cd mrcompounder
