import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function PollResults({ poll, votes, totalVotes }) {
  const chartData = poll.options.map((opt, index) => ({
    name: opt.text,
    votes: opt.votes,
    percentage: totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : 0,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-dark">{data.name}</p>
          <p className="text-gray-600">{data.votes} votos ({data.percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-dark">Resultados</h3>
        <span className="text-2xl font-bold text-primary">{totalVotes}</span>
      </div>
      
      {totalVotes > 0 ? (
        <div className="h-72 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" barSize={32}>
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120} 
                tick={{ fontSize: 13 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="votes" radius={[0, 6, 6, 0]} animationDuration={800}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <LabelList 
                  dataKey="votes" 
                  position="right" 
                  style={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-40 flex items-center justify-center text-gray-400 mb-6">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>Sin votos aún</p>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-6">
        {poll.options.map((opt, index) => {
          const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
          return (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-medium text-gray-700">{opt.text}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
                <span className="text-gray-600 text-sm w-20 text-right">
                  {opt.votes} ({percentage.toFixed(0)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-dark">Detalle de Votos</h4>
          <span className="text-sm text-gray-500">{votes.length} registros</span>
        </div>
        {votes.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No hay votos registrados</p>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">Estudiante</th>
                  <th className="pb-2 font-medium">Opción</th>
                  <th className="pb-2 font-medium text-right">Hora</th>
                </tr>
              </thead>
              <tbody>
                {votes.map((vote, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 font-medium">{vote.voterName}</td>
                    <td className="py-2 text-gray-600">{poll.options[vote.optionIndex]?.text}</td>
                    <td className="py-2 text-gray-400 text-right">
                      {new Date(vote.createdAt).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PollResults;
