export enum VNPayResponseCode {
    SUCCESS = "00",
    SUSPICIOUS = "07",
    NOT_REGISTERED = "09",
    AUTH_FAILED_3_TIMES = "10",
    EXPIRED = "11",
    ACCOUNT_LOCKED = "12",
    WRONG_OTP = "13",
    USER_CANCELLED = "24",
    INSUFFICIENT_FUNDS = "51",
    DAILY_LIMIT_EXCEEDED = "65",
    BANK_MAINTENANCE = "75",
    WRONG_PASSWORD_TOO_MANY = "79",
    OTHER_ERROR = "99"
}

export type VerifyPaymentRequest = {
    paymentId: string;
};

export type VerifyPaymentResponse = {
    status: string;
    message: string;
    transactionId?: string;
};
