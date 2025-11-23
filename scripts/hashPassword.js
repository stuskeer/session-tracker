import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hashPassword.js <password>');
  process.exit(1);
}

bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('Hashed password:', hash);
  console.log('\nAdd this to your DynamoDB users table as the password field.');
}); 