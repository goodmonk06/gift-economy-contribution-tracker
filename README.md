# 🎁 Gift Economy Contribution Tracker

> A platform to track and visualize gifts, favors, and contributions in communities. Making generosity visible.

ボランタリーな貢献・ギフト・助け合いを可視化し、見えない貢献を評価するギフトエコノミー・トラッカー。

## Overview

The Gift Economy Contribution Tracker helps communities record and visualize the flow of gifts, favors, help offered, and mutual aid. This isn't about strict accounting or creating debt obligations - it's about making patterns of generosity visible and celebrating contributions that often go unrecognized.

### Key Philosophy

- **Soft Metrics, Not Hard Accounting**: Values are indicators, not precise measurements
- **Visibility Over Obligation**: The goal is to see patterns, not create debt
- **Community Focus**: Designed for mutual aid, not transactions
- **No Judgment**: Balanced or unbalanced giving/receiving are both valid

## Tech Stack

- **Backend**: Node.js + Fastify + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Frontend**: Next.js 14 (App Router) + React + TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Dev Environment**: Docker Compose

## Project Structure

```
gift-economy-contribution-tracker/
├── backend/                 # Fastify API server
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data script
│   └── src/
│       ├── index.ts        # Server entry point
│       ├── db.ts           # Prisma client
│       ├── routes/         # API route handlers
│       │   ├── communities.ts
│       │   ├── members.ts
│       │   ├── gifts.ts
│       │   └── snapshots.ts
│       └── services/
│           └── snapshotService.ts  # Aggregation logic
├── frontend/               # Next.js web app
│   └── src/
│       └── app/
│           ├── page.tsx                    # Home page
│           ├── communities/[id]/page.tsx   # Community detail
│           └── members/[id]/page.tsx       # Member profile
└── docker-compose.yml      # PostgreSQL container
```

## Domain Model

### GiftContribution

Records individual gifts, favors, or contributions.

- `id`: Unique identifier
- `communityId`: Community this gift belongs to
- `giverMemberId`: Member giving the gift
- `receiverMemberId`: Member receiving (nullable for community-wide gifts)
- `descriptionMarkdown`: Description of the gift
- `timestamp`: When the gift was given
- `valueEstimate`: Optional soft indicator of value
- `tagsJson`: JSON array of tags for categorization

### GiftBalanceSnapshot

Periodic snapshots of a member's giving/receiving activity.

- `id`: Unique identifier
- `memberId`: Member this snapshot is for
- `communityId`: Community context
- `timestamp`: Snapshot creation time
- `givenCount`: Number of gifts given
- `receivedCount`: Number of gifts received
- `netBalance`: Soft metric (not strict accounting)
- `metaJson`: Additional metadata

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/goodmonk06/gift-economy-contribution-tracker.git
cd gift-economy-contribution-tracker
```

2. Install dependencies:

```bash
npm install
```

3. Start PostgreSQL:

```bash
npm run docker:up
```

4. Set up the database:

```bash
# Generate Prisma client
cd backend
npm run db:generate

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

5. Start the development servers:

```bash
# From the root directory
npm run dev
```

This will start:
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000

## API Endpoints

### Communities

- `GET /api/communities` - List all communities
- `GET /api/communities/:id` - Get community details
- `POST /api/communities` - Create a community

### Members

- `GET /api/members` - List members (filter by `?communityId=...`)
- `GET /api/members/:id/profile` - Get member profile with stats
- `POST /api/members` - Create a member

### Gifts

- `GET /api/gifts` - List gifts (filter by `communityId`, `giverMemberId`, `receiverMemberId`)
- `GET /api/gifts/:id` - Get gift details
- `POST /api/gifts` - Record a new gift
- `GET /api/gifts/stats/community/:communityId` - Get community gift statistics

### Snapshots

- `GET /api/snapshots/member/:memberId` - Get member's balance snapshots
- `GET /api/snapshots/community/:communityId` - Get community snapshots
- `POST /api/snapshots/generate/member/:memberId` - Generate snapshot for a member
- `POST /api/snapshots/generate/community/:communityId` - Generate snapshots for all members

## Usage Examples

### Recording a Gift

```bash
curl -X POST http://localhost:3001/api/gifts \
  -H "Content-Type: application/json" \
  -d '{
    "communityId": "...",
    "giverMemberId": "...",
    "receiverMemberId": "...",
    "descriptionMarkdown": "Helped debug production issue for 2 hours",
    "valueEstimate": 100,
    "tags": ["debugging", "emergency-help"]
  }'
```

### Generating Balance Snapshots

```bash
# For a specific member
curl -X POST http://localhost:3001/api/snapshots/generate/member/MEMBER_ID

# For all members in a community
curl -X POST http://localhost:3001/api/snapshots/generate/community/COMMUNITY_ID
```

## Features

### 1. Gift Ingestion

Record gifts through the API or UI with:
- Markdown descriptions
- Optional value estimates (soft indicators)
- Tags for categorization
- Support for community-wide gifts (no specific receiver)

### 2. Snapshot Aggregation

Generate periodic summaries of:
- Total gifts given/received
- Estimated value flows (soft metrics)
- Balance trends over time

### 3. Member Gift Profile UI

View individual member profiles showing:
- Gift giving and receiving history
- Balance snapshots over time
- Visual indicators of contribution patterns
- Tag clouds showing areas of contribution

### 4. Developer Experience

- TypeScript end-to-end for type safety
- Docker Compose for easy local development
- Prisma for type-safe database access
- Hot reload in development
- Seed data for quick testing

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Management

```bash
# Open Prisma Studio (visual DB editor)
cd backend
npm run db:studio

# Create a new migration
npm run db:migrate

# Reset database and reseed
npx prisma migrate reset
```

### Building for Production

```bash
# Build all packages
npm run build

# Start production servers
cd backend && npm start
cd frontend && npm start
```

## Philosophy and Use Cases

### What This Is For

- Making invisible contributions visible
- Celebrating patterns of generosity
- Understanding community dynamics
- Facilitating mutual aid coordination

### What This Is NOT For

- Creating debt obligations
- Strict economic accounting
- Transactional relationships
- Judgment of "balanced" vs "unbalanced" giving

### Example Use Cases

1. **Tech Communities**: Track code reviews, mentorship, knowledge sharing
2. **Neighborhoods**: Record tool sharing, skill exchanges, mutual aid
3. **Collectives**: Visualize contributions to shared projects
4. **Teams**: Recognize helping behaviors that aren't in job descriptions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

See [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with inspiration from gift economy theory, mutual aid practices, and the desire to make generosity more visible in communities.
