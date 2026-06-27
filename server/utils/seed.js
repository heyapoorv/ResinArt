/**
 * utils/seed.js
 *
 * Run once to create the default admin account and seed
 * initial categories that match the frontend filters.
 *
 * Usage:
 *   node utils/seed.js
 *   node utils/seed.js --reset   (drops existing data first)
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Admin    = require('../models/Admin');
const Category = require('../models/Category');
const Product  = require('../models/Product');
const WebsiteSettings = require('../models/WebsiteSettings');

const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    || 'admin@auraresin.art';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'changeme!123';

const defaultCategories = [
  { name: 'Ocean Series',       icon: 'waves'         },
  { name: 'Geode Style',        icon: 'diamond'        },
  { name: 'Botanical Inlay',    icon: 'eco'            },
  { name: 'Celestial Series',   icon: 'auto_awesome'   },
  { name: 'Gold Series',        icon: 'star'           },
  { name: 'Clocks',             icon: 'schedule'       },
  { name: 'Coasters',           icon: 'circle'         },
  { name: 'Wall Panels',        icon: 'image'          },
  { name: 'Tabletops',          icon: 'table_bar'      },
  { name: 'Wearables',          icon: 'diamond'        },
  { name: 'Home Decor',         icon: 'home'           },
  { name: 'Luxury Trays',       icon: 'grid_view'      },
  { name: 'Furniture',          icon: 'chair'          },
  { name: 'Flora Series',       icon: 'local_florist'  },
  { name: 'Minimalist Series',  icon: 'crop_square'    },
];

const seedProducts = [
  {
    name: 'Abyssal Deep Ocean Table',
    description: 'A mesmerizing river table depicting the deep ocean abyss using vibrant blue resin and natural walnut wood.',
    price: 1200,
    featured: true,
    available: true,
    dimensions: '120x60cm',
    sku: 'TBL-OCEAN-01',
    images: [{ url: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=1200&auto=format&fit=crop', publicId: 'seed_1' }],
    catName: 'Ocean Series'
  },
  {
    name: 'Amethyst Geode Wall Art',
    description: 'A stunning wall piece inspired by amethyst geodes, featuring real quartz crystals, crushed glass, and purple resin.',
    price: 450,
    featured: true,
    available: true,
    dimensions: '60cm Diameter',
    sku: 'ART-GEODE-01',
    images: [{ url: 'https://images.unsplash.com/photo-1629196914275-01e4a3c1097f?q=80&w=1200&auto=format&fit=crop', publicId: 'seed_2' }],
    catName: 'Geode Style'
  },
  {
    name: 'Liquid Gold Abstract Canvas',
    description: 'Luxurious fluid art featuring metallic gold pigments flowing through deep black resin.',
    price: 320,
    featured: true,
    available: true,
    dimensions: '80x80cm',
    sku: 'ART-GOLD-01',
    images: [{ url: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=1200&auto=format&fit=crop', publicId: 'seed_3' }],
    catName: 'Gold Series'
  },
  {
    name: 'Olive Wood & Resin Cutting Board',
    description: 'A functional yet artistic cutting board combining premium olive wood with turquoise epoxy resin.',
    price: 150,
    featured: false,
    available: true,
    dimensions: '40x30cm',
    sku: 'DEC-BOARD-01',
    images: [{ url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=1200&auto=format&fit=crop', publicId: 'seed_4' }],
    catName: 'Home Decor'
  },
  {
    name: 'Botanical Fern Coaster Set',
    description: 'Set of 4 resin coasters with real preserved ferns and gold leaf flakes.',
    price: 45,
    featured: false,
    available: true,
    dimensions: '10cm Diameter',
    sku: 'DEC-COAST-01',
    images: [{ url: 'https://images.unsplash.com/photo-1574677799587-578d0674cb97?q=80&w=1200&auto=format&fit=crop', publicId: 'seed_5' }],
    catName: 'Coasters'
  },
  {
    name: 'Midnight Galaxy Clock',
    description: 'A beautiful wall clock featuring a swirling galaxy design in dark blue, purple, and silver resin.',
    price: 180,
    featured: true,
    available: false, // sold out
    dimensions: '40cm Diameter',
    sku: 'CLK-GAL-01',
    images: [{ url: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=1200&auto=format&fit=crop', publicId: 'seed_6' }],
    catName: 'Clocks'
  }
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('🌱  Connected to MongoDB for seeding…');

  const reset = process.argv.includes('--reset');

  if (reset) {
    await Admin.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await WebsiteSettings.deleteMany({});
    console.log('🗑️   Existing data cleared.');
  }

  // ── Admin ──────────────────────────────────────────
  const existing = await Admin.findOne({ email: ADMIN_EMAIL });
  if (!existing) {
    await Admin.create({ email: ADMIN_EMAIL, passwordHash: ADMIN_PASSWORD });
    console.log(`✅  Admin created → ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log(`ℹ️   Admin already exists: ${ADMIN_EMAIL}`);
  }

  // ── Categories ─────────────────────────────────────
  for (const cat of defaultCategories) {
    await Category.updateOne(
      { name: cat.name },
      { $setOnInsert: cat },
      { upsert: true }
    );
  }
  console.log(`✅  ${defaultCategories.length} categories seeded.`);
  
  // ── Products ───────────────────────────────────────
  if (reset) {
    for (const prodData of seedProducts) {
      const cat = await Category.findOne({ name: prodData.catName });
      if (cat) {
        prodData.category = cat._id;
        delete prodData.catName;
        await Product.create(prodData);
      }
    }
    console.log(`✅  ${seedProducts.length} sample products seeded.`);
  } else {
    console.log(`ℹ️   Skipped product seeding (use --reset to seed products).`);
  }

  // ── Website Settings singleton ─────────────────────
  const count = await WebsiteSettings.countDocuments();
  if (count === 0) {
    await WebsiteSettings.create({});
    console.log('✅  Default WebsiteSettings created.');
  }

  console.log('\n🎉  Seeding complete.\n');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌  Seed error:', err);
  process.exit(1);
});
