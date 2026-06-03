/**
 * Database Seed Script
 * Run: cd server && npx ts-node src/scripts/seed.ts
 *
 * Creates: admin user, default categories, and sample questions.
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from '../models/User';
import { Category } from '../models/Category';
import { Question } from '../models/Question';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/samagama';

const categories = [
  { name: 'Programming', slug: 'programming', description: 'Code, algorithms, and software development', icon: 'code', color: '#494bd6' },
  { name: 'Technology', slug: 'technology', description: 'Tech news, tools, and emerging technologies', icon: 'devices', color: '#b52701' },
  { name: 'Design Systems', slug: 'design-systems', description: 'UI/UX, design tokens, and component libraries', icon: 'palette', color: '#ff5c35' },
  { name: 'React', slug: 'react', description: 'React ecosystem, hooks, and best practices', icon: 'hub', color: '#494bd6' },
  { name: 'Career', slug: 'career', description: 'Career advice, interviews, and professional growth', icon: 'work', color: '#5f5e5e' },
  { name: 'Education', slug: 'education', description: 'Learning resources, courses, and study tips', icon: 'school', color: '#494bd6' },
  { name: 'General Knowledge', slug: 'general-knowledge', description: 'Science, history, and everyday questions', icon: 'lightbulb', color: '#b52701' },
  { name: 'Development', slug: 'development', description: 'Web and app development tips and tricks', icon: 'developer_mode', color: '#ff5c35' },
];

const seed = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Question.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Create admin
  const adminHash = await bcrypt.hash('admin123', 12);
  const admin = await User.create({
    username: 'admin',
    email: 'admin@samagama.dev',
    passwordHash: adminHash,
    role: 'admin',
    bio: 'Samagama platform administrator',
    reputation: 5000,
  });

  // Create moderator
  const modHash = await bcrypt.hash('mod123', 12);
  const mod = await User.create({
    username: 'moderator',
    email: 'mod@samagama.dev',
    passwordHash: modHash,
    role: 'moderator',
    bio: 'Community moderator',
    reputation: 1500,
  });

  // Create sample user
  const userHash = await bcrypt.hash('user123', 12);
  const regularUser = await User.create({
    username: 'wiseuser',
    email: 'user@samagama.dev',
    passwordHash: userHash,
    role: 'user',
    bio: 'Passionate developer and knowledge sharer',
    reputation: 320,
  });

  console.log('👤 Users created: admin / mod / wiseuser');

  // Create categories
  const createdCategories = await Category.insertMany(categories);
  console.log(`📂 Created ${createdCategories.length} categories`);

  const catMap = Object.fromEntries(createdCategories.map(c => [c.slug, c._id]));

  // Sample questions
  const sampleQuestions = [
    {
      title: 'How do I integrate a custom Tailwind config with Next.js App Router?',
      description: `## Problem\n\nI'm building a Next.js 14 application using the App Router and I want to use a custom Tailwind CSS configuration with extended color tokens.\n\n## What I've tried\n\nI added my config to \`tailwind.config.ts\` but the custom colors aren't being applied in my server components.\n\n## Expected behavior\n\nThe custom color palette should work seamlessly across both client and server components.`,
      category: catMap['development'],
      tags: ['tailwindcss', 'nextjs', 'app-router', 'css'],
      author: regularUser._id,
      upvotes: 842, downvotes: 12, voteScore: 830,
      viewCount: 12400, clickCount: 14300, answerCount: 3,
      trendingScore: 95,
    },
    {
      title: 'What is the optimal spacing scale for a dense dashboard UI?',
      description: `## Context\n\nI'm building an admin dashboard with dense data tables. The standard 8px spacing grid creates too much whitespace.\n\n## Question\n\nWhat spacing scale works best for data-heavy UIs while maintaining visual hierarchy and readability?`,
      category: catMap['design-systems'],
      tags: ['spacing', 'ui-design', 'dashboard', 'typography'],
      author: regularUser._id,
      upvotes: 650, downvotes: 8, voteScore: 642,
      viewCount: 8200, clickCount: 9100, answerCount: 2,
      trendingScore: 78,
    },
    {
      title: 'Best practices for managing state in large Next.js applications?',
      description: `## Background\n\nOur team is building a large-scale Next.js 14 app. We're debating between Zustand, Redux Toolkit, and Jotai for global state management.\n\n## What we need\n\n- Server state management\n- Client-side global state\n- Persistent state across navigations\n\nWhat are the current best practices for this?`,
      category: catMap['react'],
      tags: ['nextjs', 'state-management', 'zustand', 'react-query'],
      author: admin._id,
      upvotes: 1200, downvotes: 15, voteScore: 1185,
      viewCount: 15100, clickCount: 17200, answerCount: 5,
      trendingScore: 98,
    },
    {
      title: 'How to implement JWT refresh token rotation in Node.js?',
      description: `## Problem\n\nI need to implement secure JWT authentication with refresh token rotation. The access token should expire in 15 minutes and the refresh token in 7 days.\n\n## Requirements\n\n- Automatic token refresh\n- Detect token reuse (security)\n- Handle concurrent requests during refresh`,
      category: catMap['programming'],
      tags: ['jwt', 'nodejs', 'authentication', 'security'],
      author: mod._id,
      upvotes: 534, downvotes: 6, voteScore: 528,
      viewCount: 9800, clickCount: 11200, answerCount: 4,
      trendingScore: 72,
    },
    {
      title: 'What is the difference between Server Components and Client Components in Next.js?',
      description: `## I'm confused about when to use each type.\n\nNext.js 13+ introduced Server Components. I understand the basics but I'm not sure when I should use \`"use client"\` and when I shouldn't.\n\n### Specific questions:\n\n1. Can Server Components fetch data?\n2. Can they use React hooks?\n3. What are the performance implications?`,
      category: catMap['react'],
      tags: ['nextjs', 'server-components', 'react', 'performance'],
      author: regularUser._id,
      upvotes: 890, downvotes: 10, voteScore: 880,
      viewCount: 22000, clickCount: 24500, answerCount: 6,
      trendingScore: 92,
    },
    {
      title: 'How do I set up MongoDB Atlas with Mongoose in an Express.js TypeScript app?',
      description: `## Setup question\n\nI'm building my first full-stack TypeScript app and I want to use MongoDB Atlas as my database.\n\n### What I need help with:\n\n1. Connecting Mongoose to Atlas\n2. Setting up proper TypeScript types for schemas\n3. Best practices for connection management`,
      category: catMap['programming'],
      tags: ['mongodb', 'mongoose', 'typescript', 'express'],
      author: mod._id,
      upvotes: 412, downvotes: 4, voteScore: 408,
      viewCount: 7600, clickCount: 8900, answerCount: 3,
      trendingScore: 60,
    },
    {
      title: 'What are the best resources for learning TypeScript in 2024?',
      description: `I'm a JavaScript developer who wants to learn TypeScript properly. I know the basics but I want to go deeper into:\n\n- Generics\n- Utility types\n- Declaration merging\n- Type inference\n\nWhat books, courses, or resources would you recommend?`,
      category: catMap['education'],
      tags: ['typescript', 'learning', 'resources'],
      author: regularUser._id,
      upvotes: 276, downvotes: 3, voteScore: 273,
      viewCount: 4500, clickCount: 5200, answerCount: 7,
      trendingScore: 48,
    },
    {
      title: 'How to implement glassmorphism effects correctly in CSS?',
      description: `## Design question\n\nI want to implement a glassmorphism navigation bar like modern apps. My current implementation looks blurry but not glassy.\n\n### What I have:\n\n\`\`\`css\n.nav {\n  background: rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(10px);\n}\n\`\`\`\n\nWhat am I missing?`,
      category: catMap['design-systems'],
      tags: ['css', 'glassmorphism', 'backdrop-filter', 'ui'],
      author: admin._id,
      upvotes: 335, downvotes: 5, voteScore: 330,
      viewCount: 6200, clickCount: 7100, answerCount: 2,
      trendingScore: 55,
    },
  ];

  await Question.insertMany(sampleQuestions);

  // Update category question counts
  for (const q of sampleQuestions) {
    await Category.findByIdAndUpdate(q.category, { $inc: { questionCount: 1 } });
  }

  // Update user question counts
  await User.findByIdAndUpdate(admin._id, { questionCount: 2 });
  await User.findByIdAndUpdate(mod._id, { questionCount: 2 });
  await User.findByIdAndUpdate(regularUser._id, { questionCount: 4 });

  console.log(`❓ Created ${sampleQuestions.length} sample questions`);
  console.log('\n✅ Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Admin credentials:');
  console.log('  Email:    admin@samagama.dev');
  console.log('  Password: admin123');
  console.log('  Role:     admin');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
