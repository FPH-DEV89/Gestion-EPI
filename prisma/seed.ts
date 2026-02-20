import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding PPE list...')

  const size34to48 = ["34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48"];
  const sizeXSto2XL = ["XS", "S", "M", "L", "XL", "XXL"];
  const sizeTU = ["TU"];

  const buildStock = (sizes: string[], initialQty = 10) => {
    const stock: Record<string, number> = {};
    sizes.forEach(s => stock[s] = initialQty);
    return stock;
  };

  const newItems = [
    {
      category: 'CHAUSSETTE_BLANCHE',
      label: 'Chaussette blanche',
      minThreshold: 5,
      price: 5.0,
      stock: buildStock(sizeTU)
    },
    {
      category: 'CHAUSSURE_SECURITE',
      label: 'Chaussure de sécurité',
      minThreshold: 3,
      price: 45.0,
      stock: buildStock(size34to48, 5)
    },
    {
      category: 'BOTTE_SECURITE',
      label: 'Botte de sécurité',
      minThreshold: 3,
      price: 55.0,
      stock: buildStock(size34to48, 5)
    },
    {
      category: 'BONNET',
      label: 'Bonnet',
      minThreshold: 5,
      price: 10.0,
      stock: buildStock(sizeTU)
    },
    {
      category: 'CHAUSSETTE_GRAND_FROID',
      label: 'Chaussette grand froid',
      minThreshold: 5,
      price: 12.0,
      stock: buildStock(size34to48, 5)
    },
    {
      category: 'GANT_NOIR',
      label: 'Gant noir',
      minThreshold: 10,
      price: 8.0,
      stock: buildStock(sizeXSto2XL, 15)
    },
    {
      category: 'GANT_ROUGE',
      label: 'Gant rouge',
      minThreshold: 10,
      price: 8.0,
      stock: buildStock(sizeXSto2XL, 15)
    },
    {
      category: 'TOUR_DE_COUP',
      label: 'Tour de coup',
      minThreshold: 5,
      price: 7.0,
      stock: buildStock(sizeTU)
    }
  ];

  for (const item of newItems) {
    await prisma.stockItem.upsert({
      where: { category: item.category },
      update: {
        label: item.label,
        minThreshold: item.minThreshold,
        price: item.price,
      },
      create: item
    });
    console.log(`Synced: ${item.label}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
