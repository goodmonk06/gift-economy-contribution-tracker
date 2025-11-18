# Architecture Documentation

## System Overview

The Gift Economy Contribution Tracker is a full-stack TypeScript application designed to track and visualize patterns of generosity in communities. The system follows a layered architecture with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                  │
│  - React Components                                      │
│  - Client-side routing                                   │
│  - UI/UX Layer                                           │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────┴────────────────────────────────────┐
│                   API Layer (Fastify)                    │
│  - Route handlers                                        │
│  - Request validation (Zod)                              │
│  - Error handling                                        │
│  - Logging & Metrics                                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                   Service Layer                          │
│  - Business logic                                        │
│  - Domain services                                       │
│  - Event emission                                        │
│  - Adapter orchestration                                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                 Data Layer (Prisma)                      │
│  - ORM                                                   │
│  - Query building                                        │
│  - Transaction management                                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                   PostgreSQL Database                    │
│  - Relational data storage                               │
│  - ACID transactions                                     │
│  - Indexes for performance                               │
└──────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Layers

#### 1. API Layer (`src/routes/`)
- **Responsibility**: HTTP request handling, validation, response formatting
- **Technologies**: Fastify, Zod
- **Key Files**:
  - `routes/communities.ts`: Community CRUD
  - `routes/members.ts`: Member management and profiles
  - `routes/gifts.ts`: Gift contribution tracking
  - `routes/snapshots.ts`: Balance aggregation

#### 2. Service Layer (`src/services/`)
- **Responsibility**: Business logic, domain operations
- **Technologies**: TypeScript, Prisma Client
- **Key Files**:
  - `services/snapshotService.ts`: Aggregation logic
  - (Future: `services/giftService.ts`, `services/memberService.ts`)

#### 3. Domain Layer (`prisma/schema.prisma`)
- **Responsibility**: Data models, relationships, constraints
- **Technologies**: Prisma Schema Language
- **Entities**: Community, Member, Gift, Tag, Relationship, etc.

#### 4. Infrastructure Layer (`src/lib/`)
- **Responsibility**: Cross-cutting concerns
- **Components**:
  - **Logging**: Structured logs with context (`lib/logger.ts`)
  - **Errors**: Type-safe error handling (`lib/errors.ts`, `lib/errorHandler.ts`)
  - **Metrics**: Performance and business metrics (`lib/metrics.ts`)
  - **Events**: Domain event bus (`lib/events/`)
  - **Adapters**: External service integrations (`lib/adapters/`)

### Design Patterns

#### 1. Adapter Pattern
Used for external integrations that can be swapped:

```typescript
interface INotificationAdapter {
  send(options: SendNotificationOptions): Promise<NotificationResult>;
  supportsChannel(channel: NotificationChannel): boolean;
}

// Development: Console output
class ConsoleNotificationAdapter implements INotificationAdapter { }

// Production: Email service
class EmailNotificationAdapter implements INotificationAdapter { }
```

#### 2. Event-Driven Architecture
Domain events decouple features:

```typescript
// Emit event
eventBus.emit({
  type: DomainEventType.GIFT_CREATED,
  giftId: gift.id,
  communityId: gift.communityId,
  giverMemberId: gift.giverMemberId,
});

// Handle event
eventBus.on(DomainEventType.GIFT_CREATED, async (event) => {
  // Send notification
  // Update analytics
  // Generate snapshot
});
```

#### 3. Repository Pattern (via Prisma)
Data access abstracted through Prisma Client:

```typescript
// Clean separation: routes don't know about SQL
const gifts = await prisma.giftContribution.findMany({
  where: { communityId },
  include: { giver: true, receiver: true },
});
```

## Data Flow

### Example: Creating a Gift

```
1. Frontend → POST /api/gifts
   ├─ Body: { giverMemberId, receiverMemberId, description, ... }
   └─ Headers: Content-Type: application/json

2. API Layer (routes/gifts.ts)
   ├─ Validate request with Zod
   ├─ Log request
   └─ Call service layer

3. Service Layer (future giftService.ts)
   ├─ Business validation
   ├─ Create gift in database
   ├─ Emit GiftCreated event
   └─ Return created gift

4. Event Handlers
   ├─ Notification handler → Send notification to receiver
   ├─ Analytics handler → Track gift event
   └─ Snapshot handler → Update balance snapshots

5. Response
   ├─ Format success response
   ├─ Log completion
   ├─ Record metrics
   └─ Return to frontend
```

## Frontend Architecture

### Structure

```
frontend/src/app/
├── page.tsx                      # Home page (community listing)
├── layout.tsx                    # Root layout with nav
├── globals.css                   # Global styles
├── communities/
│   └── [id]/
│       └── page.tsx              # Community detail page
└── members/
    └── [id]/
        └── page.tsx              # Member profile page
```

### Key Patterns

#### 1. Server-Side Data Fetching
- Use React Server Components for initial data
- Fetch from API on server for better SEO and performance

#### 2. Client-Side State
- Use React hooks (useState, useEffect) for interactive features
- Keep state close to where it's used

#### 3. Component Composition
- Small, focused components
- Reusable UI elements

## Database Schema Design

### Core Entities

#### Community (Hub)
- Central organizational unit
- Has many: Members, Gifts, Tags, Settings
- Soft delete support

#### Member (Actor)
- Belongs to one community
- Can give and receive gifts
- Can have relationships with other members
- Can be tagged with skills/roles

#### GiftContribution (Transaction)
- From one member to another (or community-wide)
- Has status lifecycle (pending → acknowledged → completed)
- Can be tagged
- Tracked in activity log

#### Tag (Classifier)
- Shared across gifts and members
- Community-scoped
- Has color and icon for visualization

### Relationship Design

#### Many-to-Many: Gifts ↔ Tags
```
GiftContribution ←─┐
                   ├→ GiftTag ←→ Tag
                   │
MemberContribution ─┘
```

#### Self-Referential: Member Relationships
```
Member ──┐
         ├→ MemberRelationship ─→ Member
         │   (type: KNOWS, TRUSTS, etc.)
         └──────────────────────┘
```

### Indexes

Strategic indexes for common queries:

```sql
-- Fast community gift lookups
CREATE INDEX ON gift_contributions (community_id, timestamp);

-- Member activity queries
CREATE INDEX ON gift_contributions (giver_member_id);
CREATE INDEX ON gift_contributions (receiver_member_id);

-- Status filtering
CREATE INDEX ON gift_contributions (status);

-- Tag lookups
CREATE INDEX ON tags (community_id, slug);
```

## Extensibility Points

### 1. Notification Adapters
**Interface**: `INotificationAdapter`
**Use Cases**:
- Email notifications (SendGrid, AWS SES)
- SMS notifications (Twilio)
- Push notifications (Firebase, OneSignal)
- Webhooks to external systems

### 2. Analytics Adapters
**Interface**: `IAnalyticsAdapter`
**Use Cases**:
- Mixpanel, Segment for product analytics
- Custom data warehouse integration
- Real-time dashboards

### 3. Domain Events
**Event Bus**: `EventBus`
**Use Cases**:
- Trigger workflows on gift creation
- Integrate with external systems
- Audit logging
- Real-time notifications

### 4. Custom Gift Types
**Extension**: `GiftTemplate`
**Use Cases**:
- Pre-defined gift types per community
- Custom value calculations
- Workflow automation

## Security Considerations

### Current State
- Input validation with Zod
- SQL injection prevention (Prisma parameterization)
- Error message sanitization (no stack traces in production)

### Future Enhancements
- Authentication (JWT, OAuth)
- Authorization (RBAC, community roles)
- Rate limiting
- CSRF protection
- API key management for external integrations

## Performance Optimization

### Database
- Strategic indexes on frequently queried columns
- Batch operations for bulk inserts
- Connection pooling via Prisma

### API
- Response compression (Fastify)
- Query result pagination
- Selective field inclusion with Prisma

### Frontend
- Code splitting (Next.js automatic)
- Image optimization
- Static generation for public pages

## Deployment Architecture

### Development
```
docker-compose up
├─ PostgreSQL (port 5432)
├─ Backend (port 3001)
└─ Frontend (port 3000)
```

### Production (Future)
```
Load Balancer
├─ Frontend (Static hosting / Vercel)
└─ Backend (Containerized / K8s)
    ├─ Replicas: 3+
    └─ PostgreSQL (Managed DB / AWS RDS)
```

## Monitoring & Observability

### Logging
- Structured JSON logs
- Request/response logging
- Error tracking with context
- Configurable log levels

### Metrics
- HTTP request duration
- Request count by endpoint
- Error rates
- Domain metrics (gifts/day, active members)

### Health Checks
- `/health`: Server status, uptime
- `/metrics`: Prometheus-compatible metrics (future)

## Testing Strategy

### Unit Tests
- Business logic in services
- Utility functions
- Error handling

### Integration Tests
- API endpoints
- Database operations
- Event handlers

### E2E Tests (Future)
- Critical user flows
- Gift creation → acknowledgment flow
- Member onboarding

## Future Architecture Improvements

1. **CQRS**: Separate read and write models for complex queries
2. **Message Queue**: Replace in-memory event bus with Redis/RabbitMQ
3. **Caching**: Redis for frequently accessed data
4. **GraphQL**: Alternative to REST for flexible frontend queries
5. **Real-time**: WebSockets for live updates
6. **Federation**: Multi-community connections and gift flows
7. **Blockchain**: Permanent gift records on distributed ledger
