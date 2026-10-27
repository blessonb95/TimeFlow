import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { pool, withTransaction } from '../config/db';
import dotenv from 'dotenv';
dotenv.config();

// ─── Super Admin & Manager ──────────────────────────────────────────────────
const SUPER_ADMIN = {
  firstName: 'Super',
  lastName: 'Admin',
  username: 'superadmin',
  email: 'superadmin@eglobeits.com',
  role: 'admin',
  department: 'Management',
  designation: 'Super Administrator',
  initials: 'SA',
  color: '#7C3AED',
};

const MANAGER = {
  firstName: 'Sarah',
  lastName: 'Miller',
  username: 'manager',
  email: 'manager@eglobeits.com',
  role: 'manager',
  department: 'Engineering',
  designation: 'Engineering Manager',
  initials: 'SM',
  color: '#059669',
};

async function seed() {
  console.log('🌱 Clearing database and seeding Super Admin & Manager…');
  const adminPasswordHash = await bcrypt.hash('SuperAdmin@123', 10);
  const managerPasswordHash = await bcrypt.hash('Manager@123', 10);

  await withTransaction(async (client) => {
    // ── Clear all tables (order matters for FK constraints) ───────────────
    console.log('  🗑️  Clearing all existing data…');
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM approvals');
    await client.query('DELETE FROM timesheets');
    await client.query('DELETE FROM work_log_tickets');
    await client.query('DELETE FROM tickets');
    await client.query('DELETE FROM work_logs');
    await client.query('DELETE FROM project_members');
    await client.query('DELETE FROM projects');
    await client.query('DELETE FROM user_preferences');
    await client.query('DELETE FROM invites');
    await client.query('DELETE FROM users');
    console.log('  ✓ All tables cleared');

    // ── Insert Super Admin ───────────────────────────────────────────────
    console.log('  👤 Creating Super Admin…');
    const adminId = crypto.randomUUID();
    await client.query(
      `INSERT INTO users (id, first_name, last_name, username, email, password_hash, role, department, designation, initials, color, status, reporting_manager_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', NULL)`,
      [adminId, SUPER_ADMIN.firstName, SUPER_ADMIN.lastName, SUPER_ADMIN.username, SUPER_ADMIN.email, adminPasswordHash, SUPER_ADMIN.role, SUPER_ADMIN.department, SUPER_ADMIN.designation, SUPER_ADMIN.initials, SUPER_ADMIN.color]
    );

    // Create Super Admin preferences
    await client.query(
      `INSERT INTO user_preferences (user_id) VALUES (?)`,
      [adminId]
    );
    console.log('  ✓ Super Admin created');

    // ── Insert Manager ───────────────────────────────────────────────────
    console.log('  👤 Creating Manager…');
    const managerId = crypto.randomUUID();
    await client.query(
      `INSERT INTO users (id, first_name, last_name, username, email, password_hash, role, department, designation, initials, color, status, reporting_manager_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', NULL)`,
      [managerId, MANAGER.firstName, MANAGER.lastName, MANAGER.username, MANAGER.email, managerPasswordHash, MANAGER.role, MANAGER.department, MANAGER.designation, MANAGER.initials, MANAGER.color]
    );

    // Create Manager preferences
    await client.query(
      `INSERT INTO user_preferences (user_id) VALUES (?)`,
      [managerId]
    );
    console.log('  ✓ Manager created');
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ SEED COMPLETE — Default accounts:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Super Admin:`);
  console.log(`    Email    : ${SUPER_ADMIN.email}`);
  console.log(`    Username : ${SUPER_ADMIN.username}`);
  console.log(`    Password : SuperAdmin@123`);
  console.log(`    Role     : ${SUPER_ADMIN.role} (Super Administrator)`);
  console.log('────────────────────────────────────────────────────────────');
  console.log(`  Manager:`);
  console.log(`    Email    : ${MANAGER.email}`);
  console.log(`    Username : ${MANAGER.username}`);
  console.log(`    Password : Manager@123`);
  console.log(`    Role     : ${MANAGER.role} (Engineering Manager)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
