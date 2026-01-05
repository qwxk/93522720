
export enum SubscriptionType {
  INDIVIDUAL = 'فرد',
  COMPANY = 'شركة'
}

export enum TransactionType {
  TRANSFER = 'تحويل',
  RECEIVE = 'استلام',
  QR_PAY = 'دفع عبر QR'
}

export enum TransactionStatus {
  COMPLETED = 'مكتملة',
  REJECTED = 'مرفوضة'
}

export interface SurveyEntry {
  id: string;
  subscriptionType: SubscriptionType;
  transactionType: TransactionType;
  amount: number;
  bankName: string;
  status: TransactionStatus;
  rejectionReason?: string;
  createdAt: string;
}

export interface BankStats {
  name: string;
  count: number;
  successRate: number;
}
