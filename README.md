# Olysea

Olysea is a digital solutions project focused on building professional websites and custom software solutions for businesses.

The project is also being developed as a real-world software engineering learning project, following a structured development lifecycle covering requirements, system design, implementation, testing, DevSecOps, deployment, and monitoring.

## Project Goals

- Build a professional portfolio and business website for Olysea.
- Showcase services and completed projects.
- Provide a contact system for potential clients.
- Provide a secure admin dashboard for managing website content.
- Practice real-world software engineering and development workflows.
- Apply security, testing, DevSecOps, deployment, and monitoring practices.

## Tech Stack

### Frontend

- Angular
- TypeScript
- HTML
- CSS
- Angular Router
- Reactive Forms
- Angular Signals

### Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- REST APIs
- Maven

### Database

- PostgreSQL

### Development & DevOps

- Git
- GitHub
- GitHub Issues
- GitHub Projects
- Docker
- GitHub Actions

## Architecture

Olysea uses a **modular monolith architecture** for the MVP.

```text
                    ┌─────────────────────┐
                    │       Visitor       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Angular Frontend  │
                    │                     │
                    │  Public Website     │
                    │  Admin Dashboard    │
                    └──────────┬──────────┘
                               │
                         HTTPS / REST
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Spring Boot API   │
                    │                     │
                    │ Authentication      │
                    │ Authorization       │
                    │ Business Logic      │
                    │ Validation          │
                    │ REST APIs           │
                    └──────────┬──────────┘
                               │
                         Spring Data JPA
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │                     │
                    │ Users               │
                    │ Projects            │
                    │ Services            │
                    │ Contact Requests    │
                    └─────────────────────┘
```

## Main Features

### Public Website

- Home page
- Services
- Projects
- Project details
- About
- Contact

### Admin Dashboard

- Admin authentication
- Dashboard
- Project management
- Service management
- Contact message management

## Project Structure

```text
olysea/
│
├── frontend/
│   └── src/
│       └── app/
│           ├── core/
│           ├── shared/
│           ├── features/
│           │   ├── home/
│           │   ├── services/
│           │   ├── projects/
│           │   ├── about/
│           │   ├── contact/
│           │   └── admin/
│           │       ├── dashboard/
│           │       ├── projects/
│           │       ├── services/
│           │       └── contacts/
│           │
│           └── app.routes.ts
│
├── backend/
│   └── src/
│       └── main/
│           └── java/
│               └── ...
│                   ├── auth/
│                   ├── project/
│                   ├── service/
│                   ├── contact/
│                   └── common/
│
├── docs/
│   └── architecture/
│       └── system-design.md
│
└── README.md
```

## API

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Admin authentication |
| `GET` | `/api/projects` | Get projects |
| `GET` | `/api/projects/{id}` | Get project details |
| `GET` | `/api/services` | Get services |
| `POST` | `/api/contact` | Submit contact request |

### Admin Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/projects` | Create project |
| `PUT` | `/api/admin/projects/{id}` | Update project |
| `DELETE` | `/api/admin/projects/{id}` | Delete project |
| `POST` | `/api/admin/services` | Create service |
| `PUT` | `/api/admin/services/{id}` | Update service |
| `DELETE` | `/api/admin/services/{id}` | Delete service |
| `GET` | `/api/admin/contact` | View contact requests |
| `PATCH` | `/api/admin/contact/{id}` | Update contact request |

## Security

Security is considered throughout the architecture rather than being added after implementation.

The system includes planned protections for:

- Authentication and authorization
- Role-based access control
- Password hashing
- Input validation
- SQL injection
- XSS
- CSRF
- CORS
- Broken access control
- Rate limiting
- Resource exhaustion
- Mass assignment
- SSRF
- Path traversal
- Secure error handling
- Secure logging
- Secret management
- Dependency security
- HTTP security headers

The backend is the primary security boundary. Frontend route guards improve the user experience but do not replace backend authorization.

## Development Workflow

Olysea follows a GitHub-based development workflow:

```text
Requirement
     ↓
User Story
     ↓
GitHub Issue
     ↓
Feature Branch
     ↓
Implementation
     ↓
Testing
     ↓
Commit
     ↓
Push
     ↓
Pull Request
     ↓
Code Review
     ↓
Merge into main
     ↓
Close Issue
```

### Branch Naming

```text
feature/<name>
fix/<name>
docs/<name>
```

### Commit Convention

```text
feat: add project management API
fix: handle invalid contact requests
test: add project service tests
docs: update system architecture
refactor: simplify authentication service
chore: update dependencies
```

## Development Roadmap

```text
[x] Requirements
[x] Software Engineering
[x] System Design
[ ] Implementation
[ ] Testing
[ ] DevSecOps
[ ] Deployment
[ ] Monitoring
```

## Project Documentation

Detailed architecture documentation is available in:

```text
docs/architecture/system-design.md
```

The system design document covers:

- System architecture
- Component architecture
- Database design
- API design
- Authentication and authorization
- Security architecture
- Frontend architecture
- Error handling
- Technology decisions
- Testing considerations
- DevSecOps considerations
- Deployment considerations
- Monitoring considerations

## Project Management

Development is managed using GitHub Issues and GitHub Projects.

### Project Board

**Olysea Development**

```text
Backlog → Todo → In Progress → In Review → Done
```

### Epics

- `EPIC-01` — Product Definition
- `EPIC-02` — System Design
- `EPIC-03` — Implementation
- `EPIC-04` — Testing
- `EPIC-05` — DevSecOps
- `EPIC-06` — Deployment
- `EPIC-07` — Monitoring

## MVP Scope

### Included

- Public business website
- Services
- Projects
- Project details
- Contact form
- Admin authentication
- Admin dashboard
- Project management
- Service management
- Contact request management
- REST API
- PostgreSQL database

### Out of Scope

The following are intentionally excluded from the MVP:

- Blog
- Customer accounts
- Online payments
- Online booking
- AI chatbot
- Newsletter
- Mobile application
- Microservices
- Kubernetes
- Multi-tenant architecture

These features may be considered in future versions if they become necessary.
