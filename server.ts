import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

// Ensure data directory and uploads directory exist
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Body parser with 25mb limit for photo uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve uploaded files and image assets
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/src/assets/images', express.static(path.join(__dirname, 'src/assets/images')));

// DB Path
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

interface DBStructure {
  users: UserRecord[];
  businesses: any[];
}

// Crypto password hashing
function hashPassword(password: string, salt?: string) {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash, salt: actualSalt };
}

function verifyPassword(password: string, hash: string, salt: string) {
  const calculated = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calculated, 'hex'));
}

// Simple token system
const SECRET = process.env.APP_SECRET || 'hublivo_dark_forest_secret_key_2026';
function generateToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token: string): string | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;
    const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
    if (signature !== expectedSig) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (Date.now() > data.exp) return null;
    return data.userId;
  } catch {
    return null;
  }
}

// Initialize and Seed Database
function getDB(): DBStructure {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (data && Array.isArray(data.users) && Array.isArray(data.businesses)) {
        return data;
      }
    } catch (e) {
      console.error('Error reading db.json, recreating...', e);
    }
  }

  // Seed demo owner and 5 initial marquee businesses
  const demoSalt = '7f8a9b0c1d2e3f4a5b6c7d8e';
  const demoHash = hashPassword('password123', demoSalt).hash;
  const demoUserId = 'usr_hublivo_demo_owner';

  const defaultAvailability = {
    monday: { open: true, start: '09:00', end: '17:00' },
    tuesday: { open: true, start: '09:00', end: '17:00' },
    wednesday: { open: true, start: '09:00', end: '17:00' },
    thursday: { open: true, start: '09:00', end: '17:00' },
    friday: { open: true, start: '09:00', end: '17:00' },
    saturday: { open: true, start: '10:00', end: '15:00' },
    sunday: { open: false, start: '09:00', end: '17:00' },
    notes: 'Walk-ins welcome or call ahead to confirm private bookings.'
  };

  const initialDB: DBStructure = {
    users: [
      {
        id: demoUserId,
        email: 'owner@hublivo.com',
        name: 'Elena Vance',
        passwordHash: demoHash,
        salt: demoSalt,
        createdAt: new Date().toISOString()
      }
    ],
    businesses: [
      {
        id: 'biz_verdant_landscaping',
        ownerId: demoUserId,
        name: 'Verdant Native Landscaping & Stone',
        slug: 'verdant-native-landscaping',
        category: 'Landscaping & Outdoors',
        tagline: 'Lush Pacific Northwest botanical garden pathways, dry-stack slate, and native plant curation.',
        locationType: 'service_area',
        serviceArea: 'Greater Portland Metro & Willamette Valley (Travels to Client)',
        photos: ['/src/assets/images/botanical_landscaping_1793147309519.jpg'],
        startingPrice: 120,
        pricingUnit: 'consultation',
        services: [
          { id: 's1', name: 'On-Site Botanical Garden Consultation', price: 120, priceSuffix: 'per 90 min', description: 'Comprehensive site analysis, soil check, and native plant arrangement blueprint.' },
          { id: 's2', name: 'Natural Flagstone & Moss Pathway Installation', price: 1450, priceSuffix: 'starting', description: 'Hand-chiselled local basalt and slate pathway with native creeping thyme and moss border.' },
          { id: 's3', name: 'Four-Season Native Canopy Pruning', price: 280, priceSuffix: 'half-day', description: 'Careful aesthetic thinning of Japanese maples, hemlocks, and elderberry bushes.' }
        ],
        availability: defaultAvailability,
        phone: '(503) 890-4122',
        email: 'elena@verdantlandscapes.com',
        status: 'published',
        featured: true,
        createdAt: '2026-10-15T10:00:00.000Z',
        updatedAt: '2026-10-20T14:30:00.000Z'
      },
      {
        id: 'biz_kavanagh_woodcraft',
        ownerId: demoUserId,
        name: 'Kavanagh Studio Woodcraft',
        slug: 'kavanagh-studio-woodcraft',
        category: 'Crafts & Woodwork',
        tagline: 'Hand-hewn walnut dining tables, heirloom credenzas, and Japanese joinery.',
        locationType: 'address',
        address: '1420 NW Industrial Way, Suite 4B, Seattle, WA',
        photos: ['/src/assets/images/artisan_woodwork_1793147310156.jpg'],
        startingPrice: 350,
        pricingUnit: 'piece',
        services: [
          { id: 's1', name: 'Bespoke Solid Walnut Dining Table', price: 2800, priceSuffix: 'custom build', description: 'Kiln-dried American black walnut with hand-rubbed organic oil and beeswax finish.' },
          { id: 's2', name: 'Mortise-and-Tenon Coffee Table', price: 850, priceSuffix: 'each', description: 'Low profile living room centerpiece built using timeless zero-hardware joinery.' },
          { id: 's3', name: 'Heirloom Furniture Restoration & Refinishing', price: 350, priceSuffix: 'starting', description: 'Careful historical timber preservation, joinery tightening, and gentle patina revival.' }
        ],
        availability: {
          ...defaultAvailability,
          saturday: { open: true, start: '11:00', end: '16:00' },
          notes: 'Studio open for wood selection by appointment.'
        },
        phone: '(206) 431-8890',
        email: 'hello@kavanaghwood.com',
        status: 'published',
        featured: true,
        createdAt: '2026-10-18T12:00:00.000Z',
        updatedAt: '2026-10-22T09:15:00.000Z'
      },
      {
        id: 'biz_slate_flour_bakery',
        ownerId: demoUserId,
        name: 'Slate & Flour Artisan Sourdough',
        slug: 'slate-and-flour-bakery',
        category: 'Artisan Bakery & Food',
        tagline: '36-hour cold-fermented wild yeast sourdough, laminated pastries, and stone-milled flours.',
        locationType: 'address',
        address: '804 Pine Street, Boulder, CO',
        photos: ['/src/assets/images/artisan_bakery_1793147311516.jpg'],
        startingPrice: 9,
        pricingUnit: 'loaf',
        services: [
          { id: 's1', name: 'Country Seeded Sourdough Batard', price: 9.50, priceSuffix: 'loaf', description: 'Toasted sesame, golden flax, and wild heirloom starter with caramelized crust.' },
          { id: 's2', name: 'Cardamom & Blood Orange Morning Bun', price: 5.75, priceSuffix: 'each', description: 'Layered croissant dough rolled in organic Ceylon cardamom and raw demerara sugar.' },
          { id: 's3', name: 'Weekly Neighborhood Bread Subscription', price: 36, priceSuffix: 'month', description: 'Two fresh loaves reserved every Friday morning with bakery-club exclusive bakes.' }
        ],
        availability: {
          monday: { open: false, start: '07:00', end: '14:00' },
          tuesday: { open: true, start: '07:00', end: '14:00' },
          wednesday: { open: true, start: '07:00', end: '14:00' },
          thursday: { open: true, start: '07:00', end: '14:00' },
          friday: { open: true, start: '07:00', end: '15:00' },
          saturday: { open: true, start: '07:30', end: '16:00' },
          sunday: { open: true, start: '08:00', end: '14:00' },
          notes: 'Fresh bake out of the stone deck oven at 7:00 AM daily.'
        },
        phone: '(303) 554-2018',
        email: 'bakes@slateandflour.com',
        status: 'published',
        featured: true,
        createdAt: '2026-10-21T08:00:00.000Z',
        updatedAt: '2026-10-24T11:00:00.000Z'
      },
      {
        id: 'biz_moss_sanctuary_spa',
        ownerId: demoUserId,
        name: 'Moss Sanctuary Wellness & Bodywork',
        slug: 'moss-sanctuary-wellness',
        category: 'Wellness & Spa',
        tagline: 'Restorative dark-botanical massage, heated river basalt stones, and herbal aromatherapy.',
        locationType: 'address',
        address: '224 Forest Ridge Road, Ashland, OR',
        photos: ['/src/assets/images/forest_wellness_spa_1793147312087.jpg'],
        startingPrice: 110,
        pricingUnit: 'session',
        services: [
          { id: 's1', name: 'Deep Forest Basalt Stone Therapy', price: 140, priceSuffix: '75 min', description: 'Smooth heated river stones infused with cedar and wild sage essential extracts.' },
          { id: 's2', name: 'Targeted Myofascial Release & Tension Relieve', price: 110, priceSuffix: '60 min', description: 'Custom structural alignment focusing on chronic postural neck, shoulder, and back fatigue.' },
          { id: 's3', name: 'Private Couples Sound Bath & Restorative Massage', price: 260, priceSuffix: '90 min', description: 'Dual therapists with Himalayan brass bowls and botanical foot bath immersion.' }
        ],
        availability: {
          ...defaultAvailability,
          sunday: { open: true, start: '10:00', end: '16:00' },
          notes: 'Quiet botanical sanctuary. Herbal infusion served post-treatment.'
        },
        phone: '(541) 488-9204',
        email: 'appointments@mosssanctuary.com',
        status: 'published',
        featured: false,
        createdAt: '2026-10-23T14:00:00.000Z',
        updatedAt: '2026-10-26T16:00:00.000Z'
      },
      {
        id: 'biz_apex_mobile_detailing',
        ownerId: demoUserId,
        name: 'Apex Mobile Precision Auto Detailing',
        slug: 'apex-mobile-precision-detailing',
        category: 'Automotive Detailing',
        tagline: 'Concours-level mobile ceramic coating, paint correction, and interior restoration at your driveway.',
        locationType: 'service_area',
        serviceArea: 'Bay Area & Silicon Valley (Fully equipped mobile van travels to your home or office)',
        photos: ['/src/assets/images/mobile_auto_detailing_1793147311696.jpg'],
        startingPrice: 180,
        pricingUnit: 'vehicle',
        services: [
          { id: 's1', name: 'Signature Mobile Foam Wash & Decontamination', price: 180, priceSuffix: 'starting', description: 'pH-neutral foam bath, iron fallout removal, clay bar, and synthetic sealant spray.' },
          { id: 's2', name: 'Two-Stage Machine Paint Correction & Mirror Polish', price: 490, priceSuffix: 'sedan / coupe', description: 'Eliminates 85-90% of swirl marks, light scratches, and oxidation.' },
          { id: 's3', name: '3-Year 9H Hardness Hydrophobic Ceramic Coating', price: 790, priceSuffix: 'complete', description: 'Multi-layer nanotech ceramic barrier applied to bodywork, wheel faces, and glass.' }
        ],
        availability: {
          monday: { open: true, start: '08:00', end: '18:00' },
          tuesday: { open: true, start: '08:00', end: '18:00' },
          wednesday: { open: true, start: '08:00', end: '18:00' },
          thursday: { open: true, start: '08:00', end: '18:00' },
          friday: { open: true, start: '08:00', end: '18:00' },
          saturday: { open: true, start: '09:00', end: '17:00' },
          sunday: { open: false, start: '09:00', end: '17:00' },
          notes: 'Self-contained water tank and silent electric generator on board.'
        },
        phone: '(415) 790-3329',
        email: 'service@apexdetailing.com',
        status: 'published',
        featured: false,
        createdAt: '2026-10-25T11:00:00.000Z',
        updatedAt: '2026-10-27T08:00:00.000Z'
      }
    ]
  };

  saveDB(initialDB);
  return initialDB;
}

function saveDB(db: DBStructure) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Authentication Middleware
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found' });
  }

  (req as any).user = user;
  next();
}

function optionalUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (userId) {
      const db = getDB();
      const user = db.users.find(u => u.id === userId);
      if (user) {
        (req as any).user = user;
      }
    }
  }
  next();
}

// ================= API ROUTES =================

// Auth: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please enter your full name, email, and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password should be at least 6 characters.' });
    }

    const db = getDB();
    if (db.users.some(u => u.email === cleanEmail)) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    const { hash, salt } = hashPassword(password);
    const newUser: UserRecord = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      email: cleanEmail,
      name: name.trim(),
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);

    const token = generateToken(newUser.id);
    return res.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter your email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = getDB();
    const user = db.users.find(u => u.email === cleanEmail);

    if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
      return res.status(401).json({ error: 'Incorrect email or password. Please try again.' });
    }

    const token = generateToken(user.id);
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Auth: Current User
app.get('/api/auth/me', authenticateUser, (req: Request, res: Response) => {
  const user = (req as any).user as UserRecord;
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }
  });
});

// Upload Photo
app.post('/api/upload', authenticateUser, (req: Request, res: Response) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'No image data received.' });
    }

    // Match data:[<mediatype>];base64,<data>
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image format.' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = 'jpg';
    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';

    const safeBaseName = (filename || 'photo').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const savedName = `img_${Date.now()}_${safeBaseName}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, savedName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${savedName}`;
    return res.json({ url: publicUrl });
  } catch (err: any) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Photo upload failed. Please try again.' });
  }
});

// Download Complete Codebase Archive (.zip for iPhone/Mac/Windows)
app.get(['/api/export', '/api/export.zip', '/api/download.zip'], (req: Request, res: Response) => {
  try {
    const format = req.query.format;
    if (format === 'tar') {
      const archivePath = '/tmp/hublivo-codebase.tar.gz';
      execSync('tar --exclude="node_modules" --exclude="dist" --exclude=".git" -czf /tmp/hublivo-codebase.tar.gz .', {
        cwd: __dirname
      });
      return res.download(archivePath, 'hublivo-fullstack-app.tar.gz');
    }

    const zipPath = '/tmp/hublivo-fullstack-app.zip';
    execSync('python3 scripts/make_zip.py /tmp/hublivo-fullstack-app.zip', {
      cwd: __dirname
    });
    res.download(zipPath, 'hublivo-fullstack-app.zip');
  } catch (err: any) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to create zip archive' });
  }
});

// Businesses: List (Public discovery)
app.get('/api/businesses', (req: Request, res: Response) => {
  try {
    const db = getDB();
    const { search, category, location, service, featured } = req.query;

    let list = db.businesses.filter(b => b.status === 'published');

    if (category && typeof category === 'string' && category !== 'All') {
      list = list.filter(b => b.category?.toLowerCase() === category.toLowerCase());
    }

    if (featured === 'true') {
      list = list.filter(b => b.featured);
    }

    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      list = list.filter(b => {
        const nameMatch = b.name?.toLowerCase().includes(q);
        const taglineMatch = b.tagline?.toLowerCase().includes(q);
        const catMatch = b.category?.toLowerCase().includes(q);
        const locMatch = (b.address?.toLowerCase().includes(q)) || (b.serviceArea?.toLowerCase().includes(q));
        const serviceMatch = b.services?.some((s: any) => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
        return nameMatch || taglineMatch || catMatch || locMatch || serviceMatch;
      });
    }

    if (location && typeof location === 'string') {
      const locQ = location.trim().toLowerCase();
      list = list.filter(b => {
        return (b.address?.toLowerCase().includes(locQ)) || (b.serviceArea?.toLowerCase().includes(locQ));
      });
    }

    if (service && typeof service === 'string') {
      const sQ = service.trim().toLowerCase();
      list = list.filter(b => {
        return b.services?.some((s: any) => s.name?.toLowerCase().includes(sQ));
      });
    }

    // Sort by updated/created
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({ businesses: list });
  } catch (err: any) {
    console.error('List businesses error:', err);
    return res.status(500).json({ error: 'Failed to load businesses.' });
  }
});

// Businesses: Get by ID or Slug
app.get('/api/businesses/:idOrSlug', optionalUser, (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const db = getDB();
    const currentUserId = (req as any).user?.id;

    const biz = db.businesses.find(b => b.id === idOrSlug || b.slug === idOrSlug);
    if (!biz) {
      return res.status(404).json({ error: 'Business portfolio not found.' });
    }

    // If draft, only owner can view
    if (biz.status === 'draft' && biz.ownerId !== currentUserId) {
      return res.status(403).json({ error: 'This portfolio is currently an unpublished draft.' });
    }

    return res.json({ business: biz });
  } catch (err: any) {
    console.error('Get business error:', err);
    return res.status(500).json({ error: 'Failed to load business profile.' });
  }
});

// Businesses: Get Current User's Portfolios (drafts & published)
app.get('/api/my-businesses', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserRecord;
    const db = getDB();
    const myBusinesses = db.businesses.filter(b => b.ownerId === user.id);
    return res.json({ businesses: myBusinesses });
  } catch (err: any) {
    console.error('My businesses error:', err);
    return res.status(500).json({ error: 'Failed to load your portfolios.' });
  }
});

// Helper for generating slug
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'portfolio';
}

// Businesses: Create (Draft or Published)
app.post('/api/businesses', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserRecord;
    const body = req.body;

    if (!body.name || !body.name.trim()) {
      return res.status(400).json({ error: 'Please enter your business or professional name.' });
    }

    const db = getDB();
    const baseSlug = slugify(body.name);
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (db.businesses.some(b => b.slug === uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    const newBiz = {
      id: 'biz_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ownerId: user.id,
      name: body.name.trim(),
      slug: uniqueSlug,
      category: body.category || 'Home & Renovation',
      tagline: body.tagline?.trim() || '',
      locationType: body.locationType || 'address',
      address: body.address?.trim() || '',
      serviceArea: body.serviceArea?.trim() || '',
      photos: Array.isArray(body.photos) ? body.photos : [],
      startingPrice: Number(body.startingPrice) || 0,
      pricingUnit: body.pricingUnit || 'service',
      services: Array.isArray(body.services) ? body.services : [],
      availability: body.availability || {
        monday: { open: true, start: '09:00', end: '17:00' },
        tuesday: { open: true, start: '09:00', end: '17:00' },
        wednesday: { open: true, start: '09:00', end: '17:00' },
        thursday: { open: true, start: '09:00', end: '17:00' },
        friday: { open: true, start: '09:00', end: '17:00' },
        saturday: { open: false, start: '09:00', end: '17:00' },
        sunday: { open: false, start: '09:00', end: '17:00' },
        notes: ''
      },
      phone: body.phone?.trim() || '',
      email: body.email?.trim() || user.email,
      status: body.status === 'draft' ? 'draft' : 'published',
      featured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.businesses.unshift(newBiz);
    saveDB(db);

    return res.status(201).json({ business: newBiz });
  } catch (err: any) {
    console.error('Create business error:', err);
    return res.status(500).json({ error: 'Failed to create business portfolio.' });
  }
});

// Businesses: Update (Owner only)
app.put('/api/businesses/:id', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserRecord;
    const { id } = req.params;
    const body = req.body;

    const db = getDB();
    const index = db.businesses.findIndex(b => b.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Business portfolio not found.' });
    }

    const existing = db.businesses[index];
    if (existing.ownerId !== user.id) {
      return res.status(403).json({ error: 'You do not have permission to edit this portfolio.' });
    }

    if (body.name && !body.name.trim()) {
      return res.status(400).json({ error: 'Business name cannot be blank.' });
    }

    const updatedBiz = {
      ...existing,
      name: body.name ? body.name.trim() : existing.name,
      category: body.category || existing.category,
      tagline: body.tagline !== undefined ? body.tagline.trim() : existing.tagline,
      locationType: body.locationType || existing.locationType,
      address: body.address !== undefined ? body.address.trim() : existing.address,
      serviceArea: body.serviceArea !== undefined ? body.serviceArea.trim() : existing.serviceArea,
      photos: Array.isArray(body.photos) ? body.photos : existing.photos,
      startingPrice: body.startingPrice !== undefined ? Number(body.startingPrice) : existing.startingPrice,
      pricingUnit: body.pricingUnit !== undefined ? body.pricingUnit : existing.pricingUnit,
      services: Array.isArray(body.services) ? body.services : existing.services,
      availability: body.availability || existing.availability,
      phone: body.phone !== undefined ? body.phone.trim() : existing.phone,
      email: body.email !== undefined ? body.email.trim() : existing.email,
      status: body.status === 'draft' ? 'draft' : 'published',
      updatedAt: new Date().toISOString()
    };

    db.businesses[index] = updatedBiz;
    saveDB(db);

    return res.json({ business: updatedBiz });
  } catch (err: any) {
    console.error('Update business error:', err);
    return res.status(500).json({ error: 'Failed to update portfolio.' });
  }
});

// Businesses: Delete (Owner only)
app.delete('/api/businesses/:id', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserRecord;
    const { id } = req.params;

    const db = getDB();
    const index = db.businesses.findIndex(b => b.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Business portfolio not found.' });
    }

    if (db.businesses[index].ownerId !== user.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this portfolio.' });
    }

    db.businesses.splice(index, 1);
    saveDB(db);

    return res.json({ success: true, message: 'Portfolio removed.' });
  } catch (err: any) {
    console.error('Delete business error:', err);
    return res.status(500).json({ error: 'Failed to delete portfolio.' });
  }
});

// Vite Middleware Setup for dev server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for all non-api SPA requests
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Hublivo server running at http://${HOST}:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
