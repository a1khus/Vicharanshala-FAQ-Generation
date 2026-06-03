import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { connectDB } from '../config/db';
import { Category } from '../models/Category';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { User } from '../models/User';

const FAQ_FILE_PATH = path.join(__dirname, '../../../FAQ.txt');

async function seed() {
  console.log('Connecting to MongoDB...');
  await connectDB();

  console.log('Reading FAQ.txt...');
  const fileContent = fs.readFileSync(FAQ_FILE_PATH, 'utf-8');
  const lines = fileContent.split('\n');

  console.log('Clearing existing categories, questions, and answers...');
  await Category.deleteMany({});
  await Question.deleteMany({});
  await Answer.deleteMany({});

  // Ensure admin user exists to author the seed data
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = await User.create({
      username: 'admin',
      email: 'admin@samagama.dev',
      password: 'admin',
      role: 'admin',
      isVerified: true
    });
  }

  const categoriesMap = new Map<string, mongoose.Types.ObjectId>();

  console.log('Parsing Categories...');
  for (const line of lines) {
    const categoryMatch = line.match(/^(\d+)\.\s+([A-Z].*)/);
    if (categoryMatch) {
      const catNumber = categoryMatch[1];
      const catName = categoryMatch[2].trim();
      
      // Filter out numbered lists that are not top-level categories
      // Top level categories are 1 to 14 in this file.
      if (parseInt(catNumber) >= 1 && parseInt(catNumber) <= 14) {
        if (!categoriesMap.has(catNumber)) {
          const category = await Category.create({
            name: catName,
            slug: catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            description: `FAQs for ${catName}`,
            author: admin._id
          });
          categoriesMap.set(catNumber, category._id as mongoose.Types.ObjectId);
          console.log(`Created Category: ${catNumber}. ${catName}`);
        }
      }
    }
  }

  console.log('Parsing Questions and Answers...');
  
  let startedBody = false;
  let currentQuestion: any = null;
  let currentAnswerLines: string[] = [];
  
  const parsedFAQs = new Map<string, { categoryId: mongoose.Types.ObjectId, questionText: string, answerText: string }>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect when TOC ends and body begins
    if (line.includes('Vicharanashala Internship — FAQ')) {
      startedBody = true;
      continue;
    }

    if (!startedBody) continue;

    // Detect new question: e.g. "1.1 What is..."
    const questionMatch = line.match(/^(\d+)\.(\d+)\s+(.*)/);
    if (questionMatch) {
      // Save previous question
      if (currentQuestion) {
        parsedFAQs.set(`${currentQuestion.cat}.${currentQuestion.sub}`, {
          categoryId: currentQuestion.catId,
          questionText: currentQuestion.text,
          answerText: currentAnswerLines.join('\n').trim()
        });
      }

      const catNumber = questionMatch[1];
      const subNumber = questionMatch[2];
      const qText = questionMatch[3].trim();
      
      const catId = categoriesMap.get(catNumber);
      if (!catId) {
        console.warn(`Category ${catNumber} not found for question ${catNumber}.${subNumber}`);
      }

      currentQuestion = {
        cat: catNumber,
        sub: subNumber,
        text: qText,
        catId: catId
      };
      currentAnswerLines = [];
      continue;
    }

    // Ignore garbage lines in answers
    if (
      line.includes('samagama.in/internship/faq') ||
      line.includes('FAQ — Vicharanashala Internship') ||
      line.includes('▸ ▸') ||
      line.match(/^\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}\s[AM|PM]/) // e.g. 6/3/26, 3:22 PM
    ) {
      continue;
    }

    if (currentQuestion) {
      // Avoid excessive blank lines
      if (line === '' && currentAnswerLines.length === 0) continue;
      currentAnswerLines.push(line);
    }
  }

  // Save the last question
  if (currentQuestion) {
    parsedFAQs.set(`${currentQuestion.cat}.${currentQuestion.sub}`, {
      categoryId: currentQuestion.catId,
      questionText: currentQuestion.text,
      answerText: currentAnswerLines.join('\n').trim()
    });
  }

  console.log(`Parsed ${parsedFAQs.size} questions from the body. Inserting into DB...`);

  let count = 0;
  for (const [qNum, faq] of parsedFAQs.entries()) {
    if (!faq.categoryId) continue;

    const question = await Question.create({
      title: faq.questionText.substring(0, 300),
      description: `This is a frequently asked question regarding the Vicharanashala Internship program. Please refer to the accepted answer below for the complete details.`,
      category: faq.categoryId,
      author: admin._id,
      status: 'open',
      tags: ['faq', 'internship'],
      viewCount: 0,
      answerCount: 1,
      trendingScore: 0,
      voteScore: 0,
      upvotes: 0,
      downvotes: 0
    });

    const answer = await Answer.create({
      content: faq.answerText,
      questionId: question._id,
      author: admin._id,
      isAccepted: true,
      votes: 0
    });

    await Category.findByIdAndUpdate(faq.categoryId, { $inc: { questionCount: 1 } });

    count++;
  }

  console.log(`✅ Successfully seeded ${count} questions and answers!`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding FAQ:', err);
  process.exit(1);
});
