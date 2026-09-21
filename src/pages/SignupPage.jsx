import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Link } from "react-router-dom";

import { ApiUrl, AuthApiKey } from "../config/api_url";
import Logo from "../assets/liyulogo.png";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function SignupForm() {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isError, setIsError] = useState({ value: false, message: "" });

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

  const onSubmit = (e) => {
    e.preventDefault();

    if (!phoneNumber || !password) {
      setIsError({
        value: true,
        message: "All required fields must be filled!",
      });
      return;
    }

    setIsLoading(true);

    axios
      .post(
        `${ApiUrl}/auth/register`,
        {
          phoneNumber,
          password,
        },
        {
          headers: {
            ...(AuthApiKey ? { "x-api-key": AuthApiKey } : {}),
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        // Response structure: { user: {...}, token: "..." }
        const { user, token } = res.data;

        if (token && user) {
          // Save token as "authtoken"
          localStorage.setItem("authtoken", token);
          // Save user data
          localStorage.setItem("user", JSON.stringify(user));
          // Store phone number for UI
          localStorage.setItem("liyu_phone", phoneNumber);

          history.push("/complete-profile");
        } else {
          setIsError({
            value: true,
            message: "Invalid response from server",
          });
        }
      })
      .catch((err) =>
        setIsError({
          value: true,
          message: err.response?.data?.message || err.message,
        })
      )
      .finally(() => setIsLoading(false));
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
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

        <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box sx={{ textAlign: "center", color: "white" }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: "bold", mb: 1 }}>
              Join Us
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Create your account to get started
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper
          elevation={10}
          sx={{
            padding: { xs: 3, sm: 5 },
            borderRadius: 2,
            bgcolor: "white",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Avatar
              alt="Liyu bus"
              src={Logo}
              sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
            />
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ color: "#4caf50", fontWeight: "bold" }}
            >
              Create Liyu Bus Customer Account
            </Typography>
          </Box>

          <form onSubmit={onSubmit}>
            <Stack spacing={3}>
              {isError.value && (
                <Alert severity="error" onClose={() => setIsError({ value: false, message: "" })}>
                  {isError.message}
                </Alert>
              )}

              <TextField
                fullWidth
                type="text"
                label="Phone Number"
                variant="outlined"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#4caf50",
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                type="password"
                label="Password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#4caf50",
                    },
                  },
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isLoading}
                size="large"
                sx={{
                  bgcolor: "#4caf50",
                  "&:hover": {
                    bgcolor: "#45a049",
                  },
                  fontWeight: "bold",
                  py: 1.5,
                  mt: 2,
                }}
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>

              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "#4caf50",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Login
                </Link>
              </Typography>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
