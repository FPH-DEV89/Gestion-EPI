const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.request.deleteMany();
  await prisma.stockItem.deleteMany();

  // Create stock items with various sizes
  const stockItems = [
    {
      category: 'CHAUSSURES',
      label: 'Chaussures de sécurité',
      minThreshold: 3,
      stock: {
        '38': 2,
        '39': 5,
        '40': 8,
        '41': 6,
        '42': 4,
        '43': 3,
        '44': 2,
        '45': 1,
        '46': 1
      }
    },
    {
      category: 'GANTS',
      label: 'Gants de protection',
      minThreshold: 10,
      stock: {
        'XS': 15,
        'S': 25,
        'M': 30,
        'L': 20,
        'XL': 10,
        'XXL': 5
      }
    },
    {
      category: 'VESTE',
      label: 'Vestes de travail',
      minThreshold: 5,
      stock: {
        'S': 8,
        'M': 12,
        'L': 15,
        'XL': 10,
        'XXL': 6,
        '3XL': 3
      }
    },
    {
      category: 'CASQUE',
      label: 'Casques de sécurité',
      minThreshold: 5,
      stock: {
        'TU': 20
      }
    }
  ];

  for (const item of stockItems) {
    await prisma.stockItem.create({
      data: item
    });
    console.log(`Created stock item: ${item.label}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
