import { BookingRequest, BookingResponse, Car, ReturnRequest, ReturnResponse } from './types';
 
const BASE_URL = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';
 
async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const response = await fetch(input, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
    if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
    }
    return response.json();
}
 
export async function fetchCars(): Promise<Car[]> {
    const data = await fetchJson<{ success: boolean; cars: Car[] }>(`${BASE_URL}/cars`);
    return data.cars;
}
 
export async function createBooking(body: BookingRequest): Promise<BookingResponse> {
 
    return fetchJson<BookingResponse>(`${BASE_URL}/booking`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
 
}
 
export async function returnBooking(bookingNumber: number, body: ReturnRequest): Promise<ReturnResponse> {
 
    return fetchJson<ReturnResponse>(`${BASE_URL}/return/${bookingNumber}`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}
