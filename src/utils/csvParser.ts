import type { Transaction, Revenus, Besoins, Dettes, Epargne, Envies } from '../types/budget';

export interface ParsedBudgetData {
  revenus: Revenus;
  besoins: Besoins;
  dettes: Dettes;
  epargne: Epargne;
  envies: Envies;
  transactions: Transaction[];
}

function parseAmount(amountStr: string): number {
  if (!amountStr || amountStr.trim() === '') return 0;
  // Montant avec point décimal (format iCompta)
  const cleaned = amountStr
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Format: JJ/MM/AAAA
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

  return new Date(year, month, day);
}

function categorizeTransaction(compte: string): { categorie: string; sousCategorie: string } | null {
  const compteUpper = compte.toUpperCase();

  // REVENUS (ENTRÉES)
  if (compteUpper.includes('ENTRÉES') || compteUpper.includes('ENTREES')) {
    if (compteUpper.includes('ACTIVITÉ') || compteUpper.includes('ACTIVITE')) {
      return { categorie: 'revenus', sousCategorie: 'activite' };
    }
    if (compteUpper.includes('SOCIALES') || compteUpper.includes('SOCIAL')) {
      return { categorie: 'revenus', sousCategorie: 'sociaux' };
    }
    if (compteUpper.includes('INTÉRÊT') || compteUpper.includes('INTERET') ||
        compteUpper.includes('REMBOURSEMENT') || compteUpper.includes('PRIMES')) {
      return { categorie: 'revenus', sousCategorie: 'interets' };
    }
    // Entrée par défaut
    return { categorie: 'revenus', sousCategorie: 'activite' };
  }

  // SORTIES
  if (compteUpper.includes('SORTIES') || compteUpper.includes('SORTIE')) {
    // BESOINS
    if (compteUpper.includes('BESOIN')) {
      if (compteUpper.includes('FIXES') || compteUpper.includes('FIXE')) {
        return { categorie: 'besoins', sousCategorie: 'fixes' };
      }
      if (compteUpper.includes('VARIABLES') || compteUpper.includes('VARIABLE')) {
        return { categorie: 'besoins', sousCategorie: 'variables' };
      }
      return { categorie: 'besoins', sousCategorie: 'fixes' };
    }

    // DETTES
    if (compteUpper.includes('DETTE')) {
      return { categorie: 'dettes', sousCategorie: 'autres' };
    }

    // ÉPARGNE
    if (compteUpper.includes('ÉPARGNE') || compteUpper.includes('EPARGNE')) {
      if (compteUpper.includes('LIVRET') || compteUpper.includes('LEP')) {
        return { categorie: 'epargne', sousCategorie: 'livretLEP' };
      }
      if (compteUpper.includes('PLACEMENT') || compteUpper.includes('PEA')) {
        return { categorie: 'epargne', sousCategorie: 'placementPEA' };
      }
      return { categorie: 'epargne', sousCategorie: 'livretLEP' };
    }

    // ENVIES
    if (compteUpper.includes('ENVIE')) {
      return { categorie: 'envies', sousCategorie: 'occasionnel' };
    }
  }

  // Non catégorisé
  return null;
}

/**
 * Parse CSV content handling multiline fields (quoted strings with newlines)
 * Returns array of rows, each row is an array of field values
 */
function parseCSVContent(csvContent: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
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

export function parseCSV(csvContent: string): ParsedBudgetData {
  const result: ParsedBudgetData = {
    revenus: { activite: 0, sociaux: 0, interets: 0, fluxInternes: 0 },
    besoins: { fixes: 0, variables: 0 },
    dettes: { creditImmo: 0, creditAuto: 0, autres: 0 },
    epargne: { livretLEP: 0, placementPEA: 0, investPersonnel: 0 },
    envies: { fourmilles: 0, occasionnel: 0 },
    transactions: [],
  };

  const rows = parseCSVContent(csvContent);

  // Skip header row
  const dataRows = rows.slice(1);

  for (const parts of dataRows) {
    // Format iCompta: 9 colonnes
    // Index 0: Compte (catégorie)
    // Index 4: Date de valeur
    // Index 7: Montant
    if (parts.length < 8) continue;

    const compte = parts[0] || '';
    const dateStr = parts[4] || '';
    const montantStr = parts[7] || '';

    // Ignorer si montant vide
    if (!montantStr || montantStr.trim() === '') continue;

    const date = parseDate(dateStr);
    if (!date) continue;

    // Filtrer 2025-2026 uniquement
    const year = date.getFullYear();
    if (year < 2025 || year > 2026) continue;

    const montant = parseAmount(montantStr);
    if (montant === 0) continue;

    const categorization = categorizeTransaction(compte);
    if (!categorization) continue;

    const { categorie, sousCategorie } = categorization;

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      compte,
      date,
      montant: Math.abs(montant),
      categorie,
      sousCategorie,
    };

    result.transactions.push(transaction);

    // Agréger les montants (valeur absolue)
    const absAmount = Math.abs(montant);

    switch (categorie) {
      case 'revenus':
        result.revenus[sousCategorie as keyof typeof result.revenus] += absAmount;
        break;
      case 'besoins':
        result.besoins[sousCategorie as keyof typeof result.besoins] += absAmount;
        break;
      case 'dettes':
        result.dettes[sousCategorie as keyof typeof result.dettes] += absAmount;
        break;
      case 'epargne':
        result.epargne[sousCategorie as keyof typeof result.epargne] += absAmount;
        break;
      case 'envies':
        result.envies[sousCategorie as keyof typeof result.envies] += absAmount;
        break;
    }
  }

  return result;
}

export function exportToCSV(data: {
  revenus: Revenus;
  besoins: Besoins;
  dettes: Dettes;
  epargne: Epargne;
  envies: Envies;
}): string {
  const lines: string[] = [];

  lines.push('Catégorie;Sous-catégorie;Montant');

  // Revenus
  lines.push(`Revenus;Activité;${data.revenus.activite.toFixed(2).replace('.', ',')}`);
  lines.push(`Revenus;Sociaux;${data.revenus.sociaux.toFixed(2).replace('.', ',')}`);
  lines.push(`Revenus;Intérêts;${data.revenus.interets.toFixed(2).replace('.', ',')}`);
  lines.push(`Revenus;Flux internes;${data.revenus.fluxInternes.toFixed(2).replace('.', ',')}`);

  // Besoins
  lines.push(`Besoins;Fixes;${data.besoins.fixes.toFixed(2).replace('.', ',')}`);
  lines.push(`Besoins;Variables;${data.besoins.variables.toFixed(2).replace('.', ',')}`);

  // Dettes
  lines.push(`Dettes;Crédit immobilier;${data.dettes.creditImmo.toFixed(2).replace('.', ',')}`);
  lines.push(`Dettes;Crédit auto;${data.dettes.creditAuto.toFixed(2).replace('.', ',')}`);
  lines.push(`Dettes;Autres;${data.dettes.autres.toFixed(2).replace('.', ',')}`);

  // Épargne
  lines.push(`Épargne;Livret LEP;${data.epargne.livretLEP.toFixed(2).replace('.', ',')}`);
  lines.push(`Épargne;Placement PEA;${data.epargne.placementPEA.toFixed(2).replace('.', ',')}`);
  lines.push(`Épargne;Invest personnel;${data.epargne.investPersonnel.toFixed(2).replace('.', ',')}`);

  // Envies
  lines.push(`Envies;Fourmilles;${data.envies.fourmilles.toFixed(2).replace('.', ',')}`);
  lines.push(`Envies;Occasionnel;${data.envies.occasionnel.toFixed(2).replace('.', ',')}`);

  return lines.join('\n');
}
