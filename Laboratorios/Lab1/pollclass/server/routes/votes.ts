import { Hono } from 'hono';
import Poll from '../models/Poll';
import Vote from '../models/Vote';

const votes = new Hono();

votes.post('/:id/vote', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const { optionIndex, voterName } = body;

  if (optionIndex === undefined || optionIndex === null) {
    return c.json({ error: 'optionIndex is required' }, 400);
  }

  if (!voterName?.trim()) {
    return c.json({ error: 'voterName is required' }, 400);
  }

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return c.json({ error: 'Invalid poll ID format' }, 400);
  }

  const poll = await Poll.findById(id);

  if (!poll) {
    return c.json({ error: 'Poll not found' }, 404);
  }

  if (poll.status === 'closed') {
    return c.json({ error: 'This poll is closed' }, 400);
  }

  const index = Number(optionIndex);
  if (isNaN(index) || index < 0 || index >= poll.options.length) {
    return c.json({ error: 'Invalid option index' }, 400);
  }

  const existingVote = await Vote.findOne({
    pollId: id,
    voterName: voterName.trim(),
  });

  if (existingVote) {
    return c.json({ error: 'You have already voted in this poll' }, 409);
  }

  const vote = await Vote.create({
    pollId: id,
    optionIndex: index,
    voterName: voterName.trim(),
  });

  await Poll.updateOne(
    { _id: id },
    { $inc: { [`options.${index}.votes`]: 1 } }
  );

  return c.json({
    message: 'Vote recorded successfully',
    vote,
  }, 201);
});

votes.get('/:id/results', async (c) => {
  const { id } = c.req.param();

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return c.json({ error: 'Invalid poll ID format' }, 400);
  }

  const poll = await Poll.findById(id);

  if (!poll) {
    return c.json({ error: 'Poll not found' }, 404);
  }

  const votesList = await Vote.find({ pollId: id })
    .sort({ createdAt: -1 })
    .select('voterName optionIndex createdAt');

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return c.json({
    poll,
    votes: votesList,
    totalVotes,
  });
});

export default votes;
