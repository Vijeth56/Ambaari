export type SaveTransactionResponse = {
  error: boolean;
  msg: string;
  eventId?: number;
  transaction?: object;
  transactionId?: number;
};
