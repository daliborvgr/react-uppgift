export type AddonKey = 'GPS' | 'Baby seat' | 'Extra driver' | 'Insurance';
 
export interface Car {
  id: number;
  category: string;
  dayPrice: number;
  kmPrice: number;
  premiumFee: number;
}
 
export interface BookingRequest {
  personNumber: string;
  id: number;
  timeStart: string ;
  timeEnd: string ;
  currentMileage: number;
  addons: AddonKey[];
}
 
export interface BookingResponse {
  success: boolean;
  message: string;
  bookingNumber: number;
}
 
export interface ReturnRequest {
  actualTimeEnd: string;
  returnMileage: number;
}
 
export interface ReturnResponse {
  success: boolean;
  message: string;
  rentalTime: number;
  mileageDifference: number;
  basePrice: number;
  premiumCost: number;
  addonsCost: number;
  delayFee: number;
  finalPrice: number;
}
 
export interface BookingMetadata {
  bookingNumber: number;
  personNumber: string;
  car: Car;
  timeStart: string;
  timeEnd: string;
  currentMileage: number;
  addons: AddonKey[];
}