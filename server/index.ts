import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { Db, MongoClient, ObjectId } from 'mongodb';

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'kural_aac';
const jwtSecret = process.env.JWT_SECRET || 'change-this-development-secret';
const client = new MongoClient(mongoUri);
let db: Db;

type AuthRequest = Request & { userId?: string };

const allowedClientOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === 'null' || origin === allowedClientOrigin) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by the API.'));
  },
}));
app.use(express.json({ limit: '1mb' }));

function publicUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    nameTa: user.nameTa,
    email: user.email,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}

function signToken(userId: string) {
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: '7d' });
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  try {
    const payload = jwt.verify(header.slice(7), jwtSecret) as jwt.JwtPayload;
    req.userId = String(payload.sub);
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
}

function userCollection() {
  return db.collection('users');
}

async function sendResetEmail(email: string, resetUrl: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[password reset] ${email}: ${resetUrl}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Reset your Kural AAC password',
    text: `Reset your password here: ${resetUrl}`,
  });
}

app.get('/api/health', (_req, res) => res.json({ ok: true, database: dbName }));

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const { name, nameTa, email, password, role, preferredLanguage, avatar, bio } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!String(name || '').trim() || !normalizedEmail || String(password || '').length < 6) {
      return res.status(400).json({ error: 'Name, valid email, and a password of at least 6 characters are required.' });
    }
    const exists = await userCollection().findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ error: 'An account with this email already exists.' });

    const user = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      nameTa: String(nameTa || name).trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(String(password), 12),
      role: ['communicator', 'caregiver', 'therapist'].includes(role) ? role : 'communicator',
      preferredLanguage: preferredLanguage === 'ta' ? 'ta' : 'en',
      avatar: String(avatar || '🌟'),
      bio: String(bio || 'Kural AAC user.').trim(),
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };
    await userCollection().insertOne(user);
    return res.status(201).json({ user: publicUser(user), token: signToken(user.id) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await userCollection().findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    await userCollection().updateOne({ id: user.id }, { $set: { lastLoginAt: Date.now() } });
    return res.json({ user: publicUser(user), token: signToken(user.id) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/forgot-password', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = await userCollection().findOne({ email });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await db.collection('password_resets').insertOne({
        userId: user.id,
        email,
        tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(),
      });
      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}?resetToken=${token}`;
      await sendResetEmail(email, resetUrl);
    }
    res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || String(password || '').length < 6) return res.status(400).json({ error: 'A valid token and password of at least 6 characters are required.' });
    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const reset = await db.collection('password_resets').findOne({ tokenHash, expiresAt: { $gt: new Date() } });
    if (!reset) return res.status(400).json({ error: 'This reset link is invalid or expired.' });
    await userCollection().updateOne({ id: reset.userId }, { $set: { passwordHash: await bcrypt.hash(String(password), 12), passwordChangedAt: Date.now() } });
    await db.collection('password_resets').deleteMany({ userId: reset.userId });
    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await userCollection().findOne({ id: req.userId });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const allowed = ['name', 'nameTa', 'bio', 'avatar', 'preferredLanguage'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    await userCollection().updateOne({ id: req.userId }, { $set: updates });
    const user = await userCollection().findOne({ id: req.userId });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/me/settings', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const settings = await db.collection('settings').findOne({ userId: req.userId });
    res.json({ settings: settings?.values || null });
  } catch (error) {
    next(error);
  }
});

app.put('/api/me/settings', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await db.collection('settings').updateOne({ userId: req.userId }, { $set: { userId: req.userId, values: req.body, updatedAt: Date.now() } }, { upsert: true });
    res.json({ settings: req.body });
  } catch (error) {
    next(error);
  }
});

app.get('/api/me/history', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const history = await db.collection('history').find({ userId: req.userId }).sort({ timestamp: -1 }).toArray();
    res.json({ history });
  } catch (error) {
    next(error);
  }
});

app.post('/api/me/history', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const item = { ...req.body, id: String(req.body.id || crypto.randomUUID()), userId: req.userId, timestamp: Number(req.body.timestamp || Date.now()) };
    await db.collection('history').updateOne({ userId: req.userId, id: item.id }, { $set: item }, { upsert: true });
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/me/history/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => ['isFavorite'].includes(key)));
    await db.collection('history').updateOne({ userId: req.userId, id: req.params.id }, { $set: updates });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/me/history/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await db.collection('history').deleteOne({ userId: req.userId, id: req.params.id });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.delete('/api/me/history', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await db.collection('history').deleteMany({ userId: req.userId });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error.' });
});

async function start() {
  await client.connect();
  db = client.db(dbName);
  await userCollection().createIndex({ email: 1 }, { unique: true });
  await db.collection('history').createIndex({ userId: 1, timestamp: -1 });
  await db.collection('password_resets').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  app.listen(port, () => console.log(`Kural API running at http://localhost:${port}`));
}

start().catch((error) => {
  console.error('Unable to start API:', error);
  process.exit(1);
});
