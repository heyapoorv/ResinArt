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
const WebsiteSettings = require('../models/WebsiteSettings');

const ADMIN_EMAIL    = process.env.SEED_ADMIN_EMAIL    || 'admin@auraresin.art';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'AuraResin@2024!';

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

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('🌱  Connected to MongoDB for seeding…');

  const reset = process.argv.includes('--reset');

  if (reset) {
    await Admin.deleteMany({});
    await Category.deleteMany({});
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
