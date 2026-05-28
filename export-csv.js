const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

function toCsv(data) {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '';
      let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      // Escape double quotes by doubling them
      str = str.replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\r\n');
}

async function main() {
  const exportDir = path.join(__dirname, 'db_export_csv');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  const originalUrl = process.env.DATABASE_URL;
  if (!originalUrl) {
    throw new Error('DATABASE_URL is not set in your environment. Make sure to run with: node --env-file=.env export-csv.js');
  }

  let prisma;
  console.log('Starting Prisma DB export to CSV...');
  
  try {
    console.log('Attempting to connect with default DATABASE_URL (Port 5432)...');
    prisma = new PrismaClient({
      datasources: {
        db: { url: originalUrl }
      }
    });
    // Test connection
    await prisma.user.findFirst();
    console.log('Successfully connected to the database!');
  } catch (err) {
    console.log('Connection failed on port 5432. Many corporate firewalls block port 5432.');
    await prisma?.$disconnect();

    // Check if we can fallback to Neon port 443 (HTTPS port, which is rarely blocked)
    if (originalUrl.includes('.neon.tech') && !originalUrl.includes(':443')) {
      let fallbackUrl = originalUrl;
      if (originalUrl.includes('.neon.tech:5432')) {
        fallbackUrl = originalUrl.replace('.neon.tech:5432', '.neon.tech:443');
      } else {
        fallbackUrl = originalUrl.replace('.neon.tech/', '.neon.tech:443/');
      }

      console.log('Attempting connection bypass using Neon Port 443 (HTTPS port)...');
      try {
        prisma = new PrismaClient({
          datasources: {
            db: { url: fallbackUrl }
          }
        });
        await prisma.user.findFirst();
        console.log('Bypass successful! Connected to the database via Port 443!');
      } catch (err2) {
        await prisma?.$disconnect();
        console.error('All connection attempts failed.');
        console.error('Original Error:', err.message);
        console.error('Port 443 Bypass Error:', err2.message);
        process.exit(1);
      }
    } else {
      console.error('Connection failed:', err.message);
      process.exit(1);
    }
  }

  try {
    // 1. Export Users
    const users = await prisma.user.findMany();
    fs.writeFileSync(path.join(exportDir, 'users.csv'), toCsv(users), 'utf-8');
    console.log(`Exported ${users.length} users to users.csv`);

    // 2. Export Requests
    const requests = await prisma.request.findMany();
    fs.writeFileSync(path.join(exportDir, 'requests.csv'), toCsv(requests), 'utf-8');
    console.log(`Exported ${requests.length} requests to requests.csv`);

    // 3. Export RequestItems
    const requestItems = await prisma.requestItem.findMany();
    fs.writeFileSync(path.join(exportDir, 'request_items.csv'), toCsv(requestItems), 'utf-8');
    console.log(`Exported ${requestItems.length} request items to request_items.csv`);

    // 4. Export StockItems
    const stockItems = await prisma.stockItem.findMany();
    fs.writeFileSync(path.join(exportDir, 'stock_items.csv'), toCsv(stockItems), 'utf-8');
    console.log(`Exported ${stockItems.length} stock items to stock_items.csv`);

    // 5. Export AuditLogs
    const auditLogs = await prisma.auditLog.findMany();
    fs.writeFileSync(path.join(exportDir, 'audit_logs.csv'), toCsv(auditLogs), 'utf-8');
    console.log(`Exported ${auditLogs.length} audit logs to audit_logs.csv`);

    console.log(`\nAll exports finished successfully! CSV files are in: ${exportDir}`);
  } finally {
    await prisma?.$disconnect();
  }
}

main().catch(e => {
  console.error('Error during DB export:', e);
  process.exit(1);
});
