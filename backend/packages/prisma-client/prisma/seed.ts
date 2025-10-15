import { PrismaClient, Prisma } from '../src/generated';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Cleaning existing data...');
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.issueHistory.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.issue.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 12);

  const john = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: hashedPassword,
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=1',
      bio: 'Full-stack developer passionate about building great products',
      phone: '+1-234-567-8901',
      location: 'San Francisco, CA',
      website: 'https://johndoe.dev',
      company: 'TechCorp',
      jobTitle: 'Senior Developer',
      emailVerified: true,
      lastLoginAt: new Date(),
    },
  });

  const jane = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
      avatar: 'https://i.pravatar.cc/150?img=5',
      bio: 'Product designer and UX enthusiast',
      phone: '+1-234-567-8902',
      location: 'New York, NY',
      company: 'DesignHub',
      jobTitle: 'Lead Designer',
      emailVerified: true,
      lastLoginAt: new Date(),
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: hashedPassword,
      name: 'Bob Wilson',
      avatar: 'https://i.pravatar.cc/150?img=12',
      bio: 'DevOps engineer focusing on cloud infrastructure',
      phone: '+1-234-567-8903',
      location: 'Austin, TX',
      company: 'CloudWorks',
      jobTitle: 'DevOps Engineer',
      emailVerified: true,
    },
  });

  console.log('📁 Creating projects...');
  const webProject = await prisma.project.create({
    data: {
      name: 'E-Commerce Website',
      key: 'ECOM',
      description: 'Building a modern e-commerce platform with Next.js and Node.js',
      isPublic: true,
      members: {
        create: [
          { userId: john.id, role: 'OWNER' },
          { userId: jane.id, role: 'ADMIN' },
          { userId: bob.id, role: 'MEMBER' },
        ],
      },
      boards: {
        create: {
          name: 'Sprint Board',
          columns: [
            { id: 'col1', title: 'To Do', order: 0 },
            { id: 'col2', title: 'In Progress', order: 1 },
            { id: 'col3', title: 'Done', order: 2 },
          ],
        },
      },
    },
  });

  const mobileProject = await prisma.project.create({
    data: {
      name: 'Mobile App',
      key: 'MOBILE',
      description: 'Cross-platform mobile application using React Native',
      isPublic: false,
      members: {
        create: [
          { userId: jane.id, role: 'OWNER' },
          { userId: john.id, role: 'MEMBER' },
        ],
      },
      boards: {
        create: {
          name: 'Development Board',
          columns: [
            { id: 'col1', title: 'Backlog', order: 0 },
            { id: 'col2', title: 'In Progress', order: 1 },
            { id: 'col3', title: 'Review', order: 2 },
            { id: 'col4', title: 'Done', order: 3 },
          ],
        },
      },
    },
  });

  console.log('🎫 Creating issues...');
  const issue1 = await prisma.issue.create({
    data: {
      projectId: webProject.id,
      key: 'ECOM-1',
      title: 'Implement user authentication',
      description: 'Set up JWT-based authentication with refresh tokens and email verification',
      type: 'FEATURE',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      reporterId: john.id,
      assigneeId: john.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      startDate: new Date(),
      tags: ['authentication', 'security', 'backend'],
      attachments: [
        {
          id: 'att1',
          filename: 'auth-diagram.png',
          url: 'https://example.com/files/auth-diagram.png',
          size: 245678,
          mimeType: 'image/png',
          uploadedAt: new Date(),
        },
      ],
    },
  });

  const issue2 = await prisma.issue.create({
    data: {
      projectId: webProject.id,
      key: 'ECOM-2',
      title: 'Design product listing page',
      description: 'Create responsive design for product catalog with filtering and sorting',
      type: 'TASK',
      status: 'TODO',
      priority: 'MEDIUM',
      reporterId: jane.id,
      assigneeId: jane.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      tags: ['design', 'frontend', 'ui'],
    },
  });

  const issue3 = await prisma.issue.create({
    data: {
      projectId: webProject.id,
      key: 'ECOM-3',
      title: 'Fix checkout cart calculation bug',
      description: 'Cart total is not calculating correctly when applying discount codes',
      type: 'BUG',
      status: 'TODO',
      priority: 'URGENT',
      reporterId: bob.id,
      assigneeId: john.id,
      tags: ['bug', 'cart', 'urgent'],
    },
  });

  const issue4 = await prisma.issue.create({
    data: {
      projectId: mobileProject.id,
      key: 'MOBILE-1',
      title: 'Set up CI/CD pipeline',
      description: 'Configure GitHub Actions for automated testing and deployment',
      type: 'IMPROVEMENT',
      status: 'DONE',
      priority: 'HIGH',
      reporterId: jane.id,
      assigneeId: bob.id,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      tags: ['devops', 'ci-cd', 'automation'],
    },
  });

  console.log('💬 Creating comments...');
  await prisma.comment.createMany({
    data: [
      {
        issueId: issue1.id,
        userId: jane.id,
        content: 'Great work on the authentication flow! Could you also add social login options?',
      },
      {
        issueId: issue1.id,
        userId: john.id,
        content: 'Sure! I\'ll add Google and GitHub OAuth in the next iteration.',
      },
      {
        issueId: issue3.id,
        userId: john.id,
        content: 'I\'ve identified the issue - the discount calculation wasn\'t considering tax. Working on a fix now.',
      },
      {
        issueId: issue4.id,
        userId: jane.id,
        content: 'Pipeline is working perfectly! Build time reduced by 40%.',
      },
    ],
  });

  console.log('📝 Creating issue history...');
  await prisma.issueHistory.createMany({
    data: [
      {
        issueId: issue1.id,
        field: 'status',
        oldValue: 'TODO',
        newValue: 'IN_PROGRESS',
        changedBy: john.id,
      },
      {
        issueId: issue1.id,
        field: 'assignee',
        oldValue: null,
        newValue: john.id,
        changedBy: john.id,
      },
      {
        issueId: issue4.id,
        field: 'status',
        oldValue: 'IN_PROGRESS',
        newValue: 'DONE',
        changedBy: bob.id,
      },
    ],
  });

  console.log('🔔 Creating notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: john.id,
        type: 'ISSUE_ASSIGNED',
        title: 'You were assigned to ECOM-1',
        message: 'John Doe assigned you to "Implement user authentication"',
        issueId: issue1.id,
        projectId: webProject.id,
      },
      {
        userId: jane.id,
        type: 'ISSUE_COMMENT',
        title: 'New comment on ECOM-1',
        message: 'John Doe commented on "Implement user authentication"',
        issueId: issue1.id,
        projectId: webProject.id,
        read: true,
        readAt: new Date(),
      },
      {
        userId: john.id,
        type: 'ISSUE_ASSIGNED',
        title: 'You were assigned to ECOM-3',
        message: 'Bob Wilson assigned you to "Fix checkout cart calculation bug"',
        issueId: issue3.id,
        projectId: webProject.id,
      },
      {
        userId: jane.id,
        type: 'PROJECT_INVITED',
        title: 'Added to Mobile App',
        message: 'You have been added to the Mobile App project',
        projectId: mobileProject.id,
        read: true,
        readAt: new Date(),
      },
    ],
  });

  console.log('📊 Creating activity logs...');
  await prisma.activityLog.createMany({
    data: [
      {
        userId: john.id,
        action: 'created_project',
        entityType: 'project',
        entityId: webProject.id,
        metadata: { projectName: webProject.name } as Prisma.JsonObject,
        ipAddress: '192.168.1.1',
      },
      {
        userId: john.id,
        action: 'created_issue',
        entityType: 'issue',
        entityId: issue1.id,
        metadata: { issueKey: issue1.key, issueTitle: issue1.title } as Prisma.JsonObject,
        ipAddress: '192.168.1.1',
      },
      {
        userId: jane.id,
        action: 'created_project',
        entityType: 'project',
        entityId: mobileProject.id,
        metadata: { projectName: mobileProject.name } as Prisma.JsonObject,
        ipAddress: '192.168.1.2',
      },
      {
        userId: bob.id,
        action: 'updated_issue',
        entityType: 'issue',
        entityId: issue4.id,
        metadata: { issueKey: issue4.key, field: 'status', newValue: 'DONE' } as Prisma.JsonObject,
        ipAddress: '192.168.1.3',
      },
    ],
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${await prisma.user.count()}`);
  console.log(`   - Projects: ${await prisma.project.count()}`);
  console.log(`   - Issues: ${await prisma.issue.count()}`);
  console.log(`   - Comments: ${await prisma.comment.count()}`);
  console.log(`   - Notifications: ${await prisma.notification.count()}`);
  console.log(`   - Activity Logs: ${await prisma.activityLog.count()}`);
  console.log('\n🔐 Test credentials:');
  console.log('   Email: john@example.com');
  console.log('   Email: jane@example.com');
  console.log('   Email: bob@example.com');
  console.log('   Password: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
