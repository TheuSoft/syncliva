# Medical Appointment System - AI Coding Instructions

## 🏗️ Architecture Overview

This is a **medical appointment management system** built with Next.js 15 (App Router), featuring dual interfaces for clinic administrators and doctors. The system uses a multi-tenant architecture where clinics contain doctors and patients.

### Key Entities & Relationships
- **Clinics** contain multiple doctors and patients
- **Users** have roles (`clinic_admin` | `doctor`) and are linked to clinics via `usersToClinicsTable`
- **Doctors** can be both database entities and user accounts (invitation system)
- **Appointments** connect patients, doctors, and clinics with status tracking

## 🚀 Essential Development Patterns

### Server Actions (Primary Data Layer)
All database operations use **next-safe-action** with strict patterns:
```typescript
// Pattern: src/actions/{action-name}/index.ts + schema.ts
export const actionName = actionClient
  .schema(actionSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    // Always validate auth and clinic access
    // Use revalidatePath() for cache invalidation
  });
```

### Authentication & Authorization Flow
- **BetterAuth** with custom session extension in `src/lib/auth.ts`
- **Role-based routing**: Admins → `/dashboard`, Doctors → `/doctor/dashboard` 
- **Middleware protection** in `src/app/(protected)` and `src/app/(doctor)` route groups
- Always check `session.user.clinic.id` for multi-tenant isolation

### Form Handling Standards
- **React Hook Form** + **Zod** + **shadcn/ui form components**
- Use `useAction` hook from next-safe-action for server action calls
- Example pattern in `src/app/(protected)/doctors/_components/upsert-doctor-form.tsx`

### Database Schema (Drizzle ORM)
- **PostgreSQL** with Drizzle schema in `src/db/schema.ts`
- **Soft deletion** patterns for critical entities
- **UTC time handling** for doctor availability (see `upsert-doctor` action)
- **Appointment status flow**: `pending` → `confirmed` | `canceled`

## 🎯 Domain-Specific Logic

### Appointment Scheduling
- **Available times calculation** in `get-available-times` action
- **Doctor availability** by weekday range + time slots
- **Conflict prevention** excludes non-canceled appointments
- **Price inheritance** from doctor to appointment (editable)

### Doctor Management System
- **Invitation workflow**: Admin invites → Doctor registers → User account created
- **Token-based registration** with 7-day expiry
- **Dual dashboard routing** based on user role
- **Clinic association** required for all operations

### Multi-Tenant Data Isolation
Every query MUST filter by `clinicId` from session:
```typescript
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user.clinic?.id) throw new Error("Clinic not found");
// Filter all queries by session.user.clinic.id
```

## 🛠️ Key Development Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npx drizzle-kit push # Database schema sync
```

## 📁 Critical File Locations

- **Database**: `src/db/schema.ts` (entities), `src/db/index.ts` (connection)
- **Authentication**: `src/lib/auth.ts` (BetterAuth config with custom session)
- **Layouts**: Route-based in `src/app/(protected)` vs `src/app/(doctor)`
- **Actions**: `src/actions/{feature}/index.ts` + `schema.ts` pattern
- **Types**: `src/types/appointments.ts` for cross-component data shapes
- **UI Components**: `src/components/ui/` (shadcn/ui based)

## ⚠️ Common Gotchas

1. **Time zones**: Doctor availability stored in UTC, convert for display
2. **Appointment editing**: Only allow editing of `pending` status appointments
3. **Role redirection**: Check middleware and layout files for routing logic
4. **Clinic access**: Never query without clinic ID validation
5. **Revalidation**: Always `revalidatePath()` after mutations for fresh data

## 🎨 UI Patterns

- Use `PageContainer` wrapper for consistent spacing
- Follow shadcn/ui component patterns
- `react-number-format` for input masks
- `dayjs` for date manipulation (not date-fns)
- Tailwind CSS with theme support (dark/light mode)

## 📝 Documentation Rules

- **Never create README files** to explain changes or new features
- Code should be self-documenting through clear naming and comments
- Use inline comments for complex business logic only
- Documentation belongs in this file, not in separate READMEs
