#!/usr/bin/env bun

const BASE_URL = 'http://localhost:3001/api';

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
  };
  console.log(`${colors[type]}${message}\x1b[0m`);
}

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();
  
  return { status: response.status, data };
}

async function runTests() {
  log('\n🧪 PollClass API Tests\n', 'info');
  log('═══════════════════════════════════════\n', 'info');
  
  let pollId;
  let pollCode;
  
  try {
    log('1. Health Check', 'info');
    const health = await request('GET', '/health');
    console.log('   Status:', health.status);
    console.log('   Data:', JSON.stringify(health.data));
    log('   ✓ Health check passed\n', 'success');
    
    log('2. Create Poll', 'info');
    const create = await request('POST', '/polls', {
      title: '¿Qué framework prefieres?',
      options: ['React', 'Vue', 'Angular', 'Svelte']
    });
    console.log('   Status:', create.status);
    console.log('   Data:', JSON.stringify(create.data));
    
    if (create.status === 201) {
      pollId = create.data._id;
      pollCode = create.data.code;
      log('   ✓ Poll created\n', 'success');
    } else {
      throw new Error('Failed to create poll');
    }
    
    log('3. Get All Polls', 'info');
    const getAll = await request('GET', '/polls');
    console.log('   Status:', getAll.status);
    console.log('   Polls count:', getAll.data.length);
    log('   ✓ Got all polls\n', 'success');
    
    log('4. Get Poll by ID', 'info');
    const getById = await request('GET', `/polls/${pollId}`);
    console.log('   Status:', getById.status);
    console.log('   Poll title:', getById.data.title);
    log('   ✓ Got poll by ID\n', 'success');
    
    log('5. Get Poll by Code', 'info');
    const getByCode = await request('GET', `/polls/code/${pollCode}`);
    console.log('   Status:', getByCode.status);
    console.log('   Poll code:', getByCode.data.code);
    log('   ✓ Got poll by code\n', 'success');
    
    log('6. Vote for option 0 (React)', 'info');
    const vote1 = await request('POST', `/polls/${pollId}/vote`, {
      optionIndex: 0,
      voterName: 'Juan Pérez'
    });
    console.log('   Status:', vote1.status);
    log('   ✓ Vote recorded\n', 'success');
    
    log('7. Try to vote again (should fail)', 'info');
    const voteAgain = await request('POST', `/polls/${pollId}/vote`, {
      optionIndex: 1,
      voterName: 'Juan Pérez'
    });
    console.log('   Status:', voteAgain.status, '(expected 409)');
    console.log('   Error:', voteAgain.data.error);
    log('   ✓ Duplicate vote blocked\n', 'success');
    
    log('8. Vote for option 1 (Vue)', 'info');
    const vote2 = await request('POST', `/polls/${pollId}/vote`, {
      optionIndex: 1,
      voterName: 'María García'
    });
    console.log('   Status:', vote2.status);
    log('   ✓ Vote recorded\n', 'success');
    
    log('9. Get Poll Results', 'info');
    const results = await request('GET', `/polls/${pollId}/results`);
    console.log('   Status:', results.status);
    console.log('   Total votes:', results.data.totalVotes);
    console.log('   Options:', results.data.poll.options.map(o => `${o.text}: ${o.votes}`).join(', '));
    log('   ✓ Got results\n', 'success');
    
    log('10. Close Poll', 'info');
    const close = await request('PATCH', `/polls/${pollId}/close`);
    console.log('   Status:', close.status);
    console.log('   New status:', close.data.status);
    log('   ✓ Poll closed\n', 'success');
    
    log('11. Try to vote on closed poll (should fail)', 'info');
    const voteClosed = await request('POST', `/polls/${pollId}/vote`, {
      optionIndex: 0,
      voterName: 'Carlos López'
    });
    console.log('   Status:', voteClosed.status, '(expected 400)');
    console.log('   Error:', voteClosed.data.error);
    log('   ✓ Vote on closed poll blocked\n', 'success');
    
    log('12. Delete Poll', 'info');
    const del = await request('DELETE', `/polls/${pollId}`);
    console.log('   Status:', del.status);
    log('   ✓ Poll deleted\n', 'success');
    
    log('═══════════════════════════════════════', 'success');
    log('✅ All tests passed!\n', 'success');
    
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}\n`, 'error');
    process.exit(1);
  }
}

runTests();
