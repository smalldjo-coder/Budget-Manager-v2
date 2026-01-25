import { Header } from './components/Header';
import { CSVImport } from './components/CSVImport';
import { BudgetCard } from './components/BudgetCard';
import { CascadeView } from './components/CascadeView';
import { LeverSlider } from './components/LeverSlider';
import { Gauge } from './components/Gauge';
import { BudgetPieChart, MonthlyBarChart, SavingsLineChart } from './components/Charts';
import { HealthCalendar } from './components/HealthCalendar';
import { ObjectivesCard } from './components/ObjectivesCard';
import { useBudgetStore } from './store/budgetStore';
import {
  TrendingUp,
  Home,
  CreditCard,
  PiggyBank,
  Heart,
  BarChart3,
  PieChartIcon,
  LineChart,
} from 'lucide-react';

function App() {
  const { revenus, besoins, dettes, epargne, envies, calculateBudget } = useBudgetStore();
  const budget = calculateBudget();

  return (
    <div className="min-h-screen bg-dark-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Import Section */}
        <section className="mb-8">
          <CSVImport />
        </section>

        {/* Summary Gauges */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6 bg-dark-800 rounded-xl border border-dark-700">
            <Gauge
              value={budget.ca}
              max={Math.max(budget.ca, 1)}
              label="CA"
              color="#22c55e"
              showPercentage={false}
            />
            <Gauge
              value={budget.totalBesoins}
              max={budget.ca || 1}
              label="Besoins"
              color="#3b82f6"
              warningThreshold={60}
              dangerThreshold={80}
            />
            <Gauge
              value={budget.totalDettes}
              max={revenus.activite || 1}
              label="Dettes"
              color="#f59e0b"
              warningThreshold={8}
              dangerThreshold={10}
            />
            <Gauge
              value={budget.epargnePercentage}
              max={100}
              label="Épargne %"
              color="#06b6d4"
            />
            <Gauge
              value={budget.enviesPercentage}
              max={100}
              label="Envies %"
              color="#a855f7"
            />
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Budget Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenus */}
            <BudgetCard
              title="Revenus"
              icon={<TrendingUp className="w-5 h-5" />}
              total={budget.ca}
              color="#22c55e"
              items={[
                { label: 'Activité', value: revenus.activite },
                { label: 'Sociaux', value: revenus.sociaux },
                { label: 'Intérêts', value: revenus.interets },
                { label: 'Flux internes (hors CA)', value: revenus.fluxInternes },
              ]}
            />

            {/* Budget Envelopes Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Besoins */}
              <BudgetCard
                title="Besoins"
                icon={<Home className="w-5 h-5" />}
                total={budget.totalBesoins}
                color="#3b82f6"
                items={[
                  { label: 'Fixes', value: besoins.fixes },
                  { label: 'Variables', value: besoins.variables },
                ]}
              />

              {/* Dettes */}
              <BudgetCard
                title="Dettes"
                icon={<CreditCard className="w-5 h-5" />}
                total={budget.totalDettes}
                color="#f59e0b"
                alert={budget.alerteDettes}
                alertMessage="Dettes > 10% du revenu d'activité"
                items={[
                  { label: 'Crédit immobilier', value: dettes.creditImmo },
                  { label: 'Crédit auto', value: dettes.creditAuto },
                  { label: 'Autres', value: dettes.autres },
                ]}
              />

              {/* Épargne */}
              <BudgetCard
                title="Épargne"
                icon={<PiggyBank className="w-5 h-5" />}
                total={budget.totalEpargne}
                color="#06b6d4"
                items={[
                  { label: 'Livret LEP', value: epargne.livretLEP },
                  { label: 'Placement PEA', value: epargne.placementPEA },
                  { label: 'Invest personnel', value: epargne.investPersonnel },
                ]}
              />

              {/* Envies */}
              <BudgetCard
                title="Envies"
                icon={<Heart className="w-5 h-5" />}
                total={budget.totalEnvies}
                color="#a855f7"
                items={[
                  { label: 'Fourmilles', value: envies.fourmilles },
                  { label: 'Occasionnel', value: envies.occasionnel },
                ]}
              />
            </div>
          </div>

          {/* Right Column - Cascade & Lever */}
          <div className="space-y-6">
            <CascadeView />
            <LeverSlider />
          </div>
        </div>

        {/* Objectives */}
        <section className="mb-8">
          <ObjectivesCard />
        </section>

        {/* Health Calendar */}
        <section className="mb-8">
          <HealthCalendar />
        </section>

        {/* Charts Section */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary-400" />
              Répartition
            </h3>
            <BudgetPieChart />
          </div>

          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-400" />
              Revenus vs Dépenses
            </h3>
            <MonthlyBarChart />
          </div>

          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <h3 className="text-lg font-semibold text-dark-100 mb-4 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary-400" />
              Évolution
            </h3>
            <SavingsLineChart />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-dark-700 text-center text-dark-500 text-sm">
          <p>Budget Manager 2025 - Méthode des enveloppes</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
