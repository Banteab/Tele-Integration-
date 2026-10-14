import { Bus, PassengerInfo, SearchParams } from '../types';

export const MAX_SEATS_PER_BOOKING = 10;

function splitName(fullName: string) {
  const parts = (fullName || '').trim().split(/\s+/);
  if (parts.length === 0) {
    return { firstName: '', middleName: '', lastName: '' };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], middleName: '', lastName: '' };
  }
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}

function formatRouteScheduleDate(dateStr?: string) {
  if (!dateStr) return new Date().toISOString();
  const parsed = new Date(`${dateStr}T08:00:00`);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

function parseOptionalInt(value?: string | number) {
  if (value === '' || value === null || value === undefined) return undefined;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function buildTicketPayload(
  bus: Bus,
  searchParams: SearchParams,
  passengerInfo: PassengerInfo,
  selectedSeats: string[],
  paymentRefNumber: string,
) {
  const seatLayout = bus.seatLayout || [];

  const ticketDetail = selectedSeats.map((seatName, index) => {
    const seat = seatLayout.find((s) => s.name === seatName);
    const passenger = passengerInfo.passengers[index] ?? passengerInfo.passengers[0];
    const names = splitName(passenger?.fullName || '');
    const detail: Record<string, unknown> = {
      firstName: names.firstName,
      middleName: names.middleName,
      lastName: names.lastName,
      phoneNumber: passengerInfo.phone,
      seatLayout: seat?.id ?? 0,
      grandTotal: bus.price,
    };

    if (passenger?.email?.trim()) detail.email = passenger.email.trim();
    if (passenger?.dob?.trim()) {
      const dob = new Date(passenger.dob);
      if (!Number.isNaN(dob.getTime())) detail.dob = dob.toISOString();
    }
    const gender = parseOptionalInt(passenger?.gender);
    if (gender !== undefined) detail.gender = gender;
    const age = parseOptionalInt(passenger?.age);
    if (age !== undefined) detail.age = age;
    const maritalStatus = parseOptionalInt(passenger?.maritalStatus);
    if (maritalStatus !== undefined) detail.maritalStatus = maritalStatus;

    return detail;
  });

  const paymentAmount = bus.price * selectedSeats.length;

  return {
    operator: bus.operatorId || 8,
    routeSchedule: Number(bus.scheduleId) || 0,
    routeScheduleDate: formatRouteScheduleDate(searchParams.date),
    paymentMethod: 144,
    paymentProcessor: 111,
    payer: passengerInfo.phone,
    paymentRefNumber,
    paymentAmount,
    paymentIssueDate: new Date().toISOString(),
    paymentStatus: 86,
    platform: 'MiniApp',
    ticketDetail,
  };
}
