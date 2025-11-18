# Changelog

All notable changes to the Gift Economy Contribution Tracker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Phase 3 - Production Ready Architecture (2025-01-XX)

#### Added
- **Domain Model Expansion**: 6 new entities (Tag, CommunitySettings, MemberRelationship, GiftTemplate, ActivityLog, Notification)
- **Event System**: Domain event bus with typed events and handlers
- **Adapter Interfaces**: INotificationAdapter and IAnalyticsAdapter for external integrations
- **CLI Tools**: gift-cli with commands for stats, seed, export, and generate
- **Logging Infrastructure**: Centralized structured logging with context
- **Metrics System**: Counter, gauge, and histogram metrics
- **Error Handling**: Comprehensive error classes and centralized error handler
- **Dockerfiles**: Multi-stage builds for backend and frontend
- **Enhanced Docker Compose**: Full stack orchestration with networking
- **Phase 3 Documentation**: PHASE3_OVERVIEW.md, ARCHITECTURE.md
- **Status Enums**: GiftStatus, GiftVisibility, RelationshipType, ActivityType, NotificationType
- **Soft Delete**: Support for soft deletes on Community, Member, GiftContribution
- **ESLint Configuration**: Code linting with TypeScript support
- **Enhanced Scripts**: lint, typecheck, format commands across workspaces
- **Test Infrastructure**: Comprehensive tests for errors, metrics, and core logic

#### Changed
- **Community Model**: Added slug, imageUrl, isActive, metadata fields
- **Member Model**: Added bio, skills, isActive, joinedAt, metadata fields
- **GiftContribution Model**: Added status, visibility, acknowledgedAt, templateId, metadata fields
- **Database Schema**: Complete restructuring with enums and many-to-many relationships
- **API Server**: Integrated error handler, logging, and metrics middleware
- **Package Dependencies**: Added commander, uuid, eslint, prettier

#### Enhanced
- **Type Safety**: Strict TypeScript configuration across all modules
- **API Routes**: Better error handling and validation
- **Development Experience**: Comprehensive scripts and tooling

## [1.0.0] - Initial Release (2025-01-XX)

### Added
- **Core Domain Models**: Community, Member, GiftContribution, GiftBalanceSnapshot
- **Backend API**: Fastify REST API with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Next.js 14 with App Router and Tailwind CSS
- **Docker Support**: Docker Compose for PostgreSQL
- **Seed Data**: Realistic test data for two communities
- **Snapshot Service**: Aggregation logic for gift balances
- **API Endpoints**:
  - Communities: CRUD operations
  - Members: CRUD and profile endpoint
  - Gifts: CRUD and statistics
  - Snapshots: Generation and retrieval
- **Validation**: Zod schemas for request validation
- **Testing**: Vitest setup with basic tests
- **Documentation**: Comprehensive README with setup instructions
- **License**: MIT License
- **Environment**: .env.example for configuration

### Core Features
- Track gifts, favors, and contributions
- Community and member management
- Soft metrics (value estimates as indicators)
- Balance snapshots over time
- Community-wide gifts support
- Tag-based categorization (JSON)
- Time-series gift data

### Development Tools
- Makefile with common commands
- Hot reload in development
- Prisma Studio for database management
- TypeScript end-to-end

---

## Version History

### Versioning Strategy

This project uses Semantic Versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking API changes or significant architecture shifts
- **MINOR**: New features, backward-compatible
- **PATCH**: Bug fixes, minor improvements

### Upgrade Guides

#### Upgrading to Phase 3 Schema

**⚠️ Breaking Changes**: The database schema has significant changes.

**Migration Steps**:
1. Backup your database: `pg_dump gift_economy > backup.sql`
2. Review new schema: See `backend/prisma/schema.prisma`
3. Run migrations: `npm run db:migrate`
4. Update seed data if customized
5. Test thoroughly in development first

**Key Schema Changes**:
- Added `slug` to Community (unique, required)
- Added `isActive` flags to Community and Member
- Replaced `tagsJson` with proper Tag relationships
- Added status enums to GiftContribution
- Added soft delete timestamps

**API Changes**:
- Community creation now requires `slug` field
- Gift creation supports `status` and `visibility` fields
- Tag endpoints added (future)

#### Deprecations
- **tagsJson field**: Still supported but deprecated. Use Tag relationships instead.
- **Direct Prisma queries in routes**: Move to service layer for better separation.

### Future Roadmap

See [PHASE3_OVERVIEW.md](docs/PHASE3_OVERVIEW.md#future-extensions-phase-4) for Phase 4+ plans.

**Coming Soon**:
- Real-time gift flow visualizations
- Mobile apps (React Native)
- Advanced analytics dashboard
- Multi-community federation
- Integration marketplace
- AI-powered gift suggestions
