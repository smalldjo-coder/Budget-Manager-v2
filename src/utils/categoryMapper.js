export function mapIComptaCategory(compte) {
  if (!compte) return null;
  const c = compte.toUpperCase();

  // ===== LIVRETS (LEP, Livret A, LDDS) =====
  if (c.includes("LIVRET") || (c.includes("🟢") || c.includes("LEP") || c.includes("LDDS"))) {
    if (c.includes("INTÉRÊT") || c.includes("INTERET") || c.includes("INTERETS")) {
      return { section: "revenus", category: "interets", source: "livret" };
    }
    if (c.includes("VERSEMENT") || c.includes("VIREMENT") || c.includes("TRANSFERT") || c.includes("DEPOT") || c.includes("DÉPÔT")) {
      return { section: "revenus", category: "fluxInternes", type: "versement_livret" };
    }
    if (c.includes("RETRAIT") || c.includes("PRÉLÈVEMENT") || c.includes("PRELEVEMENT")) {
      return { section: "revenus", category: "fluxInternes", type: "retrait_livret" };
    }
    return null;
  }

  // ===== ENTRÉES (revenus) =====
  if (c.includes("ENTRÉES") || c.includes("ENTREES") || c.includes("ENTRÉE") || c.includes("ENTREE")) {
    if (c.includes("ACTIVITÉ") || c.includes("ACTIVITE")) return { section: "revenus", category: "activite" };
    if (c.includes("SOCIALES") || c.includes("SOCIAL")) return { section: "revenus", category: "sociaux" };
    if (c.includes("INTÉRÊT") || c.includes("INTERET") || c.includes("REMBOURSEMENT") || c.includes("PRIMES")) return { section: "revenus", category: "interets" };
    return { section: "revenus", category: "activite" };
  }

  // Flux internes entre comptes courants
  if (c.includes("FLUX") && c.includes("INTERNE")) return { section: "revenus", category: "fluxInternes" };

  // SORTIES
  if (c.includes("SORTIES") || c.includes("SORTIE")) {
    // BESOINS
    if (c.includes("BESOIN")) {
      if (c.includes("FIXES") || c.includes("FIXE")) return { section: "sorties", category: "besoins", subcategory: "fixes" };
      if (c.includes("VARIABLES") || c.includes("VARIABLE")) return { section: "sorties", category: "besoins", subcategory: "variables" };
      if (c.includes("NECESSITE") || c.includes("NÉCESSITÉ") || c.includes("NECESSITÉ") || c.includes("NÉCÉSSITÉ") || c.includes("NECES")) return { section: "sorties", category: "besoins", subcategory: "necessite" };
      return { section: "sorties", category: "besoins", subcategory: "variables" };
    }

    // DETTES
    if (c.includes("DETTE")) {
      if (c.includes("IMMO") || c.includes("HYPOTHE") || c.includes("LOGEMENT")) return { section: "sorties", category: "dettes", subcategory: "creditImmo" };
      if (c.includes("AUTO") || c.includes("VOITURE") || c.includes("VEHICULE")) return { section: "sorties", category: "dettes", subcategory: "creditAuto" };
      return { section: "sorties", category: "dettes", subcategory: "autres" };
    }

    // ÉPARGNE
    if (c.includes("EPARGNE") || c.includes("ÉPARGNE")) {
      if (c.includes("LIVRET") || c.includes("LEP") || c.includes("LDD") || c.includes("LDDS") || c.includes("LIVRET A")) {
        return { section: "sorties", category: "epargne", subcategory: "livret" };
      }
      if (c.includes("PLACEMENT") || c.includes("PEA") || c.includes("ASSURANCE VIE") || c.includes("BOURSE") || c.includes("ACTION") || c.includes("INVEST")) {
        return { section: "sorties", category: "epargne", subcategory: "placement" };
      }
      if (c.includes("PERSONNEL") || c.includes("FORMATION") || c.includes("EDUCATION") || c.includes("COURS") || c.includes("LIVRE")) {
        return { section: "sorties", category: "epargne", subcategory: "investPerso" };
      }
      return { section: "sorties", category: "epargne", subcategory: "livret" };
    }

    // ENVIES
    if (c.includes("ENVIE")) {
      if (c.includes("FOURMILLES") || c.includes("FOURMILLE")) {
        return { section: "sorties", category: "envies", subcategory: "fourmilles" };
      }
      return { section: "sorties", category: "envies", subcategory: "occasionnel" };
    }
  }

  return null;
}
