import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  IconButton,
} from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import EventIcon from "@mui/icons-material/Event";
import ChairIcon from "@mui/icons-material/Chair";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import RouteIcon from "@mui/icons-material/Route";
import HistoryIcon from "@mui/icons-material/History";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import NavBar from "../components/navBar";
import { AuthApiKey, ApiUrl } from "../config/api_url";

export default function TicketHistoryPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("authtoken");

      setLoading(true);
      setError(null);

      const url = `${ApiUrl}/tickets/history`;

      const response = await axios.get(url, {
        headers: {
          "x-api-key": AuthApiKey,
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        setTickets(response.data);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch ticket history"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
        <NavBar />
        <Container sx={{ py: 12, textAlign: "center" }}>
          <CircularProgress sx={{ color: "#4caf50" }} />
          <Typography variant="h6" sx={{ mt: 2, color: "#4caf50", fontWeight: "bold" }}>
            Loading your tickets...
          </Typography>
        </Container>
      </Box>
    );
  }

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
            key={`hero-${index}`}
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
              key={`dot-${index}`}
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
            <HistoryIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: "bold", mb: 1 }}>
              My Ticket History
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              View all your booked tickets
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {tickets.length === 0 && !loading && !error ? (
          <Paper
            elevation={2}
            sx={{
              p: 6,
              textAlign: "center",
              bgcolor: "white",
              borderRadius: 2,
            }}
          >
            <HistoryIcon sx={{ fontSize: 80, color: "#4caf50", mb: 2, opacity: 0.5 }} />
            <Typography variant="h5" color="text.secondary" sx={{ mb: 1, fontWeight: "bold" }}>
              No tickets found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your booked tickets will appear here once you make a booking.
            </Typography>
          </Paper>
        ) : (
          <>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#4caf50" }}>
              {tickets.length} Ticket{tickets.length === 1 ? "" : "s"} Found
            </Typography>
            <Grid container spacing={3}>
              {tickets.map((ticket) => (
                <Grid item xs={12} key={ticket.id}>
                  <Card
                    elevation={2}
                    sx={{
                      bgcolor: "white",
                      borderRadius: 2,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Header Section */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 3,
                          pb: 2,
                          borderBottom: "2px solid #f0f0f0",
                        }}
                      >
                        <Box>
                          <Typography variant="h5" sx={{ color: "#4caf50", mb: 1.5, fontWeight: "bold" }}>
                            {ticket.routeName || ticket.routeDescription || "Unknown Route"}
                          </Typography>
                          <Box
                            sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}
                          >
                            <Chip
                              icon={<ConfirmationNumberIcon />}
                              label={`Ticket #${ticket.id}`}
                              size="small"
                              sx={{
                                bgcolor: "#4caf50",
                                color: "white",
                                fontWeight: "bold",
                              }}
                            />
                            <Chip
                              label={ticket.status ? "Active" : "Inactive"}
                              size="small"
                              sx={{
                                bgcolor: ticket.status ? "#4caf50" : "#d32f2f",
                                color: "white",
                                fontWeight: "bold",
                              }}
                            />
                            {ticket.levelDesc && (
                              <Chip
                                label={ticket.levelDesc}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: "#4caf50",
                                  color: "#4caf50",
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* Route Information */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          mb: 2.5,
                          bgcolor: "#f8f9fa",
                          borderRadius: 2,
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              <LocationOnIcon sx={{ mr: 1, color: "#4caf50", fontSize: 28 }} />
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>
                                  Origin
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: "#333" }}>
                                  {ticket.originTerminalName || "N/A"}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              <LocationOnIcon sx={{ mr: 1, color: "#4caf50", fontSize: 28 }} />
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>
                                  Destination
                                </Typography>
                                <Typography variant="body1" fontWeight="bold" sx={{ color: "#333" }}>
                                  {ticket.destinationTerminalName || ticket.destCityName || "N/A"}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          {ticket.viaDescription && (
                            <Grid item xs={12}>
                              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                                <RouteIcon sx={{ mr: 0.5, color: "#4caf50" }} />
                                <Typography variant="body2" color="text.secondary">
                                  Via: <strong style={{ color: "#4caf50" }}>{ticket.viaDescription}</strong>
                                </Typography>
                                {ticket.distance && (
                                  <>
                                    <Typography variant="body2" color="text.secondary">•</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Distance: <strong style={{ color: "#4caf50" }}>{ticket.distance} km</strong>
                                    </Typography>
                                  </>
                                )}
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      </Paper>

                      {/* Date and Time Information */}
                      <Grid container spacing={3} sx={{ mb: 2.5 }}>
                        <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              bgcolor: "#f8f9fa",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              <EventIcon sx={{ mr: 1, color: "#4caf50" }} />
                              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>
                                Departure
                              </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ color: "#4caf50", fontWeight: "bold", mb: 0.5 }}>
                              {ticket.departureDate
                                ? new Date(ticket.departureDate).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })
                                : "N/A"}
                            </Typography>
                            {ticket.departureDate && (
                              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                {new Date(ticket.departureDate).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Typography>
                            )}
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              bgcolor: "#f8f9fa",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              <EventIcon sx={{ mr: 1, color: "#4caf50" }} />
                              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>
                                Issued
                              </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ color: "#4caf50", fontWeight: "bold", mb: 0.5 }}>
                              {ticket.issuedDate
                                ? new Date(ticket.issuedDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                                : "N/A"}
                            </Typography>
                            {ticket.issuedDate && (
                              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                {new Date(ticket.issuedDate).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Typography>
                            )}
                          </Paper>
                        </Grid>
                      </Grid>

                      {/* Vehicle and Seat Information */}
                      <Grid container spacing={2} sx={{ mb: 2.5 }}>
                        <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              bgcolor: "#f8f9fa",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              <DirectionsBusIcon sx={{ mr: 1, color: "#4caf50" }} />
                              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>
                                Operator
                              </Typography>
                            </Box>
                            <Typography variant="body1" fontWeight="bold" sx={{ color: "#333", mb: 0.5 }}>
                              {ticket.vehicleOperator || "N/A"}
                            </Typography>
                            {ticket.plate && (
                              <Typography variant="body2" color="text.secondary">
                                Plate: <strong>{ticket.plate}</strong>
                              </Typography>
                            )}
                            {ticket.sideNumber && (
                              <Typography variant="body2" color="text.secondary">
                                Side: <strong>{ticket.sideNumber}</strong>
                              </Typography>
                            )}
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              bgcolor: "#f8f9fa",
                              borderRadius: 2,
                              border: "1px solid #e0e0e0",
                              textAlign: "center",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
                              <ChairIcon sx={{ mr: 1, color: "#4caf50" }} />
                              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: "bold" }}>
                                Seat Number
                              </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ color: "#4caf50", fontWeight: "bold" }}>
                              {ticket.seatLayoutName || "N/A"}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      {/* Passenger Information */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          mb: 2.5,
                          bgcolor: "#f8f9fa",
                          borderRadius: 2,
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ textTransform: "uppercase", fontWeight: "bold", mb: 2 }}>
                          Passenger Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                              <PersonIcon sx={{ mr: 1, fontSize: 24, color: "#4caf50" }} />
                              <Typography variant="body1" fontWeight="bold" sx={{ color: "#333" }}>
                                {ticket.passengerFullName || "N/A"}
                              </Typography>
                            </Box>
                            {ticket.passengerIdNumber && (
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 5 }}>
                                ID: <strong>{ticket.passengerIdNumber}</strong>
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <PhoneIcon sx={{ mr: 1, fontSize: 24, color: "#4caf50" }} />
                              <Typography variant="body1" fontWeight="medium" sx={{ color: "#333" }}>
                                {ticket.payer || "N/A"}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>

                      {/* Payment Information */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 3,
                          bgcolor: "#4caf50",
                          borderRadius: 2,
                          color: "white",
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ opacity: 0.9, textTransform: "uppercase", fontWeight: "bold" }}>
                            Total Amount
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                            <LocalAtmIcon sx={{ fontSize: 32 }} />
                            <Typography variant="h4" fontWeight="bold">
                              {ticket.grandTotal !== undefined && ticket.grandTotal !== null
                                ? new Intl.NumberFormat("en-ET", {
                                  style: "currency",
                                  currency: "ETB",
                                }).format(ticket.grandTotal)
                                : "N/A"}
                            </Typography>
                          </Box>
                          {(ticket.subTotal !== undefined || ticket.discount !== undefined || ticket.additionalCharge !== undefined) && (
                            <Typography variant="caption" sx={{ mt: 1, opacity: 0.8, display: "block" }}>
                              {ticket.subTotal !== undefined && `Subtotal: ${ticket.subTotal} ETB`}
                              {ticket.discount !== undefined && ticket.discount > 0 && ` • Discount: ${ticket.discount} ETB`}
                              {ticket.additionalCharge !== undefined && ticket.additionalCharge > 0 && ` • Additional: ${ticket.additionalCharge} ETB`}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}
