export interface SearchParams {
  from: string;
  to: string;
  date: string;
}

export interface Bus {
  id: string;
  operator: string;
  operatorId?: number;
  type: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  // Additional fields from Bank-Portal-2018
  sideNumber?: string;
  from?: string;
  to?: string;
  vehicleId?: string | number;
  scheduleId?: string | number;
  routeId?: string | number;
  // Seat layout data
  seatLayout?: Array<{
    id: number;
    name: string;
    type: string;
    x: number;
    y: number;
  }>;
}

export interface Passenger {
  name: string;
  gender: string;
  age: string;
  idNumber?: string;
  nationalId?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  email?: string;
  dob?: string;
  maritalStatus?: string;
  region?: number;
  city?: number;
  subCity?: number;
  woreda?: string;
  houseNumber?: string;
  specificAddress?: string;
  latitude?: number;
  longitude?: number;
}

export interface PassengerInfo {
  phone: string;
  fullName: string;
  email?: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  idNumber?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  refNumber: string;
  operator: string;
  route: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  seats: string[];
  passengers: string[];
  totalAmount: number;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface Booking {
  id: string;
  scheduleId: string;
  seats: string[];
  passengers: Passenger[];
  phone: string;
  email: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface PaymentOrder {
  id: string;
  bookingId: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed';
  checkoutUrl?: string;
  createdAt: string;
}
