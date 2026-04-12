const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const products = [
  {
    id: 'nano',
    code: 'AL-S1 / NF',
    name: 'Nano Foam',
    sub: 'Vehicle Foam Shampoo',
    price: 850,
    cat: 'exterior',
    hook: 'ONE BOTTLE. 200+ WASHES.',
    desc: '<p>Nano Foam is a highly concentrated, pH-neutral vehicle shampoo designed for maximum lubrication and safe cleaning. It produces an incredible amount of thick, clinging foam that lifts dirt and grime away from the surface, reducing the risk of swirl marks and scratches.</p>',
    advantage: 'Foam cannon: 100-150g per 1L | Hand sprayer: 1:800 dilution',
    howToUse: [
      'Rinse the vehicle thoroughly to remove loose dirt.',
      'Dilute Nano Foam in a foam cannon or wash bucket (1:800).',
      'Apply foam to the entire vehicle surface.',
      'Gently agitate with a wash mitt if necessary.',
      'Rinse off with clean water and dry.'
    ],
    feats: [
      '**Ultra High Dilution** — 1:800 ratio for maximum value',
      '**pH Neutral** — Safe on all coatings and waxes',
      '**Extra Lubrication** — Prevents wash-induced marring'
    ],
    tags: ['Exterior', 'Shampoo', 'Foam'],
    grad: 'linear-gradient(135deg, #1e3a8a, #1e1b4b)'
  },
  {
    id: 'fusion',
    code: 'AL-S1 / FW',
    name: 'Fusion Wash',
    sub: 'Wash & Wax',
    price: 1150,
    cat: 'exterior',
    hook: 'CLEAN, SHINE, AND PROTECT IN ONE STEP.',
    desc: '<p>Fusion Wash combines premium cleaning agents with advanced wax technology. It removes road grime while depositing a thin layer of protective wax, leaving your vehicle with a deep, glossy finish and improved water beading in just one step.</p>',
    advantage: 'Perfect for maintenance washes to boost existing protection.',
    howToUse: [
      'Dilute 30-50ml in a 10L bucket of water.',
      'Wash the vehicle from top to bottom using a wash mitt.',
      'Rinse each section as you go.',
      'Dry with a premium microfiber towel to reveal the shine.'
    ],
    feats: [
      '**Hybrid Formula** — Cleans and protects simultaneously',
      '**Deep Gloss** — Enhances paint depth and clarity',
      '**Beading Action** — Leaves a hydrophobic protective layer'
    ],
    tags: ['Exterior', 'Wash', 'Wax'],
    grad: 'linear-gradient(135deg, #065f46, #064e3b)'
  },
  {
    id: 'gleam',
    code: 'AL-S1 / GX',
    name: 'Gleam-X',
    sub: 'Glass Cleaner & Protector',
    price: 750,
    cat: 'exterior',
    hook: 'STREAK-FREE CLARITY, RAIN-REPELLING POWER.',
    desc: '<p>Gleam-X is a professional-grade glass cleaner that cuts through film, grease, and smoke residue with ease. It features advanced polymers that help repel water and dust, keeping your glass cleaner for longer and improving visibility during rain.</p>',
    advantage: 'Ammonia-free – safe for tinted windows and all glass surfaces.',
    howToUse: [
      'Spray directly onto the glass or a microfiber towel.',
      'Wipe using a circular motion to lift dirt.',
      'Flip the towel to a clean, dry side for the final buff.',
      'Repeat on the interior side for crystal clarity.'
    ],
    feats: [
      '**Streak-Free** — Leaves no residue or haze',
      '**Dust Repellent** — Anti-static properties keep glass clean',
      '**Visibility Boost** — Improves clarity in all weather'
    ],
    tags: ['Exterior', 'Glass', 'Clarity'],
    grad: 'linear-gradient(135deg, #0369a1, #0c4a6e)'
  },
  {
    id: 'hyper',
    code: 'AL-S1 / HD',
    name: 'Hyper DRESS',
    sub: 'Multi-Surface Dressing',
    price: 1450,
    cat: 'interior',
    hook: 'VERSATILE GLOSS FOR EVERY SURFACE.',
    desc: '<p>Hyper DRESS is a water-based dressing that provides a rich, factory-fresh look to plastic, vinyl, and rubber surfaces. Its versatile formula allows you to adjust the gloss level by changing the dilution ratio, making it perfect for both interior trims and engine bays.</p>',
    advantage: 'Dilutable for custom gloss levels – 1:1 for high gloss, up to 1:4 for satin.',
    howToUse: [
      'Ensure the surface is clean and dry.',
      'Apply directly or with an applicator pad.',
      'Spread evenly across the surface.',
      'Wipe away any excess for a uniform finish.'
    ],
    feats: [
      '**UV Protection** — Prevents fading and cracking',
      '**Non-Greasy** — Leaves a dry-to-the-touch finish',
      '**Multi-Surface** — Use on trim, engine, and tires'
    ],
    tags: ['Interior', 'Exterior', 'Dressing'],
    grad: 'linear-gradient(135deg, #374151, #111827)'
  },
  {
    id: 'cabin',
    code: 'AL-S1 / CG',
    name: 'Cabin Glow',
    sub: 'Interior Surface Cleaner',
    price: 950,
    cat: 'interior',
    hook: 'REVIVE YOUR INTERIOR, PROTECT YOUR SPACE.',
    desc: '<p>Cabin Glow is a specialized cleaner for all interior surfaces, including dashboards, door panels, and consoles. It effectively removes dust, fingerprints, and light stains without leaving any sticky residue, while adding a subtle UV-resistant barrier.</p>',
    advantage: 'Fresh clean scent with zero harsh chemical odors.',
    howToUse: [
      'Spray onto a clean microfiber towel.',
      'Wipe the surface to remove dirt and grime.',
      'For stubborn spots, spray directly and let sit for 30 seconds.',
      'Wipe dry and admire the OEM finish.'
    ],
    feats: [
      '**OEM Finish** — No artificial shine, just clean',
      '**Safe Cleaning** — Gentler than all-purpose cleaners',
      '**Anti-Static** — Reduces dust accumulation'
    ],
    tags: ['Interior', 'Cleaner', 'Detailer'],
    grad: 'linear-gradient(135deg, #78350f, #451a03)'
  },
  {
    id: 'surface',
    code: 'AL-S1 / SR',
    name: 'Surface Revive',
    sub: 'Plastic & Rubber Restorer',
    price: 1270,
    cat: 'tyre',
    hook: 'BRING FADED TRIM BACK TO LIFE.',
    desc: '<p>Surface Revive uses advanced polymer technology to penetrate deep into faded plastic and rubber trim, restoring the original deep black color. It creates a durable, hydrophobic bond that lasts through multiple washes and protects against UV damage.</p>',
    advantage: 'Highly durable bond – won\'t streak or run in the rain.',
    howToUse: [
      'Thoroughly clean and dry the trim surface.',
      'Apply a small amount to an applicator.',
      'Work into the surface using firm, even pressure.',
      'Let cure for 10-15 minutes before exposure to moisture.'
    ],
    feats: [
      '**Permanent Look** — Not just a temporary oil coating',
      '**UV Shield** — Blocks the primary cause of trim fading',
      '**Extreme Hydrophobic** — Water beads right off'
    ],
    tags: ['Exterior', 'Trim', 'Restorer'],
    grad: 'linear-gradient(135deg, #3f3f46, #18181b)'
  },
  {
    id: 'graphene',
    code: 'AL-S1 / GT',
    name: 'Graphene Tyre Coat',
    sub: 'Tyre Shine',
    price: 1802,
    cat: 'tyre',
    hook: 'THE ULTIMATE SHINE. INFUSED WITH GRAPHENE.',
    desc: '<p>Graphene Tyre Coat represents the pinnacle of tire finishing technology. Infused with reduced graphene oxide, it provides a deep, dark shine that is incredibly durable and resistant to water, dirt, and UV rays while being dry to the touch.</p>',
    advantage: 'Graphene infusion provides superior longevity over standard dressings.',
    howToUse: [
      'Clean tires with a stiff brush and degreaser; dry completely.',
      'Apply 2-3 drops to a tire applicator.',
      'Spread evenly around the sidewall.',
      'Apply a second coat after 20 minutes for extra high gloss.'
    ],
    feats: [
      '**Graphene Infused** — Enhanced durability and heat resistance',
      '**Sling-Free** — Sets dry to prevent messy spray on paint',
      '**Jet Black** — Provides the deepest possible finish'
    ],
    tags: ['Exterior', 'Tyre', 'Graphene'],
    grad: 'linear-gradient(135deg, #111111, #000000)'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[SEED] Connected to MongoDB');
    
    // Clear existing products? No, let's update or create
    for (const p of products) {
      await Product.findOneAndUpdate({ id: p.id }, p, { upsert: true, new: true });
      console.log(`[SEED] Synced: ${p.name}`);
    }
    
    console.log('[SEED] Database populated successfully!');
  } catch (err) {
    console.error('[SEED] Error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
