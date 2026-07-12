export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function successResponse<T>(message: string, data?: T, meta?: ApiResponse['meta']): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta,
  };
}

export function errorResponse(message: string, errors?: any): ApiResponse {
  return {
    success: false,
    message,
    errors,
  };
}
