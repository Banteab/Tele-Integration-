import { useEffect, useMemo, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
  Alert,
  TextField,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import NavBar from "../components/navBar";
import { ApiUrl, AuthApiKey, AuthBaseUrl } from "../config/api_url";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import { generateGuestToken } from "../services/authService";

// Utility function to generate a random payment reference number (10 characters)
const generatePaymentReference = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Utility function to detect platform
const detectPlatform = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/android/i.test(userAgent)) {
    return "Android";
  }
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "iOS";
  }
  if (/Windows/.test(userAgent)) {
    return "Windows";
  }
  if (/Mac/.test(userAgent)) {
    return "MacOS";
  }
  if (/Linux/.test(userAgent)) {
    return "Linux";
  }
  return ""; // Return empty string if unknown
};

export default function SeatLayoutPage() {
  const location = useLocation();
  const history = useHistory();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const vehicleId = searchParams.get("vehicleId");
  const scheduleId = searchParams.get("scheduleId");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState({});
  const [submitting, setSubmitting] = useState(false);
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
    const fetchLayout = async () => {
      if (!vehicleId) {
        setError("Missing vehicleId");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get or generate the external API bearer token (same as your curl)
        let bearerToken = localStorage.getItem("liyu_login_token");
        if (!bearerToken) {
          bearerToken = await generateGuestToken();
        }

        const url = `${AuthBaseUrl}/api/vehicles/getvehicleseatlayout`;
        const res = await axios.get(url, {
          params: {
            id: "13",//vehicleId, // match curl: ?id=<vehicleId>
            routeSchedule: scheduleId, // match curl: &routeSchedule=<scheduleId>
          },
          headers: {
            "x-api-key": AuthApiKey,
            ...(bearerToken
              ? { Authorization: `Bearer ${bearerToken}` }
              : {}),
            Accept: "application/json",
          },
        });

        // Debug: Log the response to see what we're getting
        console.log("Seat layout response:", res);
        console.log("Response data:", res.data);
        console.log("Response data type:", typeof res.data);
        console.log("Response data.seats:", res.data?.seats);
        console.log("Is seats array?", Array.isArray(res.data?.seats));

        // Ensure the response data has the expected structure
        const layoutData = res.data;

        // Check if layoutData is valid
        if (!layoutData) {
          console.error("No layout data in response");
          setError("No Seat Layout!");
          return;
        }

        // Check if seats exists and is an array
        if (layoutData.seats && Array.isArray(layoutData.seats)) {
          console.log("Setting layout with", layoutData.seats.length, "seats");
          setLayout(layoutData);
          setError(null); // Clear any previous errors
        } else {
          console.error("Invalid seat layout response structure:", layoutData);
          console.error("Seats value:", layoutData.seats);
          console.error("Seats type:", typeof layoutData.seats);
          setError("No Seat Layout!");
        }
      } catch (err) {
        console.error("Error fetching seat layout:", err);
        // Always display "No Seat Layout!" for errors from this endpoint
        setError("No Seat Layout!");

      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, [vehicleId, scheduleId]);

  const handleSeatClick = (seatName) => {
    if (!seatName) return;

    setSelectedSeats((prev) => {
      if (prev.includes(seatName)) {
        // Remove seat and its passenger info
        const updated = prev.filter((s) => s !== seatName);
        setPassengers((p) => {
          const newPassengers = { ...p };
          delete newPassengers[seatName];
          return newPassengers;
        });
        return updated;
      } else {
        // Add seat and initialize passenger info
        const updated = [...prev, seatName];
        setPassengers((p) => ({
          ...p,
          [seatName]: {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            seatNumber: seatName,
          },
        }));
        return updated;
      }
    });
  };

  const updatePassenger = (seatName, field, value) => {
    setPassengers((prev) => ({
      ...prev,
      [seatName]: {
        ...prev[seatName],
        [field]: value,
      },
    }));
  };

  const PHONE_REGEX = /^(\+251|0)(9\d{8})$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async () => {
    // Validate
    for (const seatName of selectedSeats) {
      const p = passengers[seatName];
      if (!p.firstName || !p.lastName || !p.phoneNumber) {
        setError("Please fill in all required fields for each passenger");
        return;
      }

      if (!PHONE_REGEX.test(p.phoneNumber)) {
        setError(
          `Invalid phone number for seat ${seatName}. Use 09xxxxxxxx or +2519xxxxxxxx`
        );
        return;
      }

      if (p.email && !EMAIL_REGEX.test(p.email)) {
        setError(`Invalid email address for seat ${seatName}`);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      // Get auth token and user data from localStorage
      const token = localStorage.getItem("authtoken");
      const userStr = localStorage.getItem("user");
      let userData = null;

      if (userStr) {
        try {
          userData = JSON.parse(userStr);
        } catch (e) {
          console.error("Failed to parse user data:", e);
        }
      }

      // Get booking flow data from localStorage
      const scheduleDataStr = localStorage.getItem("selected_schedule_data");
      let scheduleData = null;

      if (scheduleDataStr) {
        try {
          scheduleData = JSON.parse(scheduleDataStr);
        } catch (e) {
          console.error("Failed to parse schedule data:", e);
        }
      }

      // Get operatorId from scheduleData (stored when schedule is selected)
      const operatorId = scheduleData?.operatorId;

      // Validate required data
      if (!operatorId || !scheduleData?.routeScheduleId) {
        setError(
          "Missing booking information. Please start from the route search page."
        );
        return;
      }

      // Get payer phone number from user data or localStorage
      const payerPhone =
        userData?.phoneNumber || localStorage.getItem("liyu_phone") || "";

      // Build ticketDetail array with all required fields from API schema
      const ticketDetail = selectedSeats.map((seatName) => {
        const seat = layout?.seats.find((s) => s.name === seatName);
        const passenger = passengers[seatName] || {};

        return {
          pnr: "",
          idNumber: userData?.idNumber || "",
          nationalId: "",
          firstName: passenger.firstName || "",
          middleName: "",
          lastName: passenger.lastName || "",
          gender: 0, // Default value, can be updated if UI collects this
          maritalStatus: 0, // Default value, can be updated if UI collects this
          dob: null, // Default value, can be updated if UI collects this
          phoneNumber: passenger.phoneNumber || "",
          emergencyContact: "",
          email: passenger.email || "",
          region: 0, // Default value, can be updated if UI collects this
          city: 0, // Default value, can be updated if UI collects this
          subCity: 0, // Default value, can be updated if UI collects this
          woreda: "",
          houseNumber: "",
          specificAddress: "",
          longitude: 0,
          latitude: 0,
          imageUrl: "",
          seatLayout: seat?.id || 0,
          grandTotal: scheduleData?.tariff || 0.1, // Use actual tariff from schedule
        };
      });

      // Build the simplified payload
      const payload = {
        operator: parseInt(operatorId),
        agent: null,
        ticketDetail: ticketDetail,
        routeSchedule: scheduleData.routeScheduleId,
        routeScheduleDate:
          scheduleData.departureDate || new Date().toISOString(),
        paymentMethod: 144,
        period: null,
        paymentProcessor: 111,
        payer: payerPhone,
        paymentRefNumber: generatePaymentReference(),
        paymentAmount: ticketDetail.reduce((sum, t) => sum + t.grandTotal, 0),
        maturityDate: new Date().toISOString(),
        paymentIssueDate: new Date().toISOString(),
        paymentStatus: 86,
        ipAddress: "",
        platform: detectPlatform(),
        appId: 5,
      };

      // Step 1: Create ticket through NestJS backend
      const ticketResponse = await axios.post(`${ApiUrl}/tickets`, payload, {
        headers: {
          "x-api-key": AuthApiKey,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Store the response data if needed
      console.log("Ticket booking response:", ticketResponse.data);

      // Check if ticket booking was successful
      const successfulTickets = ticketResponse.data?.successful || [];
      const failedTickets = ticketResponse.data?.failed || [];

      if (successfulTickets.length === 0) {
        // No tickets were created successfully
        const errorMessage = failedTickets.length > 0
          ? failedTickets[0]?.error || failedTickets[0]?.message || "Failed to book tickets"
          : "No tickets were created. Please try again.";
        throw new Error(errorMessage);
      }

      // Step 2: Create Telebirr payment order
      const totalAmount = ticketDetail.reduce((sum, t) => sum + t.grandTotal, 0);

      // Generate orderId that matches Telebirr pattern: ^[A-Za-z0-9]+$ (alphanumeric only, no hyphens/special chars)
      const timestamp = Date.now().toString();
      const randomStr = Math.random().toString(36).substr(2, 9).toUpperCase();
      const orderId = `TICKET${timestamp}${randomStr}`;

      const paymentOrderPayload = {
        title: `Bus Ticket`,
        amount: totalAmount.toString(),
        orderId: orderId,
        returnUrl: `${window.location.origin}/portal/ticket-success`,
        extra: {
          ticketIds: successfulTickets.map((t) => t.id),
        },
      };

      console.log("Creating Telebirr payment order:", paymentOrderPayload);

      // Read JWT token (same one used for /tickets)
      const paymentToken = localStorage.getItem("authtoken");

      const paymentResponse = await axios.post(
        `${ApiUrl}/payment/preorder`,
        paymentOrderPayload,
        {
          headers: {
            "Content-Type": "application/json",
            ...(paymentToken ? { Authorization: `Bearer ${paymentToken}` } : {}),
          },
        }
      );

      console.log("Payment order response:", paymentResponse.data);

      // Step 3: Navigate to Telebirr payment page
      // Backend now returns structured response: { success, message, data: { prepayId, rawRequest, fullResponse }, checkoutUrl }
      const responseData = paymentResponse.data;
      
      if (responseData?.success && responseData?.checkoutUrl) {
        // Store ticket data in localStorage for success page
        localStorage.setItem("pending_ticket_data", JSON.stringify({
          tickets: ticketResponse.data?.successful || [],
          paymentOrder: {
            checkoutUrl: responseData.checkoutUrl,
            prepayId: responseData.data?.prepayId,
            message: responseData.message,
          },
        }));

        // Redirect to Telebirr payment page
        console.log("Payment order created successfully:", responseData.message);
        console.log("Redirecting to checkout URL:", responseData.checkoutUrl);
        window.location.href = responseData.checkoutUrl;
      } else {
        // Handle error response
        const errorMessage = responseData?.message || 
                            "Failed to get payment checkout URL. Please try again or contact support.";
        console.error("Payment order failed:", errorMessage);
        console.error("Response data:", responseData);
        setError(errorMessage);
        setSubmitting(false);
        // Don't redirect - let user see the error and try again
      }
    } catch (err) {
      console.error("Error in booking flow:", err);

      // Check if ticket was created but payment failed
      if (err.config?.url?.includes("/payment/")) {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Ticket created but payment initialization failed. Please contact support."
        );
      } else {
        // Ticket creation failed
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to book tickets"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderGrid = () => {
    if (!layout) return null;

    // Defensive check: ensure layout has required properties
    if (!layout.seats || !Array.isArray(layout.seats)) {
      console.error("Invalid layout structure:", layout);
      return null;
    }

    const { maxX, maxY, seats } = layout;

    const byCoord = new Map();
    seats.forEach((s) => {
      byCoord.set(`${s.x},${s.y}`, s);
    });

    const rows = [];
    for (let y = 1; y <= maxY; y++) {
      const cells = [];
      for (let x = 1; x <= maxX; x++) {
        const seat = byCoord.get(`${x},${y}`);
        const type = seat?.type || "empty";
        const isSeat = type === "seat";
        const isSold = type === "sold";
        const isSelected =
          isSeat && seat?.name && selectedSeats.includes(seat.name);

        const baseStyles = {
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 1,
          mx: 0.5,
          my: 0.5,
          transition: "all 0.2s",
          cursor: isSeat ? "pointer" : "default",
        };

        let styles = { ...baseStyles };
        let content = null;

        if (isSeat) {
          styles = {
            ...baseStyles,
            backgroundColor: isSelected ? "#4caf50" : "#1976D2",
            color: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            border: isSelected ? "2px solid #2e7d32" : "1px solid #115293",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            },
          };
          content = (
            <Box sx={{ fontSize: 11, fontWeight: 600 }}>{seat?.name}</Box>
          );
        } else if (isSold) {
          // Sold seat - display in red and make non-clickable
          styles = {
            ...baseStyles,
            backgroundColor: "#d32f2f",
            color: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            border: "1px solid #b71c1c",
            cursor: "not-allowed",
            opacity: 0.8,
          };
          content = (
            <Box sx={{ fontSize: 11, fontWeight: 600 }}>{seat?.name}</Box>
          );
        } else if (type === "aile") {
          styles = { ...baseStyles };
        } else if (type === "stair case") {
          styles = {
            ...baseStyles,
            backgroundColor: "#bdbdbd",
            border: "1px solid #9e9e9e",
          };
        } else if (type === "driver seat") {
          styles = {
            ...baseStyles,
            backgroundColor: "#ffb74d",
            border: "1px solid #fb8c00",
          };
          content = <DriveEtaIcon sx={{ fontSize: 16, color: "#fff" }} />;
        }

        cells.push(
          <Box
            key={`c-${x}-${y}`}
            sx={styles}
            onClick={() =>
              isSeat && !isSold && seat?.name && handleSeatClick(seat.name)
            }
          >
            {content}
          </Box>
        );
      }
      rows.push(
        <Box key={`r-${y}`} sx={{ display: "flex", gap: 0 }}>
          {cells}
        </Box>
      );
    }

    return (
      <Box sx={{ display: "inline-flex", flexDirection: "column", gap: 0.5 }}>
        {rows}
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <NavBar />

      {/* Hero Section with Bus Background Carousel */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "250px", md: "300px" },
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
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: "bold", mb: 1 }}>
              Select Your Seats
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Choose your preferred seats and enter passenger information
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: "white",
            borderRadius: 2,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" sx={{ color: "#4caf50", fontWeight: "bold", mb: 0.5 }}>
                Vehicle ID: <strong style={{ color: "#333" }}>{vehicleId || "-"}</strong>
              </Typography>
              {scheduleId && (
                <Typography variant="subtitle2" color="text.secondary">
                  Schedule: {scheduleId}
                </Typography>
              )}
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{ textAlign: { xs: "left", md: "right" } }}
            >
              <Button
                variant="outlined"
                onClick={() => window.history.back()}
                sx={{
                  borderColor: "#4caf50",
                  color: "#4caf50",
                  "&:hover": {
                    borderColor: "#45a049",
                    bgcolor: "#f1f8f4",
                  },
                }}
              >
                ← Back
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading seat layout...
            </Typography>
          </Box>
        )}

        {layout && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card
                elevation={2}
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "#4caf50", fontWeight: "bold" }}>
                      Bus Layout
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: "#1976D2",
                            borderRadius: 1,
                          }}
                        />
                        <Typography variant="caption">Available</Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: "#4caf50",
                            borderRadius: 1,
                          }}
                        />
                        <Typography variant="caption">Selected</Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: "#bdbdbd",
                            borderRadius: 1,
                          }}
                        />
                        <Typography variant="caption">Stair</Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: "#d32f2f",
                            borderRadius: 1,
                          }}
                        />
                        <Typography variant="caption">Sold</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      overflowX: "auto",
                      textAlign: "center",
                      pl: 2,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {renderGrid()}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                elevation={2}
                sx={{
                  bgcolor: "white",
                  borderRadius: 2,
                  position: "sticky",
                  top: 20,
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: "#4caf50", fontWeight: "bold" }}>
                    Passenger Information
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                    sx={{ display: "block", mb: 2 }}
                  >
                    Selected Seats: <strong style={{ color: "#4caf50" }}>{selectedSeats.length}</strong>
                  </Typography>

                  {selectedSeats.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        Please select seats to continue
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 2 }}>
                      {selectedSeats.map((seatName, index) => (
                        <Box key={seatName} sx={{ mb: 3 }}>
                          {index > 0 && <Divider sx={{ my: 2 }} />}
                          <Typography
                            variant="subtitle2"
                            gutterBottom
                            sx={{ color: "#4caf50", fontWeight: "bold" }}
                          >
                            Seat {seatName}
                          </Typography>
                          <Stack spacing={2}>
                            <TextField
                              size="small"
                              label="First Name *"
                              value={passengers[seatName]?.firstName || ""}
                              onChange={(e) =>
                                updatePassenger(
                                  seatName,
                                  "firstName",
                                  e.target.value
                                )
                              }
                            />
                            <TextField
                              size="small"
                              label="Last Name *"
                              value={passengers[seatName]?.lastName || ""}
                              onChange={(e) =>
                                updatePassenger(
                                  seatName,
                                  "lastName",
                                  e.target.value
                                )
                              }
                            />
                            <TextField
                              size="small"
                              label="Phone Number *"
                              value={passengers[seatName]?.phoneNumber || ""}
                              onChange={(e) =>
                                updatePassenger(
                                  seatName,
                                  "phoneNumber",
                                  e.target.value
                                )
                              }
                            />
                            <TextField
                              size="small"
                              label="Email"
                              type="email"
                              value={passengers[seatName]?.email || ""}
                              onChange={(e) =>
                                updatePassenger(
                                  seatName,
                                  "email",
                                  e.target.value
                                )
                              }
                            />
                          </Stack>
                        </Box>
                      ))}

                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{
                          mt: 3,
                          bgcolor: "#4caf50",
                          "&:hover": {
                            bgcolor: "#45a049",
                          },
                          fontWeight: "bold",
                          py: 1.5,
                        }}
                        onClick={handleSubmit}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Book Tickets"
                        )}
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
}
