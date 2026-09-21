import { useState, useEffect, useCallback } from "react";
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
  InputAdornment,
  Alert,
  CircularProgress,
  Chip,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DirectionsIcon from "@mui/icons-material/Directions";
import RouteIcon from "@mui/icons-material/Route";
import NavBar from "../components/navBar";
import { AuthApiKey, AuthBaseUrl } from "../config/api_url";

export default function RoutesPage() {
  const history = useHistory();
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOperatorName, setSelectedOperatorName] = useState("");

  useEffect(() => {
    // Check if operator is selected
    const operatorId = localStorage.getItem("selected_operator_id");
    const operatorName = localStorage.getItem("selected_operator_name");

    if (!operatorId) {
      // No operator selected, redirect to operators page
      history.push("/book");
      return;
    }

    setSelectedOperatorName(operatorName || "");
    fetchRoutes();
  }, [history]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${AuthBaseUrl}/api/routes/getallroutes`;
      const response = await axios.get(url, {
        headers: {
          "x-api-key": AuthApiKey,
          
        },
      });

      if (response.data && response.data.length > 0) {
        // Flatten all routes from all origin cities
        const allRoutes = response.data.flatMap((origin) =>
          origin.routes.map((route) => ({
            ...route,
            originCityName: origin.originCityName,
          }))
        );
        setRoutes(allRoutes);
      } else {
        setRoutes([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch routes"
      );
    } finally {
      setLoading(false);
    }
  };

  const filterRoutes = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredRoutes(routes);
    } else {
      const filtered = routes.filter(
        (route) =>
          route.destinationCityName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          route.destinationTerminalName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          route.viaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          route.routeGroupDesc.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoutes(filtered);
    }
  }, [searchTerm, routes]);

  useEffect(() => {
    filterRoutes();
  }, [filterRoutes]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRouteSelect = (route) => {
    // Store route ID in localStorage
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
      })
    );

    // Navigate to schedules page
    history.push("/schedules");
  };

  if (loading) {
    return (
      <Box>
        <NavBar />
        <Container sx={{ mt: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading routes...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Available Routes
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          All routes originate from Addis Ababa
        </Typography>

        {selectedOperatorName && (
          <Typography
            variant="body1"
            align="center"
            color="primary"
            sx={{ mb: 4, fontWeight: "bold" }}
          >
            Selected Operator: {selectedOperatorName}
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search destinations, terminals, or routes..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 600, mx: "auto", display: "block" }}
          />
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          {filteredRoutes.length} route{filteredRoutes.length !== 1 ? "s" : ""}{" "}
          found
        </Typography>

        <Grid container spacing={3}>
          {filteredRoutes.map((route) => (
            <Grid item xs={12} key={route.routeId}>
              <Card
                sx={{
                  height: "100%",
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                  cursor: "pointer",
                }}
                onClick={() => handleRouteSelect(route)}
              >
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    {/* Origin - Row 1 Left */}
                    <Grid item xs={6} md={2} sx={{ order: { xs: 1, md: 1 } }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocationOnIcon color="primary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Origin
                          </Typography>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {route.originTerminalName}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Arrow 1 - Desktop Only */}
                    <Grid
                      item
                      md={1}
                      sx={{
                        display: { xs: "none", md: "block" },
                        order: { md: 2 },
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <DirectionsIcon color="action" />
                      </Box>
                    </Grid>

                    {/* Via - Row 2 Center */}
                    <Grid
                      item
                      xs={12}
                      md={2}
                      sx={{
                        order: { xs: 3, md: 3 },
                        textAlign: { xs: "center", md: "left" },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          justifyContent: { xs: "center", md: "flex-start" },
                        }}
                      >
                        <RouteIcon color="secondary" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Via
                          </Typography>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {route.viaName}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Arrow 2 - Desktop Only */}
                    <Grid
                      item
                      md={1}
                      sx={{
                        display: { xs: "none", md: "block" },
                        order: { md: 4 },
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <DirectionsIcon color="action" />
                      </Box>
                    </Grid>

                    {/* Destination - Row 1 Right */}
                    <Grid
                      item
                      xs={6}
                      md={2}
                      sx={{
                        order: { xs: 2, md: 5 },
                        textAlign: { xs: "right", md: "left" },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          justifyContent: { xs: "flex-end", md: "flex-start" },
                        }}
                      >
                        <LocationOnIcon color="success" />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Destination
                          </Typography>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {route.destinationCityName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {route.destinationTerminalName}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Distance - Row 3 Left */}
                    <Grid item xs={6} md={2} sx={{ order: { xs: 4, md: 6 } }}>
                      <Box sx={{ textAlign: { xs: "left", md: "center" } }}>
                        <Typography variant="body2" color="text.secondary">
                          Distance
                        </Typography>
                        <Typography
                          variant="h6"
                          color="primary"
                          fontWeight="bold"
                        >
                          {route.distance} km
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Button - Row 3 Right */}
                    <Grid item xs={6} md={2} sx={{ order: { xs: 5, md: 7 } }}>
                      <Box sx={{ textAlign: { xs: "right", md: "center" } }}>
                        <Chip
                          label={route.routeGroupDesc}
                          color="primary"
                          variant="outlined"
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Box>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRouteSelect(route);
                            }}
                          >
                            Select Route
                          </Button>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredRoutes.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No routes found matching your search
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try searching for a different destination or route
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
