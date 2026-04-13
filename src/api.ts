import { BookingRequest, BookingResponse, Car, ReturnRequest, ReturnResponse } from './types';
import { fetchCars as fetchMockCars, createBooking as createMockBooking, returnBooking as returnMockBooking } from './mockApi';

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';
const BASE_URL = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }
  return response.json();
}

export async function fetchCars(): Promise<Car[]> {
  if (USE_MOCK_API) {
    return fetchMockCars();
  }

  const data = await fetchJson<{ success: boolean; message: string; cars: Car[] }>(`${BASE_URL}/cars`);
  if (!data.success) {
    throw new Error(data.message || 'Failed to load vehicles');
  }
  return data.cars;
}

export async function createBooking(body: BookingRequest): Promise<BookingResponse> {
  if (USE_MOCK_API) {
    return createMockBooking(body);
  }
  return fetchJson<BookingResponse>(`${BASE_URL}/booking`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function returnBooking(bookingNumber: number, body: ReturnRequest): Promise<ReturnResponse> {
  if (USE_MOCK_API) {
    return returnMockBooking(bookingNumber, body);
  }
  return fetchJson<ReturnResponse>(`${BASE_URL}/return/${bookingNumber}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
