// Test file để chạy thử CRUD operations
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCRUD() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test create user (nếu có quyền)
    /*
    const newUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com', 
        role: 'user',
        password: 'hashedpassword'
      }
    });
    console.log('Created user:', newUser);
    */
    
    // Test find users
    const users = await prisma.user.findMany();
    console.log('Users:', users);
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCRUD();
