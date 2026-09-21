import { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import axios from "axios";

import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import { ApiUrl, AuthApiKey } from "../config/api_url";
import Logo from "../assets/liyulogo.png";

export default function VerifyOtpForm() {
  const history = useHistory();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(
    location.state?.phoneNumber || ""
  );
  const [isError, setIsError] = useState({ value: false, message: "" });

  const onSubmit = (e) => {
    e.preventDefault();

    if (!phoneNumber || !otp) {
      setIsError({
        value: true,
        message: "Phone number and OTP are required",
      });
      return;
    }

    setIsLoading(true);

    axios
      .post(
        `${ApiUrl}/customers/auth/verify-phone`,
        {
          phoneNumber,
          otp,
        },
        {
          headers: {
            ...(AuthApiKey ? { "x-api-key": AuthApiKey } : {}),
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        console.log("OTP Verification Response:", res.data);
        history.push("/login");
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
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: { xs: 2, sm: 4 }, mt: 10 }}>
        <Avatar
          alt="Liyu bus"
          src={Logo}
          sx={{ width: 100, height: 100, mx: "auto" }}
        />

        <Typography
          variant="h5"
          component="h4"
          gutterBottom
          align="center"
          mt={3}
        >
          Verify Your Phone
        </Typography>

        <form onSubmit={onSubmit}>
          <Stack alignItems="center" spacing={3}>
            {isError.value && <Alert severity="error">{isError.message}</Alert>}

            <TextField
              fullWidth
              type="text"
              label="Phone Number"
              variant="standard"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <TextField
              fullWidth
              type="text"
              label="OTP Code"
              variant="standard"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
