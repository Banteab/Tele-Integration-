import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

import { ApiUrl } from "../config/api_url";
import NavBar from "../components/navBar";

export default function PaymentInstructionsPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const { bank } = location.state || { bank: "Addis Pay" };
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("liyu_login_token");
    axios
      .get(`${ApiUrl}/booking/${bookingId}/customer`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPaymentDetail(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <>
        <NavBar />
        <Container maxWidth="sm" sx={{ mt: 10 }}>
          <Typography align="center">Loading instructions...</Typography>
        </Container>
      </>
    );
  }

  if (!paymentDetail) {
    return (
      <>
        <NavBar />
        <Container maxWidth="sm" sx={{ mt: 10 }}>
          <Alert severity="error">Failed to load payment details.</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Container maxWidth="sm" sx={{ mt: 16 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Your trip has been reserved!
          </Alert>

          <Typography variant="h5" gutterBottom>
            Payment Instructions
          </Typography>

          <Typography variant="body1" sx={{ mt: 2 }}>
            Please follow the steps below to complete your payment using {bank}:
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography>Step 1: Go to your nearest Branch Office.</Typography>
            <Typography>
              Step 2: Use LiyuBus account and enter the Reservation Code as the
            </Typography>
            <Typography>
              Step 3: Your Reservation Code is <b>{paymentDetail.refNumber}</b>
            </Typography>
            <Typography>
              Step 4: Enter the amount:{" "}
              <b>
                {paymentDetail.passengers.split(",").length *
                  paymentDetail.trip.price}{" "}
                ETB
              </b>
            </Typography>
          </Stack>

          <Alert severity="error" sx={{ mt: 3 }}>
            Please make your payment within 45 minutes. Your reservation will
            expire after this time.
          </Alert>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Important Note</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              If you request a refund for this payment in the future, the refund
              will be processed to the account used for the original payment.
              Ensure the payment is made from your own bank/wallet account.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
