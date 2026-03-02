# MunchGo E2E User Journeys

This document maps every user journey covered by the E2E test suites for both the **Monolith** (Playwright against localhost:8080) and the **SPA** (Playwright against CloudFront). Both suites test the same journeys to validate functional parity.

---

## Journey Coverage by Role

### Guest User

```mermaid
journey
    title Guest User Journeys
    section Browse
      View home page: 5: Guest
      Browse restaurants: 5: Guest
      View restaurant menu: 5: Guest
      See menu prices: 5: Guest
    section Auth Prompts
      See login prompt on cart: 3: Guest
      Redirected to login on protected page: 3: Guest
    section Registration
      Register as Customer: 5: Guest
      Register as Restaurant Owner: 5: Guest
      Register as Courier: 5: Guest
      Duplicate user error: 3: Guest
      Toggle role fields: 5: Guest
```

### Customer

```mermaid
journey
    title Customer Journeys
    section Authentication
      Login with credentials: 5: Customer
      Invalid login shows error: 3: Customer
      Logout: 5: Customer
    section Dashboard
      View dashboard with stats: 5: Customer
      See Total Orders count: 5: Customer
      See Active Orders count: 5: Customer
      See Recent Orders table: 5: Customer
    section Ordering
      Browse restaurants: 5: Customer
      View menu with quantities: 5: Customer
      Fill delivery address: 5: Customer
      Place order: 5: Customer
    section Order Management
      View orders list: 5: Customer
      View order detail: 5: Customer
      Track order timeline: 5: Customer
      Cancel approved order: 4: Customer
    section Navigation
      See My Dashboard link: 5: Customer
      See My Orders link: 5: Customer
      See Browse Restaurants link: 5: Customer
```

### Restaurant Owner

```mermaid
journey
    title Restaurant Owner Journeys
    section Authentication
      Register as owner: 5: Owner
      Login: 5: Owner
    section Order Workflow
      View Pending Approval orders: 5: Owner
      Approve order: 5: Owner
      Accept order: 5: Owner
      Start Preparing: 5: Owner
      Mark Ready for Pickup: 5: Owner
    section Navigation
      See Restaurant Dashboard link: 5: Owner
      View dashboard with workflow sections: 5: Owner
```

### Courier

```mermaid
journey
    title Courier Journeys
    section Authentication
      Register as courier: 5: Courier
      Login: 5: Courier
    section Deliveries
      View Available Pickups: 5: Courier
      Pick up order: 5: Courier
      View My Active Deliveries: 5: Courier
      Mark order Delivered: 5: Courier
    section Navigation
      See Courier Dashboard link: 5: Courier
      View empty state messages: 4: Courier
```

### Admin

```mermaid
journey
    title Admin Journeys
    section Authentication
      Login as admin: 5: Admin
      Non-admin denied access: 3: Customer
    section Dashboard
      View summary cards: 5: Admin
      See Consumers count: 5: Admin
      See Restaurants count: 5: Admin
      See Orders count: 5: Admin
      See Couriers count: 5: Admin
    section Data Management
      View consumers table: 5: Admin
      View restaurants table: 5: Admin
      View orders table: 5: Admin
      View couriers table: 5: Admin
      Filter orders by state: 5: Admin
```

---

## Order Lifecycle State Machine

This is the core cross-role journey tested in `05-order-lifecycle.spec.ts`:

```mermaid
flowchart TD
    A[Customer places order] --> B{APPROVAL_PENDING}
    B -->|Restaurant Owner: Approve| C[APPROVED]
    B -->|Restaurant Owner: Reject| R[REJECTED]
    C -->|Customer: Cancel| X[CANCELLED]
    C -->|Restaurant Owner: Accept| D[ACCEPTED]
    D -->|Restaurant Owner: Start Preparing| E[PREPARING]
    E -->|Restaurant Owner: Ready| F[READY_FOR_PICKUP]
    F -->|Courier: Pick Up| G[PICKED_UP]
    G -->|Courier: Deliver| H[DELIVERED]

    style A fill:#ffc107,color:#000
    style B fill:#ffc107,color:#000
    style C fill:#17a2b8,color:#fff
    style D fill:#0d6efd,color:#fff
    style E fill:#fd7e14,color:#fff
    style F fill:#20c997,color:#fff
    style G fill:#6610f2,color:#fff
    style H fill:#198754,color:#fff
    style R fill:#dc3545,color:#fff
    style X fill:#6c757d,color:#fff
```

---

## Test File to Journey Mapping

| Test File | Journeys Covered | Roles | Monolith | SPA |
|-----------|-----------------|-------|----------|-----|
| `01-registration` | Registration for all 3 roles, duplicate error, field toggling | Guest | 5 tests | 6 tests |
| `02-login-logout` | Login, invalid login, logout, auth redirect | Guest, Customer, Admin | 6 tests | 5 tests |
| `03-browse` | Home page, restaurant browsing, menu viewing, guest prompts | Guest, Customer | 4 tests | 7 tests |
| `04-order-placement` | Place order, verify in list, view detail | Customer | 3 tests | 3 tests |
| `05-order-lifecycle` | Full order state machine across all roles | All 4 roles | 1 test | 1 test |
| `06-order-cancel` | Cancel approved order | Customer, Owner | 1 test | 1 test |
| `07-admin` | Dashboard, all admin tables, access denial | Admin, Customer | 7 tests | 7 tests |
| `08-role-based-dashboards` | Dashboard routing, navbar links per role | All 4 roles | 4 tests | 6 tests |
| `09-ui-parity` | Content parity validation across all pages | All roles | — | 14 tests |
| **Total** | | | **31 tests** | **50 tests** |

---

## Intentional Differences (Not Bugs)

These are architecture-driven differences between monolith and SPA that are documented and tested:

| Area | Monolith | SPA | Reason |
|------|----------|-----|--------|
| Login field | Username | Email | Cognito identity provider |
| Role selection | Dropdown `<select>` | Tab buttons | Modern UX pattern |
| Post-registration | Redirect to `/login?registered` | Auto-login to dashboard | Better UX, JWT-based |
| Remember me | Checkbox present | Not present | JWT handles persistence |
| Admin Users page | Present | Absent | Users managed via Cognito console |
| 403 page | Dedicated error page | Redirect to `/login` | SPA uses RequireAuth component |
| Cancel eligibility | APPROVED only | APPROVAL_PENDING + APPROVED | Broader cancel window |
| Order state filters | None | Filter pills on admin orders | SPA enhancement |
| Pagination | None | Present on order lists | SPA enhancement |
