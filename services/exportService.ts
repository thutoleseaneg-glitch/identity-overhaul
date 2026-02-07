
import { UserState } from "../types";

export function downloadFile(content: string, fileName: string, contentType: string) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportToJSON(user: UserState, insights: string[]) {
  const exportData = {
    userData: user.entries,
    generatedInsights: insights,
    exportDate: new Date().toISOString(),
    plan: user.plan
  };
  const jsonString = JSON.stringify(exportData, null, 2);
  const fileName = `identity-overhaul-export-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(jsonString, fileName, "application/json");
}

export function exportToCSV(user: UserState) {
  const entries = Object.entries(user.entries);
  if (entries.length === 0) {
    alert("No data to export.");
    return;
  }

  // Define headers aligned with the actual DailyData interface from types.ts
  const headers = [
    "Date",
    "Categories",
    "Sales_Leads",
    "Sales_Revenue",
    "Finance_Revenue",
    "Finance_Expenses",
    "Productivity_FocusHours",
    "Productivity_Score",
    "Relationship_Contact",
    "Relationship_Trust",
    "Relationship_Notes"
  ];

  const rows = entries.map(([date, data]) => {
    const categories = data.categories.join("; ");
    
    // Fix: Replaced dating/gym/hobby references with actual categories from types.ts
    // Sales metrics
    const salesLeads = data.sales?.leads || 0;
    const salesRevenue = data.sales?.revenue || 0;
    
    // Finance metrics (Fix: changed 'expenses' to 'operatingExpenses' to match FinanceEntry)
    const finRevenue = data.finance?.revenue || 0;
    const finExpenses = data.finance?.operatingExpenses || 0;
    
    // Productivity metrics (Fix: ProductivityEntry does not have a 'score' property)
    const prodFocus = data.productivity?.focusHours || 0;
    const prodScore = 0;
    
    // Fix: Correctly handle the relationships array and map to existing Contact/RelationshipEntry fields
    const rels = data.relationships || [];
    const relContact = rels.map(r => {
      const contact = user.contacts.find(c => c.id === r.contactId);
      return contact ? contact.fullName : r.contactId;
    }).join("; ");
    
    // Fix: replaced non-existent 'newTrustScore' with the sum of trustMatrix components
    const relTrust = rels.length > 0 
      ? (rels.reduce((acc, r) => acc + (r.trustMatrix.integrity + r.trustMatrix.competence + r.trustMatrix.communication + r.trustMatrix.alignment + r.trustMatrix.reciprocity), 0) / rels.length).toFixed(1) 
      : 0;
    
    // Fix: access notes from relationship section instead of non-existent top-level notes property
    // We join all strategic notes for that day with a separator and sanitize for CSV.
    const relNotes = rels.map(r => r.strategicNotes).join("; ").replace(/,/g, " ").replace(/\n/g, " ");

    return [
      date,
      `"${categories}"`,
      salesLeads,
      salesRevenue,
      finRevenue,
      finExpenses,
      prodFocus,
      prodScore,
      `"${relContact}"`,
      relTrust,
      `"${relNotes}"`
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");
  const fileName = `identity-overhaul-export-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csvContent, fileName, "text/csv");
}
