const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Démarrage du peuplement démo...');

    // 1. Création du compte Directeur
    const hashedPassword = await bcrypt.hash('DemoDirecteur2026!', 10);
    const director = await prisma.user.upsert({
        where: { email: 'director@example.com' },
        update: { password: hashedPassword, role: 'ADMIN', name: 'Directeur STEF' },
        create: {
            email: 'director@example.com',
            password: hashedPassword,
            name: 'Directeur STEF',
            role: 'ADMIN',
        },
    });
    console.log(`✅ Compte Directeur créé : ${director.email}`);

    // 2. Vérification/Création des stocks de base
    const baseStocks = [
        { category: 'CHAUSSURES', label: 'Chaussures de sécurité', minThreshold: 5, stock: { "40": 10, "41": 12, "42": 4, "43": 15, "44": 2 } },
        { category: 'PANTALON', label: 'Pantalon de travail', minThreshold: 10, stock: { "S": 8, "M": 15, "L": 20, "XL": 5 } },
        { category: 'VESTE', label: 'Veste haute visibilité', minThreshold: 5, stock: { "M": 10, "L": 5, "XL": 2 } },
        { category: 'GANTS', label: 'Gants de protection', minThreshold: 20, stock: { "T9": 50, "T10": 15 } },
    ];

    for (const s of baseStocks) {
        await prisma.stockItem.upsert({
            where: { category: s.category },
            update: { stock: s.stock, minThreshold: s.minThreshold, label: s.label },
            create: s,
        });
    }
    console.log('✅ Stocks initialisés.');

    // 3. Création de demandes fictives (Historique + En cours)
    const demoRequests = [
        {
            employeeName: 'DUPONT',
            firstName: 'Jean',
            service: 'MAG',
            reason: 'Nouvel arrivant',
            status: 'Ordered',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
            items: [
                { category: 'CHAUSSURES', size: '42', quantity: 1 },
                { category: 'PANTALON', size: 'M', quantity: 2 }
            ]
        },
        {
            employeeName: 'MARTIN',
            firstName: 'Sophie',
            service: 'LAD',
            reason: 'Usure',
            status: 'Rejected',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
            items: [
                { category: 'VESTE', size: 'L', quantity: 1 }
            ]
        },
        {
            employeeName: 'BERNARD',
            firstName: 'Lucas',
            service: 'EXPE',
            reason: 'Usure',
            status: 'Pending',
            createdAt: new Date(),
            items: [
                { category: 'GANTS', size: 'T9', quantity: 2 },
                { category: 'PANTALON', size: 'L', quantity: 1 }
            ]
        },
        {
            employeeName: 'PETIT',
            firstName: 'Thomas',
            service: 'RECEP',
            reason: 'Perte',
            status: 'Pending',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            items: [
                { category: 'CHAUSSURES', size: '44', quantity: 1 }
            ]
        }
    ];

    for (const dr of demoRequests) {
        const { items, ...reqData } = dr;
        await prisma.request.create({
            data: {
                ...reqData,
                items: {
                    create: items
                }
            }
        });
    }
    console.log('✅ Demandes de démo injectées.');
    console.log('🎉 Fin du peuplement démo !');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
