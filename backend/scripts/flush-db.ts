import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function flushDatabase() {
  try {
    console.log('🗑️  Starting database flush...');
    console.log('⚠️  WARNING: This will delete ALL data from the database!\n');
    
    // Delete all records from all tables
    // Order matters due to relationships - delete children first
    
    console.log('💬 Deleting messages...');
    const messages = await prisma.message.deleteMany({});
    console.log(`   ✓ Deleted ${messages.count} messages`);
    
    console.log('👥 Deleting chat room participants...');
    const chatRoomParticipants = await prisma.chatRoomParticipant.deleteMany({});
    console.log(`   ✓ Deleted ${chatRoomParticipants.count} chat room participants`);
    
    console.log('💬 Deleting chat rooms...');
    const chatRooms = await prisma.chatRoom.deleteMany({});
    console.log(`   ✓ Deleted ${chatRooms.count} chat rooms`);
    
    console.log('🔔 Deleting notifications...');
    const notifications = await prisma.notification.deleteMany({});
    console.log(`   ✓ Deleted ${notifications.count} notifications`);
    
    console.log('💬 Deleting comments...');
    const comments = await prisma.comment.deleteMany({});
    console.log(`   ✓ Deleted ${comments.count} comments`);
    
    console.log('🏷️  Deleting issue tags...');
    const issueTags = await prisma.issueTag.deleteMany({});
    console.log(`   ✓ Deleted ${issueTags.count} issue tags`);
    
    console.log('🏷️  Deleting tags...');
    const tags = await prisma.tag.deleteMany({});
    console.log(`   ✓ Deleted ${tags.count} tags`);
    
    console.log('📋 Deleting issues...');
    const issues = await prisma.issue.deleteMany({});
    console.log(`   ✓ Deleted ${issues.count} issues`);
    
    console.log('📊 Deleting columns...');
    const columns = await prisma.column.deleteMany({});
    console.log(`   ✓ Deleted ${columns.count} columns`);
    
    console.log('📋 Deleting boards...');
    const boards = await prisma.board.deleteMany({});
    console.log(`   ✓ Deleted ${boards.count} boards`);
    
    console.log('📁 Deleting projects...');
    const projects = await prisma.project.deleteMany({});
    console.log(`   ✓ Deleted ${projects.count} projects`);
    
    console.log('👥 Deleting workspace members...');
    const workspaceMembers = await prisma.workspaceMember.deleteMany({});
    console.log(`   ✓ Deleted ${workspaceMembers.count} workspace members`);
    
    console.log('🏢 Deleting workspaces...');
    const workspaces = await prisma.workspace.deleteMany({});
    console.log(`   ✓ Deleted ${workspaces.count} workspaces`);
    
    console.log('👤 Deleting users...');
    const users = await prisma.user.deleteMany({});
    console.log(`   ✓ Deleted ${users.count} users`);
    
    console.log('\n✅ Database flushed successfully!');
    console.log('\n📊 Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`   👤 Users:                    ${users.count}`);
    console.log(`   🏢 Workspaces:               ${workspaces.count}`);
    console.log(`   👥 Workspace Members:        ${workspaceMembers.count}`);
    console.log(`   📁 Projects:                 ${projects.count}`);
    console.log(`   📋 Boards:                   ${boards.count}`);
    console.log(`   📊 Columns:                  ${columns.count}`);
    console.log(`   📋 Issues:                   ${issues.count}`);
    console.log(`   🏷️  Tags:                     ${tags.count}`);
    console.log(`   🏷️  Issue Tags:               ${issueTags.count}`);
    console.log(`   💬 Comments:                 ${comments.count}`);
    console.log(`   🔔 Notifications:            ${notifications.count}`);
    console.log(`   💬 Chat Rooms:               ${chatRooms.count}`);
    console.log(`   👥 Chat Room Participants:   ${chatRoomParticipants.count}`);
    console.log(`   💬 Messages:                 ${messages.count}`);
    console.log('═══════════════════════════════════════');
    const total = users.count + workspaces.count + workspaceMembers.count + 
                  projects.count + boards.count + columns.count + issues.count + 
                  tags.count + issueTags.count + comments.count + notifications.count + 
                  chatRooms.count + chatRoomParticipants.count + messages.count;
    console.log(`   🗑️  Total Records Deleted:   ${total}`);
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error flushing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

flushDatabase();
