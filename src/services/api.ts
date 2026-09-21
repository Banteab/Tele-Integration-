import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS, getApiKeyHeaders } from '../config/api';

const apiClient = axios.create({
  baseURL: API_CONFIG.baseUrl,
  headers: {
    'Content-Type': 'application/json',
    ...getApiKeyHeaders(),
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(API_CONFIG.authTokenKey);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const telebirrRegister = async (phoneNumber: string, password: string) => {
  const response = await apiClient.post(API_ENDPOINTS.auth.register, {
    phoneNumber,
    password,
  });
  if (response.data?.token) {
    localStorage.setItem(API_CONFIG.authTokenKey, response.data.token);
  }
  return response.data;
};

export const telebirrLogin = async (phoneNumber: string, password: string) => {
  const response = await apiClient.post(API_ENDPOINTS.auth.login, {
    phoneNumber,
    password,
  });
  if (response.data?.token) {
    localStorage.setItem(API_CONFIG.authTokenKey, response.data.token);
  }
  return response.data;
};

/** H5 auto-login: Super App access_token → backend → JWT */
export const telebirrTelebirrLogin = async (accessToken: string) => {
  const response = await apiClient.post(API_ENDPOINTS.auth.telebirr, {
    accessToken,
  });
  if (response.data?.token) {
    localStorage.setItem(API_CONFIG.authTokenKey, response.data.token);
  }
  return response.data;
};

export const telebirrGetCurrentUser = async () => {
  const response = await apiClient.get(API_ENDPOINTS.users.getCurrentUser);
  return response.data;
};

export const getAllRoutes = async () => {
  const response = await apiClient.get(API_ENDPOINTS.tickets.proxy.routes);
  return response.data;
};

export const getSchedulesByRoute = async (
  routeId: string | number,
  date: string,
) => {
  const response = await apiClient.get(API_ENDPOINTS.tickets.proxy.schedules, {
    params: { routeId, date },
  });
  return response.data;
};

export const searchTrips = async (from: string, to: string, date: string) => {
  const allRoutesResponse = await apiClient.get(
    API_ENDPOINTS.tickets.proxy.routes,
  );

  if (!Array.isArray(allRoutesResponse.data)) return [];

  const allRoutes = allRoutesResponse.data.flatMap((origin: any) =>
    (origin.routes || []).map((route: any) => ({
      ...route,
      originCityName: (origin.originCityName || '').trim(),
      originTerminalName: (origin.originTerminalName || '').trim(),
      destinationCityName: (route.destinationCityName || '').trim(),
      destinationTerminalName: (route.destinationTerminalName || '').trim(),
    })),
  );

  const fromValue = from.toLowerCase().trim();
  const toValue = to.toLowerCase().trim();

  let matchedRoutes = allRoutes.filter((route: any) => {
    const originMatch =
      route.originCityName?.toLowerCase() === fromValue ||
      route.originTerminalName?.toLowerCase() === fromValue;
    const destinationMatch =
      route.destinationCityName?.toLowerCase() === toValue ||
      route.destinationTerminalName?.toLowerCase() === toValue;
    return originMatch && destinationMatch;
  });

  if (matchedRoutes.length === 0) {
    matchedRoutes = allRoutes.filter((route: any) => {
      const originMatch =
        route.originCityName?.toLowerCase().includes(fromValue) ||
        route.originTerminalName?.toLowerCase().includes(fromValue);
      const destinationMatch =
        route.destinationCityName?.toLowerCase().includes(toValue) ||
        route.destinationTerminalName?.toLowerCase().includes(toValue);
      return originMatch && destinationMatch;
    });
  }

  if (matchedRoutes.length === 0) return [];

  const routesWithSchedules = await Promise.all(
    matchedRoutes.map((route: any) =>
      getSchedulesByRoute(route.routeId, date)
        .then((schedules) => ({ route, schedules: schedules || [] }))
        .catch(() => ({ route, schedules: [] })),
    ),
  );

  return routesWithSchedules.flatMap(({ route, schedules }: any) =>
    schedules.map((schedule: any) => ({
      id: schedule.id,
      operator: schedule.vehicleOperator || 'Unknown',
      operatorId: schedule.vehicleOperatorId || 8,
      type: schedule.levelDesc || 'Standard',
      departureTime: schedule.departureDate,
      arrivalTime: schedule.arrivalDate,
      price: schedule.tariff || 0,
      totalSeats: schedule.noOfSeat || 0,
      availableSeats: schedule.noOfSeat || 0,
      sideNumber: schedule.sideNumber || schedule.vehiclePlateNumber,
      from: schedule.originTerminalName || route.originCityName || from,
      to: schedule.destinationTerminalName || route.destinationCityName || to,
      vehicleId: schedule.vehicleId,
      scheduleId: schedule.id,
      routeId: schedule.route,
    })),
  );
};

export const getVehicleLayout = async (
  vehicleId: string | number,
  scheduleId: string | number,
) => {
  const response = await apiClient.get(
    API_ENDPOINTS.tickets.proxy.seatLayout(vehicleId, scheduleId),
  );
  return response.data;
};

export const telebirrCreateTicket = async (ticketData: Record<string, unknown>) => {
  const response = await apiClient.post(API_ENDPOINTS.tickets.create, ticketData);
  return response.data;
};

export const getTicketStatus = async (reference: string) => {
  const response = await apiClient.get(API_ENDPOINTS.tickets.getStatus(reference));
  return response.data;
};

export const getTicketHistory = async () => {
  const response = await apiClient.get(API_ENDPOINTS.tickets.getHistory);
  return response.data;
};

export const createPaymentOrder = async (paymentDetails: {
  amount: string;
  title: string;
  merch_order_id: string;
}) => {
  const response = await apiClient.post(API_ENDPOINTS.payment.preorder, {
    title: paymentDetails.title,
    amount: paymentDetails.amount,
    merch_order_id: paymentDetails.merch_order_id,
    extra: { merch_order_id: paymentDetails.merch_order_id },
  });
  return response.data;
};

/** Step 5 — queryOrder fallback when notify not received (payment_flow.txt) */
export const queryPaymentOrder = async (merchOrderId: string) => {
  const response = await apiClient.post(API_ENDPOINTS.payment.queryOrder, {
    merch_order_id: merchOrderId,
  });
  return response.data;
};

export const sanitizePaymentTitle = (title: string) =>
  title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .substring(0, 100);

/** @deprecated use telebirrLogin */
export const userLogin = telebirrLogin;
/** @deprecated use telebirrRegister */
export const userSignup = telebirrRegister;
