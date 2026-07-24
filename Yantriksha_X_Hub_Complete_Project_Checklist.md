# Yantriksha X Hub: Complete Technical Project Checklist

This document provides a highly granular, step-by-step checklist of all tasks required to build, test, secure, and deploy the Yantriksha X Hub website. It covers database schemas, serverless API endpoints, user dashboards, frontend components, and deployment steps.

---

## 1. Initial Infrastructure & Configuration Setup
- [x] **Git Repository Setup**
  - [x] Initialize empty Git repository at `excited-salk/`.
  - [x] Back up historical commits to `.git_nitttr_backup/`.
  - [x] Link local repository to `https://github.com/personale88/Yantriksha-X-Hub`.
  - [x] Create primary branches: `main` and `staging`.
  - [x] Set upstream tracking to remote origin.
- [x] **Project Skeleton Configuration**
  - [x] Create `package.json` with scripts for `dev` and dependencies (`mysql2`, `dotenv`, `vercel`).
  - [x] Create `vercel.json` and configure `cleanUrls: true` for clean page routing.
  - [x] Create `.env.example` mapping out database credential requirements.
  - [x] Write [.gitignore](file:///C:/Users/VIGNESH/Documents/antigravity/excited-salk/.gitignore) configured with absolute root paths (`/index.html`, `/.env`, etc.) to prevent commits from leaking credentials while allowing the `public/` folder.
- [x] **Directory Layout**
  - [x] Create `public/` folder for static assets (HTML, CSS, JS).
  - [x] Create `api/` folder for Node.js serverless functions.
- [x] **Dependencies Installation**
  - [x] Run `npm install` to locally resolve libraries.
  - [x] Confirm local lockfile (`package-lock.json`) is generated.

---

## 2. Database Schema & Architecture Design (TiDB)
- [x] **Cluster Provisioning**
  - [x] Spin up TiDB Serverless instance named `vignesh` on AWS Singapore region.
  - [x] Copy connection parameters (host, port, user, password, database).
  - [x] Configure Traffic Filter: Add whitelisting rule `0.0.0.0/0` to allow Vercel dynamic IPs to communicate with the database.
- [x] **SQL Schema Design & Migration Scripts**
  - Create SQL scripts to initialize database tables with appropriate constraints:
  - [x] **Table: `users`**
    - Fields: `id` (INT Auto-Increment, Primary Key), `veltech_id` (VARCHAR, Unique), `name` (VARCHAR), `email` (VARCHAR, Unique), `role` (ENUM: 'student', 'faculty', 'mentor', 'admin'), `discipline` (ENUM: 'engineering', 'law', 'business', 'other'), `created_at` (TIMESTAMP).
  - [x] **Table: `teams`**
    - Fields: `id` (INT Auto-Increment, Primary Key), `team_name` (VARCHAR, Unique), `sector` (VARCHAR), `leader_id` (INT, Foreign Key referencing `users(id)`), `current_stage` (INT, Default 1), `created_at` (TIMESTAMP).
  - [x] **Table: `team_members`**
    - Fields: `id` (INT Auto-Increment, Primary Key), `team_id` (INT, Foreign Key referencing `teams(id)`), `user_id` (INT, Foreign Key referencing `users(id)`), `joined_at` (TIMESTAMP).
    - Constraint: Unique pair of `(team_id, user_id)` to prevent double entry.
  - [x] **Table: `progress_reports`**
    - Fields: `id` (INT Auto-Increment, Primary Key), `team_id` (INT, Foreign Key referencing `teams(id)`), `submitted_by` (INT, Foreign Key referencing `users(id)`), `milestone_step` (INT), `report_content` (TEXT), `file_url` (VARCHAR), `mentor_feedback` (TEXT), `status` (ENUM: 'pending', 'approved', 'revision_requested'), `created_at` (TIMESTAMP).
  - [x] **Table: `funding_requests`**
    - Fields: `id` (INT Auto-Increment, Primary Key), `team_id` (INT, Foreign Key referencing `teams(id)`), `requested_amount` (DECIMAL, Max 50000), `itemized_budget` (JSON), `status` (ENUM: 'pending_advisor', 'pending_treasurer', 'approved', 'disbursed', 'rejected'), `receipts_url` (VARCHAR), `created_at` (TIMESTAMP).
  - [x] **Table: `bookings`**
    - Fields: `id` (INT Auto-Increment, Primary Key), `team_id` (INT, Foreign Key referencing `teams(id)`), `mentor_id` (INT, Foreign Key referencing `users(id)`), `scheduled_time` (DATETIME), `mode` (ENUM: 'virtual', 'offline'), `meeting_link_or_venue` (VARCHAR), `status` (ENUM: 'scheduled', 'completed', 'cancelled'), `created_at` (TIMESTAMP).
  - [x] **Table: `podcast_qa`**
    - Fields: `id` (INT Auto-Increment, Primary Key), `submitter_name` (VARCHAR), `sector_interest` (VARCHAR), `question_text` (TEXT), `status` (ENUM: 'submitted', 'reviewed', 'answered'), `created_at` (TIMESTAMP).

---

## 3. Backend API Endpoints Design (Node.js Serverless)
- [x] **Database Connection Pool Wrapper**
  - [x] Configure [api/db.js](file:///C:/Users/VIGNESH/Documents/antigravity/excited-salk/api/db.js) with standard connection pool settings.
  - [x] Implement TLS/SSL rejectUnauthorized enforcement for TiDB Cloud Serverless.
  - [x] Optimize connection limit (default: 5) to prevent pool exhaustion on serverless scaling.
- [x] **Connection Verification Endpoint**
  - [x] Write [api/test-db.js](file:///C:/Users/VIGNESH/Documents/antigravity/excited-salk/api/test-db.js) returning timestamp and calculation verification.
  - [x] Configure CORS headers inside the test endpoint for debugging.
- [x] **Authentication & User Management APIs**
  - [x] `POST /api/auth/register`: Create user profile. Ensure validation blocks emails outside `veltech.edu.in` domains.
  - [x] `POST /api/auth/login`: Issue JSON Web Tokens (JWT) or session cookies for role validation.
- [x] **Team Builder & Matchmaking APIs**
  - [x] `GET /api/users/unassigned`: Fetch list of registered students looking for a team, filterable by discipline (Engineering, Law, MBA).
  - [x] `POST /api/teams/create`: Create a new team entry, adding the creator as leader.
  - [x] `POST /api/teams/invite`: Send join request from a team to an unassigned user.
  - [x] `POST /api/teams/join-requests`: Handle accept/decline operations for team invites.
- [x] **Roadmap & Progress APIs**
  - [x] `GET /api/teams/my-progress`: Retrieve 14-stage roadmap status for a user's active team.
  - [x] `POST /api/teams/submit-report`: Upload markdown content and URLs for bi-weekly report (Step 8).
  - [x] `POST /api/teams/evaluate-report`: Allow assigned mentors to review reports and write feedback.
- [x] **Funding & Resource Request APIs**
  - [x] `POST /api/funding/request`: Create an itemized request (up to ₹50,000) for components/software.
  - [x] `GET /api/funding/pending`: Allow Treasurer and Admin to fetch all pending funding claims.
  - [x] `PATCH /api/funding/approve`: Update funding status (Approve / Reject / Disbursed).
- [x] **Podcast Q&A API**
  - [x] `POST /api/podcast/submit-question`: Form handler to insert new Q&A questions into database.
  - [x] `GET /api/podcast/questions`: Admin-only view to fetch submitted questions.

---

## 4. Frontend UI Pages & Components (HTML/CSS/JS)
- [x] **Global Layout Structure**
  - [x] Create [public/index.html](file:///C:/Users/VIGNESH/Documents/antigravity/excited-salk/public/index.html).
  - [x] Nav bar with smooth scroll anchors and logo.
  - [x] Footer containing copyrights, link to top, and college acknowledgments.
- [x] **Global Styling & Theming**
  - [x] Create [public/style.css](file:///C:/Users/VIGNESH/Documents/antigravity/excited-salk/public/style.css).
  - [x] Primary Matte Dark theme (`#0b0f19`).
  - [x] Gradient colors: Cobalt Blue (Engineering), Royal Gold (Business), Crimson Red (Law).
  - [x] Responsive layout using CSS Grid and Flexbox.
- [x] **Core UI Modules & Sections**
  - [x] **Hero Section:** Headline, subtitle, visual CTA buttons, and stats grid.
  - [x] **About Section:** Multi-disciplinary mission descriptions.
  - [x] **Phases Showcase:** Interactive panels showing Confusion, Idea, and Product stages.
  - [x] **Roadmap Section:** Grid timeline presenting 14-stages.
  - [x] **Team Builder:** Left-hand inputs and right-hand compliance visual percentage gauge.
  - [x] **Podcast Hub:** Video player wrapper and Q&A submit form.
  - [x] **DB connection check widget:** Visual ring indicator, text details, and trigger button.
  - [x] **Leadership & Advisory board:** Grids highlighting coordinators, student organizers, and Vel Tech advisors.
- [x] **Client-Side Logic Integrations**
  - [x] Write [public/app.js](file:///C:/Users/VIGNESH/Documents/antigravity/excited-salk/public/app.js).
  - [x] Phase switcher click animations.
  - [x] 14-stage roadmap card click hooks opening detailed requirement popups.
  - [x] Team builder state engine: dynamically calculate rules validation (Engineering, Law, MBA, Advisor present; total 10 members) and update compliance percentage.
  - [x] Database test indicator click handler doing `fetch('/api/test-db')` and updating ring styling (glowing green/red) based on response.

---

## 5. Portal System & Dashboards (Advanced Feature Phase)
- [x] **Student Dashboard**
  - [x] Visual 14-stage roadmap checklist reflecting database status.
  - [x] Document repository links for templates (feasibility report format, progress report templates).
  - [x] Budget expense logger displaying spent amount vs remaining seed funding (₹50,000 max).
- [x] **Mentor Console**
  - [x] List of assigned teams with their current roadmap status.
  - [x] Action panel to read submitted bi-weekly reports, type feedback comments, and tick approval.
  - [x] Availability slots editor for scheduling weekly mentorship check-ins.
- [x] **Admin / Coordinator Panel**
  - [x] Global search dashboard for all active projects, filterable by sector.
  - [x] Funding request manager: approve disbursements and verify submitted invoices.
  - [x] Hackathon & Sandbox event coordinator tool: update registration status for upcoming challenges.

---

## 6. Testing, Quality Assurance, & Verification
- [x] **Local Dependency Validation**
  - [x] Verify `npm install` executes clean of dependency lock conflicts.
- [x] **Database Connection Validation**
  - [x] Test local command execution of [test-connection.js](file:///C:/Users/VIGNESH/Documents/antigravity/excited-salk/test-connection.js).
  - [x] Verify SSL parameter handshakes are secure and trusted by TiDB.
- [x] **Frontend Verification**
  - [x] Validate responsive design across standard media viewports (mobile, tablet, desktop).
  - [x] Check modal layouts on click to verify z-index values stack higher than sticky headers.
- [x] **Backend API Endpoints Testing**
  - [x] Verify test-db returns `success: true` when cluster whitelists are set.
  - [x] Confirm error handling returns correct status code (500) and descriptions when the database is forced offline.
- [x] **Vercel Dev Execution**
  - [x] Run `npx vercel dev` to confirm local server runs frontend assets and local serverless routes correctly at `http://localhost:3000`.

---

## 7. Security, Compliance, & IP Shielding
- [x] **Credential Safety Enforcement**
  - [x] Verify `.env` file is excluded from tracking by Git.
  - [x] Verify `test-connection.js` is excluded from tracking.
  - [x] Configure CORS headers on APIs to reject requests originating from unauthorized domains.
- [x] **Intellectual Property Route Guards**
  - [x] Implement middleware to verify JWT signatures before accessing team-specific information.
  - [x] Restrict progress report file downloads to team members and assigned advisors only.
- [x] **Code of Conduct Checkbox**
  - [x] Implement database flag checking: users cannot view the matchmaking directory until they confirm agreement to the Code of Conduct.

---

## 8. Deployment & Launch Operations
- [x] **Staging Environment Deployment**
  - [x] Connect the GitHub repository `staging` branch to Vercel.
  - [x] Define staging environment variables (`TIDB_HOST`, etc.) inside the Vercel project dashboard.
  - [x] Run staging deployments and verify URLs.
- [x] **Domain Mapping**
  - [x] Map custom domain (e.g., `yantrikshaxhub.com` or `yantriksha.veltech.edu.in`) via Vercel DNS.
- [x] **Production Rollout**
  - [x] Merge tested features from `staging` to `main`.
  - [x] Confirm production deployment builds successfully.
  - [x] Run final smoke tests on live database endpoints.
