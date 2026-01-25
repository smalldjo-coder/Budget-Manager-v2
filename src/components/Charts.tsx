import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useBudgetStore } from '../store/budgetStore';
import { formatCurrency } from '../utils/format';

const COLORS = {
  revenus: '#22c55e',
  besoins: '#3b82f6',
  dettes: '#f59e0b',
  epargne: '#06b6d4',
  envies: '#a855f7',
};

export function BudgetPieChart() {
  const { calculateBudget } = useBudgetStore();
  const budget = calculateBudget();

  const data = [
    { name: 'Besoins', value: budget.totalBesoins, color: COLORS.besoins },
    { name: 'Dettes', value: budget.totalDettes, color: COLORS.dettes },
    { name: 'Épargne', value: budget.totalEpargne, color: COLORS.epargne },
    { name: 'Envies', value: budget.totalEnvies, color: COLORS.envies },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-dark-400">
        Aucune donnée à afficher
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyBarChart() {
  const { monthlyHistory } = useBudgetStore();

  const data = monthlyHistory.slice(-6).map((m) => ({
    name: m.month.slice(0, 3),
    Revenus: m.revenus.activite + m.revenus.sociaux + m.revenus.interets,
    Dépenses: m.besoins.fixes + m.besoins.variables + m.dettes.creditImmo + m.dettes.creditAuto + m.dettes.autres,
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-dark-400">
        Aucun historique disponible
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="Revenus" fill={COLORS.revenus} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Dépenses" fill={COLORS.dettes} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SavingsLineChart() {
  const { monthlyHistory } = useBudgetStore();

  const data = monthlyHistory.map((m) => ({
    name: m.month.slice(0, 3),
    Épargne: m.epargne.livretLEP + m.epargne.placementPEA + m.epargne.investPersonnel,
    'Solde': (m.revenus.activite + m.revenus.sociaux + m.revenus.interets) -
      (m.besoins.fixes + m.besoins.variables + m.dettes.creditImmo + m.dettes.creditAuto + m.dettes.autres +
       m.epargne.livretLEP + m.epargne.placementPEA + m.epargne.investPersonnel +
       m.envies.fourmilles + m.envies.occasionnel),
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-dark-400">
        Aucun historique disponible
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="name" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="Épargne"
          stroke={COLORS.epargne}
          strokeWidth={2}
          dot={{ fill: COLORS.epargne }}
        />
        <Line
          type="monotone"
          dataKey="Solde"
          stroke={COLORS.revenus}
          strokeWidth={2}
          dot={{ fill: COLORS.revenus }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
