<div align="center">
AdElevate
Business & Service Promotion Marketplace Platform
A subscription-tiered advertising marketplace where vendors pay for listing priority, admins moderate every ad before it goes live, and customers discover businesses through search, filters, and ratings.
Built as four independently deployable services — not a monolith — to keep payment handling, ad management, and audit logging cleanly separated.
![Java](https://img.shields.io/badge/Java%2017-Spring%20Boot-6DB33F?logo=springboot&logoColor=white)
![.NET](https://img.shields.io/badge/.NET%208-ASP.NET%20Core-512BD4?logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?logo=mysql&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?logo=razorpay&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-informational)
</div>
---
Overview
AdElevate lets a vendor register, create a business ad, choose a Silver / Gold / Platinum subscription tier, and pay through Razorpay — after which the ad is queued for admin approval before it's shown publicly. Approved ads are ranked on the home and browse pages by plan priority first, recency second, so a vendor's subscription tier has a direct, visible payoff. Customers browse, filter by category and location, and rate ads once approved.
The system is deliberately polyglot and service-oriented: two Spring Boot services (Core, Payment), one ASP.NET Core service (Logging), and a React frontend — each independently runnable, each with a single clear responsibility.
Architecture
![AdElevate system architecture](docs/architecture-diagram.png)
Service	Stack	Port	Responsibility
Core	Java 17, Spring Boot, Spring Security, JPA/Hibernate	`9090`	Users, vendors, ads, ratings, plans, locations, JWT auth
Payment	Java 17, Spring Boot, Razorpay SDK	`8081`	Order creation, signature verification, payment records (own DB)
Logging	.NET 8, ASP.NET Core Web API	`5085`	Best-effort audit trail — appends login/register/payment events to daily `.txt` files
Frontend	React, Vite, Axios	`5173`	Vendor, customer, and admin-facing UI
The Core and Payment services each own a separate MySQL database and talk to each other over REST — there is no shared schema or cross-service foreign key. The Logging service is called by both, asynchronously and best-effort: if it's down, login, registration, and payments still succeed, they just go unlogged for that window.
Key Design Decisions
Plan-tier priority is enforced at the sort level, not just cosmetically. Platinum ads are guaranteed to rank above Gold, which rank above Silver, on every ad listing surface — this is the entire value proposition of the paid tiers.
Payments are isolated in their own service and database. The Core service never touches Razorpay directly; it calls the Payment service, and the Payment service calls back to update ad status once a payment is verified.
Audit logging can never break a user-facing flow. Every call to the Logging service is wrapped so a network failure or the service being offline degrades to "no log line," never to a failed login, registration, or payment.
Admin approval sits between payment and visibility. Paying for a plan queues an ad for review — it does not publish it directly — so every public ad has passed a moderation step.
Features
🔐 JWT-based authentication with role-based access control (Admin / Vendor / Customer)
📢 Ad creation with category, location, image upload, and plan selection
💳 Razorpay integration with server-side signature verification before an ad is queued
✅ Admin approval workflow (Pending → Approved / Rejected)
🏆 Plan-tier priority ranking (Platinum → Gold → Silver) on all public listings
🔎 Search, category filter, and location filter for customers
⭐ Customer ratings on approved ads
📝 Cross-service audit logging (login / register / payment) to human-readable `.txt` files
🧩 Independently deployable services — restart or redeploy one without touching the others
Project Structure
```
AdElevate/
├── frontend/                          # React + Vite SPA
├── spring_boot_backend_template/      # Core service — users, ads, ratings, plans
├── AdElevate-Payment-Service/         # Payment service — Razorpay + payment records
├── AdElevate-Logging-Service/         # .NET audit-logging microservice
├── docs/                              # Architecture diagram and other docs assets
└── images/                            # Seed / sample ad images
```
Getting Started
Prerequisites
Java 17+ and Maven
.NET 8 SDK
Node.js 18+
MySQL 8+
A Razorpay test account (for `razorpay.key` / `razorpay.secret`)
1. Clone
```bash
git clone https://github.com/Pratham-107-1/AdElevate.git
cd AdElevate
```
2. Core service
```bash
cd spring_boot_backend_template/spring_boot_backend_template
cp src/main/resources/application.properties.example src/main/resources/application.properties
# edit application.properties: set your MySQL password
./mvnw spring-boot:run
```
Runs on `http://localhost:9090`.
3. Payment service
```bash
cd AdElevate-Payment-Service/AdElevate-Payment-Service
cp src/main/resources/application.properties.example src/main/resources/application.properties
# edit application.properties: set your MySQL password + Razorpay test key/secret
./mvnw spring-boot:run
```
Runs on `http://localhost:8081`.
4. Logging service
```bash
cd AdElevate-Logging-Service
dotnet restore
dotnet run
```
Runs on `http://localhost:5085`. Log files appear under `Logs/`.
5. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.
> Start the Core and Payment services before the frontend — the Logging service can be started any time (or skipped entirely; its absence never blocks the app, per the design decision above).
Roadmap
[ ] Automated ad renewal and expiry
[ ] Refund handling in the Payment service
[ ] Admin analytics dashboard (revenue by plan, approval turnaround time)
[ ] Mobile client
License
MIT — see LICENSE for details.
---
<div align="center">
<sub>Built by Pratham-107-1</sub>
</div>
