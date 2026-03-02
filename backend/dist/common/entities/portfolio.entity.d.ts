import { User } from './user.entity';
import { PortfolioHolding } from './portfolio-holding.entity';
export declare class Portfolio {
    id: string;
    userId: string;
    name: string;
    description: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    holdings: PortfolioHolding[];
}
