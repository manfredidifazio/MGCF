import bcrypt from 'bcrypt';

const passwordHash = '$2b$10$PEF9si1oqusPt2Q2/YTUL.E1WwSgonWUAQT30l9bQhCAlgVOtBwxa';
const password = 'CambiaQuestaPassword123!';

try {
  const match = await bcrypt.compare(password, passwordHash);
  console.log(`\n🔐 Password match: ${match ? '✅ CORRETTA' : '❌ NON CORRETTA'}`);
  console.log(`   Hash: ${passwordHash}`);
  console.log(`   Password: ${password}`);
  
  if (!match) {
    console.log('\n⚠️  La password non corrisponde all\'hash nel database!');
    console.log('   Procedo a creare un nuovo hash...');
    const newHash = await bcrypt.hash(password, 10);
    console.log(`\n   Nuovo hash: ${newHash}`);
    console.log('   Questo hash dovrebbe essere usato nel database.');
  }
} catch (error) {
  console.error('❌ Errore:', error.message);
  process.exit(1);
}
