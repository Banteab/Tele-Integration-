import React, { useState, useEffect, useRef } from "react";
import SeatPicker from "react-seat-picker";
import { ApiUrl, AuthApiKey } from "../config/api_url";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const SEAT_VALIDITY_DURATION = 2 * 60 * 1000;
const POLLING_INTERVAL = 1000;
const MAX_SEATS = 6;

export default function SeatStructure(props) {
  const [allOccupiedSeats, setAllOccupiedSeats] = useState([]);
  const [userSelectedSeats, setUserSelectedSeats] = useState(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const [seatPickerKey, setSeatPickerKey] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const token = localStorage.getItem("liyu_login_token");
  const isMounted = useRef(true);
  const intervalRef = useRef(null);
  const timersRef = useRef(new Map());
  const tripId = props.selectedBus.id;

  const STORAGE_KEY = `selected_seats_${tripId}`;

  // Initialize from localStorage first
  useEffect(() => {
    const initializeSeats = async () => {
      try {
        const validSeats = new Map();
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);

          for (const [seatId, data] of parsed) {
            const elapsed = Date.now() - data.timestamp;
            const remaining = SEAT_VALIDITY_DURATION - elapsed;

            if (remaining > 0) {
              validSeats.set(seatId, data);
              startTimer(seatId, data.bookingId, remaining);
              props.addSeat(seatId, data.bookingId);
            } else {
              // Seat expired, remove from server
              await removeFromServer(seatId, data.bookingId);
            }
          }

          setUserSelectedSeats(validSeats);
        }

        // Initialize with original booked/blocked seats but exclude user's seats
        const userSeatIds = Array.from(validSeats.keys());
        const initialOccupied = props.selectedBus.bookedSeats
          .concat(props.selectedBus.blockedSeats)
          .filter((seatId) => !userSeatIds.includes(seatId));

        setAllOccupiedSeats(initialOccupied);
        setIsInitialized(true);

        // Force SeatPicker to re-render with correct initial state
        setSeatPickerKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error loading from localStorage:", error);
        localStorage.removeItem(STORAGE_KEY);
        setAllOccupiedSeats(
          props.selectedBus.bookedSeats.concat(props.selectedBus.blockedSeats)
        );
        setIsInitialized(true);
      }
    };

    initializeSeats();

    return () => {
      isMounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Save to localStorage when userSelectedSeats changes
  useEffect(() => {
    if (isInitialized) {
      if (userSelectedSeats.size > 0) {
        const toSave = Array.from(userSelectedSeats.entries());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [userSelectedSeats, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    const fetchSeats = async () => {
      try {
        const response = await axios.get(
          `${ApiUrl}/trips/formatted-seats/${tripId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              ...(AuthApiKey ? { "x-api-key": AuthApiKey } : {}),
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200 && isMounted.current) {
          const serverSeats = response.data || [];
          // Always filter out user's own selected seats
          const userSeatIds = Array.from(userSelectedSeats.keys());
          const otherOccupied = serverSeats.filter(
            (seatId) => !userSeatIds.includes(seatId)
          );

          setAllOccupiedSeats((prev) => {
            const prevSet = new Set(prev);
            const newSet = new Set(otherOccupied);

            if (
              prevSet.size !== newSet.size ||
              [...prevSet].some((id) => !newSet.has(id)) ||
              [...newSet].some((id) => !prevSet.has(id))
            ) {
              return otherOccupied;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Seat polling error:", err);
      }
    };

    // Small delay to ensure userSelectedSeats is properly set
    const timeoutId = setTimeout(() => {
      fetchSeats(); // Initial fetch
      intervalRef.current = setInterval(fetchSeats, POLLING_INTERVAL);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tripId, token, isInitialized]); // Removed userSelectedSeats from dependencies to prevent constant re-creation

  const startTimer = (seatId, bookingId, duration = SEAT_VALIDITY_DURATION) => {
    if (timersRef.current.has(seatId)) {
      clearTimeout(timersRef.current.get(seatId));
    }

    const timer = setTimeout(() => {
      autoRemoveSeat(seatId, bookingId);
    }, duration);

    timersRef.current.set(seatId, timer);
  };

  const removeFromServer = async (seatId, bookingId) => {
    try {
      await axios.put(
        `${ApiUrl}/booking/remove-seat/${seatId}/booking/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(AuthApiKey ? { "x-api-key": AuthApiKey } : {}),
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      console.error("Error removing from server:", err);
    }
  };

  const autoRemoveSeat = async (seatId, bookingId) => {
    if (!isMounted.current) return;

    await removeFromServer(seatId, bookingId);

    // Clear timer first
    if (timersRef.current.has(seatId)) {
      clearTimeout(timersRef.current.get(seatId));
      timersRef.current.delete(seatId);
    }

    // Update user selected seats
    setUserSelectedSeats((prev) => {
      const next = new Map(prev);
      next.delete(seatId);
      return next;
    });

    // Make sure the seat doesn't appear in allOccupiedSeats
    setAllOccupiedSeats((prev) => prev.filter((id) => id !== seatId));

    // Update parent
    props.removeSeat(seatId);

    // Force SeatPicker to re-render to update visual state
    setSeatPickerKey((prev) => prev + 1);

    setSnackbar({
      open: true,
      severity: "warning",
      message: `Seat ${seatId} expired and was automatically released.`,
    });
  };

  const buildRows = () => {
    if (!isInitialized) {
      // Show initial state while loading
      let num = 0;
      return props.selectedBus.busStructureName.split(",").map((rowPattern) => {
        return rowPattern.split("").map((position) => {
          if (position === "p") {
            num++;
            const isInitiallyOccupied = props.selectedBus.bookedSeats
              .concat(props.selectedBus.blockedSeats)
              .includes(num);
            return {
              id: num,
              number: num,
              isReserved: isInitiallyOccupied,
              isSelected: false,
            };
          }
          return null;
        });
      });
    }

    let num = 0;
    const userSeatIds = Array.from(userSelectedSeats.keys());

    return props.selectedBus.busStructureName.split(",").map((rowPattern) => {
      return rowPattern.split("").map((position) => {
        if (position === "p") {
          num++;
          return {
            id: num,
            number: num,
            isReserved: allOccupiedSeats.includes(num),
            isSelected: userSeatIds.includes(num),
          };
        }
        return null;
      });
    });
  };

  const handleAddSeat = async ({ row, number, id }, addCb) => {
    if (userSelectedSeats.size >= MAX_SEATS) {
      setSnackbar({
        open: true,
        severity: "warning",
        message: `Maximum ${MAX_SEATS} seats allowed.`,
      });
      return;
    }

    if (userSelectedSeats.has(id)) return;

    // Check if seat is currently occupied by others
    if (allOccupiedSeats.includes(id)) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "This seat is no longer available.",
      });
      return;
    }

    try {
      const res = await axios.post(
        `${ApiUrl}/booking/add-seat-general`,
        {
          tripId: tripId,
          selectedRoute: props.selectedBus.selectedRoute,
          seat: id.toString(),
          type: "Customer",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(AuthApiKey ? { "x-api-key": AuthApiKey } : {}),
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.status === 400) {
        setSnackbar({
          open: true,
          severity: "error",
          message: res.data.message,
        });
        return;
      }

      if (res.data.success && res.data.data) {
        const bookingId = res.data.data;
        const seatData = {
          bookingId,
          timestamp: Date.now(),
        };

        // Update user selected seats
        setUserSelectedSeats((prev) => new Map(prev.set(id, seatData)));

        // Make sure this seat doesn't appear in occupied seats
        setAllOccupiedSeats((prev) => prev.filter((seatId) => seatId !== id));

        startTimer(id, bookingId);
        props.addSeat(id, bookingId);
        addCb(row, number, id);

        setSnackbar({
          open: true,
          severity: "success",
          message: `Seat ${id} reserved! Valid for 2 minutes.`,
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        severity: "error",
        message: err.response?.data?.message || "Failed to reserve seat",
      });
    }
  };

  const handleRemoveSeat = async ({ row, number, id }, removeCb) => {
    const seatData = userSelectedSeats.get(id);

    if (seatData) {
      await removeFromServer(id, seatData.bookingId);

      // Clear timer
      if (timersRef.current.has(id)) {
        clearTimeout(timersRef.current.get(id));
        timersRef.current.delete(id);
      }
    }

    // Update user selected seats
    setUserSelectedSeats((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });

    // Make sure the seat doesn't appear as occupied
    setAllOccupiedSeats((prev) => prev.filter((seatId) => seatId !== id));

    props.removeSeat(id);
    removeCb(row, number, id);

    setSnackbar({
      open: true,
      severity: "success",
      message: `Seat ${id} released.`,
    });
  };

  return (
    <>
      <SeatPicker
        key={seatPickerKey}
        addSeatCallback={handleAddSeat}
        removeSeatCallback={handleRemoveSeat}
        rows={buildRows()}
        maxReservableSeats={MAX_SEATS}
        alpha
        visible
        selectedByDefault
        loading={false}
        tooltipProps={{ multiline: true }}
        style={{ textAlign: "center" }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </>
  );
}
