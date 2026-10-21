import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to seed categories.");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const categories = [
  ["العجلات", "Pneus", "pneus"],
  ["الشواحن", "Chargeurs", "chargeurs"],
  ["بلايكات الفرانات", "Plaquettes de frein", "plaquettes-frein"],
  ["كابلات الفرانات", "Câbles de frein", "cables-frein"],
  ["أكسيليراتور كهربائي", "Accélérateur électrique", "accelerateurs"],
  ["كونترولورات", "Contrôleurs", "controleurs"],
  ["الموتورات", "Moteurs", "moteurs"],
  ["الجنوط", "Jantes", "jantes"],
  ["شامبر آير", "Chambres à air", "chambres-a-air"],
  ["ديسكات الفرانات", "Disques de frein", "disques-frein"],
  ["ليفييات الفرانات", "Leviers de frein", "leviers-frein"],
  ["گارد بوا", "Garde-boue", "garde-boue"],
  ["البطاريات", "Batteries", "batteries"],
  ["الإضاءة والديزبلايات", "Éclairages & displays", "eclairages-displays"],
  ["الكونكتورات والإكسسوارات", "Connecteurs & accessoires", "connecteurs-accessoires"],
] as const;

async function seed() {
  try {
    for (const [index, [nameAr, nameFr, slug]] of categories.entries()) {
      await db.category.upsert({ where: { slug }, create: { nameAr, nameFr, slug, position: index }, update: { nameAr, nameFr, position: index } });
    }
    console.log(`Seeded ${categories.length} editable starter categories.`);
  } finally {
    await db.$disconnect();
  }
}

seed().catch(() => {
  console.error("Could not seed starter categories.");
  process.exitCode = 1;
});