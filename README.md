AdElevate
A full-stack local business advertising platform where vendors can list ads for their businesses and customers can browse, filter, and rate them by category and location.
---
Overview
AdElevate connects local business owners with nearby customers through a simple ad-listing platform. Vendors create and manage ads across categories like food, electronics, home services, and more, while customers browse listings, view ratings, and make plan-based payments to feature their ads.
The project is built as a set of independent services, each responsible for a distinct part of the system — a common pattern in real-world microservice-style architectures.
---
Tech Stack
Layer	Technology
Frontend	React (Vite)
Core Backend	Spring Boot, Spring Security, JWT
Payment Service	Spring Boot, Razorpay API
Logging Service	ASP.NET Core (.NET)
Database	MySQL
Auth	JWT-based authentication
---
Architecture
```
                ┌────────────┐
                │  Frontend  │
                │  (React)   │
                └─────┬──────┘
                      │
                      ▼
              ┌───────────────┐
              │  Core Backend │◄──────┐
              │ (Spring Boot) │       │
              └───────┬───────┘       │
                      │               │
          ┌───────────┼──────────┐    │
          ▼           ▼          ▼    │
   ┌────────────┐ ┌──────────┐  ┌─────┴──────┐
   │  Payment   │ │  MySQL   │  │  Logging   │
   │  Service   │ │    DB    │  │  Service   │
   │(Spring Boot)│└──────────┘  │  (.NET)    │
   └─────┬──────┘               └────────────┘
         │
         ▼
   ┌────────────┐
   │  Razorpay  │
   └────────────┘
```
Each backend service exposes its own REST API and can be run and scaled independently.
---
Features
For Customers
Browse and search ads by category and location
View detailed ad pages with images and ratings
Rate and review businesses
Register, log in, and manage account/profile
For Business Vendors
Create, edit, and manage ad listings with image uploads
Track ad performance from a provider dashboard
Subscribe to paid plans for extended visibility
Make secure payments via Razorpay
For Admins
Manage users, vendors, and ad approvals from an admin dashboard
View platform-wide stats and plan revenue
Platform
JWT-secured authentication and role-based access (Admin / Vendor / Customer)
Centralized structured logging via a dedicated logging microservice
Location-based ad filtering
---
Project Structure
```
AdElevate/
├── frontend/                          # React (Vite) client
├── spring_boot_backend_template/      # Core backend API (users, ads, auth, ratings, locations)
├── AdElevate-Payment-Service/         # Payment + subscription handling (Razorpay integration)
├── AdElevate-Logging-Service/         # Centralized logging service (.NET)
├── images/                            # Static category/demo images
└── README.md
```
---
Getting Started
Prerequisites
Node.js (v18+)
Java 17+ and Maven
.NET SDK
MySQL (running locally)
1. Clone the repository
```bash
git clone https://github.com/Pratham-107-1/AdElevate.git
cd AdElevate
```
2. Configure environment
Each backend service has an `application.properties.example` file. Copy it and fill in your own local credentials:
```bash
cp spring_boot_backend_template/spring_boot_backend_template/src/main/resources/application.properties.example \
   spring_boot_backend_template/spring_boot_backend_template/src/main/resources/application.properties

cp AdElevate-Payment-Service/AdElevate-Payment-Service/src/main/resources/application.properties.example \
   AdElevate-Payment-Service/AdElevate-Payment-Service/src/main/resources/application.properties
```
Update the copied files with your MySQL credentials and Razorpay test API keys.
3. Run the core backend
```bash
cd spring_boot_backend_template/spring_boot_backend_template
mvnw spring-boot:run
```
Runs on `http://localhost:9090`
4. Run the payment service
```bash
cd AdElevate-Payment-Service/AdElevate-Payment-Service
mvnw spring-boot:run
```
Runs on `http://localhost:8081`
5. Run the logging service
```bash
cd AdElevate-Logging-Service
dotnet run
```
6. Run the frontend
```bash
cd frontend
npm install
npm run dev
```
---
API Overview
The core backend exposes REST endpoints for:
`/api/auth` — login, registration, password reset
`/api/ads` — ad creation, browsing, updates
`/api/users` — user profile management
`/api/vendors` — business vendor profiles
`/api/ratings` — ad ratings and reviews
`/api/locations` — location data for filtering
`/api/subscription-plans` — plan management
`/api/admin` — admin-level operations
The payment service exposes `/api/payments` for order creation and verification via Razorpay.
---
Security Notes
Real credentials (DB passwords, API keys) are never committed — each service uses a git-ignored `application.properties`, with a tracked `.example` template for reference.
Authentication uses JWT tokens with role-based route protection on both frontend and backend.
---
License
This project is for educational/demonstration purposes.
