export interface QuotaResponse {
    userId: string;
    testingQuotaLimit: number;
    testingQuotaRemaining: number;
    optimizationQuotaLimit: number;
    optimizationQuotaRemaining: number;
    individualTokenLimit: number;
    individualTokenRemaining: number;
    promptActionLimit: number;
    promptActionRemaining: number;
    collectionActionLimit: number;
    collectionActionRemaining: number;
}
