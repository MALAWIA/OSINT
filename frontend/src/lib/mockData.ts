// Mock data for dashboard when backend is not available

export const mockNewsArticles = [
  {
    id: '1',
    title: 'Safaricom Reports Strong Q3 Earnings',
    summary: 'Safaricom PLC announced impressive third quarter results with revenue growth of 12% year-over-year.',
    content: 'Safaricom PLC announced impressive third quarter results with revenue growth of 12% year-over-year, driven by strong performance in mobile money and data services.',
    source: 'Business Daily',
    publishedAt: '2024-02-11T10:30:00Z',
    sentiment: 'positive',
    companyId: 'scom',
    companyName: 'Safaricom PLC',
    url: 'https://www.businessdailyafrica.com/safaricom-q3-earnings'
  },
  {
    id: '2',
    title: 'KCB Group Launches Digital Banking Platform',
    summary: 'KCB Group has unveiled a new digital banking platform aimed at enhancing customer experience.',
    content: 'KCB Group has unveiled a new digital banking platform aimed at enhancing customer experience through innovative features and seamless integration.',
    source: 'Nation',
    publishedAt: '2024-02-11T09:15:00Z',
    sentiment: 'positive',
    companyId: 'kcb',
    companyName: 'KCB Group',
    url: 'https://nation.africa/kcb-digital-platform'
  },
  {
    id: '3',
    title: 'Equity Group Expands Regional Presence',
    summary: 'Equity Group announces expansion into three new African markets.',
    content: 'Equity Group announces expansion into three new African markets as part of its regional growth strategy.',
    source: 'Capital FM',
    publishedAt: '2024-02-11T08:45:00Z',
    sentiment: 'neutral',
    companyId: 'eqty',
    companyName: 'Equity Group Holdings',
    url: 'https://www.capitalfm.co.ke/equity-expansion'
  }
];

export const mockCompanies = [
  {
    id: 'scom',
    name: 'Safaricom PLC',
    ticker: 'SCOM',
    sector: 'Telecommunications',
    description: 'Leading telecommunications company in Kenya',
    website: 'https://www.safaricom.co.ke',
    sentiment: 0.65,
    newsCount: 45,
    lastUpdated: '2024-02-11T10:30:00Z'
  },
  {
    id: 'kcb',
    name: 'KCB Group',
    ticker: 'KCB',
    sector: 'Banking',
    description: 'One of the largest banking groups in East Africa',
    website: 'https://www.kcbgroup.com',
    sentiment: 0.42,
    newsCount: 32,
    lastUpdated: '2024-02-11T09:15:00Z'
  },
  {
    id: 'eqty',
    name: 'Equity Group Holdings',
    ticker: 'EQTY',
    sector: 'Banking',
    description: 'Leading banking group with pan-African presence',
    website: 'https://www.equitygroup.com',
    sentiment: 0.38,
    newsCount: 28,
    lastUpdated: '2024-02-11T08:45:00Z'
  },
  {
    id: 'eabl',
    name: 'East African Breweries',
    ticker: 'EABL',
    sector: 'Beverages',
    description: 'Leading beverage manufacturer in East Africa',
    website: 'https://www.eabl.com',
    sentiment: 0.51,
    newsCount: 22,
    lastUpdated: '2024-02-11T07:20:00Z'
  },
  {
    id: 'coop',
    name: 'Co-operative Bank',
    ticker: 'COOP',
    sector: 'Banking',
    description: 'Major Kenyan bank with strong cooperative roots',
    website: 'https://www.co-opbank.co.ke',
    sentiment: 0.44,
    newsCount: 19,
    lastUpdated: '2024-02-11T06:10:00Z'
  }
];

export const mockSentimentData = {
  overall: 0.48,
  positive: 45,
  neutral: 35,
  negative: 20,
  timeline: [
    { date: '2024-02-05', sentiment: 0.42 },
    { date: '2024-02-06', sentiment: 0.45 },
    { date: '2024-02-07', sentiment: 0.48 },
    { date: '2024-02-08', sentiment: 0.51 },
    { date: '2024-02-09', sentiment: 0.46 },
    { date: '2024-02-10', sentiment: 0.49 },
    { date: '2024-02-11', sentiment: 0.48 }
  ]
};
