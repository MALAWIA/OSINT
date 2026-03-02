import { AlertType } from '../../common/entities/price-alert.entity';
export declare class CreateAlertDto {
    companyId: string;
    alertType: AlertType;
    targetValue: number;
    message?: string;
    notifyPush?: boolean;
    notifyEmail?: boolean;
    notifyInApp?: boolean;
    expiresAt?: string;
}
