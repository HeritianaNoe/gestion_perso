# Gestion du Personnel — Next.js 15 + Prisma + PostgreSQL + NextAuth v5

## Fametrahana
```bash
unzip gestion-personnel.zip && cd gestion-personnel
cp .env.example .env          # ovay ny DATABASE_URL ; AUTH_SECRET = `npx auth secret`
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev                   # http://localhost:3000
```

Login: 
admin@entreprise.mg / Admin@12345  
directeur@entreprise.mg / Directeur@2026
comptable@entreprise.mg / Comptable@2026


