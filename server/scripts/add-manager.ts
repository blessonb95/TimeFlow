import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query, pool } from '../src/config/db';
import dotenv from 'dotenv';
dotenv.config();

const MANAGER = {
  firstName: 'Sarah',
  lastName: 'Miller',
  username: 'manager',
  email: 'manager@eglobeits.com',
  password: 'Manager@123',
  role: 'manager',
  department: 'Engineering',
  designation: 'Engineering Manager',
  initials: 'SM',
  color: '#059669',
};

async function main() {
  console.log('🔍 Checking if manager already exists…');
  const existing = await query('SELECT * FROM users WHERE email = $1 OR username = $2', [
    MANAGER.email.toLowerCase(),
    MANAGER.username.toLowerCase(),
  ]);

  let managerId: string;
  const passwordHash = await bcrypt.hash(MANAGER.password, 10);

  if (existing.rows.length > 0) {
    const user = existing.rows[0] as Record<string, unknown>;
    managerId = user['id'] as string;
    console.log(`ℹ️ Manager user found (id: ${managerId}). Updating password & role…`);
    await query(
      `UPDATE users SET
        first_name = $1,
        last_name = $2,
        username = $3,
        email = $4,
        password_hash = $5,
        role = $6,
        department = $7,
        designation = $8,
        initials = $9,
        color = $10,
        status = 'Active'
      WHERE id = $11`,
      [
        MANAGER.firstName,
        MANAGER.lastName,
        MANAGER.username,
        MANAGER.email,
        passwordHash,
        MANAGER.role,
        MANAGER.department,
        MANAGER.designation,
        MANAGER.initials,
        MANAGER.color,
        managerId,
      ]
    );
  } else {
    managerId = crypto.randomUUID();
    console.log(`👤 Creating manager user (id: ${managerId})…`);
    await query(
      `INSERT INTO users (id, first_name, last_name, username, email, password_hash, role, department, designation, initials, color, status, reporting_manager_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', NULL)`,
      [
        managerId,
        MANAGER.firstName,
        MANAGER.lastName,
        MANAGER.username,
        MANAGER.email,
        passwordHash,
        MANAGER.role,
        MANAGER.department,
        MANAGER.designation,
        MANAGER.initials,
        MANAGER.color,
      ]
    );
  }

  // Ensure user preferences exist
  const pref = await query('SELECT user_id FROM user_preferences WHERE user_id = $1', [managerId]);
  if (pref.rows.length === 0) {
    await query('INSERT INTO user_preferences (user_id) VALUES ($1)', [managerId]);
    console.log('✓ Created user preferences for manager');
  }

  // Ensure manager is assigned as reporting manager for employee(s)
  console.log('🔗 Assigning employee(s) to report to this manager…');
  const updateRes = await query(
    `UPDATE users SET reporting_manager_id = $1 WHERE role = 'employee' AND (reporting_manager_id IS NULL OR reporting_manager_id = '')`,
    [managerId]
  );
  console.log(`✓ Updated employees reporting_manager_id: ${(updateRes as any).rowCount || 0}`);

  // Also add manager to project_members of all active projects if not already member
  const projects = await query('SELECT id FROM projects');
  for (const p of projects.rows as Array<{ id: string }>) {
    await query(
      `INSERT IGNORE INTO project_members (project_id, user_id) VALUES ($1, $2)`,
      [p.id, managerId]
    );
  }
  console.log('✓ Manager added to project_members');

  // Verify and print details
  const allUsers = await query('SELECT id, first_name, last_name, username, email, role, reporting_manager_id FROM users');
  console.log('\n📋 Current database users:');
  console.table(allUsers.rows);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ MANAGER ACCOUNT READY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Name     : ${MANAGER.firstName} ${MANAGER.lastName}`);
  console.log(`  Email    : ${MANAGER.email}`);
  console.log(`  Username : ${MANAGER.username}`);
  console.log(`  Password : ${MANAGER.password}`);
  console.log(`  Role     : ${MANAGER.role} (${MANAGER.designation})`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((err) => {
    console.error('❌ Failed to add manager:', err);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
