import { AlertType, AlertStatus } from '../../common/entities/price-alert.entity';
export declare class UpdateAlertDto {
    alertType?: AlertType;
    targetValue?: number;
    message?: string;
    notifyPush?: boolean;
    notifyEmail?: boolean;
    notifyInApp?: boolean;
    status?: AlertStatus;
    expiresAt?: string;
}
