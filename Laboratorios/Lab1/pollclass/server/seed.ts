#!/usr/bin/env bun

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pollclass';

const PollSchema = new mongoose.Schema({
  title: String,
  options: [{ text: String, votes: Number }],
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  code: String,
  createdAt: { type: Date, default: Date.now },
  closedAt: Date,
});

const VoteSchema = new mongoose.Schema({
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll' },
  optionIndex: Number,
  voterName: String,
  createdAt: { type: Date, default: Date.now },
});

const Poll = mongoose.model('Poll', PollSchema);
const Vote = mongoose.model('Vote', VoteSchema);

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}

const samplePolls = [
  {
    title: '¿Qué lenguaje de programación prefieres?',
    options: ['JavaScript', 'Python', 'TypeScript', 'Go'],
  },
  {
    title: '¿Cuántas horas al día programas?',
    options: ['Menos de 2 horas', '2-4 horas', '4-6 horas', 'Más de 6 horas'],
  },
  {
    title: '¿Cuál es tu framework frontend favorito?',
    options: ['React', 'Vue', 'Angular', 'Svelte', 'Next.js'],
  },
];

const sampleNames = [
  'María García', 'Juan Pérez', 'Ana López', 'Carlos Rodríguez',
  'Laura Martínez', 'Pedro Sánchez', 'Sofia Fernández', 'Diego Torres',
  'Carmen Ruiz', 'Miguel Díaz', 'Isabel Castro', 'Antonio Romero',
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Poll.deleteMany({});
    await Vote.deleteMany({});
    console.log('Cleared existing data');

    const createdPolls = [];
    
    for (const pollData of samplePolls) {
      const poll = await Poll.create({
        ...pollData,
        code: generateCode(),
      });
      createdPolls.push(poll);
      console.log(`Created poll: ${poll.title} (${poll.code})`);
    }

    for (const poll of createdPolls) {
      const numVotes = Math.floor(Math.random() * 8) + 3;
      
      for (let i = 0; i < numVotes; i++) {
        const randomOption = Math.floor(Math.random() * poll.options.length);
        const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
        
        await Vote.create({
          pollId: poll._id,
          optionIndex: randomOption,
          voterName: randomName,
        });

        await Poll.updateOne(
          { _id: poll._id },
          { $inc: { [`options.${randomOption}.votes`]: 1 } }
        );
      }
      
      const totalVotes = numVotes;
      console.log(`  → Added ${totalVotes} votes`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`   Created ${createdPolls.length} polls with votes`);

    const stats = await Poll.aggregate([
      { $unwind: '$options' },
      { $group: { _id: '$_id', title: { $first: '$title' }, totalVotes: { $sum: '$options.votes' } } }
    ]);

    console.log('\n📊 Poll Stats:');
    stats.forEach(poll => {
      console.log(`   - ${poll.title}: ${poll.totalVotes} votes`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
