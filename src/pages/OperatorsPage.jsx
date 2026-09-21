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
import BusinessIcon from "@mui/icons-material/Business";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NavBar from "../components/navBar";
import { AuthApiKey, AuthBaseUrl } from "../config/api_url";

export default function OperatorsPage() {
  const history = useHistory();
  const [operators, setOperators] = useState([]);
  const [filteredOperators, setFilteredOperators] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${AuthBaseUrl}/api/operators/getalloperators`;
      const response = await axios.get(url, {
        headers: {
          "x-api-key": AuthApiKey,
        },
      });

      if (response.data && response.data.length > 0) {
        setOperators(response.data);
      } else {
        setOperators([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch operators"
      );
    } finally {
      setLoading(false);
    }
  };

  const filterOperators = useCallback(() => {
    if (!searchTerm.trim()) {
      setFilteredOperators(operators);
    } else {
      const filtered = operators.filter(
        (operator) =>
          (operator.tradeName?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (operator.companyName?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (operator.code?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (operator.cityName?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          ) ||
          (operator.subCityName?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          )
      );
      setFilteredOperators(filtered);
    }
  }, [searchTerm, operators]);

  useEffect(() => {
    filterOperators();
  }, [filterOperators]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOperatorSelect = (operator) => {
    // Store operator ID in localStorage
    localStorage.setItem("selected_operator_id", operator.id);
    localStorage.setItem("selected_operator_name", operator.tradeName);

    // Navigate to routes page
    history.push("/routes");
  };

  if (loading) {
    return (
      <Box>
        <NavBar />
        <Container sx={{ mt: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading operators...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <NavBar />
      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Select Operator
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Choose your preferred bus operator
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search operators by name, code, or location..."
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
          {filteredOperators.length} operator
          {filteredOperators.length !== 1 ? "s" : ""} found
        </Typography>

        <Grid container spacing={3}>
          {filteredOperators.map((operator) => (
            <Grid item xs={12} md={6} lg={4} key={operator.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                  },
                  cursor: "pointer",
                }}
                onClick={() => handleOperatorSelect(operator)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <BusinessIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {operator.tradeName || "N/A"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {operator.code || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {operator.companyName || "N/A"}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    {operator.serviceLevelDesc && (
                      <Chip
                        label={operator.serviceLevelDesc}
                        color="primary"
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    )}
                    {operator.companyTypeDesc && (
                      <Chip
                        label={operator.companyTypeDesc}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>

                  {operator.phoneNumber && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <PhoneIcon color="action" sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">
                        {operator.phoneNumber}
                      </Typography>
                    </Box>
                  )}

                  {operator.email && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <EmailIcon color="action" sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">{operator.email}</Typography>
                    </Box>
                  )}

                  {operator.website && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <LanguageIcon
                        color="action"
                        sx={{ mr: 1, fontSize: 16 }}
                      />
                      <Typography variant="body2">
                        {operator.website}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <LocationOnIcon
                      color="action"
                      sx={{ mr: 1, fontSize: 16 }}
                    />
                    <Typography variant="body2">
                      {operator.subCityName || "N/A"},{" "}
                      {operator.cityName || "N/A"}
                    </Typography>
                  </Box>

                  {operator.specificAddress && (
                    <Typography variant="caption" color="text.secondary">
                      {operator.specificAddress}
                    </Typography>
                  )}
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOperatorSelect(operator);
                    }}
                  >
                    Select Operator
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredOperators.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No operators found matching your search
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try searching for a different operator name or location
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
