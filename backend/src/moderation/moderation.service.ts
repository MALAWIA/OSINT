import { Injectable } from '@nestjs/common';

@Injectable()
export class ModerationService {
  private flags: any[] = [];

  async createFlag(flagData: {
    flaggerId: string;
    messageId?: string;
    reason: 'spam' | 'inappropriate' | 'financial_advice' | 'misinformation' | 'harassment' | 'other';
    description?: string;
  }) {
    const flag = {
      id: String(this.flags.length + 1),
      ...flagData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.flags.push(flag);
    return flag;
  }

  async getPendingFlags() {
    return this.flags
      .filter(f => f.status === 'pending')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async reviewFlag(flagId: string, moderatorId: string, status: 'reviewed' | 'resolved' | 'dismissed', notes?: string) {
    const flag = this.flags.find(f => f.id === flagId);
    if (flag) {
      flag.moderatorId = moderatorId;
      flag.status = status;
      flag.moderatorNotes = notes;
      flag.reviewedAt = new Date().toISOString();
    }
  }

  async getFlaggedContent(limit = 50) {
    return this.flags
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getModerationStats(hours = 24) {
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const recentFlags = this.flags.filter(f => new Date(f.createdAt) >= timeThreshold);
    const totalFlags = recentFlags.length;
    const pendingFlags = recentFlags.filter(f => f.status === 'pending').length;
    const resolvedFlags = recentFlags.filter(f => f.status === 'resolved').length;

    return {
      totalFlags,
      pendingFlags,
      resolvedFlags,
      resolutionRate: totalFlags > 0 ? (resolvedFlags / totalFlags) * 100 : 0,
    };
  }
}
