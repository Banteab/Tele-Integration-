import { useState, useEffect } from "react";
import axios from "axios";
import Countdown from "react-countdown";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Snackbar from "@mui/material/Snackbar";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

import { ApiUrl } from "../config/api_url";
import NavBar from "../components/navBar";
import Stepper from "../components/stepper";

const BookingStatus = {
  ACTIVE: "ACTIVE",
  SEAT_ADDED: "SEAT_ADDED",
  BOOKED: "BOOKED",
  CANCELLED: "CANCELLED",
};

// Simple debounce function
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Simple date formatting
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US");
}

export default function DownloadTicketPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [isError, setIsError] = useState({ value: false, message: "" });
  const [query, setQuery] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    booking: null,
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const token = localStorage.getItem("liyu_login_token");

  useEffect(() => {
    fetchBooking();
  }, [query]);

  const fetchBooking = async () => {
    setIsLoading(true);
    setIsError({ value: false, message: "" });

    try {
      const response = await axios.get(
        `${ApiUrl}/booking/search-by-reference/${query || "-1"}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(
        response.data.map((booking) => ({
          ...booking,
          selectedRoute: JSON.parse(booking.selectedRoute),
        }))
      );
    } catch (error) {
      setBookings([]);
      setIsError({
        value: true,
        message: "Failed to fetch bookings",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced input handling
  const debouncedSearch = debounce((searchQuery) => {
    setQuery(searchQuery);
  }, 500);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleIssueTicketClick = (booking) => {
    setConfirmDialog({ open: true, booking });
  };

  const issueTicket = async () => {
    if (!confirmDialog.booking) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${ApiUrl}/tickets/call-center/generate`,
        {
          bookingId: confirmDialog.booking.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { data } = response;

      if (data.success) {
        setNotification({
          open: true,
          message: "Ticket issued successfully!",
          severity: "success",
        });
        fetchBooking();
      } else {
        setNotification({
          open: true,
          message: data.message || "Failed to issue ticket",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: "Failed to issue ticket",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
      setConfirmDialog({ open: false, booking: null });
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const columns = [
    { field: "refNumber", headerName: "Reference Number", width: 180 },
    { field: "passengers", headerName: "Passenger Name", width: 200 },
    { field: "phoneNumber", headerName: "Phone", width: 150 },
    {
      field: "travelDate",
      headerName: "Travel Date",
      width: 150,
      renderCell: (params) => formatDate(params.row.trip?.travelDate),
    },
    {
      field: "from",
      headerName: "From",
      width: 150,
      renderCell: (params) => params.row.selectedRoute?.from || "",
    },
    {
      field: "to",
      headerName: "To",
      width: 150,
      renderCell: (params) => params.row.selectedRoute?.to || "",
    },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      renderCell: (params) =>
        formatNumber(params.row.selectedRoute?.price || 0),
    },
    {
      field: "countdown",
      headerName: "Countdown",
      width: 150,
      renderCell: (params) => {
        const firstSeatTime = new Date(params.row.firstSeatReserved);
        const countdownDate = new Date(
          firstSeatTime.getTime() + 45 * 60 * 1000
        );

        return (
          <Countdown
            date={countdownDate}
            renderer={({ minutes, seconds, completed }) =>
              completed ? (
                <span style={{ color: "red" }}>Expired</span>
              ) : (
                <span style={{ color: "red" }}>
                  {String(minutes).padStart(2, "0")}:
                  {String(seconds).padStart(2, "0")}
                </span>
              )
            }
          />
        );
      },
    },
    {
      field: "statusAction",
      headerName: "Action",
      width: 200,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const booking = params.row;

        if (booking.status === BookingStatus.ACTIVE) {
          return (
            <Chip
              label="Booking not confirmed"
              color="warning"
              size="small"
              variant="outlined"
            />
          );
        }

        if (booking.status === BookingStatus.SEAT_ADDED) {
          return (
            <Button
              variant="outlined"
              size="small"
              startIcon={<CheckIcon />}
              disabled={isLoading}
              onClick={() => handleIssueTicketClick(booking)}
            >
              Issue Ticket
            </Button>
          );
        }

        if (booking.status === BookingStatus.BOOKED) {
          return (
            <Chip
              label="BOOKED"
              color="success"
              size="small"
              variant="outlined"
            />
          );
        }

        if (booking.status === BookingStatus.CANCELLED) {
          return (
            <Chip
              label="CANCELLED"
              color="error"
              size="small"
              variant="outlined"
            />
          );
        }

        return <Chip label={booking.status} size="small" variant="outlined" />;
      },
    },
  ];

  return (
    <>
      <NavBar />
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1100,
          bgcolor: "white",
          pb: 1,
          px: 10,
        }}
      >
        {" "}
        <Stack spacing={4} mt={10} mb={5}>
          <Stepper activeStep={4} />

          <Typography variant="h4" component="h1" gutterBottom>
            Manual Ticket Issuing
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search bookings (reference / phone / name)"
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {isError.value && <Alert severity="error">{isError.message}</Alert>}

          {!isLoading && bookings.length === 0 && query && (
            <Typography
              variant="h6"
              component="p"
              color="text.secondary"
              gutterBottom
            >
              No bookings found
            </Typography>
          )}

          <Box sx={{ height: "75vh", width: "100%" }}>
            <DataGrid
              rows={bookings}
              columns={columns}
              loading={isLoading}
              disableColumnFilter
              disableColumnSelector
              disableDensitySelector
            />
          </Box>
        </Stack>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, booking: null })}
      >
        <DialogTitle>Confirm Ticket Issuance</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to issue a ticket for{" "}
            <strong>{confirmDialog.booking?.passengers}</strong> with reference{" "}
            <strong>{confirmDialog.booking?.refNumber}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, booking: null })}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={issueTicket}
            disabled={isLoading}
            variant="contained"
          >
            {isLoading ? "Issuing..." : "Issue Ticket"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}
