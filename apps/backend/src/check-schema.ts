import prisma from './src/lib/prisma';

async function checkSchema() {
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'colonne';
    `;
    
    console.log("'colonne' column exists:", result);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema().catch(console.error);
