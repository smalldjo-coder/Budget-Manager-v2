import { useState, useMemo, useRef, useCallback } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const MONTHS_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function initializeMonthsData() {
  return Array(12).fill(null).map(() => ({
    revenus: { activite: 0, sociaux: 0, interets: 0, fluxInternes: 0 },
    sorties: {
      besoins: { fixes: 0, variables: 0 },
      dettes: { creditImmo: 0, creditAuto: 0, autres: 0 },
      epargne: { livret: 0, placement: 0, investPerso: 0 },
      envies: { fourmilles: 0, occasionnel: 0 }
    },
    patrimoine: { lep: 0, pea: 0 },
    levier: 0.5
  }));
}

const InputRow = ({ label, value, onChange, className = "" }) => (
  <div className={"flex justify-between items-center " + className}>
    <label className="text-xs">{label}</label>
    <input
      type="number"
      defaultValue={value || ""}
      onBlur={e => onChange(e.target.value)}
      onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
      className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-right text-white text-xs focus:outline-none focus:border-blue-500"
      placeholder="0"
    />
  </div>
);

const ResultRow = ({ label, value, pct, alert, alertMessage, target, highlight, formatMoney, formatPct }) => (
  <div className={"mt-1 pt-1 border-t border-gray-700 " + (highlight ? "bg-gray-700 -mx-3 px-3 py-1" : "")}>
    <div className="flex justify-between items-center text-xs">
      <span className={highlight ? "font-semibold" : ""}>{label}</span>
      <div className="text-right">
        <span className={"font-semibold " + (value < 0 ? "text-red-400" : "")}>{formatMoney(value)}</span>
        {pct !== undefined && (
          <span className={"ml-1 " + (alert ? "text-red-400" : "text-gray-400")}>
            ({formatPct(pct)})
            {alert && <span className="ml-1">{alertMessage}</span>}
            {target && !alert && <span className="ml-1 text-gray-500">cible: {target}</span>}
          </span>
        )}
      </div>
    </div>
  </div>
);

const Gauge = ({ label, value, thresholdLow, thresholdHigh, icon }) => {
  const pct = Math.min(Math.max(value, 0), 100);
  const isOk = (thresholdLow === undefined || value >= thresholdLow) && (thresholdHigh === undefined || value <= thresholdHigh);
  const color = isOk ? "#10B981" : "#EF4444";
  const circ = 2 * Math.PI * 36;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90">
          <circle cx="40" cy="40" r="36" stroke="#374151" strokeWidth="6" fill="none" />
          <circle cx="40" cy="40" r="36" stroke={color} strokeWidth="6" fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{value.toFixed(1)}%</span>
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-400">{icon} {label}</div>
      <div className="text-xs text-gray-500">
        {thresholdLow !== undefined && thresholdHigh !== undefined ? thresholdLow + "-" + thresholdHigh + "%" : thresholdHigh !== undefined ? "≤" + thresholdHigh + "%" : "≥" + thresholdLow + "%"}
      </div>
      <div className={"text-xs font-semibold " + (isOk ? "text-green-500" : "text-red-500")}>{isOk ? "✓ OK" : "⚠ Alerte"}</div>
    </div>
  );
};

const ProgressBar = ({ label, current, target, icon, formatMoney }) => {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-300">{icon} {label}</span>
        <span className="text-gray-400">{formatMoney(current)} / {formatMoney(target)}</span>
      </div>
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
        <div className={"h-full rounded-full " + (current >= target ? "bg-green-500" : "bg-blue-500")} style={{ width: pct + "%" }} />
      </div>
      <div className="text-right text-xs mt-1">
        <span className={current >= target ? "text-green-400" : "text-blue-400"}>{pct.toFixed(1)}%</span>
      </div>
    </div>
  );
};

/**
 * Parse CSV content handling multiline fields (quoted strings with newlines)
 * Returns array of rows, each row is an array of field values
 */
function parseCSVContent(csvContent) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++;
        } else {
          // End of quoted field
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ';') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentField.trim());
        if (currentRow.length > 0 && currentRow.some(f => f !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        if (char === '\r') i++; // Skip \n after \r
      } else if (char !== '\r') {
        currentField += char;
      }
    }
  }

  // Handle last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(f => f !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export default function BudgetApp() {
  const [currentMonth, setCurrentMonth] = useState(0);
  const [view, setView] = useState("saisie");
  const [monthsData, setMonthsData] = useState(initializeMonthsData);
  const [notification, setNotification] = useState(null);
  const [importStats, setImportStats] = useState(null);
  const fileInputRef = useRef(null);
  const iComptaInputRef = useRef(null);

  const objectifs = { lep: 7812, pea: 10000 };

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const formatMoney = useCallback((v) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v), []);
  const formatPct = useCallback((v) => new Intl.NumberFormat("fr-FR", { style: "percent", minimumFractionDigits: 1 }).format(v), []);

  const exportToCSV = useCallback(() => {
    const headers = ["Mois", "Revenus_Activite", "Revenus_Sociaux", "Revenus_Interets", "Flux_Internes", "Besoins_Fixes", "Besoins_Variables", "Dettes_CreditImmo", "Dettes_CreditAuto", "Dettes_Autres", "Epargne_Livret", "Epargne_Placement", "Epargne_InvestPerso", "Envies_Fourmilles", "Envies_Occasionnel", "Patrimoine_LEP", "Patrimoine_PEA", "Levier"];
    const rows = monthsData.map((d, idx) => [MONTHS[idx], d.revenus.activite, d.revenus.sociaux, d.revenus.interets, d.revenus.fluxInternes, d.sorties.besoins.fixes, d.sorties.besoins.variables, d.sorties.dettes.creditImmo, d.sorties.dettes.creditAuto, d.sorties.dettes.autres, d.sorties.epargne.livret, d.sorties.epargne.placement, d.sorties.epargne.investPerso, d.sorties.envies.fourmilles, d.sorties.envies.occasionnel, d.patrimoine.lep, d.patrimoine.pea, d.levier]);
    const csvContent = [headers.join(";"), ...rows.map(row => row.join(";"))].join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "budget_2025_" + new Date().toISOString().split("T")[0] + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Export CSV réussi !");
  }, [monthsData, showNotification]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const lines = e.target.result.split("\n").filter(line => line.trim());
        if (lines.length < 2) { showNotification("Fichier CSV vide", "error"); return; }
        const headers = lines[0].split(";").map(h => h.trim());
        if (!headers.includes("Mois") || !headers.includes("Revenus_Activite")) { showNotification("Format CSV invalide", "error"); return; }
        const newMonthsData = initializeMonthsData();
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(";").map(v => v.trim());
          const monthIndex = MONTHS.findIndex(m => m.toLowerCase() === values[0].toLowerCase());
          if (monthIndex === -1) continue;
          const getValue = (h) => { const idx = headers.indexOf(h); return idx !== -1 ? parseFloat(values[idx]) || 0 : 0; };
          newMonthsData[monthIndex] = {
            revenus: { activite: getValue("Revenus_Activite"), sociaux: getValue("Revenus_Sociaux"), interets: getValue("Revenus_Interets"), fluxInternes: getValue("Flux_Internes") },
            sorties: {
              besoins: { fixes: getValue("Besoins_Fixes"), variables: getValue("Besoins_Variables") },
              dettes: { creditImmo: getValue("Dettes_CreditImmo"), creditAuto: getValue("Dettes_CreditAuto"), autres: getValue("Dettes_Autres") },
              epargne: { livret: getValue("Epargne_Livret"), placement: getValue("Epargne_Placement"), investPerso: getValue("Epargne_InvestPerso") },
              envies: { fourmilles: getValue("Envies_Fourmilles"), occasionnel: getValue("Envies_Occasionnel") }
            },
            patrimoine: { lep: getValue("Patrimoine_LEP"), pea: getValue("Patrimoine_PEA") },
            levier: getValue("Levier") || 0.5
          };
        }
        setMonthsData(newMonthsData);
        showNotification("Import CSV réussi !");
      } catch (error) { showNotification("Erreur: " + error.message, "error"); }
    };
    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  }, [showNotification]);

  const mapIComptaCategory = useCallback((compte) => {
    if (!compte) return null;
    const c = compte.toUpperCase();

    // ENTRÉES (revenus)
    if (c.includes("ENTRÉES") || c.includes("ENTREES") || c.includes("ENTRÉE") || c.includes("ENTREE")) {
      if (c.includes("ACTIVITÉ") || c.includes("ACTIVITE")) {
        return { section: "revenus", category: "activite" };
      }
      if (c.includes("SOCIALES") || c.includes("SOCIAL")) {
        return { section: "revenus", category: "sociaux" };
      }
      if (c.includes("INTÉRÊT") || c.includes("INTERET") || c.includes("REMBOURSEMENT") || c.includes("PRIMES")) {
        return { section: "revenus", category: "interets" };
      }
      // Par défaut pour ENTRÉES sans sous-catégorie identifiée
      return { section: "revenus", category: "activite" };
    }

    // Flux internes ignorés
    if (c.includes("FLUX") && c.includes("INTERNE")) return null;

    // SORTIES
    if (c.includes("SORTIES") || c.includes("SORTIE")) {
      // BESOINS (fixes ou variables)
      if (c.includes("BESOIN")) {
        if (c.includes("FIXES") || c.includes("FIXE")) {
          return { section: "sorties", category: "besoins", subcategory: "fixes" };
        }
        if (c.includes("VARIABLES") || c.includes("VARIABLE")) {
          return { section: "sorties", category: "besoins", subcategory: "variables" };
        }
        // Par défaut variables si non précisé
        return { section: "sorties", category: "besoins", subcategory: "variables" };
      }

      // DETTES
      if (c.includes("DETTE")) {
        return { section: "sorties", category: "dettes", subcategory: "autres" };
      }

      // ÉPARGNE
      if (c.includes("EPARGNE") || c.includes("ÉPARGNE")) {
        if (c.includes("LIVRET") || c.includes("LEP")) {
          return { section: "sorties", category: "epargne", subcategory: "livret" };
        }
        if (c.includes("PLACEMENT") || c.includes("PEA")) {
          return { section: "sorties", category: "epargne", subcategory: "placement" };
        }
        // Par défaut livret
        return { section: "sorties", category: "epargne", subcategory: "livret" };
      }

      // ENVIES
      if (c.includes("ENVIE")) {
        return { section: "sorties", category: "envies", subcategory: "occasionnel" };
      }
    }
    return null;
  }, []);

  const handleiComptaImport = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;

        // Parse CSV with multiline support
        const rows = parseCSVContent(text);

        if (rows.length < 2) {
          showNotification("Fichier iCompta vide", "error");
          return;
        }

        // Headers are in first row
        // Format: Compte;ID;Statut;Date;Date de valeur;Nom;Commentaire;Montant;Catégorie
        // Index:    0    1    2     3        4         5       6        7        8
        const headers = rows[0];

        // Find column indices by name (flexible)
        const findIndex = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));

        const compteIdx = findIndex("compte");
        const dateValeurIdx = findIndex("date de valeur");
        const montantIdx = findIndex("montant");

        // Fallback to fixed indices if headers not found
        const COMPTE_IDX = compteIdx !== -1 ? compteIdx : 0;
        const DATE_VALEUR_IDX = dateValeurIdx !== -1 ? dateValeurIdx : 4;
        const MONTANT_IDX = montantIdx !== -1 ? montantIdx : 7;

        const newMonthsData = initializeMonthsData();
        let stats = { total: 0, mapped: 0, unmapped: 0, skippedYear: 0 };

        // Process data rows (skip header)
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i];
          if (values.length < 8) continue;

          const compte = values[COMPTE_IDX] || "";
          const dateValeur = values[DATE_VALEUR_IDX] || "";
          const montantStr = values[MONTANT_IDX] || "";

          // Skip if no amount
          if (!montantStr || montantStr.trim() === "") continue;

          // Parse amount (point décimal)
          const montant = parseFloat(montantStr.replace(",", ".")) || 0;
          if (montant === 0) continue;

          // Parse date (format: JJ/MM/AAAA)
          let monthIndex = -1;
          const dateMatch = dateValeur.match(/(\d{2})\/(\d{2})\/(\d{4})/);
          if (dateMatch) {
            const year = parseInt(dateMatch[3]);
            const month = parseInt(dateMatch[2]) - 1;
            // Filter only 2025 and 2026
            if ((year === 2025 || year === 2026) && month >= 0 && month <= 11) {
              monthIndex = month;
            } else {
              stats.skippedYear++;
              continue;
            }
          } else {
            continue;
          }

          stats.total++;
          const mapping = mapIComptaCategory(compte);

          if (mapping) {
            stats.mapped++;
            const { section, category, subcategory } = mapping;
            const absAmount = Math.abs(montant);

            if (section === "revenus") {
              // Pour les revenus, on prend le montant positif
              newMonthsData[monthIndex].revenus[category] += montant > 0 ? montant : absAmount;
            } else if (section === "sorties" && subcategory) {
              // Pour les sorties, on prend toujours la valeur absolue
              newMonthsData[monthIndex].sorties[category][subcategory] += absAmount;
            }
          } else {
            stats.unmapped++;
          }
        }

        setMonthsData(newMonthsData);
        setImportStats(stats);
        const yearInfo = stats.skippedYear > 0 ? ` (${stats.skippedYear} hors 2025-2026)` : "";
        showNotification(`Import: ${stats.mapped}/${stats.total} transactions${yearInfo}`);

      } catch (error) {
        showNotification("Erreur import: " + error.message, "error");
      }
    };

    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  }, [mapIComptaCategory, showNotification]);

  const resetAllData = useCallback(() => {
    if (window.confirm("Réinitialiser toutes les données ?")) {
      setMonthsData(initializeMonthsData());
      setImportStats(null);
      showNotification("Données réinitialisées");
    }
  }, [showNotification]);

  const data = monthsData[currentMonth];

  const updateRevenus = useCallback((cat, val) => {
    setMonthsData(prev => {
      const n = [...prev];
      n[currentMonth] = {
        ...n[currentMonth],
        revenus: { ...n[currentMonth].revenus, [cat]: parseFloat(val) || 0 }
      };
      return n;
    });
  }, [currentMonth]);

  const updateSorties = useCallback((cat, sub, val) => {
    setMonthsData(prev => {
      const n = [...prev];
      n[currentMonth] = {
        ...n[currentMonth],
        sorties: {
          ...n[currentMonth].sorties,
          [cat]: { ...n[currentMonth].sorties[cat], [sub]: parseFloat(val) || 0 }
        }
      };
      return n;
    });
  }, [currentMonth]);

  const updatePatrimoine = useCallback((cat, val) => {
    setMonthsData(prev => {
      const n = [...prev];
      n[currentMonth] = {
        ...n[currentMonth],
        patrimoine: { ...n[currentMonth].patrimoine, [cat]: parseFloat(val) || 0 }
      };
      return n;
    });
  }, [currentMonth]);

  const updateLevier = useCallback((val) => {
    setMonthsData(prev => {
      const n = [...prev];
      n[currentMonth] = { ...n[currentMonth], levier: parseFloat(val) };
      return n;
    });
  }, [currentMonth]);

  const calculs = useMemo(() => {
    const r = data.revenus;
    const s = data.sorties;
    const ca = r.activite + r.sociaux + r.interets;
    const totalBesoins = s.besoins.fixes + s.besoins.variables;
    const soldeApresBesoins = ca - totalBesoins;
    const totalDettes = s.dettes.creditImmo + s.dettes.creditAuto + s.dettes.autres;
    const pctDettes = r.activite > 0 ? totalDettes / r.activite : 0;
    const soldeApresDettes = soldeApresBesoins - totalDettes;
    const totalEpargne = s.epargne.livret + s.epargne.placement + s.epargne.investPerso;
    const pctEpargne = ca > 0 ? totalEpargne / ca : 0;
    const soldeApresEpargne = soldeApresDettes - totalEpargne;
    const totalEnvies = s.envies.fourmilles + s.envies.occasionnel;
    const pctEnvies = ca > 0 ? totalEnvies / ca : 0;
    const soldeFinal = soldeApresEpargne - totalEnvies;
    return {
      ca, totalBesoins, soldeApresBesoins,
      pctBesoins: ca > 0 ? totalBesoins / ca : 0,
      totalDettes, seuilMaxDettes: r.activite * 0.10, pctDettes, alerteDettes: pctDettes > 0.10, soldeApresDettes,
      totalEpargne, pctEpargne, alerteEpargneMin: pctEpargne < 0.05 && pctEpargne > 0, alerteEpargneMax: pctEpargne > 0.20, soldeApresEpargne,
      epargneObjectif: soldeApresDettes > 0 ? soldeApresDettes * data.levier : 0,
      totalEnvies, pctEnvies, alerteEnviesMax: pctEnvies > 0.30,
      enviesObjectif: soldeApresDettes > 0 ? soldeApresDettes * (1 - data.levier) : 0,
      soldeFinal
    };
  }, [data]);

  const allMonthsCalculs = useMemo(() => monthsData.map((m, idx) => {
    const ca = m.revenus.activite + m.revenus.sociaux + m.revenus.interets;
    const besoins = m.sorties.besoins.fixes + m.sorties.besoins.variables;
    const dettes = m.sorties.dettes.creditImmo + m.sorties.dettes.creditAuto + m.sorties.dettes.autres;
    const epargne = m.sorties.epargne.livret + m.sorties.epargne.placement + m.sorties.epargne.investPerso;
    const envies = m.sorties.envies.fourmilles + m.sorties.envies.occasionnel;
    return { mois: MONTHS_SHORT[idx], ca, besoins, dettes, epargne, envies, soldeFinal: ca - besoins - dettes - epargne - envies };
  }), [monthsData]);

  const epargnesCumulees = useMemo(() => {
    let c = 0;
    return allMonthsCalculs.map(m => { c += m.epargne; return { ...m, epargneCumulee: c }; });
  }, [allMonthsCalculs]);

  const donutData = useMemo(() => {
    if (calculs.ca === 0) return [];
    return [
      { name: "Besoins", value: calculs.totalBesoins, color: "#6B7280" },
      { name: "Dettes", value: calculs.totalDettes, color: "#3B82F6" },
      { name: "Épargne", value: calculs.totalEpargne, color: "#F97316" },
      { name: "Envies", value: calculs.totalEnvies, color: "#EF4444" },
      { name: "Solde", value: Math.max(0, calculs.soldeFinal), color: "#10B981" },
    ].filter(d => d.value > 0);
  }, [calculs]);

  const HealthCalendar = useCallback(() => (
    <div className="grid grid-cols-6 gap-1">
      {allMonthsCalculs.map((m, idx) => {
        const health = m.ca === 0 ? "empty" : m.soldeFinal >= 0 ? (m.soldeFinal > m.ca * 0.1 ? "good" : "ok") : "bad";
        const colors = { empty: "bg-gray-700", good: "bg-green-600", ok: "bg-yellow-600", bad: "bg-red-600" };
        return (
          <button key={idx} onClick={() => { setCurrentMonth(idx); setView("saisie"); }}
            className={colors[health] + " rounded p-1 text-xs hover:opacity-80 " + (currentMonth === idx ? "ring-2 ring-white" : "")}>
            {m.mois}
          </button>
        );
      })}
    </div>
  ), [allMonthsCalculs, currentMonth]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2">
      {notification && (
        <div className={"fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 " + (notification.type === "error" ? "bg-red-600" : "bg-green-600")}>
          {notification.message}
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
      <input type="file" ref={iComptaInputRef} onChange={handleiComptaImport} accept=".csv" className="hidden" />

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-blue-400">📊 Budget Manager 2025</h1>
            <p className="text-gray-400 text-xs">Répartition intelligente par enveloppes</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setView("saisie")} className={"px-3 py-1 rounded text-sm " + (view === "saisie" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600")}>✏️ Saisie</button>
            <button onClick={() => setView("dashboard")} className={"px-3 py-1 rounded text-sm " + (view === "dashboard" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600")}>📈 Dashboard</button>
            <div className="w-px bg-gray-600 mx-1" />
            <button onClick={() => iComptaInputRef.current?.click()} className="px-3 py-1 rounded text-sm bg-purple-700 hover:bg-purple-600">📱 iCompta</button>
            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600">📥 CSV</button>
            <button onClick={exportToCSV} className="px-3 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600">📤 Export</button>
            <button onClick={resetAllData} className="px-3 py-1 rounded text-sm bg-gray-700 hover:bg-red-600">🗑️</button>
          </div>
        </div>

        {importStats && (
          <div className="bg-purple-900 rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-purple-300 text-sm font-semibold">📱 Dernier import iCompta</span>
                <span className="text-gray-400 text-xs ml-2">{importStats.mapped}/{importStats.total} transactions • {importStats.unmapped} non mappées</span>
              </div>
              <button onClick={() => setImportStats(null)} className="text-gray-400 hover:text-white text-xs">✕</button>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-1 mb-3 flex-wrap">
          {MONTHS.map((m, idx) => {
            const hasData = allMonthsCalculs[idx].ca > 0 || allMonthsCalculs[idx].besoins > 0;
            return (
              <button key={m} onClick={() => setCurrentMonth(idx)}
                className={"px-2 py-1 rounded text-xs " + (currentMonth === idx ? "bg-blue-600" : hasData ? "bg-gray-600" : "bg-gray-700") + " hover:bg-gray-500"}>
                {m.substring(0, 3)}
                {hasData && <span className="ml-1 text-green-400">•</span>}
              </button>
            );
          })}
        </div>

        {view === "dashboard" ? (
          <div className="space-y-3">
            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-3 text-center text-gray-300">📊 Indicateurs — {MONTHS[currentMonth]}</h2>
              <div className="flex justify-around flex-wrap gap-4">
                <Gauge label="Dettes" value={calculs.pctDettes * 100} thresholdHigh={10} icon="🟦" />
                <Gauge label="Épargne" value={calculs.pctEpargne * 100} thresholdLow={5} thresholdHigh={20} icon="🟧" />
                <Gauge label="Envies" value={calculs.pctEnvies * 100} thresholdLow={10} thresholdHigh={30} icon="🟥" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-sm font-semibold mb-2 text-center text-gray-300">🥧 Répartition — {MONTHS[currentMonth]}</h2>
                {donutData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {donutData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={v => formatMoney(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-48 flex items-center justify-center text-gray-500">Aucune donnée</div>}
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {donutData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: d.color }} />
                      <span>{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-sm font-semibold mb-2 text-center text-gray-300">📈 Évolution annuelle</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={epargnesCumulees}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="mois" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none" }} formatter={v => formatMoney(v)} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Line type="monotone" dataKey="ca" name="Revenus" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="soldeFinal" name="Solde" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="epargneCumulee" name="Épargne cumulée" stroke="#F97316" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-2 text-center text-gray-300">📊 Répartition mensuelle</h2>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={allMonthsCalculs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="mois" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "none" }} formatter={v => formatMoney(v)} />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar dataKey="besoins" name="Besoins" fill="#6B7280" stackId="a" />
                  <Bar dataKey="dettes" name="Dettes" fill="#3B82F6" stackId="a" />
                  <Bar dataKey="epargne" name="Épargne" fill="#F97316" stackId="a" />
                  <Bar dataKey="envies" name="Envies" fill="#EF4444" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-sm font-semibold mb-3 text-gray-300">🎯 Objectifs Patrimoine</h2>
                <ProgressBar label="LEP (Fond urgence)" current={data.patrimoine.lep} target={objectifs.lep} icon="💰" formatMoney={formatMoney} />
                <ProgressBar label="PEA (Long terme)" current={data.patrimoine.pea} target={objectifs.pea} icon="📈" formatMoney={formatMoney} />
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-400 mb-2">Saisie — {MONTHS[currentMonth]}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">LEP</label>
                      <input type="number" defaultValue={data.patrimoine.lep || ""} onBlur={e => updatePatrimoine("lep", e.target.value)} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-right text-white text-xs" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">PEA</label>
                      <input type="number" defaultValue={data.patrimoine.pea || ""} onBlur={e => updatePatrimoine("pea", e.target.value)} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-right text-white text-xs" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-sm font-semibold mb-3 text-gray-300">🗓️ Santé budgétaire</h2>
                <HealthCalendar />
                <div className="flex justify-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-600" />Excédent</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-600" />Serré</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-600" />Déficit</div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-700 grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">Total revenus:</div>
                  <div className="text-right text-green-400 font-semibold">{formatMoney(allMonthsCalculs.reduce((s, m) => s + m.ca, 0))}</div>
                  <div className="text-gray-400">Total épargne:</div>
                  <div className="text-right text-orange-400 font-semibold">{formatMoney(allMonthsCalculs.reduce((s, m) => s + m.epargne, 0))}</div>
                  <div className="text-gray-400">Solde annuel:</div>
                  <div className={"text-right font-semibold " + (allMonthsCalculs.reduce((s, m) => s + m.soldeFinal, 0) >= 0 ? "text-blue-400" : "text-red-400")}>
                    {formatMoney(allMonthsCalculs.reduce((s, m) => s + m.soldeFinal, 0))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <h2 className="text-base font-semibold mb-2 text-green-400">1. REVENUS</h2>
                <div className="space-y-1">
                  <InputRow label="🔵 Revenus activité" value={data.revenus.activite} onChange={v => updateRevenus("activite", v)} />
                  <InputRow label="🟠 Revenus sociaux" value={data.revenus.sociaux} onChange={v => updateRevenus("sociaux", v)} />
                  <InputRow label="🔴 Intérêts / Avantages" value={data.revenus.interets} onChange={v => updateRevenus("interets", v)} />
                  <InputRow label="🔁 Flux internes" value={data.revenus.fluxInternes} onChange={v => updateRevenus("fluxInternes", v)} className="text-gray-400" />
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between text-green-400 font-semibold text-sm">
                  <span>CA</span><span>{formatMoney(calculs.ca)}</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <h2 className="text-base font-semibold mb-2 text-gray-300">⬛ 2. BESOINS</h2>
                <div className="space-y-1">
                  <InputRow label="Charges fixes" value={data.sorties.besoins.fixes} onChange={v => updateSorties("besoins", "fixes", v)} />
                  <InputRow label="Charges variables" value={data.sorties.besoins.variables} onChange={v => updateSorties("besoins", "variables", v)} />
                </div>
                <ResultRow label="Total" value={calculs.totalBesoins} pct={calculs.pctBesoins} formatMoney={formatMoney} formatPct={formatPct} />
                <ResultRow label="→ Solde" value={calculs.soldeApresBesoins} highlight formatMoney={formatMoney} formatPct={formatPct} />
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <h2 className="text-base font-semibold mb-2 text-blue-300">🟦 3. DETTES</h2>
                <div className="space-y-1">
                  <InputRow label="🏠 Crédit immobilier" value={data.sorties.dettes.creditImmo} onChange={v => updateSorties("dettes", "creditImmo", v)} />
                  <InputRow label="🚗 Crédit auto" value={data.sorties.dettes.creditAuto} onChange={v => updateSorties("dettes", "creditAuto", v)} />
                  <InputRow label="🤝 Autres (impôts...)" value={data.sorties.dettes.autres} onChange={v => updateSorties("dettes", "autres", v)} />
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700 text-xs flex justify-between text-gray-400">
                  <span>Seuil MAX (10%)</span><span>{formatMoney(calculs.seuilMaxDettes)}</span>
                </div>
                <ResultRow label="Total" value={calculs.totalDettes} pct={calculs.pctDettes} alert={calculs.alerteDettes} alertMessage="⚠️ >10%" formatMoney={formatMoney} formatPct={formatPct} />
                <ResultRow label="→ Solde" value={calculs.soldeApresDettes} highlight formatMoney={formatMoney} formatPct={formatPct} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <h2 className="text-base font-semibold mb-2 text-orange-400">🟧 4. ÉPARGNE</h2>
                <div className="space-y-1">
                  <InputRow label="💰 Livret (LEP)" value={data.sorties.epargne.livret} onChange={v => updateSorties("epargne", "livret", v)} />
                  <InputRow label="📈 Placement (PEA)" value={data.sorties.epargne.placement} onChange={v => updateSorties("epargne", "placement", v)} />
                  <InputRow label="📚 Invest. personnel" value={data.sorties.epargne.investPerso} onChange={v => updateSorties("epargne", "investPerso", v)} />
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700 text-xs flex justify-between text-gray-400">
                  <span>Objectif ({formatPct(data.levier)})</span><span>{formatMoney(calculs.epargneObjectif)}</span>
                </div>
                <ResultRow label="Total" value={calculs.totalEpargne} pct={calculs.pctEpargne} alert={calculs.alerteEpargneMin || calculs.alerteEpargneMax} alertMessage={calculs.alerteEpargneMin ? "⚠️ <5%" : "⚠️ >20%"} target="5-20%" formatMoney={formatMoney} formatPct={formatPct} />
                <ResultRow label="→ Solde" value={calculs.soldeApresEpargne} highlight formatMoney={formatMoney} formatPct={formatPct} />
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <h2 className="text-base font-semibold mb-2 text-red-400">🟥 5. ENVIES</h2>
                <div className="space-y-1">
                  <InputRow label="🐜 Fourmilles" value={data.sorties.envies.fourmilles} onChange={v => updateSorties("envies", "fourmilles", v)} />
                  <InputRow label="🎁 Occasionnel" value={data.sorties.envies.occasionnel} onChange={v => updateSorties("envies", "occasionnel", v)} />
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700 text-xs flex justify-between text-gray-400">
                  <span>Objectif ({formatPct(1 - data.levier)})</span><span>{formatMoney(calculs.enviesObjectif)}</span>
                </div>
                <ResultRow label="Total" value={calculs.totalEnvies} pct={calculs.pctEnvies} alert={calculs.alerteEnviesMax} alertMessage="⚠️ >30%" target="10-30%" formatMoney={formatMoney} formatPct={formatPct} />
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <h2 className="text-base font-semibold mb-2 text-purple-400">⚖️ LEVIER</h2>
                <div className="flex items-center gap-3">
                  <span className="text-orange-400 text-xs">Épargne</span>
                  <input type="range" min="0" max="1" step="0.001" value={data.levier} onChange={e => updateLevier(e.target.value)} className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                  <span className="text-red-400 text-xs">Envies</span>
                </div>
                <div className="text-center mt-1 text-purple-300 text-xs">
                  {formatPct(data.levier)} Épargne | {formatPct(1 - data.levier)} Envies
                </div>

                {calculs.soldeApresDettes > 0 && calculs.ca > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Indicateur Épargne */}
                      <div className="bg-gray-700 rounded p-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-orange-400 text-xs font-semibold">🟧 Épargne</span>
                          <span className="text-white text-xs font-bold">{formatMoney(calculs.epargneObjectif)}</span>
                        </div>
                        <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden mb-1">
                          {/* Zone verte 5-20% */}
                          <div className="absolute h-full bg-green-900 opacity-50" style={{ left: "5%", width: "15%" }} />
                          {/* Curseur position */}
                          <div
                            className={"absolute h-full w-1 " + (
                              (calculs.epargneObjectif / calculs.ca * 100) >= 5 && (calculs.epargneObjectif / calculs.ca * 100) <= 20
                                ? "bg-green-400"
                                : "bg-red-400"
                            )}
                            style={{ left: Math.min(calculs.epargneObjectif / calculs.ca * 100, 100) + "%", transform: "translateX(-50%)" }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">0%</span>
                          <span className={
                            (calculs.epargneObjectif / calculs.ca * 100) >= 5 && (calculs.epargneObjectif / calculs.ca * 100) <= 20
                              ? "text-green-400 font-semibold"
                              : "text-red-400 font-semibold"
                          }>
                            {(calculs.epargneObjectif / calculs.ca * 100).toFixed(1)}% du CA
                            {(calculs.epargneObjectif / calculs.ca * 100) < 5 && " ⚠️ <5%"}
                            {(calculs.epargneObjectif / calculs.ca * 100) > 20 && " ⚠️ >20%"}
                            {(calculs.epargneObjectif / calculs.ca * 100) >= 5 && (calculs.epargneObjectif / calculs.ca * 100) <= 20 && " ✓"}
                          </span>
                          <span className="text-gray-500">50%</span>
                        </div>
                        <div className="text-center text-xs text-gray-500 mt-1">Zone idéale: 5-20%</div>
                      </div>

                      {/* Indicateur Envies */}
                      <div className="bg-gray-700 rounded p-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-red-400 text-xs font-semibold">🟥 Envies</span>
                          <span className="text-white text-xs font-bold">{formatMoney(calculs.enviesObjectif)}</span>
                        </div>
                        <div className="relative h-2 bg-gray-600 rounded-full overflow-hidden mb-1">
                          {/* Zone verte 10-30% */}
                          <div className="absolute h-full bg-green-900 opacity-50" style={{ left: "10%", width: "20%" }} />
                          {/* Curseur position */}
                          <div
                            className={"absolute h-full w-1 " + (
                              (calculs.enviesObjectif / calculs.ca * 100) >= 10 && (calculs.enviesObjectif / calculs.ca * 100) <= 30
                                ? "bg-green-400"
                                : "bg-red-400"
                            )}
                            style={{ left: Math.min(calculs.enviesObjectif / calculs.ca * 100, 100) + "%", transform: "translateX(-50%)" }}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">0%</span>
                          <span className={
                            (calculs.enviesObjectif / calculs.ca * 100) >= 10 && (calculs.enviesObjectif / calculs.ca * 100) <= 30
                              ? "text-green-400 font-semibold"
                              : "text-red-400 font-semibold"
                          }>
                            {(calculs.enviesObjectif / calculs.ca * 100).toFixed(1)}% du CA
                            {(calculs.enviesObjectif / calculs.ca * 100) < 10 && " ⚠️ <10%"}
                            {(calculs.enviesObjectif / calculs.ca * 100) > 30 && " ⚠️ >30%"}
                            {(calculs.enviesObjectif / calculs.ca * 100) >= 10 && (calculs.enviesObjectif / calculs.ca * 100) <= 30 && " ✓"}
                          </span>
                          <span className="text-gray-500">50%</span>
                        </div>
                        <div className="text-center text-xs text-gray-500 mt-1">Zone idéale: 10-30%</div>
                      </div>
                    </div>

                    {/* Résumé status */}
                    <div className={"mt-2 p-2 rounded text-center text-xs " + (
                      (calculs.epargneObjectif / calculs.ca * 100) >= 5 &&
                      (calculs.epargneObjectif / calculs.ca * 100) <= 20 &&
                      (calculs.enviesObjectif / calculs.ca * 100) >= 10 &&
                      (calculs.enviesObjectif / calculs.ca * 100) <= 30
                        ? "bg-green-900 text-green-300"
                        : "bg-yellow-900 text-yellow-300"
                    )}>
                      {(calculs.epargneObjectif / calculs.ca * 100) >= 5 &&
                       (calculs.epargneObjectif / calculs.ca * 100) <= 20 &&
                       (calculs.enviesObjectif / calculs.ca * 100) >= 10 &&
                       (calculs.enviesObjectif / calculs.ca * 100) <= 30
                        ? "✅ Répartition équilibrée !"
                        : "⚠️ Ajustez le levier pour équilibrer"}
                    </div>
                  </div>
                )}
              </div>

              <div className={"rounded-lg p-3 " + (calculs.soldeFinal >= 0 ? "bg-green-900" : "bg-red-900")}>
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold">💰 SOLDE FINAL</span>
                  <span className={"text-xl font-bold " + (calculs.soldeFinal >= 0 ? "text-green-400" : "text-red-400")}>
                    {formatMoney(calculs.soldeFinal)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-300">
                  {calculs.soldeFinal >= 0 ? "✅ Budget équilibré" : "❌ Dépassement"}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center text-gray-500 text-xs">Phase 3.5 — Import iCompta</div>
      </div>
    </div>
  );
}
