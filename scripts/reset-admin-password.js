const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://pdaxfpkwakaiprqpvlsz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkYXhmcGt3YWthaXBycXB2bHN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTE0NTU2NywiZXhwIjoyMDc0NzIxNTY3fQ.KUdZMO2ntzZhyykfSCffhK3dPzQRQRWhrZMQ2KiNQos';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPassword() {
  const newPassword = 'admin123';

  console.log('🔐 Generating new password hash for:', newPassword);
  const hash = await bcrypt.hash(newPassword, 12);
  console.log('✅ Hash generated:', hash.substring(0, 20) + '...');

  console.log('\n🔍 Updating admin user password...');
  const { data, error } = await supabase
    .from('admin_users')
    .update({ password_hash: hash })
    .eq('email', 'admin@rapidcompanies.com')
    .select();

  if (error) {
    console.error('❌ Error updating password:', error);
    process.exit(1);
  }

  console.log('✅ Password updated successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Email: admin@rapidcompanies.com');
  console.log('   Password:', newPassword);
  console.log('\nUpdated user:', data);
}

resetPassword();
