import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import PollForm from '../components/PollForm';
import PollCard from '../components/PollCard';

function Professor() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchPolls = async () => {
    try {
      const data = await api.getPolls();
      setPolls(data);
    } catch (error) {
      console.error('Error fetching polls:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const filteredPolls = polls.filter(poll => {
    if (filter === 'all') return true;
    return poll.status === filter;
  });

  const handlePollClosed = async (id) => {
    try {
      await api.closePoll(id);
      fetchPolls();
    } catch (error) {
      console.error('Error closing poll:', error);
    }
  };

  const handlePollDeleted = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta encuesta?')) {
      try {
        await api.deletePoll(id);
        fetchPolls();
      } catch (error) {
        console.error('Error deleting poll:', error);
      }
    }
  };

  const activeCount = polls.filter(p => p.status === 'active').length;
  const closedCount = polls.filter(p => p.status === 'closed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-dark">Panel del Profesor</h1>
                <p className="text-sm text-gray-500">Gestiona tus encuestas</p>
              </div>
            </div>
            <Link 
              to="/" 
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <PollForm onPollCreated={fetchPolls} />

        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-dark">Mis Encuestas</h2>
            
            <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
              {[
                { key: 'all', label: 'Todas', count: polls.length },
                { key: 'active', label: 'Activas', count: activeCount },
                { key: 'closed', label: 'Cerradas', count: closedCount },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          ) : filteredPolls.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'No hay encuestas todavía' 
                  : filter === 'active'
                    ? 'No hay encuestas activas'
                    : 'No hay encuestas cerradas'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPolls.map((poll) => (
                <PollCard
                  key={poll._id}
                  poll={poll}
                  onViewResults={() => {}}
                  onClose={() => handlePollClosed(poll._id)}
                  onDelete={() => handlePollDeleted(poll._id)}
                  showResults
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Professor;
