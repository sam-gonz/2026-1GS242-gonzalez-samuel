import { useState } from 'react';

function VoteForm({ poll, voterName, onVote }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedOption === null) {
      setError('Selecciona una opción para votar');
      return;
    }

    setLoading(true);
    try {
      await onVote(selectedOption);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-dark mb-1">{poll.title}</h3>
        <p className="text-gray-500">¡Hola, <span className="font-semibold text-primary">{voterName}</span>!</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-3 mb-6">
          {poll.options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedOption(index)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                selectedOption === index
                  ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedOption === index
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {selectedOption === index && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </div>
                <span className={`font-medium ${
                  selectedOption === index ? 'text-primary' : 'text-gray-700'
                }`}>
                  {option.text}
                </span>
              </div>
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || selectedOption === null}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Enviando voto...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirmar Voto
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default VoteForm;
