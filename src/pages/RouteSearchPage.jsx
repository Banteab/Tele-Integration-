import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import {
    Container,
    Typography,
    TextField,
    Box,
    Card,
    CardContent,
    Grid,
    Alert,
    CircularProgress,
    Chip,
    Button,
    Paper,
    Autocomplete,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import LockIcon from "@mui/icons-material/Lock";
import WalletIcon from "@mui/icons-material/Wallet";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import NavBar from "../components/navBar";
import { AuthApiKey, AuthBaseUrl } from "../config/api_url";
import { generateGuestToken } from "../services/authService";

export default function RouteSearchPage() {
    const history = useHistory();
    const [fromCity, setFromCity] = useState(null);
    const [toCity, setToCity] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [operatorFilter, setOperatorFilter] = useState("ALL");
    const [allRoutes, setAllRoutes] = useState([]);
    const [matchedRoutes, setMatchedRoutes] = useState([]);
    const [fromOptions, setFromOptions] = useState([]);
    const [toOptions, setToOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
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
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [busImages.length]);

    const handlePrevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + busImages.length) % busImages.length);
    };

    const handleNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % busImages.length);
    };

    useEffect(() => {
        // Fetch all routes on mount to enable search
        fetchAllRoutes();
    }, []);

    const fetchAllRoutes = async () => {
        try {
            setLoading(true);
            setError(null);

            let bearerToken = localStorage.getItem("liyu_login_token");
            if (!bearerToken) {
                bearerToken = await generateGuestToken();
            }

            const url = `${AuthBaseUrl}/api/routes/getallroutes`;
            const response = await axios.get(url, {
                headers: {
                    "x-api-key": AuthApiKey,
                    ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
                },
            });

            if (response.data && response.data.length > 0) {
                // Flatten all routes from all origin cities
                const routes = response.data.flatMap((origin) =>
                    origin.routes.map((route) => ({
                        ...route,
                        originCityName: origin.originCityName,
                    }))
                );
                setAllRoutes(routes);

                // Extract unique "from" options (origin cities and terminals)
                const fromSet = new Set();
                routes.forEach((route) => {
                    if (route.originCityName) {
                        fromSet.add(route.originCityName);
                    }
                    if (route.originTerminalName) {
                        fromSet.add(route.originTerminalName);
                    }
                });
                setFromOptions(Array.from(fromSet).sort());

                // Extract unique "to" options (destination cities and terminals)
                const toSet = new Set();
                routes.forEach((route) => {
                    if (route.destinationCityName) {
                        toSet.add(route.destinationCityName);
                    }
                    if (route.destinationTerminalName) {
                        toSet.add(route.destinationTerminalName);
                    }
                });
                setToOptions(Array.from(toSet).sort());
            } else {
                setAllRoutes([]);
                setFromOptions([]);
                setToOptions([]);
            }
        } catch (err) {
            console.error("Error fetching routes:", err);
            setError(
                err.response?.data?.message || err.message || "Failed to fetch routes"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!fromCity || !toCity) {
            setError("Please select both 'From' and 'To' locations");
            return;
        }

        setSearching(true);
        setError(null);
        setHasSearched(true);

        try {
            // Search for routes matching exact from and to values
            const fromValue = fromCity.toLowerCase();
            const toValue = toCity.toLowerCase();

            const matched = allRoutes.filter((route) => {
                const originMatch =
                    route.originCityName?.toLowerCase() === fromValue ||
                    route.originTerminalName?.toLowerCase() === fromValue;

                const destinationMatch =
                    route.destinationCityName?.toLowerCase() === toValue ||
                    route.destinationTerminalName?.toLowerCase() === toValue;

                return originMatch && destinationMatch;
            });

            setMatchedRoutes(matched);

            if (matched.length === 0) {
                setError(
                    `No routes found from "${fromCity}" to "${toCity}". Please try different locations.`
                );
            }
        } catch (err) {
            console.error("Error searching routes:", err);
            setError(err.message || "Failed to search routes");
        } finally {
            setSearching(false);
        }
    };

    const handleRouteSelect = (route) => {
        // Store route ID and info in localStorage
        localStorage.setItem("selected_route_id", route.routeId);
        localStorage.setItem(
            "selected_route_info",
            JSON.stringify({
                origin: route.originTerminalName,
                destination: route.destinationCityName,
                destinationTerminal: route.destinationTerminalName,
                via: route.viaName,
                distance: route.distance,
                routeGroup: route.routeGroupDesc,
                originCity: route.originCityName,
            })
        );

        // Store selected date for schedules page
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split("T")[0];
            localStorage.setItem("selected_schedule_date", formattedDate);
        }

        // Navigate to schedules page
        history.push("/schedules");
    };


    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
            <NavBar />

            {/* Hero Section with Bus Background Carousel */}
            <Box
                sx={{
                    position: "relative",
                    height: { xs: "500px", md: "600px" },
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
                {/* Search Form Overlay */}
                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Paper
                        elevation={10}
                        sx={{
                            p: { xs: 2, md: 4 },
                            borderRadius: 2,
                            bgcolor: "white",
                            maxWidth: "1000px",
                            mx: "auto",
                        }}
                    >
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                                <Autocomplete
                                    fullWidth
                                    options={fromOptions}
                                    value={fromCity}
                                    onChange={(event, newValue) => {
                                        setFromCity(newValue);
                                        setHasSearched(false);
                                        setMatchedRoutes([]);
                                    }}
                                    disabled={loading || searching || fromOptions.length === 0}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Going From"
                                            placeholder="Select origin"
                                            variant="outlined"
                                        />
                                    )}
                                    noOptionsText="No locations available"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <Autocomplete
                                    fullWidth
                                    options={toOptions}
                                    value={toCity}
                                    onChange={(event, newValue) => {
                                        setToCity(newValue);
                                        setHasSearched(false);
                                        setMatchedRoutes([]);
                                    }}
                                    disabled={loading || searching || toOptions.length === 0}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Going To"
                                            placeholder="Select destination"
                                            variant="outlined"
                                        />
                                    )}
                                    noOptionsText="No locations available"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={2}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DesktopDatePicker
                                        label="Select Date"
                                        value={selectedDate}
                                        onChange={(newValue) => setSelectedDate(newValue)}
                                        minDate={new Date()}
                                        renderInput={(params) => (
                                            <TextField {...params} variant="outlined" fullWidth />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Operator</InputLabel>
                                    <Select
                                        value={operatorFilter}
                                        onChange={(e) => setOperatorFilter(e.target.value)}
                                        label="Operator"
                                    >
                                        <MenuItem value="ALL">ALL</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={handleSearch}
                                    disabled={loading || searching || !fromCity || !toCity}
                                    startIcon={searching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                                    sx={{
                                        height: "56px",
                                        bgcolor: "#4caf50",
                                        "&:hover": {
                                            bgcolor: "#45a049",
                                        },
                                        fontWeight: "bold",
                                    }}
                                >
                                    {searching ? "Searching..." : "Search"}
                                </Button>
                            </Grid>
                        </Grid>

                        {error && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        )}
                    </Paper>
                </Container>
            </Box>

            {/* Search Results Section - Below Hero */}
            {hasSearched && !loading && !searching && (
                <Container maxWidth="lg" sx={{ py: 4, bgcolor: "#f5f5f5" }}>
                    {matchedRoutes.length > 0 ? (
                        <Box>
                            {matchedRoutes.map((route) => (
                                <Card
                                    key={route.routeId}
                                    sx={{
                                        mb: 2,
                                        bgcolor: "white",
                                        borderRadius: 2,
                                        boxShadow: 2,
                                        transition: "box-shadow 0.3s",
                                        "&:hover": {
                                            boxShadow: 4,
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Grid container spacing={3} alignItems="center">
                                            {/* Left: Operator and Route Info */}
                                            <Grid item xs={12} md={3}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{ fontWeight: "bold", mb: 1 }}
                                                >
                                                    {route.routeGroupDesc || "Route"}
                                                </Typography>
                                                <Chip
                                                    label={route.levelDesc || "Standard"}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: "#4caf50",
                                                        color: "white",
                                                        mb: 1,
                                                    }}
                                                />
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        From: <strong>{route.originTerminalName}</strong>
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        To: <strong>{route.destinationTerminalName || route.destinationCityName}</strong>
                                                    </Typography>
                                                </Box>
                                            </Grid>

                                            {/* Departure Time */}
                                            <Grid item xs={6} md={2}>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ textTransform: "uppercase", fontWeight: "bold" }}
                                                >
                                                    Departure Time
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    sx={{ color: "#4caf50", fontWeight: "bold", mt: 0.5 }}
                                                >
                                                    Select Date
                                                </Typography>
                                            </Grid>

                                            {/* Arrival Time */}
                                            <Grid item xs={6} md={2}>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ textTransform: "uppercase", fontWeight: "bold" }}
                                                >
                                                    Arrival Time
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    sx={{ color: "#4caf50", fontWeight: "bold", mt: 0.5 }}
                                                >
                                                    Select Date
                                                </Typography>
                                            </Grid>

                                            {/* Seats Available */}
                                            <Grid item xs={6} md={1.5}>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ textTransform: "uppercase", fontWeight: "bold" }}
                                                >
                                                    Seats Available
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    sx={{ color: "#4caf50", fontWeight: "bold", mt: 0.5 }}
                                                >
                                                    N/A
                                                </Typography>
                                            </Grid>

                                            {/* Price */}
                                            <Grid item xs={6} md={1.5}>
                                                <Chip
                                                    label="No Additional Charge"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: "#e8f5e9",
                                                        color: "#4caf50",
                                                        mb: 0.5,
                                                        fontSize: "0.7rem",
                                                    }}
                                                />
                                                <Typography
                                                    variant="h6"
                                                    sx={{ color: "#4caf50", fontWeight: "bold" }}
                                                >
                                                    {route.tariff
                                                        ? new Intl.NumberFormat("en-ET", {
                                                            style: "currency",
                                                            currency: "ETB",
                                                        }).format(route.tariff)
                                                        : "N/A"}
                                                </Typography>
                                            </Grid>

                                            {/* View Schedules Button */}
                                            <Grid item xs={12} md={2}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    onClick={() => handleRouteSelect(route)}
                                                    sx={{
                                                        bgcolor: "#4caf50",
                                                        "&:hover": {
                                                            bgcolor: "#45a049",
                                                        },
                                                        fontWeight: "bold",
                                                        mb: 1,
                                                    }}
                                                >
                                                    View Schedules
                                                </Button>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ textAlign: "center", display: "block" }}
                                                >
                                                    Cancellation Policy
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    ) : (
                        <Paper
                            sx={{
                                p: 4,
                                textAlign: "center",
                                bgcolor: "white",
                                borderRadius: 2,
                            }}
                        >
                            <Typography variant="h6" color="text.secondary">
                                No routes found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Try searching with different locations
                            </Typography>
                        </Paper>
                    )}
                </Container>
            )}

            {/* Buy tickets in 3 easy steps Section */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography
                    variant="h4"
                    component="h2"
                    align="center"
                    gutterBottom
                    sx={{ color: "#4caf50", fontWeight: "bold", mb: 4 }}
                >
                    Buy tickets in 3 easy steps
                </Typography>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: "center", p: 3 }}>
                            <SearchIcon
                                sx={{
                                    fontSize: 60,
                                    color: "#4caf50",
                                    mb: 2,
                                }}
                            />
                            <Typography
                                variant="h6"
                                sx={{ color: "#4caf50", fontWeight: "bold", mb: 1 }}
                            >
                                Search
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Choose your origin, destination, journey dates and search for buses
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: "center", p: 3 }}>
                            <DirectionsBusIcon
                                sx={{
                                    fontSize: 60,
                                    color: "#4caf50",
                                    mb: 2,
                                }}
                            />
                            <Typography
                                variant="h6"
                                sx={{ color: "#4caf50", fontWeight: "bold", mb: 1 }}
                            >
                                Select
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Select your desired trip and choose your seats
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: "center", p: 3 }}>
                            <WalletIcon
                                sx={{
                                    fontSize: 60,
                                    color: "#4caf50",
                                    mb: 2,
                                }}
                            />
                            <Typography
                                variant="h6"
                                sx={{ color: "#4caf50", fontWeight: "bold", mb: 1 }}
                            >
                                Payment
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Pay by bank cards or mobile banking
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ textAlign: "center", mt: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                        <LockIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                            Safe and Secure online payments
                        </Typography>
                    </Box>
                </Box>
            </Container>


            {loading && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <CircularProgress />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Loading routes...
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
