import { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

import { ApiUrl, AuthApiKey } from "../config/api_url";
import { location, gender, maritalStatus } from "../config/constants";

export default function CompleteProfilePage() {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState({ value: false, message: "" });

  // Personal Info
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Dropdowns
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState("");

  // Location
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSubCity, setSelectedSubCity] = useState("");

  // Derived lists for cascading dropdowns
  const [cities, setCities] = useState([]);
  const [subCities, setSubCities] = useState([]);

  // Handle Region Change
  const handleRegionChange = (e) => {
    const regionId = e.target.value;
    setSelectedRegion(regionId);
    setSelectedCity("");
    setSelectedSubCity("");

    const region = location.find((l) => l.id === regionId);
    setCities(region ? region.cities : []);
    setSubCities([]);
  };

  // Handle City Change
  const handleCityChange = (e) => {
    const cityId = e.target.value;
    setSelectedCity(cityId);
    setSelectedSubCity("");

    const city = cities.find((c) => c.id === cityId);
    setSubCities(city ? city.subCities : []);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsError({ value: false, message: "" });

    // Validation
    if (
      !firstName ||
      !middleName ||
      !lastName ||
      !selectedGender ||
      !selectedMaritalStatus ||
      !selectedRegion ||
      !selectedCity
    ) {
      setIsError({
        value: true,
        message: "Please fill in all required fields.",
      });
      return;
    }

    // If subcities exist for the selected city, make subcity required
    if (subCities.length > 0 && !selectedSubCity) {
      setIsError({
        value: true,
        message: "Please select a sub-city.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("authtoken");
      if (!token) {
        throw new Error("No auth token found. Please login again.");
      }

      const payload = {
        firstName,
        middleName,
        lastName,
        email,
        gender: selectedGender,
        maritalStatus: selectedMaritalStatus,
        region: selectedRegion,
        city: selectedCity,
        subCity: selectedSubCity || null,
      };

      const response = await axios.put(`${ApiUrl}/users/me`, payload, {
        headers: {
          ...(AuthApiKey ? { "x-api-key": AuthApiKey } : {}),
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Response is the updated user object directly
      const updatedUser = response.data;

      if (updatedUser && updatedUser.id) {
        // Update user data in localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        history.push("/");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      setIsError({
        value: true,
        message:
          err.response?.data?.message || err.message || "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: { xs: 2, sm: 4 }, mt: 5, mb: 5 }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          Complete Your Profile
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" mb={3}>
          Please provide your details to continue.
        </Typography>

        <form onSubmit={onSubmit}>
          <Stack spacing={2}>
            {isError.value && <Alert severity="error">{isError.message}</Alert>}

            <TextField
              label="First Name"
              fullWidth
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              label="Middle Name"
              fullWidth
              required
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
            <TextField
              label="Last Name"
              fullWidth
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <FormControl fullWidth required>
              <InputLabel>Gender</InputLabel>
              <Select
                value={selectedGender}
                label="Gender"
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                {gender.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Marital Status</InputLabel>
              <Select
                value={selectedMaritalStatus}
                label="Marital Status"
                onChange={(e) => setSelectedMaritalStatus(e.target.value)}
              >
                {maritalStatus.map((ms) => (
                  <MenuItem key={ms.id} value={ms.id}>
                    {ms.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Region</InputLabel>
              <Select
                value={selectedRegion}
                label="Region"
                onChange={handleRegionChange}
              >
                {location.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required disabled={!selectedRegion}>
              <InputLabel>City</InputLabel>
              <Select
                value={selectedCity}
                label="City"
                onChange={handleCityChange}
              >
                {cities.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {subCities.length > 0 && (
              <FormControl fullWidth required>
                <InputLabel>Sub City</InputLabel>
                <Select
                  value={selectedSubCity}
                  label="Sub City"
                  onChange={(e) => setSelectedSubCity(e.target.value)}
                >
                  {subCities.map((sc) => (
                    <MenuItem key={sc.id} value={sc.id}>
                      {sc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? "Saving..." : "Complete Profile"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
