import { Injectable } from '@nestjs/common';

@Injectable()
export class NewsService {
  private newsArticles: any[] = [
    {
      id: '1',
      title: 'CMA Announces Revised Listing Requirements for FinTech Companies',
      summary: 'The Capital Markets Authority has announced revised listing requirements that lower the minimum capital threshold for fintech companies, driving a 3.2% gain in the All-Share Index.',
      content: 'The Capital Markets Authority (CMA) announced revised listing requirements that lower the minimum capital threshold for fintech companies. The announcement drove a 3.2% gain in the NSE All-Share Index on Monday, with technology and renewable-energy stocks leading the surge. FinTech Africa Ltd (FTAF) jumped 11.22% while M-Pay Holdings (MPAY) surged 9.86% in heavy trading volume.',
      source: 'Capital Markets Authority',
      sourceUrl: 'https://www.cma.or.ke',
      publishedAt: new Date('2026-02-08T09:00:00').toISOString(),
      sentiment: { score: 0.75, label: 'positive', confidence: 0.92 },
      companies: ['FTAF', 'MPAY'],
      keywords: ['CMA', 'listing requirements', 'fintech', 'regulatory', 'capital threshold'],
      category: 'regulatory',
      isActive: true,
      createdAt: new Date('2026-02-08T09:00:00').toISOString(),
      updatedAt: new Date('2026-02-08T09:00:00').toISOString(),
    },
    {
      id: '2',
      title: 'NSE All-Share Index Posts 3.2% Gain Led by Tech Stocks',
      summary: 'The Nairobi Stock Exchange posted a strong session with the All-Share Index gaining 3.2%, driven by technology and renewable energy sectors.',
      content: 'The Nairobi Stock Exchange posted a remarkable session on Monday with the All-Share Index gaining 3.2%. Technology stocks led the rally following the CMA announcement of revised listing requirements for fintech companies. The NSE 20-Share Index also rose by 0.67% to close at 1,845.67 points. Total turnover reached KES 2.8 billion with 189 million shares traded.',
      source: 'Business Daily',
      sourceUrl: 'https://www.businessdailyafrica.com',
      publishedAt: new Date('2026-02-08T16:30:00').toISOString(),
      sentiment: { score: 0.65, label: 'positive', confidence: 0.88 },
      companies: ['FTAF', 'MPAY', 'SCOM'],
      keywords: ['NSE', 'All-Share Index', 'technology', 'market rally'],
      category: 'market',
      isActive: true,
      createdAt: new Date('2026-02-08T16:30:00').toISOString(),
      updatedAt: new Date('2026-02-08T16:30:00').toISOString(),
    },
    {
      id: '3',
      title: 'Safaricom Reports Strong Q3 Earnings Driven by M-Pesa Growth',
      summary: 'Safaricom PLC announced impressive Q3 results with revenue growth of 12% year-over-year, driven by M-Pesa transaction volumes.',
      content: 'Safaricom PLC reported strong third-quarter earnings with revenue reaching KES 78.5 billion, representing a 12% increase from the same period last year. The company attributed the growth to increased mobile data usage and M-Pesa transaction volumes which grew 18% to process KES 15.2 trillion in the quarter. The stock rose 0.98% to KES 25.75 on the news.',
      source: 'Business Daily',
      sourceUrl: 'https://www.businessdailyafrica.com',
      publishedAt: new Date('2026-02-09T08:00:00').toISOString(),
      sentiment: { score: 0.70, label: 'positive', confidence: 0.85 },
      companies: ['SCOM'],
      keywords: ['Safaricom', 'earnings', 'revenue', 'growth', 'M-Pesa'],
      category: 'earnings',
      isActive: true,
      createdAt: new Date('2026-02-09T08:00:00').toISOString(),
      updatedAt: new Date('2026-02-09T08:00:00').toISOString(),
    },
    {
      id: '4',
      title: 'KCB Group Launches Digital Banking Platform',
      summary: 'KCB Group has unveiled a new digital banking platform aimed at enhancing customer experience across East Africa.',
      content: 'KCB Group has launched a comprehensive digital banking platform that offers customers seamless access to banking services through mobile and web applications. The platform features AI-powered financial advice and real-time transaction monitoring. The bank expects the platform to reduce operational costs by 15% over the next two years.',
      source: 'Nation Media',
      sourceUrl: 'https://www.nation.africa',
      publishedAt: new Date('2026-02-09T10:00:00').toISOString(),
      sentiment: { score: 0.45, label: 'neutral', confidence: 0.72 },
      companies: ['KCB'],
      keywords: ['KCB', 'digital banking', 'technology', 'innovation'],
      category: 'corporate',
      isActive: true,
      createdAt: new Date('2026-02-09T10:00:00').toISOString(),
      updatedAt: new Date('2026-02-09T10:00:00').toISOString(),
    },
    {
      id: '5',
      title: 'Equity Group Expands Regional Presence with New Markets',
      summary: 'Equity Group announces expansion into three new African markets as part of its regional growth strategy.',
      content: 'Equity Group Holdings has announced plans to expand its operations into three new African markets as part of its regional growth strategy. The expansion will target Uganda, Tanzania, and Rwanda with an initial investment of KES 5.2 billion. The stock dipped 1.52% as investors assessed the capital expenditure implications.',
      source: 'Capital FM',
      sourceUrl: 'https://www.capitalfm.co.ke',
      publishedAt: new Date('2026-02-09T14:00:00').toISOString(),
      sentiment: { score: 0.35, label: 'neutral', confidence: 0.78 },
      companies: ['EQTY'],
      keywords: ['Equity Group', 'expansion', 'regional', 'growth', 'Africa'],
      category: 'corporate',
      isActive: true,
      createdAt: new Date('2026-02-09T14:00:00').toISOString(),
      updatedAt: new Date('2026-02-09T14:00:00').toISOString(),
    },
    {
      id: '6',
      title: 'FinTech Africa Ltd Surges 11% After CMA Rule Changes',
      summary: 'FinTech Africa Ltd leads market gains after CMA lowers listing requirements for fintech companies.',
      content: 'FinTech Africa Ltd (FTAF) surged 11.22% to KES 22.80 in heavy trading volume of 9.5 million shares. The company was a primary beneficiary of the CMA announcement lowering the minimum capital threshold for fintech companies. Analysts at Standard Investment Bank raised their target price to KES 28.00 from KES 20.00, citing improved regulatory environment.',
      source: 'The Standard',
      sourceUrl: 'https://www.standardmedia.co.ke',
      publishedAt: new Date('2026-02-08T14:00:00').toISOString(),
      sentiment: { score: 0.82, label: 'positive', confidence: 0.90 },
      companies: ['FTAF'],
      keywords: ['FinTech Africa', 'CMA', 'surge', 'fintech', 'regulation'],
      category: 'market',
      isActive: true,
      createdAt: new Date('2026-02-08T14:00:00').toISOString(),
      updatedAt: new Date('2026-02-08T14:00:00').toISOString(),
    },
    {
      id: '7',
      title: 'Kenya Power Reports Improved Network Reliability',
      summary: 'Kenya Power announces 15% improvement in grid reliability following KES 12 billion infrastructure investment.',
      content: 'Kenya Power and Lighting Company (KPLC) reported a 15% improvement in network reliability following its KES 12 billion grid modernization program. The company also announced a partnership with KenGen for expanded renewable energy integration. KPLC shares rose 1.59% to KES 3.20.',
      source: 'Star Newspaper',
      sourceUrl: 'https://www.the-star.co.ke',
      publishedAt: new Date('2026-02-10T07:00:00').toISOString(),
      sentiment: { score: 0.55, label: 'positive', confidence: 0.75 },
      companies: ['KPLC', 'KEGN'],
      keywords: ['Kenya Power', 'grid', 'infrastructure', 'renewable energy'],
      category: 'corporate',
      isActive: true,
      createdAt: new Date('2026-02-10T07:00:00').toISOString(),
      updatedAt: new Date('2026-02-10T07:00:00').toISOString(),
    },
    {
      id: '8',
      title: 'M-Pay Holdings Gains 9.86% on CMA Regulatory Tailwinds',
      summary: 'M-Pay Holdings benefits from revised CMA fintech listing requirements with strong volume.',
      content: 'M-Pay Holdings (MPAY) jumped 9.86% to KES 15.60 as the mobile payments company benefited from the CMA announcement on revised fintech listing requirements. Trading volume reached 7.2 million shares, significantly above the 30-day average of 2.1 million. The company recently reported a 45% increase in quarterly transaction volumes.',
      source: 'Business Daily',
      sourceUrl: 'https://www.businessdailyafrica.com',
      publishedAt: new Date('2026-02-09T11:00:00').toISOString(),
      sentiment: { score: 0.78, label: 'positive', confidence: 0.88 },
      companies: ['MPAY'],
      keywords: ['M-Pay', 'mobile payments', 'CMA', 'fintech', 'volume'],
      category: 'market',
      isActive: true,
      createdAt: new Date('2026-02-09T11:00:00').toISOString(),
      updatedAt: new Date('2026-02-09T11:00:00').toISOString(),
    },
    {
      id: '9',
      title: 'Bamburi Cement Faces Headwinds from Rising Input Costs',
      summary: 'Bamburi Cement shares decline as rising energy and raw material costs pressure margins.',
      content: 'Bamburi Cement PLC (BAMB) dropped 1.72% to KES 28.50 as the construction materials company warned about rising input costs. Energy costs have increased 22% year-over-year while raw material costs rose 18%. The company is implementing cost-cutting measures but expects Q1 margins to be under pressure.',
      source: 'Nation Media',
      sourceUrl: 'https://www.nation.africa',
      publishedAt: new Date('2026-02-10T09:30:00').toISOString(),
      sentiment: { score: -0.35, label: 'negative', confidence: 0.80 },
      companies: ['BAMB'],
      keywords: ['Bamburi', 'cement', 'costs', 'margins', 'construction'],
      category: 'earnings',
      isActive: true,
      createdAt: new Date('2026-02-10T09:30:00').toISOString(),
      updatedAt: new Date('2026-02-10T09:30:00').toISOString(),
    },
    {
      id: '10',
      title: 'ABSA Bank Kenya Launches Green Bond Program',
      summary: 'ABSA Bank Kenya introduces KES 10 billion green bond program for sustainable financing.',
      content: 'ABSA Bank Kenya PLC (formerly Barclays Bank of Kenya) has launched a KES 10 billion green bond program aimed at financing sustainable projects in renewable energy, clean transportation, and green buildings. Despite the positive announcement, shares dipped 1.42% to KES 13.90 amid broader market profit-taking in the banking sector.',
      source: 'Financial Times Africa',
      sourceUrl: 'https://www.ft.com/africa',
      publishedAt: new Date('2026-02-10T11:00:00').toISOString(),
      sentiment: { score: 0.30, label: 'neutral', confidence: 0.70 },
      companies: ['ABSA'],
      keywords: ['ABSA', 'green bond', 'sustainable', 'ESG', 'banking'],
      category: 'corporate',
      isActive: true,
      createdAt: new Date('2026-02-10T11:00:00').toISOString(),
      updatedAt: new Date('2026-02-10T11:00:00').toISOString(),
    },
  ];

  async findAll(limit = 50, offset = 0) {
    return this.newsArticles
      .filter(article => article.isActive)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(offset, offset + limit);
  }

  async findOne(id: string) {
    return this.newsArticles.find(article => article.id === id);
  }

  async findByCompany(companyId: string, limit = 20) {
    return this.newsArticles
      .filter(article => article.companies.includes(companyId) && article.isActive)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  async findByKeyword(keyword: string, limit = 20) {
    const lowerKeyword = keyword.toLowerCase();
    return this.newsArticles
      .filter(article =>
        article.isActive && (
          article.title.toLowerCase().includes(lowerKeyword) ||
          article.summary.toLowerCase().includes(lowerKeyword) ||
          article.keywords.some((k: string) => k.toLowerCase().includes(lowerKeyword))
        )
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  async findBySentiment(sentiment: string, limit = 20) {
    return this.newsArticles
      .filter(article => article.isActive && article.sentiment.label === sentiment)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  async findByCategory(category: string, limit = 20) {
    return this.newsArticles
      .filter(article => article.isActive && article.category === category)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  async getLatestNews(limit = 10) {
    return this.newsArticles
      .filter(article => article.isActive)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  async getNewsStats() {
    const activeArticles = this.newsArticles.filter(a => a.isActive);
    const totalArticles = activeArticles.length;
    const positiveSentiment = activeArticles.filter(a => a.sentiment.label === 'positive').length;
    const negativeSentiment = activeArticles.filter(a => a.sentiment.label === 'negative').length;
    const neutralSentiment = activeArticles.filter(a => a.sentiment.label === 'neutral').length;

    const averageSentiment = activeArticles
      .reduce((sum, a) => sum + a.sentiment.score, 0) / totalArticles;

    // Category breakdown
    const categories: Record<string, number> = {};
    for (const article of activeArticles) {
      categories[article.category] = (categories[article.category] || 0) + 1;
    }

    return {
      totalArticles,
      sentimentDistribution: {
        positive: positiveSentiment,
        negative: negativeSentiment,
        neutral: neutralSentiment,
      },
      averageSentiment: Math.round((averageSentiment || 0) * 100) / 100,
      overallSentiment: averageSentiment > 0.1 ? 'positive' : averageSentiment < -0.1 ? 'negative' : 'neutral',
      categoryBreakdown: categories,
    };
  }

  async search(query: string, limit = 20) {
    const lowerQuery = query.toLowerCase();
    return this.newsArticles
      .filter(article =>
        article.isActive && (
          article.title.toLowerCase().includes(lowerQuery) ||
          article.summary.toLowerCase().includes(lowerQuery) ||
          article.content.toLowerCase().includes(lowerQuery) ||
          article.keywords.some((k: string) => k.toLowerCase().includes(lowerQuery))
        )
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
}
