import { BookingRequest, BookingResponse, Car, ReturnRequest, ReturnResponse } from './types';
import { calculatePrices, getStartedDays } from './utils/pricing';

const mockCars: Car[] = [
  { id: 1, category: 'Småbil', dayPrice: 320, kmPrice: 1.8, premiumFee: 0 },
  { id: 2, category: 'Småbil', dayPrice: 340, kmPrice: 1.9, premiumFee: 0 },
  { id: 3, category: 'Elbil', dayPrice: 430, kmPrice: 1.5, premiumFee: 0 },
  { id: 4, category: 'Elbil', dayPrice: 470, kmPrice: 1.4, premiumFee: 0 },
  { id: 5, category: 'Van', dayPrice: 620, kmPrice: 2.2, premiumFee: 0 },
  { id: 6, category: 'Van', dayPrice: 650, kmPrice: 2.0, premiumFee: 0 },
  { id: 7, category: 'Minibuss', dayPrice: 790, kmPrice: 2.5, premiumFee: 0 },
  { id: 8, category: 'Minibuss', dayPrice: 820, kmPrice: 2.3, premiumFee: 0 },
  { id: 9, category: 'Premium', dayPrice: 1120, kmPrice: 3.5, premiumFee: 260 },
  { id: 10, category: 'Premium', dayPrice: 1240, kmPrice: 3.8, premiumFee: 295 },
  { id: 11, category: 'Småbil', dayPrice: 330, kmPrice: 1.7, premiumFee: 0 },
  { id: 12, category: 'Småbil', dayPrice: 350, kmPrice: 1.85, premiumFee: 0 },
  { id: 13, category: 'Elbil', dayPrice: 460, kmPrice: 1.55, premiumFee: 0 },
  { id: 14, category: 'Elbil', dayPrice: 495, kmPrice: 1.45, premiumFee: 0 },
  { id: 15, category: 'Van', dayPrice: 640, kmPrice: 2.15, premiumFee: 0 },
  { id: 16, category: 'Van', dayPrice: 670, kmPrice: 2.05, premiumFee: 0 },
  { id: 17, category: 'Minibuss', dayPrice: 810, kmPrice: 2.4, premiumFee: 0 },
  { id: 18, category: 'Minibuss', dayPrice: 840, kmPrice: 2.35, premiumFee: 0 },
  { id: 19, category: 'Premium', dayPrice: 1180, kmPrice: 3.6, premiumFee: 275 },
  { id: 20, category: 'Premium', dayPrice: 1300, kmPrice: 4.0, premiumFee: 310 },
];

interface MockBookingRecord {
  bookingNumber: number;
  request: BookingRequest;
  car: Car;
}

const bookingRecords: MockBookingRecord[] = [];
let nextBookingNumber = 1001;

export async function fetchCars(): Promise<Car[]> {
  return new Promise((resolve) => setTimeout(() => resolve(mockCars), 120));
}

export async function createBooking(body: BookingRequest): Promise<BookingResponse> {
  const car = mockCars.find((item) => item.id === body.id);
  if (!car) {
    return { success: false, message: 'Vald bilkategori hittades inte.', bookingNumber: 0 };
  }

  const bookingNumber = nextBookingNumber++;
  bookingRecords.push({ bookingNumber, request: body, car });

  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          success: true,
          message: 'Bokningen har registrerats.',
          bookingNumber,
        }),
      180,
    ),
  );
}

export async function returnBooking(bookingNumber: number, body: ReturnRequest): Promise<ReturnResponse> {
  const record = bookingRecords.find((item) => item.bookingNumber === bookingNumber);
  if (!record) {
    return { success: false, message: 'Bokningen kunde inte hittas.', rentalTime: 0, mileageDifference: 0, basePrice: 0, premiumCost: 0, addonsCost: 0, delayFee: 0, finalPrice: 0 };
  }

  const rentalTime = Math.max(1, getStartedDays(record.request.timeStart, body.actualTimeEnd));
  const mileageDifference = Math.max(0, body.returnMileage - record.request.currentMileage);
  const pricing = calculatePrices(record.car, rentalTime, mileageDifference, record.request.addons, record.request.timeEnd, body.actualTimeEnd);

  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          success: true,
          message: 'Återlämningen har registrerats.',
          rentalTime,
          mileageDifference,
          basePrice: pricing.basePrice,
          premiumCost: pricing.premiumCost,
          addonsCost: pricing.addonsCost,
          delayFee: pricing.delayFee,
          finalPrice: pricing.finalPrice,
        }),
      200,
    ),
  );
}
