import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
export const ok = <T>(data:T, init?:ResponseInit) => NextResponse.json({ data }, init);
export const fail = (code:string, message:string, status=400, details?:unknown) => NextResponse.json({ error:{ code,message,details } }, { status });
export function apiError(error:unknown) { if (error instanceof ZodError) return fail('VALIDATION_ERROR','Please check the highlighted fields.',422,error.flatten().fieldErrors); console.error(error); return fail('INTERNAL_ERROR','We could not complete that request. Please try again.',500); }
