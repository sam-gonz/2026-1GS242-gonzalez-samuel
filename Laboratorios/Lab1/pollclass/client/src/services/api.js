const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const api = {
  createPoll: (data) => request('/polls', { method: 'POST', body: JSON.stringify(data) }),
  getPolls: () => request('/polls'),
  getPoll: (id) => request(`/polls/${id}`),
  getPollByCode: (code) => request(`/polls/code/${code}`),
  closePoll: (id) => request(`/polls/${id}/close`, { method: 'PATCH' }),
  deletePoll: (id) => request(`/polls/${id}`, { method: 'DELETE' }),
  vote: (pollId, data) => request(`/polls/${pollId}/vote`, { method: 'POST', body: JSON.stringify(data) }),
  getResults: (pollId) => request(`/polls/${pollId}/results`),
};
