import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NavBar from "../components/navBar";

export default function TicketSuccessPage() {
  const history = useHistory();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Check for existing end time in local storage
    let endTime = localStorage.getItem("ticketSuccessRedirectTime");

    if (!endTime) {
      // If no end time, set it to 5 seconds from now
      endTime = Date.now() + 5000;
      localStorage.setItem("ticketSuccessRedirectTime", endTime);
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.ceil((parseInt(endTime) - now) / 1000);

      if (remaining <= 0) {
        clearInterval(interval);
        setCountdown(0);
        localStorage.removeItem("ticketSuccessRedirectTime");
        history.replace("/book");
      } else {
        setCountdown(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [history]);

  return (
    <Box>
      <NavBar />
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Paper
          elevation={3}
          sx={{
            p: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CheckCircleOutlineIcon
            sx={{ fontSize: 80, color: "success.main" }}
          />
          <Typography variant="h4" component="h1" gutterBottom>
            Booking Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your ticket has been booked successfully. Thank you for choosing us.
          </Typography>

          <Box sx={{ mt: 4, display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress
              variant="determinate"
              value={(100 * (5 - countdown)) / 5}
              size={24}
            />
            <Typography variant="body2" color="text.secondary">
              Redirecting to home in {countdown} seconds...
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={() => {
              localStorage.removeItem("ticketSuccessRedirectTime");
              history.replace("/");
            }}
            sx={{ mt: 2 }}
          >
            Go to Home Now
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
