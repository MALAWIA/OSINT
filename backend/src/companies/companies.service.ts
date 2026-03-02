import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CompaniesService {
  private companies: any[] = [
    {
      id: '1', name: 'Safaricom PLC', symbol: 'SCOM', sector: 'Telecommunications',
      description: 'Leading telecommunications company in Kenya providing mobile, data, and M-Pesa services',
      website: 'https://www.safaricom.co.ke', listedDate: '2008-06-09',
      stockPrice: 25.75, marketCap: 1025000000000, volume: 15230000,
      change: 0.25, changePercent: 0.98,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '2', name: 'Equity Group Holdings', symbol: 'EQTY', sector: 'Banking',
      description: 'Largest banking group in Kenya by customer base with operations across East Africa',
      website: 'https://www.equitygroup.co.ke', listedDate: '2006-08-18',
      stockPrice: 48.50, marketCap: 185000000000, volume: 8400000,
      change: -0.75, changePercent: -1.52,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '3', name: 'KCB Group', symbol: 'KCB', sector: 'Banking',
      description: 'Kenya Commercial Bank Group — largest bank by assets in East Africa',
      website: 'https://www.kcbgroup.com', listedDate: '1989-01-01',
      stockPrice: 42.25, marketCap: 142000000000, volume: 6500000,
      change: 0.50, changePercent: 1.20,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '4', name: 'East African Breweries', symbol: 'EABL', sector: 'Manufacturing',
      description: 'Leading branded alcoholic beverages company in East Africa',
      website: 'https://www.eabl.com', listedDate: '1972-01-01',
      stockPrice: 155.00, marketCap: 122600000000, volume: 320000,
      change: 2.50, changePercent: 1.64,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '5', name: 'BAT Kenya', symbol: 'BAT', sector: 'Manufacturing',
      description: 'British American Tobacco Kenya — leading tobacco manufacturer',
      website: 'https://www.batkenya.com', listedDate: '1969-01-01',
      stockPrice: 350.00, marketCap: 35000000000, volume: 45000,
      change: 2.00, changePercent: 0.57,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '6', name: 'Stanbic Holdings', symbol: 'SBIC', sector: 'Banking',
      description: 'Stanbic Holdings PLC — subsidiary of Standard Bank Group',
      website: 'https://www.stanbicbank.co.ke', listedDate: '1998-06-15',
      stockPrice: 112.00, marketCap: 44400000000, volume: 180000,
      change: 1.50, changePercent: 1.36,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '7', name: 'Co-operative Bank', symbol: 'COOP', sector: 'Banking',
      description: 'Co-operative Bank of Kenya — one of the largest commercial banks',
      website: 'https://www.co-opbank.co.ke', listedDate: '2008-12-22',
      stockPrice: 14.75, marketCap: 86700000000, volume: 4200000,
      change: 0.25, changePercent: 1.72,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '8', name: 'ABSA Bank Kenya', symbol: 'ABSA', sector: 'Banking',
      description: 'ABSA Bank Kenya PLC — formerly Barclays Bank of Kenya',
      website: 'https://www.absabank.co.ke', listedDate: '1986-01-01',
      stockPrice: 13.90, marketCap: 75700000000, volume: 3800000,
      change: -0.20, changePercent: -1.42,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '9', name: 'NCBA Group', symbol: 'NCBA', sector: 'Banking',
      description: 'NCBA Group PLC — formed by merger of NIC Bank and CBA',
      website: 'https://www.ncbagroup.com', listedDate: '2019-10-01',
      stockPrice: 44.50, marketCap: 73200000000, volume: 520000,
      change: 0.75, changePercent: 1.71,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '10', name: 'Kenya Power', symbol: 'KPLC', sector: 'Energy',
      description: 'Kenya Power and Lighting Company — sole electricity distributor',
      website: 'https://www.kplc.co.ke', listedDate: '1972-01-01',
      stockPrice: 3.20, marketCap: 6240000000, volume: 12000000,
      change: 0.05, changePercent: 1.59,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '11', name: 'KenGen', symbol: 'KEGN', sector: 'Energy',
      description: 'Kenya Electricity Generating Company — largest power producer',
      website: 'https://www.kengen.co.ke', listedDate: '2006-05-10',
      stockPrice: 4.85, marketCap: 31890000000, volume: 2800000,
      change: 0.05, changePercent: 1.04,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '12', name: 'Bamburi Cement', symbol: 'BAMB', sector: 'Construction',
      description: 'Bamburi Cement PLC — leading cement manufacturer in East Africa',
      website: 'https://www.lafargeholcim.co.ke', listedDate: '1970-01-01',
      stockPrice: 28.50, marketCap: 10340000000, volume: 450000,
      change: -0.50, changePercent: -1.72,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '13', name: 'ScanGroup', symbol: 'SCAN', sector: 'Commercial & Services',
      description: 'WPP-Scangroup PLC — largest marketing communications company in Africa',
      website: 'https://www.wpp-scangroup.com', listedDate: '2006-01-01',
      stockPrice: 8.50, marketCap: 3230000000, volume: 150000,
      change: 0.10, changePercent: 1.19,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '14', name: 'Jubilee Holdings', symbol: 'JUB', sector: 'Insurance',
      description: 'Jubilee Holdings Limited — largest insurance group in East Africa',
      website: 'https://www.jubileeholdings.com', listedDate: '1984-01-01',
      stockPrice: 185.00, marketCap: 13320000000, volume: 32000,
      change: 3.00, changePercent: 1.65,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '15', name: 'Britam Holdings', symbol: 'BRIT', sector: 'Insurance',
      description: 'Britam Holdings PLC — diversified financial services group',
      website: 'https://www.britam.com', listedDate: '2010-01-01',
      stockPrice: 6.20, marketCap: 14880000000, volume: 1800000,
      change: 0.10, changePercent: 1.64,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '16', name: 'FinTech Africa Ltd', symbol: 'FTAF', sector: 'Technology',
      description: 'FinTech Africa — leading fintech solutions provider benefiting from new CMA listing rules',
      website: 'https://www.fintechafrica.co.ke', listedDate: '2025-06-15',
      stockPrice: 22.80, marketCap: 11400000000, volume: 9500000,
      change: 2.30, changePercent: 11.22,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: true,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '17', name: 'M-Pay Holdings', symbol: 'MPAY', sector: 'Technology',
      description: 'M-Pay Holdings — mobile payments and digital financial services',
      website: 'https://www.mpayholdings.co.ke', listedDate: '2025-09-01',
      stockPrice: 15.60, marketCap: 7800000000, volume: 7200000,
      change: 1.40, changePercent: 9.86,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: true,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '18', name: 'TotalEnergies Kenya', symbol: 'TOTL', sector: 'Energy',
      description: 'TotalEnergies Marketing Kenya PLC — petroleum products distribution',
      website: 'https://www.totalenergies.co.ke', listedDate: '1988-01-01',
      stockPrice: 21.75, marketCap: 7900000000, volume: 350000,
      change: 0.25, changePercent: 1.16,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '19', name: 'CIC Insurance Group', symbol: 'CGEN', sector: 'Insurance',
      description: 'CIC Insurance Group — composite insurer serving cooperatives and retail market',
      website: 'https://www.cic.co.ke', listedDate: '2012-01-01',
      stockPrice: 2.10, marketCap: 5480000000, volume: 5600000,
      change: 0.02, changePercent: 0.96,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
    {
      id: '20', name: 'Diamond Trust Bank', symbol: 'DTK', sector: 'Banking',
      description: 'Diamond Trust Bank Kenya — regional banking group',
      website: 'https://www.dtbafrica.com', listedDate: '1972-01-01',
      stockPrice: 52.00, marketCap: 14560000000, volume: 85000,
      change: 0.50, changePercent: 0.97,
      lastUpdated: new Date().toISOString(), isActive: true, hasRegulatoryFlag: false,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    },
  ];

  async findAll(page = 1, limit = 50) {
    const start = (page - 1) * limit;
    const items = this.companies.slice(start, start + limit);
    return {
      data: items,
      total: this.companies.length,
      page,
      limit,
      totalPages: Math.ceil(this.companies.length / limit),
    };
  }

  async findOne(id: string) {
    const company = this.companies.find(c => c.id === id);
    if (!company) {
      throw new NotFoundException(`Company ${id} not found`);
    }
    return company;
  }

  async findBySymbol(symbol: string) {
    const company = this.companies.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());
    if (!company) {
      throw new NotFoundException(`Company with symbol ${symbol} not found`);
    }
    return company;
  }

  async findBySector(sector: string) {
    return this.companies.filter(c => c.sector.toLowerCase() === sector.toLowerCase());
  }

  async search(query: string) {
    const lowerQuery = query.toLowerCase();
    return this.companies.filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.symbol.toLowerCase().includes(lowerQuery) ||
      c.sector.toLowerCase().includes(lowerQuery) ||
      (c.description && c.description.toLowerCase().includes(lowerQuery))
    );
  }

  async getTopGainers(limit = 10) {
    return this.companies
      .filter(c => c.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, limit);
  }

  async getTopLosers(limit = 10) {
    return this.companies
      .filter(c => c.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, limit);
  }

  async getMostActive(limit = 10) {
    return this.companies
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
  }

  async getSectors() {
    const sectorMap: Record<string, { count: number; totalMarketCap: number; companies: string[] }> = {};
    for (const c of this.companies) {
      if (!sectorMap[c.sector]) {
        sectorMap[c.sector] = { count: 0, totalMarketCap: 0, companies: [] };
      }
      sectorMap[c.sector].count++;
      sectorMap[c.sector].totalMarketCap += c.marketCap;
      sectorMap[c.sector].companies.push(c.symbol);
    }
    return Object.entries(sectorMap).map(([name, data]) => ({
      name,
      ...data,
    }));
  }

  async getMarketStats() {
    const totalMarketCap = this.companies.reduce((sum, c) => sum + c.marketCap, 0);
    const totalVolume = this.companies.reduce((sum, c) => sum + c.volume, 0);
    const gainers = this.companies.filter(c => c.changePercent > 0).length;
    const losers = this.companies.filter(c => c.changePercent < 0).length;
    const unchanged = this.companies.filter(c => c.changePercent === 0).length;

    return {
      totalMarketCap,
      totalVolume,
      totalCompanies: this.companies.length,
      gainers,
      losers,
      unchanged,
      marketSentiment: gainers > losers ? 'bullish' : gainers < losers ? 'bearish' : 'neutral',
      flaggedCompanies: this.companies.filter(c => c.hasRegulatoryFlag).length,
    };
  }

  async getFlaggedCompanies() {
    return this.companies.filter(c => c.hasRegulatoryFlag);
  }
}
