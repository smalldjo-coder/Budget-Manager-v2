import { parse, isValid } from "date-fns";
import { MONTHS, STORAGE_KEY, MAX_FILE_SIZE_MB, MAX_FILE_SIZE_BYTES, MAX_MONTANT, NOTIFICATION_TIMEOUT_MS } from '../../constants';
import { round2 } from '../../utils/formatters';
import { initializeMonthsData } from '../../utils/initializers';
import { parseCSVContent } from '../../utils/csv';
import { mapIComptaCategory } from '../../utils/categoryMapper';
import {
  loadFromStorage, saveToStorage, loadSelectedYear, saveSelectedYear,
  loadTransactions, saveTransactions, loadBudgetPrevu,
  loadSoldesInitiaux, saveSoldesInitiaux
} from '../storage';
import { Smartphone, Download, Upload, Trash2, HardDrive, AlertTriangle, PiggyBank } from "lucide-react";

export const createBudgetDataSlice = (set, get) => ({
  selectedYear: loadSelectedYear(),
  currentMonth: new Date().getMonth(),
  monthsData: loadFromStorage(loadSelectedYear()) || initializeMonthsData(),
  transactions: loadTransactions(loadSelectedYear()),
  soldesInitiaux: loadSoldesInitiaux(loadSelectedYear()),

  setSelectedYear: (year) => {
    saveSelectedYear(year);
    const data = loadFromStorage(year) || initializeMonthsData();
    const transactions = loadTransactions(year);
    const budgetPrevu = loadBudgetPrevu(year);
    const soldesInitiaux = loadSoldesInitiaux(year);
    set({
      selectedYear: year,
      monthsData: data,
      transactions,
      budgetPrevu,
      soldesInitiaux,
    });
  },

  setCurrentMonth: (month) => set({ currentMonth: month }),

  setMonthsData: (data) => set({ monthsData: data }),

  updateRevenus: (cat, val) => {
    const currentMonth = get().currentMonth;
    set(state => {
      const n = [...state.monthsData];
      n[currentMonth] = { ...n[currentMonth], revenus: { ...n[currentMonth].revenus, [cat]: parseFloat(val) || 0 } };
      return { monthsData: n };
    });
  },

  updateSorties: (cat, sub, val) => {
    const currentMonth = get().currentMonth;
    set(state => {
      const n = [...state.monthsData];
      n[currentMonth] = { ...n[currentMonth], sorties: { ...n[currentMonth].sorties, [cat]: { ...n[currentMonth].sorties[cat], [sub]: parseFloat(val) || 0 } } };
      return { monthsData: n };
    });
  },

  updatePatrimoine: (cat, val) => {
    const currentMonth = get().currentMonth;
    set(state => {
      const n = [...state.monthsData];
      n[currentMonth] = { ...n[currentMonth], patrimoine: { ...n[currentMonth].patrimoine, [cat]: parseFloat(val) || 0 } };
      return { monthsData: n };
    });
  },

  updateLevier: (val) => {
    const currentMonth = get().currentMonth;
    set(state => {
      const n = [...state.monthsData];
      n[currentMonth] = { ...n[currentMonth], levier: parseFloat(val) };
      return { monthsData: n };
    });
  },

  updateSoldeInitial: (livretKey, val) => {
    const { selectedYear, soldesInitiaux } = get();
    const newSoldes = { ...soldesInitiaux, [livretKey]: parseFloat(val) || 0 };
    saveSoldesInitiaux(newSoldes, selectedYear);
    set({ soldesInitiaux: newSoldes });
  },

  setSoldesInitiaux: (soldes) => {
    const { selectedYear } = get();
    saveSoldesInitiaux(soldes, selectedYear);
    set({ soldesInitiaux: soldes });
  },

  setTransactions: (transactions) => set({ transactions }),

  resetAllData: () => {
    const { selectedYear, showNotification } = get();
    if (window.confirm(`Réinitialiser toutes les données ${selectedYear} (budget + transactions) ?`)) {
      set({ monthsData: initializeMonthsData(), transactions: [], importStats: null });
      localStorage.removeItem(`${STORAGE_KEY}-${selectedYear}`);
      localStorage.removeItem(`${STORAGE_KEY}-transactions-${selectedYear}`);
      showNotification(`Données ${selectedYear} réinitialisées`, "success", Trash2);
    }
  },

  restoreFromStorage: () => {
    const { selectedYear, showNotification } = get();
    const saved = loadFromStorage(selectedYear);
    if (saved) {
      set({ monthsData: saved });
      showNotification(`Données ${selectedYear} restaurées`, "success", HardDrive);
    } else {
      showNotification("Aucune sauvegarde trouvée", "error");
    }
  },

  exportToCSV: () => {
    const { monthsData, selectedYear, showNotification } = get();
    const headers = ["Mois", "Revenus_Activite", "Revenus_Sociaux", "Revenus_Interets", "Flux_Internes", "Besoins_Fixes", "Besoins_Variables", "Besoins_Necessite", "Dettes_CreditImmo", "Dettes_CreditAuto", "Dettes_Autres", "Epargne_Livret", "Epargne_Placement", "Epargne_InvestPerso", "Envies_Fourmilles", "Envies_Occasionnel", "Patrimoine_LEP", "Patrimoine_LivretA", "Patrimoine_PEA", "Levier"];
    const rows = monthsData.map((d, idx) => [
      MONTHS[idx],
      round2(d.revenus.activite),
      round2(d.revenus.sociaux),
      round2(d.revenus.interets),
      round2(d.revenus.fluxInternes),
      round2(d.sorties.besoins.fixes),
      round2(d.sorties.besoins.variables),
      round2(d.sorties.besoins.necessite || 0),
      round2(d.sorties.dettes.creditImmo),
      round2(d.sorties.dettes.creditAuto),
      round2(d.sorties.dettes.autres),
      round2(d.sorties.epargne.livret),
      round2(d.sorties.epargne.placement),
      round2(d.sorties.epargne.investPerso),
      round2(d.sorties.envies.fourmilles),
      round2(d.sorties.envies.occasionnel),
      round2(d.patrimoine.lep),
      round2(d.patrimoine.livretA || 0),
      round2(d.patrimoine.pea),
      d.levier
    ]);
    const csvContent = [headers.join(";"), ...rows.map(row => row.join(";"))].join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `budget_${selectedYear}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Export ${selectedYear} réussi !`, "success", Download);
  },

  handleFileUpload: (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const { showNotification } = get();

    if (file.size > MAX_FILE_SIZE_BYTES) {
      showNotification(`Fichier trop volumineux (max ${MAX_FILE_SIZE_MB}MB)`, "error");
      event.target.value = "";
      return;
    }

    set({ isImporting: true });
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const lines = e.target.result.split("\n").filter(line => line.trim());
        if (lines.length < 2) {
          showNotification("Fichier CSV vide", "error");
          set({ isImporting: false });
          return;
        }

        const headers = lines[0].split(";").map(h => h.trim());
        if (!headers.includes("Mois") || !headers.includes("Revenus_Activite")) {
          showNotification("Format CSV invalide. Utilisez le format d'export de l'app ou iCompta.", "error");
          set({ isImporting: false });
          return;
        }

        const newMonthsData = initializeMonthsData();
        let importedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(";").map(v => v.trim());
          const monthIndex = MONTHS.findIndex(m => m.toLowerCase() === values[0].toLowerCase());
          if (monthIndex === -1) continue;

          const getValue = (h) => {
            const idx = headers.indexOf(h);
            if (idx === -1 || idx >= values.length) return 0;
            const val = values[idx].replace(",", ".");
            return parseFloat(val) || 0;
          };

          newMonthsData[monthIndex] = {
            revenus: {
              activite: getValue("Revenus_Activite"),
              sociaux: getValue("Revenus_Sociaux"),
              interets: getValue("Revenus_Interets"),
              fluxInternes: getValue("Flux_Internes")
            },
            sorties: {
              besoins: { fixes: getValue("Besoins_Fixes"), variables: getValue("Besoins_Variables"), necessite: getValue("Besoins_Necessite") },
              dettes: { creditImmo: getValue("Dettes_CreditImmo"), creditAuto: getValue("Dettes_CreditAuto"), autres: getValue("Dettes_Autres") },
              epargne: { livret: getValue("Epargne_Livret"), placement: getValue("Epargne_Placement"), investPerso: getValue("Epargne_InvestPerso") },
              envies: { fourmilles: getValue("Envies_Fourmilles"), occasionnel: getValue("Envies_Occasionnel") }
            },
            patrimoine: { lep: getValue("Patrimoine_LEP"), livretA: getValue("Patrimoine_LivretA"), pea: getValue("Patrimoine_PEA") },
            levier: getValue("Levier") || 0.5
          };
          importedCount++;
        }

        set({ monthsData: newMonthsData, isImporting: false });
        showNotification(`Import réussi : ${importedCount} mois chargés`, "success", Upload);
      } catch (error) {
        showNotification("Erreur: " + error.message, "error");
        set({ isImporting: false });
      }
    };

    reader.onerror = () => {
      showNotification("Erreur lecture du fichier", "error");
      set({ isImporting: false });
    };

    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  },

  handleiComptaImport: (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const { selectedYear, showNotification } = get();

    if (file.size > MAX_FILE_SIZE_BYTES) {
      showNotification(`Fichier trop volumineux (max ${MAX_FILE_SIZE_MB}MB)`, "error");
      event.target.value = "";
      return;
    }

    set({ isImporting: true });
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = parseCSVContent(text);

        if (rows.length < 2) {
          showNotification("Fichier iCompta vide", "error");
          set({ isImporting: false });
          return;
        }

        const headers = rows[0];
        const findIndex = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));

        const compteIdx = findIndex("compte");
        const dateValeurIdx = findIndex("date de valeur");
        const montantIdx = findIndex("montant");
        const nomIdx = findIndex("nom");

        const COMPTE_IDX = compteIdx !== -1 ? compteIdx : 0;
        const DATE_VALEUR_IDX = dateValeurIdx !== -1 ? dateValeurIdx : 4;
        const MONTANT_IDX = montantIdx !== -1 ? montantIdx : 7;
        const NOM_IDX = nomIdx !== -1 ? nomIdx : 5;

        const newMonthsData = initializeMonthsData();
        const newTransactions = [];
        let stats = { total: 0, mapped: 0, unmapped: 0, skippedYear: 0, unmappedCategories: [] };

        for (let i = 1; i < rows.length; i++) {
          const values = rows[i];
          if (values.length < 8) continue;

          const compte = values[COMPTE_IDX] || "";
          const dateValeur = values[DATE_VALEUR_IDX] || "";
          const nom = values[NOM_IDX] || "";

          let montantStr = (values[MONTANT_IDX] || "").trim();
          montantStr = montantStr.replace(/\s/g, "").replace(",", ".");

          if (!montantStr || montantStr === "") continue;

          const montant = round2(parseFloat(montantStr) || 0);
          if (montant === 0 || Math.abs(montant) > MAX_MONTANT) continue;

          let monthIndex = -1;
          const parsedDate = parse(dateValeur, "dd/MM/yyyy", new Date());

          if (isValid(parsedDate)) {
            const year = parsedDate.getFullYear();
            const month = parsedDate.getMonth();
            if (year === selectedYear && month >= 0 && month <= 11) {
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
            const absAmount = round2(Math.abs(montant));

            newTransactions.push({
              id: i,
              date: dateValeur,
              nom,
              compte,
              montant: absAmount,
              month: monthIndex,
              section,
              category,
              subcategory: subcategory || null
            });

            if (section === "revenus") {
              newMonthsData[monthIndex].revenus[category] = round2(newMonthsData[monthIndex].revenus[category] + (montant > 0 ? montant : absAmount));
            } else if (section === "sorties" && subcategory) {
              newMonthsData[monthIndex].sorties[category][subcategory] = round2(newMonthsData[monthIndex].sorties[category][subcategory] + absAmount);
            }
          } else {
            stats.unmapped++;
            if (compte && !stats.unmappedCategories.includes(compte)) {
              stats.unmappedCategories.push(compte);
            }
          }
        }

        set({ monthsData: newMonthsData, transactions: newTransactions, importStats: stats, isImporting: false });
        saveTransactions(newTransactions, selectedYear);
        const yearInfo = stats.skippedYear > 0 ? ` (${stats.skippedYear} hors ${selectedYear})` : "";
        showNotification(`Import ${selectedYear}: ${stats.mapped}/${stats.total} transactions${yearInfo}`, "success", Smartphone);

      } catch (error) {
        showNotification("Erreur import: " + error.message, "error");
        set({ isImporting: false });
      }
    };

    reader.onerror = () => {
      showNotification("Erreur lecture du fichier", "error");
      set({ isImporting: false });
    };

    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  },

  handleLivretsImport: (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const { selectedYear, monthsData, showNotification } = get();

    if (file.size > MAX_FILE_SIZE_BYTES) {
      showNotification(`Fichier trop volumineux (max ${MAX_FILE_SIZE_MB}MB)`, "error");
      event.target.value = "";
      return;
    }

    set({ isImporting: true });
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = parseCSVContent(text);

        if (rows.length < 2) {
          showNotification("Fichier livrets vide", "error");
          set({ isImporting: false });
          return;
        }

        const headers = rows[0];
        const findIndex = (name) => headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));

        const compteIdx = findIndex("compte") !== -1 ? findIndex("compte") : 0;
        const dateValeurIdx = findIndex("date de valeur") !== -1 ? findIndex("date de valeur") : 4;
        const montantIdx = findIndex("montant") !== -1 ? findIndex("montant") : 7;

        // Parse ALL operations (all years) and sort by date
        const allOps = [];
        let stats = { total: 0, mapped: 0 };

        for (let i = 1; i < rows.length; i++) {
          const values = rows[i];
          if (values.length < 5) continue;

          const compte = (values[compteIdx] || "").toUpperCase();
          const dateValeur = values[dateValeurIdx] || "";
          let montantStr = (values[montantIdx] || "").trim().replace(/\s/g, "").replace(",", ".");
          if (!montantStr) continue;

          const montant = parseFloat(montantStr) || 0;
          if (montant === 0) continue;

          const parsedDate = parse(dateValeur, "dd/MM/yyyy", new Date());
          if (!isValid(parsedDate)) continue;

          stats.total++;

          // Detect which livret
          let livretKey = null;
          if (compte.includes("LEP") || compte.includes("LIVRET D'ÉPARGNE") || compte.includes("LIVRET D'EPARGNE")) livretKey = "lep";
          else if (compte.includes("LIVRET A") || compte.includes("LDDS")) livretKey = "livretA";
          else if (compte.includes("PEA") || compte.includes("PLAN D'ÉPARGNE") || compte.includes("PLAN D'EPARGNE")) livretKey = "pea";

          if (!livretKey) continue;
          stats.mapped++;

          // Detect operation type
          let opType;
          if (compte.includes("INTÉRÊT") || compte.includes("INTERET") || compte.includes("INT.")) {
            opType = "interets";
          } else if (montant > 0) {
            opType = "versement";
          } else {
            opType = "retrait";
          }

          allOps.push({
            date: parsedDate,
            year: parsedDate.getFullYear(),
            month: parsedDate.getMonth(),
            livretKey,
            opType,
            montant: Math.abs(montant),
          });
        }

        // Sort all operations by date
        allOps.sort((a, b) => a.date - b.date);

        // Calculate cumulative balances across all years
        const cumulSoldes = { lep: 0, livretA: 0, pea: 0 };
        // Track monthly ops for current year
        const currentYearOps = { lep: Array(12).fill(null).map(() => ({ versements: 0, retraits: 0, interets: 0 })), livretA: Array(12).fill(null).map(() => ({ versements: 0, retraits: 0, interets: 0 })), pea: Array(12).fill(null).map(() => ({ versements: 0, retraits: 0, interets: 0 })) };
        // Solde at end of each month for current year
        const monthEndSoldes = { lep: Array(12).fill(0), livretA: Array(12).fill(0), pea: Array(12).fill(0) };
        // Track solde at start of selected year (= solde initial)
        let soldeAtYearStart = { lep: 0, livretA: 0, pea: 0 };
        let passedYearStart = false;

        for (const op of allOps) {
          // Record solde just before entering selectedYear
          if (!passedYearStart && op.year >= selectedYear) {
            soldeAtYearStart = { ...cumulSoldes };
            passedYearStart = true;
          }

          // Apply operation to cumulative
          if (op.opType === "versement" || op.opType === "interets") {
            cumulSoldes[op.livretKey] += op.montant;
          } else {
            cumulSoldes[op.livretKey] -= op.montant;
          }

          // Track ops and monthly snapshots for current year
          if (op.year === selectedYear) {
            const m = op.month;
            if (op.opType === "versement") currentYearOps[op.livretKey][m].versements += op.montant;
            else if (op.opType === "retrait") currentYearOps[op.livretKey][m].retraits += op.montant;
            else currentYearOps[op.livretKey][m].interets += op.montant;
          }
        }

        // If no ops reached the selected year, solde at year start = final cumul of prior years
        if (!passedYearStart) {
          soldeAtYearStart = { ...cumulSoldes };
        }

        // Calculate month-end balances for selected year using soldeAtYearStart + monthly ops
        for (const key of ["lep", "livretA", "pea"]) {
          let solde = soldeAtYearStart[key];
          for (let m = 0; m < 12; m++) {
            const ops = currentYearOps[key][m];
            solde += ops.versements - ops.retraits + ops.interets;
            monthEndSoldes[key][m] = round2(solde);
          }
        }

        // Save soldesInitiaux (automatically calculated from historical data)
        const newSoldesInitiaux = {
          lep: round2(soldeAtYearStart.lep),
          livretA: round2(soldeAtYearStart.livretA),
          pea: round2(soldeAtYearStart.pea),
        };
        saveSoldesInitiaux(newSoldesInitiaux, selectedYear);

        // Update monthsData patrimoine with real cumulative balances
        const newMonthsData = monthsData.map((m, idx) => ({
          ...m,
          patrimoine: {
            ...m.patrimoine,
            lep: monthEndSoldes.lep[idx],
            livretA: monthEndSoldes.livretA[idx],
            pea: monthEndSoldes.pea[idx],
          }
        }));

        set({ monthsData: newMonthsData, soldesInitiaux: newSoldesInitiaux, isImporting: false });

        const prevYearOps = allOps.filter(o => o.year < selectedYear).length;
        const currYearOps = allOps.filter(o => o.year === selectedYear).length;
        const info = prevYearOps > 0 ? ` (historique: ${prevYearOps} ops antérieures)` : "";
        showNotification(`Import livrets ${selectedYear}: ${currYearOps} ops + soldes initiaux calculés${info}`, "success", PiggyBank);

      } catch (error) {
        showNotification("Erreur import livrets: " + error.message, "error");
        set({ isImporting: false });
      }
    };

    reader.onerror = () => {
      showNotification("Erreur lecture du fichier", "error");
      set({ isImporting: false });
    };

    reader.readAsText(file, "UTF-8");
    event.target.value = "";
  },
});
