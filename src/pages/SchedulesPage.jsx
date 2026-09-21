import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Alert,
  Button,
  TextField,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import NavBar from "../components/navBar";
import { generateGuestToken } from "../services/authService";
import { AuthApiKey, AuthBaseUrl } from "../config/api_url";

export default function SchedulesPage() {
  const history = useHistory();
  const [selectedRouteInfo, setSelectedRouteInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [schedules, setSchedules] = useState(null);
  const [dateAutoLoaded, setDateAutoLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Bus images for carousel
  const busImages = [
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1516528387618-afa90b13e000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1557223562-6c77ef16210f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
  ];

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % busImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [busImages.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + busImages.length) % busImages.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % busImages.length);
  };

  useEffect(() => {
    // Check if route is selected (operator no longer required)
    const routeId = localStorage.getItem("selected_route_id");
    const routeInfo = localStorage.getItem("selected_route_info");
    const storedDate = localStorage.getItem("selected_schedule_date");

    if (!routeId) {
      // Missing route selection, redirect to route search page
      history.push("/");
      return;
    }

    if (routeInfo) {
      setSelectedRouteInfo(JSON.parse(routeInfo));
    }

    // If date is passed from route search page, set it and auto-fetch schedules
    if (storedDate) {
      const dateObj = new Date(storedDate);
      if (!isNaN(dateObj.getTime())) {
        setSelectedDate(dateObj);
        setDateAutoLoaded(true);
        // Auto-fetch schedules after a short delay to ensure state is set
        setTimeout(() => {
          fetchSchedulesWithDate(dateObj);
        }, 100);
      }
    }
  }, [history]);

  const fetchSchedulesWithDate = async (dateToUse) => {
    const routeId = localStorage.getItem("selected_route_id");

    if (!routeId) {
      setError("Missing route selection");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Format date as YYYY-MM-DD (required by API)
      const year = dateToUse.getFullYear();
      const month = String(dateToUse.getMonth() + 1).padStart(2, "0");
      const day = String(dateToUse.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      // Get Bearer token
      let bearerToken = localStorage.getItem("liyu_login_token");
      if (!bearerToken) {
        bearerToken = await generateGuestToken();
      }

      const url = `${AuthBaseUrl}/api/routeschedule/getschedulesbyroute`;
      const params = {
        route: routeId,
        date: formattedDate,
      };

      const response = await axios.get(url, {
        params,
        headers: {
          "x-api-key": AuthApiKey,
          ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        },
      });

      setSchedules(response.data);
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch schedules"
      );
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRoutes = () => {
    // Clear route selection and go back to route search
    localStorage.removeItem("selected_route_id");
    localStorage.removeItem("selected_route_info");
    history.push("/");
  };

  const fetchSchedules = async () => {
    await fetchSchedulesWithDate(selectedDate);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSuccess(false);
    setError(null);
    setSchedules(null);
    setDateAutoLoaded(false); // Clear auto-loaded flag when user changes date
    // Update stored date
    if (newDate) {
      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, "0");
      const day = String(newDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      localStorage.setItem("selected_schedule_date", formattedDate);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
    }).format(amount);
  };

  const handleSelectSchedule = (schedule) => {
    // Store schedule information in localStorage for ticket booking
    localStorage.setItem("selected_schedule_id", String(schedule.id));
    localStorage.setItem(
      "selected_schedule_date",
      schedule.departureDate || ""
    );
    localStorage.setItem(
      "selected_schedule_data",
      JSON.stringify({
        id: schedule.id,
        routeScheduleId: schedule.id,
        departureDate: schedule.departureDate,
        arrivalDate: schedule.arrivalDate,
        tariff: schedule.tariff,
        vehicleId: schedule.vehicleId || schedule.vehicle,
        operatorId: schedule.vehicleOperatorId || null, // Get operator from schedule
      })
    );

    // Navigate to seat layout view with vehicleId and scheduleId
    const params = new URLSearchParams({
      vehicleId: String(schedule.vehicleId ?? schedule.vehicle),
      scheduleId: String(schedule.id),
    });
    history.push(`/seat-layout?${params.toString()}`);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <NavBar />
      
      {/* Hero Section with Bus Background Carousel */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "300px", md: "400px" },
          overflow: "hidden",
        }}
      >
        {/* Carousel Images */}
        {busImages.map((image, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `url('${image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: currentSlide === index ? 1 : 0,
              transition: "opacity 1s ease-in-out",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.4)",
              },
            }}
          />
        ))}

        {/* Navigation Arrows */}
        <IconButton
          onClick={handlePrevSlide}
          sx={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "rgba(255, 255, 255, 0.3)",
            color: "white",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.5)",
            },
          }}
        >
          <ArrowBackIosIcon />
        </IconButton>
        <IconButton
          onClick={handleNextSlide}
          sx={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "rgba(255, 255, 255, 0.3)",
            color: "white",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.5)",
            },
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>

        {/* Carousel Dots */}
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            display: "flex",
            gap: 1,
          }}
        >
          {busImages.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentSlide(index)}
              sx={{
                width: currentSlide === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: currentSlide === index ? "#4caf50" : "rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: currentSlide === index ? "#45a049" : "rgba(255, 255, 255, 0.7)",
                },
              }}
            />
          ))}
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box sx={{ textAlign: "center", color: "white" }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
              Select Schedule
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Choose your preferred departure time
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>

        {selectedRouteInfo && (
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 3,
              bgcolor: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: "#4caf50", fontWeight: "bold" }}>
              Route Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Route:</strong> {selectedRouteInfo.origin} →{" "}
                  {selectedRouteInfo.destination}
                  {selectedRouteInfo.via && ` (via ${selectedRouteInfo.via})`}
                </Typography>
                {selectedRouteInfo.distance && (
                  <Typography variant="body2" color="text.secondary">
                    Distance: <strong>{selectedRouteInfo.distance} km</strong>
                  </Typography>
                )}
              </Grid>
              {dateAutoLoaded && selectedDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Selected Date:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" sx={{ color: "#4caf50" }}>
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        {!dateAutoLoaded && (
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 3,
              bgcolor: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: "#4caf50", fontWeight: "bold" }}>
              Select Date
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                <DesktopDatePicker
                  label="Pick Date"
                  inputFormat="dd/MM/yyyy"
                  value={selectedDate}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} />}
                  minDate={new Date()}
                />
                <Button
                  variant="contained"
                  onClick={fetchSchedules}
                  disabled={loading}
                  sx={{
                    minWidth: 120,
                    bgcolor: "#4caf50",
                    "&:hover": {
                      bgcolor: "#45a049",
                    },
                    fontWeight: "bold",
                  }}
                >
                  {loading ? "Loading..." : "Get Schedules"}
                </Button>
              </Box>
            </LocalizationProvider>
          </Paper>
        )}

        {dateAutoLoaded && (
          <Paper
            elevation={2}
            sx={{
              p: 2,
              mb: 3,
              bgcolor: "white",
              borderRadius: 2,
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Selected Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" sx={{ color: "#4caf50" }}>
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
                <DesktopDatePicker
                  label="Change Date"
                  inputFormat="dd/MM/yyyy"
                  value={selectedDate}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} size="small" />}
                  minDate={new Date()}
                />
              </Box>
            </LocalizationProvider>
          </Paper>
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Fetching schedules...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {schedules && Array.isArray(schedules) && schedules.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: "bold", color: "#4caf50" }}>
              Available Schedules
            </Typography>
            <Grid container spacing={3}>
              {schedules.map((schedule, index) => (
                <Grid item xs={12} key={schedule.id || index}>
                  <Card
                    elevation={2}
                    sx={{
                      p: 2,
                      bgcolor: "white",
                      borderRadius: 2,
                      transition: "box-shadow 0.3s, transform 0.2s",
                      "&:hover": {
                        boxShadow: 4,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="h6" sx={{ color: "#4caf50", fontWeight: "bold", mb: 1 }}>
                            {schedule.routeName || "Route Name"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {schedule.routeDescription || "Route Description"}
                          </Typography>
                        </Box>
                        <Chip
                          label={formatCurrency(schedule.tariff)}
                          sx={{
                            bgcolor: "#4caf50",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            height: "36px",
                          }}
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />


                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            VEHICLE INFO
                          </Typography>
                          <Typography variant="body2">
                            <strong>Operator:</strong>{" "}
                            {schedule.vehicleOperator || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Vehicle:</strong>{" "}
                            {schedule.vehiclePlateNumber || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Side Number:</strong>{" "}
                            {schedule.sideNumber || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Seats:</strong> {schedule.noOfSeat || "N/A"}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            ROUTE DETAILS
                          </Typography>
                          <Typography variant="body2">
                            <strong>Via:</strong>{" "}
                            {schedule.viaDescription || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Distance:</strong>{" "}
                            {schedule.distance
                              ? `${schedule.distance} km`
                              : "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Level:</strong>{" "}
                            {schedule.levelDesc || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Code:</strong> {schedule.code || "N/A"}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            DRIVER INFO
                          </Typography>
                          <Typography variant="body2">
                            <strong>Driver:</strong>{" "}
                            {schedule.driverName || "Not Assigned"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Assistant:</strong>{" "}
                            {schedule.assistantName || "Not Assigned"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Status:</strong>
                            <Chip
                              label={schedule.isActive ? "Active" : "Inactive"}
                              color={schedule.isActive ? "success" : "error"}
                              size="small"
                              sx={{ ml: 1 }}
                            />
                          </Typography>
                        </Grid>
                      </Grid>

                      {schedule.note && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                          >
                            NOTE
                          </Typography>
                          <Typography variant="body2">
                            {schedule.note}
                          </Typography>
                        </>
                      )}

                      <Box sx={{ mt: 3, textAlign: "right" }}>
                        <Button
                          variant="contained"
                          size="large"
                          sx={{
                            minWidth: 150,
                            bgcolor: "#4caf50",
                            "&:hover": {
                              bgcolor: "#45a049",
                            },
                            fontWeight: "bold",
                          }}
                          onClick={() => handleSelectSchedule(schedule)}
                        >
                          Select This Schedule
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {schedules && Array.isArray(schedules) && schedules.length === 0 && (
          <Paper
            elevation={2}
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: "white",
              borderRadius: 2,
              mt: 3,
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No schedules available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No schedules available for the selected date. Please try a different date.
            </Typography>
          </Paper>
        )}

        {!schedules && !loading && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Paper
              elevation={2}
              sx={{
                p: 4,
                bgcolor: "white",
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {dateAutoLoaded
                  ? "Select a different date above to view available schedules."
                  : "Select a date above and click 'Get Schedules' to view available schedules."}
                <br />
                Choose your preferred schedule and click "Select This Schedule" to proceed.
              </Typography>

              <Button
                variant="outlined"
                onClick={handleBackToRoutes}
                sx={{
                  borderColor: "#4caf50",
                  color: "#4caf50",
                  "&:hover": {
                    borderColor: "#45a049",
                    bgcolor: "#f1f8f4",
                  },
                }}
              >
                ← Back to Route Search
              </Button>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
}
