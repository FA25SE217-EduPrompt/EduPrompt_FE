//default response type for the api
export type ErrorPayload = {
    code: string;
    messages: string[]; 
    status: string;    
  };
  
export type BaseResponse<T = unknown> = {
    data: T | null;
    error: ErrorPayload | null;
};
  