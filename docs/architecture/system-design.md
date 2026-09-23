# Olysea System Design

## 1. Overview

Olysea is a digital solutions studio website designed to present Olysea's services and projects while providing a way for potential customers to contact the business.

The MVP consists of:

- A public-facing website
- An administrator dashboard
- A Spring Boot REST API
- A PostgreSQL database
- Authentication and authorization for administrators

The system will use a **modular monolith architecture**.

### Primary User Flow

```text
Visitor
   ↓
Understand Olysea
   ↓
Explore Services
   ↓
View Projects
   ↓
Build Trust
   ↓
Contact Olysea
```

### Administrator Flow

```text
Administrator
   ↓
Admin Login
   ↓
Authentication
   ↓
Admin Dashboard
   ↓
Manage Projects / Services / Contact Messages
```

---

# 2. System Architecture

## 2.1 Architecture Style

Olysea will use a **modular monolith**.

The system will initially consist of one Angular frontend, one Spring Boot backend, and one PostgreSQL database.

```text
                    Internet
                       │
                       ↓
              ┌─────────────────┐
              │ Angular Frontend│
              └────────┬────────┘
                       │
                  HTTPS / REST
                       │
                       ↓
              ┌─────────────────┐
              │  Spring Boot API│
              └────────┬────────┘
                       │
                 Spring Data JPA
                       │
                       ↓
              ┌─────────────────┐
              │   PostgreSQL    │
              └─────────────────┘
```

## 2.2 Architecture Responsibilities

### Angular

Responsible for:

- Public website UI
- Admin dashboard UI
- Client-side routing
- Form handling
- Client-side validation
- API communication
- User interface state
- Loading and error states

### Spring Boot

Responsible for:

- REST APIs
- Business logic
- Authentication
- Authorization
- Server-side validation
- Database access
- Error handling
- Security controls
- Logging

### PostgreSQL

Responsible for:

- Persistent application data
- Users
- Projects
- Services
- Contact requests

---

# 3. Component Architecture

## 3.1 Frontend Structure

The frontend will use a feature-based architecture.

```text
frontend/
└── src/
    └── app/
        ├── core/
        │   ├── auth/
        │   ├── guards/
        │   ├── interceptors/
        │   └── services/
        │
        ├── shared/
        │   ├── components/
        │   ├── directives/
        │   └── pipes/
        │
        ├── features/
        │   ├── home/
        │   ├── services/
        │   ├── projects/
        │   │   ├── project-list/
        │   │   └── project-details/
        │   ├── about/
        │   ├── contact/
        │   └── admin/
        │       ├── login/
        │       ├── dashboard/
        │       ├── projects/
        │       ├── services/
        │       └── contacts/
        │
        ├── app.ts
        ├── app.routes.ts
        └── app.config.ts
```

### Core

Contains application-wide functionality such as:

- Authentication
- Route guards
- HTTP interceptors
- Global services

### Shared

Contains reusable UI functionality that is not specific to one feature.

Examples:

- Navbar
- Footer
- Buttons
- Loading components
- Modals
- Reusable directives
- Reusable pipes

### Features

Contains business-specific functionality.

Public features:

- Home
- Services
- Projects
- About
- Contact

Admin features:

- Login
- Dashboard
- Project management
- Service management
- Contact management

---

# 4. Backend Architecture

The backend will also use a feature-oriented structure.

```text
backend/
└── src/
    └── main/
        └── java/
            └── com/
                └── olysea/
                    ├── auth/
                    │   ├── controller/
                    │   └── service/
                    │
                    ├── project/
                    │   ├── controller/
                    │   ├── service/
                    │   ├── repository/
                    │   ├── entity/
                    │   └── dto/
                    │
                    ├── service/
                    │   ├── controller/
                    │   ├── service/
                    │   ├── repository/
                    │   ├── entity/
                    │   └── dto/
                    │
                    ├── contact/
                    │   ├── controller/
                    │   ├── service/
                    │   ├── repository/
                    │   ├── entity/
                    │   └── dto/
                    │
                    └── common/
                        ├── exception/
                        ├── response/
                        ├── validation/
                        └── configuration/
```

Each feature is responsible for its own functionality.

For example:

```text
Project Controller
       ↓
Project Service
       ↓
Project Repository
       ↓
Project Entity
       ↓
PostgreSQL
```

---

# 5. Database Design

PostgreSQL will be used as the primary relational database.

## 5.1 Users

```text
users
--------------------------------
id             PK
email
password
role
created_at
updated_at
```

Passwords must never be stored as plaintext.

They must be stored using a secure password-hashing mechanism.

The MVP only requires the `ADMIN` role, but the design supports role-based authorization.

---

## 5.2 Projects

```text
projects
--------------------------------
id             PK
name
description
image_url
project_url
created_at
updated_at
```

Images will not be stored directly as binary data in the database.

The database stores a reference such as a URL or storage path.

---

## 5.3 Services

```text
services
--------------------------------
id             PK
name
description
created_at
updated_at
```

---

## 5.4 Contact Requests

```text
contact_requests
--------------------------------
id             PK
name
email
business_name
message
status
created_at
updated_at
```

The `status` field allows administrators to track the state of incoming contact requests.

---

# 6. API Design

The backend exposes a REST API.

Base path:

```text
/api
```

## 6.1 Authentication

```text
POST /api/auth/login
```

Authenticates the administrator.

The exact authentication mechanism will be implemented during the Implementation phase.

---

## 6.2 Public Project API

```text
GET /api/projects
GET /api/projects/{id}
```

These endpoints allow visitors to retrieve public project information.

---

## 6.3 Public Service API

```text
GET /api/services
```

Allows visitors to retrieve Olysea's available services.

---

## 6.4 Contact API

```text
POST /api/contact
```

Allows visitors to submit contact requests.

---

## 6.5 Admin Project API

```text
POST   /api/admin/projects
PUT    /api/admin/projects/{id}
DELETE /api/admin/projects/{id}
```

These endpoints require administrator authorization.

---

## 6.6 Admin Service API

```text
POST   /api/admin/services
PUT    /api/admin/services/{id}
DELETE /api/admin/services/{id}
```

These endpoints require administrator authorization.

---

## 6.7 Admin Contact API

```text
GET   /api/admin/contact
PATCH /api/admin/contact/{id}
```

These endpoints allow administrators to view and manage contact requests.

---

# 7. HTTP Status Codes

The API will use standard HTTP status codes.

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource successfully created |
| 400 | Invalid request or validation failure |
| 401 | Authentication required or failed |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Resource conflict |
| 429 | Too many requests |
| 500 | Unexpected server error |

---

# 8. Authentication and Security Architecture

Security is designed as a layered system.

```text
Internet
   ↓
HTTPS / Edge Protection
   ↓
Angular
   ↓
Spring Boot Security
   ↓
Authorization
   ↓
Validation
   ↓
Business Logic
   ↓
Database
```

Security implementation will be performed during the Implementation and DevSecOps phases.

## 8.1 Administrator Access

The MVP will use a hidden administrator URL.

Example:

```text
/admin
```

The admin area will not be publicly linked from the normal website.

However, hiding the URL is **not considered a security mechanism**.

Actual protection will be enforced by the backend.

---

## 8.2 Authentication

Administrators must authenticate before accessing protected functionality.

```text
Administrator
     ↓
Login
     ↓
Authentication
     ↓
Authenticated session
     ↓
Admin Dashboard
```

The exact authentication mechanism will be selected and implemented during the Implementation phase.

---

## 8.3 Authorization

Admin endpoints require the appropriate administrator role.

Conceptually:

```text
Unauthenticated
      ↓
401 Unauthorized

Authenticated but not ADMIN
      ↓
403 Forbidden

Authenticated ADMIN
      ↓
Request allowed
```

The backend is the authoritative security boundary.

---

## 8.4 Angular Route Guards

Angular route guards will protect frontend navigation to administrator pages.

However:

> Angular guards are not a replacement for backend authorization.

An attacker can bypass the Angular application and send HTTP requests directly to the API.

Therefore, Spring Boot must independently enforce authorization.

---

## 8.5 Input Validation

User-controlled input must be validated on the backend.

Examples:

- Required fields
- String length
- Email format
- Allowed values
- Request size
- File restrictions if file uploads are introduced

Frontend validation exists primarily for user experience.

Backend validation is mandatory for security and data integrity.

---

## 8.6 Injection Protection

The application will avoid constructing database queries from raw user input.

Database access will use:

- Spring Data JPA
- Parameterized queries where custom queries are required
- Input validation

Other forms of injection will be considered when implementing features that process user-controlled input.

---

## 8.7 Broken Access Control

Authorization must be checked for protected operations.

For example:

```text
POST /api/admin/projects
```

must verify that the requester is authorized to perform the operation.

The system must not rely on the frontend to determine whether a user is allowed to perform an action.

---

## 8.8 Mass Assignment Protection

Client requests must not be allowed to modify arbitrary entity fields.

DTOs will be used where appropriate to explicitly define which fields clients are allowed to submit.

For example, an administrator request should not be able to arbitrarily modify security-sensitive fields such as:

```text
role
```

unless explicitly intended by the API.

---

## 8.9 Rate Limiting and Resource Protection

The system should protect against excessive resource consumption.

Controls will include, where appropriate:

- Rate limiting
- Stricter limits for authentication endpoints
- Contact endpoint limits
- Request body size limits
- Input length limits
- Pagination
- Maximum page sizes
- Database/resource protection

Application-level rate limiting protects the application from excessive requests, but it is not a complete solution for large-scale network-level DDoS attacks.

---

## 8.10 Security Misconfiguration

Production configuration must avoid exposing unnecessary information or functionality.

Examples:

- Debug mode
- Stack traces
- Default credentials
- Unnecessary endpoints
- Development configuration
- Sensitive actuator endpoints
- Excessive network exposure

---

## 8.11 Secrets

The following must never be committed to the repository:

```text
Database passwords
API keys
Authentication secrets
Private keys
Production credentials
```

Secrets will be supplied through environment or secret-management mechanisms.

The detailed secret-management strategy will be defined during DevSecOps and Deployment.

---

## 8.12 Logging and Security Events

Security-relevant events should be logged.

Examples:

- Failed authentication attempts
- Successful administrator authentication
- Authorization failures
- Rate-limit violations
- Unexpected server errors
- Important security events

Sensitive information such as passwords and authentication secrets must never be logged.

Detailed monitoring will be addressed during the Monitoring phase.

---

# 9. Frontend Architecture

## 9.1 Routing

The application will use Angular Router.

Public routes:

```text
/
/services
/projects
/projects/:id
/about
/contact
```

Admin routes:

```text
/admin/login
/admin/dashboard
/admin/projects
/admin/services
/admin/contacts
```

The admin area will be protected using Angular route guards.

---

## 9.2 Lazy Loading

Larger feature areas, particularly the admin area, can be lazy loaded.

This prevents unnecessary application code from being loaded when visitors only use the public website.

---

## 9.3 API Communication

Components should not contain raw HTTP logic wherever possible.

Instead:

```text
Component
    ↓
Feature Service
    ↓
HttpClient
    ↓
REST API
```

This keeps UI logic separate from API communication.

---

## 9.4 State Management

The MVP will use Angular's built-in mechanisms:

- Signals
- Services
- Component state

A dedicated state-management library such as NgRx is not required for the MVP.

This decision can be reconsidered if application complexity increases.

---

## 9.5 Forms

Reactive Forms will be used for forms that require structured validation.

Examples:

- Contact form
- Admin login
- Project management forms
- Service management forms

Validation will exist on both the frontend and backend.

---

## 9.6 UI States

API-driven features should account for:

```text
Loading
Success
Empty
Error
```

For example:

```text
Loading projects...
        ↓
Projects displayed
```

or:

```text
Loading projects...
        ↓
No projects available
```

or:

```text
Loading projects...
        ↓
Unable to load projects
```

---

# 10. Error Handling Architecture

The application will use centralized error handling.

## 10.1 Error Flow

```text
Angular
   ↓
Spring Boot
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
Error
   ↓
Global Exception Handler
   ↓
Standard API Error Response
   ↓
Angular
   ↓
User-friendly message
```

---

## 10.2 Standard Error Response

The API will use a consistent error structure.

Example:

```json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "The request contains invalid data.",
  "path": "/api/contact",
  "timestamp": "2026-09-23T12:00:00Z"
}
```

Validation errors may additionally contain field-specific errors.

Example:

```json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed.",
  "fields": {
    "name": "Name is required.",
    "email": "Invalid email address.",
    "message": "Message is required."
  }
}
```

---

## 10.3 Internal Errors

Unexpected server errors must not expose:

- Stack traces
- Internal class names
- Database details
- Secrets
- Infrastructure information
- Sensitive implementation details

Users receive a generic message.

Developers receive detailed information through secure server logs.

---

# 11. Technology Decisions

## 11.1 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Angular |
| Frontend language | TypeScript |
| Backend | Spring Boot |
| Backend language | Java |
| API | REST |
| Database | PostgreSQL |
| ORM | JPA / Hibernate |
| Data access | Spring Data JPA |
| Security | Spring Security |
| Build tool | Maven |
| Version control | Git |
| Repository | GitHub |

---

## 11.2 Technologies Deliberately Not Used

The MVP will not use:

- Microservices
- Kubernetes
- GraphQL
- NgRx
- Kafka
- Service mesh
- Multiple databases
- Event-driven architecture

These technologies may be appropriate for different problems, but they are not currently required by Olysea's MVP.

---

# 12. Docker and Infrastructure

Docker will be introduced as part of the DevSecOps and Deployment stages.

The eventual containerized architecture may include:

```text
Docker
├── Angular
├── Spring Boot
└── PostgreSQL
```

However, development does not need to begin with a fully containerized environment.

Infrastructure decisions should be introduced when they solve an actual requirement.

---

# 13. Testing Considerations

Testing is designed into the architecture even though detailed testing will be handled in a later phase.

Backend testing may include:

- Unit tests
- Service tests
- Controller/API tests
- Integration tests
- Security tests

Frontend testing may include:

- Component tests
- Service tests
- Form validation tests
- Important user-flow tests

The complete testing strategy will be defined in **EPIC-05: Testing**.

---

# 14. DevSecOps Considerations

The architecture is designed to support future DevSecOps practices.

Potential CI/CD security controls include:

- Dependency scanning
- Static analysis
- Secret scanning
- Automated tests
- Container scanning
- Build verification
- Security checks

These will be designed and implemented during **EPIC-06: DevSecOps**.

---

# 15. Deployment Considerations

The application is designed to support containerized deployment.

Deployment architecture will be defined separately and may eventually contain:

```text
Internet
   ↓
Reverse Proxy / Load Balancer
   ↓
Angular / Web Server
   ↓
Spring Boot API
   ↓
PostgreSQL
```

Production deployment decisions are intentionally deferred until the Deployment phase.

---

# 16. Monitoring Considerations

Monitoring will be addressed after deployment.

The system should eventually provide visibility into:

- Application health
- API errors
- Response times
- Resource usage
- Authentication failures
- Authorization failures
- Rate-limit violations
- Database health
- Infrastructure health

Monitoring and alerting will be defined in **EPIC-08: Monitoring**.

---

# 17. Architecture Review

The architecture was reviewed against the requirements defined during the Requirements phase.

## 17.1 Functional Requirements

The architecture supports:

- Public website
- Services
- Projects
- Project details
- Contact form
- Admin authentication
- Admin dashboard
- Project management
- Service management
- Contact management

## 17.2 Security

The architecture includes design considerations for:

- Authentication
- Authorization
- Broken access control
- Input validation
- Injection protection
- Rate limiting
- Resource exhaustion
- Secure error handling
- Secret management
- Security logging
- Security misconfiguration
- Mass assignment protection

Security implementation is intentionally deferred to the Implementation and DevSecOps phases.

## 17.3 Maintainability

Feature-based frontend and backend structures provide separation of responsibilities and make the codebase easier to maintain.

## 17.4 Scalability

The modular monolith provides a simple starting point while leaving room for future scaling.

The system can be reevaluated if traffic, team size, or business requirements grow significantly.

## 17.5 Complexity

The architecture intentionally avoids unnecessary infrastructure and distributed-system complexity.

The MVP does not require:

- Microservices
- Kubernetes
- GraphQL
- Kafka
- Complex state-management infrastructure

---

# 18. Key Architectural Principles

The Olysea project follows these principles:

### Separation of Concerns

Each layer should have a clear responsibility.

```text
Frontend → UI
Backend → Business Logic
Database → Persistence
```

### Backend as Security Boundary

Frontend security mechanisms improve user experience but do not replace backend security.

### Validate at Trust Boundaries

User-controlled data must be validated on the backend.

### Least Privilege

Users, services, APIs, and database connections should receive only the permissions they require.

### Secure by Design

Security requirements are considered during architecture rather than being added only after implementation.

### Avoid Premature Complexity

Technology should be introduced when it solves a real problem.

### Design for Change

The architecture should allow future evolution without requiring unnecessary complexity in the MVP.

---

# 19. Final Architecture

```text
                         INTERNET
                            │
                            ▼
                  ┌──────────────────┐
                  │ Angular Frontend │
                  │                  │
                  │ Public Website   │
                  │ Admin Dashboard  │
                  └────────┬─────────┘
                           │
                      HTTPS / REST
                           │
                           ▼
                ┌──────────────────────┐
                │    Spring Boot API   │
                │                      │
                │ Authentication       │
                │ Authorization        │
                │ Controllers          │
                │ Validation           │
                │ Business Logic       │
                │ Error Handling       │
                │ Security Controls    │
                └──────────┬───────────┘
                           │
                    Spring Data JPA
                           │
                           ▼
                ┌──────────────────────┐
                │      PostgreSQL      │
                │                      │
                │ Users                │
                │ Projects             │
                │ Services             │
                │ Contact Requests     │
                └──────────────────────┘
```

---

# 20. Architecture Status

**EPIC-02: System Design — Complete**

Implementation will follow the architecture defined in this document.