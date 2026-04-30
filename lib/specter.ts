const SPECTER_BASE = "https://api.tryspecter.com";

export interface VendorInfo {
  found: boolean;
  fundingTotal?: string;
  employeeCount?: number;
  riskSignals?: string[];
}

export async function lookupVendor(vendorName: string): Promise<VendorInfo | null> {
  if (!process.env.SPECTER_API_KEY) return null;

  try {
    const res = await fetch(
      `${SPECTER_BASE}/v1/companies/search?query=${encodeURIComponent(vendorName)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.SPECTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();

    if (data.results?.length > 0) {
      const company = data.results[0];
      return {
        found: true,
        fundingTotal: company.fundingTotal,
        employeeCount: company.employeeCount,
        riskSignals: company.signals || [],
      };
    }
    return { found: false };
  } catch {
    return null;
  }
}
