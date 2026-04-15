import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { computePartageByCat, computePartageTimeline } from '../../utils/partageCalculations';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg border border-border-default">
      <div className="font-semibold text-text-heading">{d.name || d.description}</div>
      {d.value !== undefined && (
        <div className="text-text-secondary mt-0.5 tabular-nums">{d.value.toFixed(2)} €</div>
      )}
      {d.solde !== undefined && (
        <div className={`mt-0.5 tabular-nums font-medium ${d.solde >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
          Solde: {d.solde >= 0 ? '+' : ''}{d.solde.toFixed(2)} €
        </div>
      )}
    </div>
  );
};

export const PartageChart = ({ expenses }) => {
  const catData = useMemo(() => computePartageByCat(expenses), [expenses]);
  const timelineData = useMemo(() => computePartageTimeline(expenses), [expenses]);

  if (expenses.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slideUp stagger-4">
      {/* Donut par catégorie */}
      <div className="card p-4">
        <h4 className="text-xs font-semibold text-text-heading mb-3 uppercase tracking-wider">
          Par catégorie
        </h4>
        {catData.length > 0 ? (
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={catData}
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {catData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {catData.map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-[11px] text-text-secondary flex-1 truncate">{cat.icon} {cat.name}</span>
                  <span className="text-[11px] font-semibold text-text-primary tabular-nums">{cat.value.toFixed(0)}€</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-text-muted text-xs">Aucune donnée</div>
        )}
      </div>

      {/* Timeline du solde */}
      <div className="card p-4">
        <h4 className="text-xs font-semibold text-text-heading mb-3 uppercase tracking-wider">
          Évolution du solde
        </h4>
        {timelineData.length > 1 ? (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="soldeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="idx" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <ReferenceLine y={0} stroke="var(--text-muted)" strokeDasharray="3 3" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="solde"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#soldeGradient)"
                  dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-6 text-text-muted text-xs">
            {timelineData.length === 1
              ? 'Ajoutez une 2e dépense pour voir l\'évolution'
              : 'Aucune donnée'}
          </div>
        )}
      </div>
    </div>
  );
};
