import { Hono } from 'hono';
import Poll from '../models/Poll';
import Vote from '../models/Vote';

const polls = new Hono();

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}

async function generateUniqueCode(): Promise<string> {
  let code: string;
  let exists = true;
  
  while (exists) {
    code = generateCode();
    const existing = await Poll.findOne({ code });
    if (!existing) {
      exists = false;
    }
  }
  
  return code!;
}

polls.post('/', async (c) => {
  const body = await c.req.json();
  const { title, options } = body;

  if (!title?.trim()) {
    return c.json({ error: 'Title is required' }, 400);
  }

  if (!options || !Array.isArray(options) || options.length < 2) {
    return c.json({ error: 'At least 2 options are required' }, 400);
  }

  const validOptions = options
    .map((opt: string) => opt?.trim())
    .filter((opt: string) => opt.length > 0);

  if (validOptions.length < 2) {
    return c.json({ error: 'At least 2 non-empty options are required' }, 400);
  }

  const code = await generateUniqueCode();

  const poll = await Poll.create({
    title: title.trim(),
    options: validOptions.map((text: string) => ({ text, votes: 0 })),
    status: 'active',
    code,
  });

  return c.json(poll, 201);
});

polls.get('/', async (c) => {
  const status = c.req.query('status');
  const filter = status ? { status } : {};
  
  const pollsList = await Poll.find(filter).sort({ createdAt: -1 });
  return c.json(pollsList);
});

polls.get('/:id', async (c) => {
  const { id } = c.req.param();

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return c.json({ error: 'Invalid poll ID format' }, 400);
  }

  const poll = await Poll.findById(id);

  if (!poll) {
    return c.json({ error: 'Poll not found' }, 404);
  }

  return c.json(poll);
});

polls.get('/code/:code', async (c) => {
  const { code } = c.req.param();
  const normalizedCode = code.toUpperCase();

  const poll = await Poll.findOne({ code: normalizedCode });

  if (!poll) {
    return c.json({ error: 'Poll not found' }, 404);
  }

  return c.json(poll);
});

polls.patch('/:id/close', async (c) => {
  const { id } = c.req.param();

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return c.json({ error: 'Invalid poll ID format' }, 400);
  }

  const poll = await Poll.findByIdAndUpdate(
    id,
    { status: 'closed', closedAt: new Date() },
    { new: true }
  );

  if (!poll) {
    return c.json({ error: 'Poll not found' }, 404);
  }

  return c.json(poll);
});

polls.delete('/:id', async (c) => {
  const { id } = c.req.param();

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return c.json({ error: 'Invalid poll ID format' }, 400);
  }

  const poll = await Poll.findByIdAndDelete(id);

  if (!poll) {
    return c.json({ error: 'Poll not found' }, 404);
  }

  await Vote.deleteMany({ pollId: id });

  return c.json({ message: 'Poll deleted successfully' });
});

export default polls;
