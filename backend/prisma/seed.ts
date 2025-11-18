import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.giftBalanceSnapshot.deleteMany();
  await prisma.giftContribution.deleteMany();
  await prisma.member.deleteMany();
  await prisma.community.deleteMany();

  // Create communities
  const techCommunity = await prisma.community.create({
    data: {
      name: 'Tech Collective',
      description: 'A community of developers helping each other with code, mentorship, and tools',
    },
  });

  const localCommunity = await prisma.community.create({
    data: {
      name: 'Neighborhood Network',
      description: 'Local community sharing skills, tools, and mutual aid',
    },
  });

  console.log('✅ Created communities');

  // Create members for Tech Collective
  const alice = await prisma.member.create({
    data: {
      communityId: techCommunity.id,
      name: 'Alice',
      email: 'alice@example.com',
    },
  });

  const bob = await prisma.member.create({
    data: {
      communityId: techCommunity.id,
      name: 'Bob',
      email: 'bob@example.com',
    },
  });

  const charlie = await prisma.member.create({
    data: {
      communityId: techCommunity.id,
      name: 'Charlie',
      email: 'charlie@example.com',
    },
  });

  const diana = await prisma.member.create({
    data: {
      communityId: techCommunity.id,
      name: 'Diana',
      email: 'diana@example.com',
    },
  });

  // Create members for Neighborhood Network
  const emma = await prisma.member.create({
    data: {
      communityId: localCommunity.id,
      name: 'Emma',
      email: 'emma@example.com',
    },
  });

  const frank = await prisma.member.create({
    data: {
      communityId: localCommunity.id,
      name: 'Frank',
      email: 'frank@example.com',
    },
  });

  console.log('✅ Created members');

  // Create gift contributions for Tech Collective
  const gifts = [
    // Alice's contributions
    {
      communityId: techCommunity.id,
      giverMemberId: alice.id,
      receiverMemberId: bob.id,
      descriptionMarkdown: 'Code review for authentication module',
      valueEstimate: 50,
      tagsJson: JSON.stringify(['code-review', 'security']),
      timestamp: new Date('2024-01-15'),
    },
    {
      communityId: techCommunity.id,
      giverMemberId: alice.id,
      receiverMemberId: charlie.id,
      descriptionMarkdown: 'Mentored on React best practices for 2 hours',
      valueEstimate: 100,
      tagsJson: JSON.stringify(['mentorship', 'react']),
      timestamp: new Date('2024-02-01'),
    },
    {
      communityId: techCommunity.id,
      giverMemberId: alice.id,
      receiverMemberId: null, // Community-wide gift
      descriptionMarkdown: 'Published open-source design system for the community',
      valueEstimate: 200,
      tagsJson: JSON.stringify(['open-source', 'design']),
      timestamp: new Date('2024-02-15'),
    },

    // Bob's contributions
    {
      communityId: techCommunity.id,
      giverMemberId: bob.id,
      receiverMemberId: alice.id,
      descriptionMarkdown: 'Fixed deployment pipeline issues',
      valueEstimate: 75,
      tagsJson: JSON.stringify(['devops', 'debugging']),
      timestamp: new Date('2024-01-20'),
    },
    {
      communityId: techCommunity.id,
      giverMemberId: bob.id,
      receiverMemberId: diana.id,
      descriptionMarkdown: 'Pair programming session on API design',
      valueEstimate: 60,
      tagsJson: JSON.stringify(['mentorship', 'api']),
      timestamp: new Date('2024-02-10'),
    },

    // Charlie's contributions
    {
      communityId: techCommunity.id,
      giverMemberId: charlie.id,
      receiverMemberId: alice.id,
      descriptionMarkdown: 'Shared notes from conference on modern frontend patterns',
      valueEstimate: 30,
      tagsJson: JSON.stringify(['knowledge-sharing', 'frontend']),
      timestamp: new Date('2024-02-05'),
    },
    {
      communityId: techCommunity.id,
      giverMemberId: charlie.id,
      receiverMemberId: bob.id,
      descriptionMarkdown: 'Helped debug performance issue in database queries',
      valueEstimate: 40,
      tagsJson: JSON.stringify(['debugging', 'database']),
      timestamp: new Date('2024-02-20'),
    },

    // Diana's contributions
    {
      communityId: techCommunity.id,
      giverMemberId: diana.id,
      receiverMemberId: charlie.id,
      descriptionMarkdown: 'UI/UX feedback on new feature',
      valueEstimate: 25,
      tagsJson: JSON.stringify(['design', 'feedback']),
      timestamp: new Date('2024-01-25'),
    },
    {
      communityId: techCommunity.id,
      giverMemberId: diana.id,
      receiverMemberId: null,
      descriptionMarkdown: 'Organized community meetup and provided snacks',
      valueEstimate: 80,
      tagsJson: JSON.stringify(['community', 'event']),
      timestamp: new Date('2024-02-12'),
    },

    // Neighborhood Network gifts
    {
      communityId: localCommunity.id,
      giverMemberId: emma.id,
      receiverMemberId: frank.id,
      descriptionMarkdown: 'Loaned lawn mower for the weekend',
      valueEstimate: 20,
      tagsJson: JSON.stringify(['tools', 'sharing']),
      timestamp: new Date('2024-01-10'),
    },
    {
      communityId: localCommunity.id,
      giverMemberId: frank.id,
      receiverMemberId: emma.id,
      descriptionMarkdown: 'Helped with car repair',
      valueEstimate: 100,
      tagsJson: JSON.stringify(['repair', 'automotive']),
      timestamp: new Date('2024-01-18'),
    },
    {
      communityId: localCommunity.id,
      giverMemberId: emma.id,
      receiverMemberId: null,
      descriptionMarkdown: 'Organized neighborhood cleanup event',
      valueEstimate: 50,
      tagsJson: JSON.stringify(['community', 'environment']),
      timestamp: new Date('2024-02-08'),
    },
  ];

  for (const gift of gifts) {
    await prisma.giftContribution.create({ data: gift });
  }

  console.log('✅ Created gift contributions');

  // Generate initial snapshots
  const allMembers = [alice, bob, charlie, diana, emma, frank];
  for (const member of allMembers) {
    const givenGifts = await prisma.giftContribution.findMany({
      where: { giverMemberId: member.id },
    });

    const receivedGifts = await prisma.giftContribution.findMany({
      where: { receiverMemberId: member.id },
    });

    const givenCount = givenGifts.length;
    const receivedCount = receivedGifts.length;
    const totalGivenValue = givenGifts.reduce(
      (sum, gift) => sum + (gift.valueEstimate || 0),
      0
    );
    const totalReceivedValue = receivedGifts.reduce(
      (sum, gift) => sum + (gift.valueEstimate || 0),
      0
    );

    await prisma.giftBalanceSnapshot.create({
      data: {
        memberId: member.id,
        communityId: member.communityId,
        givenCount,
        receivedCount,
        netBalance: totalGivenValue - totalReceivedValue,
        metaJson: JSON.stringify({
          totalGivenValue,
          totalReceivedValue,
        }),
      },
    });
  }

  console.log('✅ Created balance snapshots');

  console.log('\n🎁 Seed data created successfully!');
  console.log(`   - ${2} communities`);
  console.log(`   - ${allMembers.length} members`);
  console.log(`   - ${gifts.length} gift contributions`);
  console.log(`   - ${allMembers.length} balance snapshots\n`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
