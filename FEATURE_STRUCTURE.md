# Feature-Based Architecture Guide

This guide explains how to organize code in a feature-based structure for scalability.

## Directory Structure

```
project/
├── features/               # Feature modules (optional)
│   ├── auth/              # Authentication feature
│   ├── projects/          # Project management feature
│   ├── risks/             # Risk management feature
│   └── tasks/             # Task management feature
├── lib/                   # Shared utilities
│   ├── types/            # Shared TypeScript types
│   ├── errors/           # Error handling
│   ├── auth.ts           # Authentication utilities
│   ├── rbac.ts           # Role-based access control
│   ├── middleware.ts     # API middleware
│   └── prisma.ts         # Database client
└── app/                  # Next.js App Router
    └── api/              # API routes
```

## Feature Module Pattern

Each feature can have:

```
features/projects/
├── types.ts              # Feature-specific types
├── validators.ts         # Input validation schemas
├── services.ts           # Business logic
├── utils.ts              # Feature-specific utilities
└── README.md            # Feature documentation
```

## Current Architecture

The application currently uses a **hybrid approach**:

1. **API Routes**: Located in `app/api/` following Next.js App Router conventions
2. **Shared Utilities**: Located in `lib/` for cross-feature utilities
3. **Types**: Centralized in `lib/types/` for consistency
4. **Components**: Can be organized by feature or globally

## Benefits of Feature-Based Structure

1. **Scalability**: Easy to add new features without affecting existing ones
2. **Maintainability**: Related code is co-located
3. **Team Collaboration**: Different teams can work on different features
4. **Code Organization**: Clear boundaries between features

## Example: Adding a New Feature

To add a new feature (e.g., "reports"):

1. Create API routes: `app/api/reports/route.ts`
2. Add types: Update `lib/types/index.ts` or create `features/reports/types.ts`
3. Add business logic: Create `features/reports/services.ts`
4. Add validation: Create `features/reports/validators.ts`
5. Update Prisma schema if needed
6. Add documentation: Create `features/reports/README.md`

## Best Practices

1. **Keep lib/ lean**: Only shared utilities that are used across multiple features
2. **Feature isolation**: Features should not directly import from each other
3. **Use types**: Always use TypeScript types for API requests/responses
4. **Error handling**: Use the error utilities from `lib/errors/`
5. **Authentication**: Use middleware from `lib/middleware.ts`
6. **RBAC**: Check permissions with `lib/rbac.ts`

## Migration Path

The current structure is flexible. You can:

- **Keep it as is**: Continue using the current structure
- **Gradually migrate**: Move feature-specific code to `features/` as needed
- **Full migration**: Restructure everything into feature modules

Choose the approach that best fits your team's needs and project size.
