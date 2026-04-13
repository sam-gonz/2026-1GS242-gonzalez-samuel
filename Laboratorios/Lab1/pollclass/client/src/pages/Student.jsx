import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import JoinPoll from '../components/JoinPoll';
import VoteForm from '../components/VoteForm';
import PollResults from '../components/PollResults';

function Student() {
  const [step, setStep] = useState('join');
  const [poll, setPoll] = useState(null);
  const [votes, setVotes] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [voterName, setVoterName] = useState('');
  const [liveIndicator, setLiveIndicator] = useState(false);

  const fetchResults = async () => {
    if (!poll?._id) return;
    try {
      const data = await api.getResults(poll._id);
      setPoll(data.poll);
      setVotes(data.votes);
      setTotalVotes(data.totalVotes);
      setLiveIndicator(true);
      setTimeout(() => setLiveIndicator(false), 1000);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  useEffect(() => {
    if (step === 'results' && poll?.status === 'active') {
      fetchResults();
      const interval = setInterval(fetchResults, 5000);
      return () => clearInterval(interval);
    }
  }, [step, poll?._id, poll?.status]);

  const handleJoin = async (code, name) => {
    try {
      const data = await api.getPollByCode(code);
      if (data.status === 'closed') {
        throw new Error('Esta encuesta ya está cerrada');
      }
      setPoll(data);
      setVoterName(name);
      setStep('vote');
    } catch (error) {
      throw new Error('Código inválido o encuesta no encontrada');
    }
  };

  const handleVote = async (optionIndex) => {
    try {
      await api.vote(poll._id, { optionIndex, voterName });
      await fetchResults();
      setStep('results');
    } catch (error) {
      if (error.message.includes('409')) {
        await fetchResults();
        setStep('results');
      } else if (error.message.includes('closed')) {
        throw new Error('Esta encuesta ha sido cerrada');
      } else {
        throw error;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-dark">Vista del Estudiante</h1>
                <p className="text-sm text-gray-500">Participa en encuestas</p>
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
        {step === 'join' && <JoinPoll onJoin={handleJoin} />}
        
        {step === 'vote' && poll && (
          <VoteForm poll={poll} voterName={voterName} onVote={handleVote} />
        )}

        {step === 'results' && poll && (
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-dark mb-2">{poll.title}</h3>
                  <p className="text-gray-600">
                    {step === 'vote' 
                      ? `¡Hola, ${voterName}! Selecciona tu opción` 
                      : `Gracias por votar, ${voterName}!`
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {liveIndicator && (
                    <span className="text-xs text-green-500 animate-pulse">Actualizando...</span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                    poll.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {poll.status === 'active' && (
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                    {poll.status === 'active' ? 'En vivo' : 'Cerrada'}
                  </span>
                </div>
              </div>
            </div>
            <PollResults poll={poll} votes={votes} totalVotes={totalVotes} />
          </div>
        )}
      </main>
    </div>
  );
}

export default Student;
