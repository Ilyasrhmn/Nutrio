import * as bcrypt from 'bcrypt';

/**
 * Generate bcrypt hash for a password
 * Usage: ts-node apps/api/src/scripts/generate-password-hash.ts
 */

async function generateHash(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(`\nPassword: ${password}`);
  console.log(`Hash: ${hash}\n`);
  console.log(`SQL:\nUPDATE users SET password_hash = '${hash}' WHERE email = 'your@email.com';\n`);
}

// Default password for all test users
const defaultPassword = 'password123';

console.log('='.repeat(60));
console.log('  Password Hash Generator');
console.log('='.repeat(60));

generateHash(defaultPassword)
  .then(() => {
    console.log('✅ Hash generated successfully');
    console.log('\nYou can now use this hash in the seed file or update existing users.');
  })
  .catch((error) => {
    console.error('❌ Error generating hash:', error);
    process.exit(1);
  });
