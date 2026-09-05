import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/User';
import { Task } from '../models/Task';
import { hashPassword } from '../utils/password';

const seedAdmin = async () => {
  try {
    console.log('--- Starting Admin Seeding Script ---');
    await connectDatabase();

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@taskflow.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`Admin account already exists with email: ${adminEmail}`);
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
        console.log(`Promoted user ${adminEmail} to admin role.`);
      }
    } else {
      const hashedPassword = await hashPassword(adminPassword);
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log(`Administrator created successfully!`);
      console.log(`  Name:     ${admin.name}`);
      console.log(`  Email:    ${admin.email}`);
      console.log(`  Password: ${adminPassword}`);
      console.log(`  Role:     ${admin.role}`);
    }

    // Ensure Member account exists
    const memberEmail = 'alex@taskflow.com';
    let member = await User.findOne({ email: memberEmail });
    if (!member) {
      const memberPasswordHash = await hashPassword('Password123!');
      member = await User.create({
        name: 'Alex Rivera',
        email: memberEmail,
        password: memberPasswordHash,
        role: 'user',
      });
      console.log(`Demo Member created: ${memberEmail} (Password: Password123!)`);
    } else {
      member.password = await hashPassword('Password123!');
      await member.save();
      console.log(`Demo Member password reset to Password123!`);
    }

    // Check if demo tasks exist. If no tasks exist, create initial sample tasks
    const taskCount = await Task.countDocuments();
    if (taskCount === 0) {
      console.log('Seeding initial sample tasks...');
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 5);

      await Task.create([
        {
          title: 'Implement Authentication System',
          description: 'Set up JWT token generation, verification, bcrypt password hashing, and cookie/header auth.',
          status: 'DONE',
          priority: 'HIGH',
          dueDate: new Date(),
          creator: admin._id,
          assignedUser: admin._id,
        },
        {
          title: 'Design Drag-and-Drop Task Board',
          description: 'Construct interactive Kanban columns (TO DO, DOING, DONE) using @dnd-kit with real-time feedback.',
          status: 'DOING',
          priority: 'HIGH',
          dueDate: nextWeek,
          creator: admin._id,
          assignedUser: admin._id,
        },
        {
          title: 'Setup Production Deployment Pipeline',
          description: 'Configure automated CI/CD for Next.js on Vercel and Node.js Express backend on Render/Railway.',
          status: 'TODO',
          priority: 'MEDIUM',
          dueDate: nextWeek,
          creator: admin._id,
          assignedUser: null,
        },
        {
          title: 'Role-Based Access Control Auditing',
          description: 'Ensure normal users cannot see other users or reassign unauthorized tasks.',
          status: 'TODO',
          priority: 'LOW',
          dueDate: nextWeek,
          creator: admin._id,
          assignedUser: null,
        },
      ]);
      console.log('Initial sample tasks created successfully!');
    }

    console.log('--- Seeding Completed Successfully ---');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

seedAdmin();
