export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; message: string; error: unknown };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
