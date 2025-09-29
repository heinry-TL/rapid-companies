const bcrypt = require('bcryptjs');

async function createAdminHash() {
  const password = 'admin123!';
  const saltRounds = 12;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password:', password);
    console.log('Hash:', hash);

    // Verify the hash works
    const isValid = await bcrypt.compare(password, hash);
    console.log('Hash verification:', isValid);

    console.log('\nSQL to insert admin user:');
    console.log(`INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES`);
    console.log(`('admin', 'admin@rapidcompanies.com', '${hash}', 'System Administrator', 'super_admin')`);
    console.log(`ON DUPLICATE KEY UPDATE password_hash = '${hash}';`);

  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminHash();