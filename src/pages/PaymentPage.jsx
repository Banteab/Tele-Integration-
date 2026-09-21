import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Countdown from "react-countdown";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { ApiUrl } from "../config/api_url";
import NavBar from "../components/navBar";
import Stepper from "../components/stepper";
import { useHistory } from "react-router-dom";
import cbe from "../assets/cbe.png";
import bankOfAbyssinia from "../assets/boa.webp";
import awashBank from "../assets/awash.png";
import oromiaBank from "../assets/coop.jpg";
import bunnaBank from "../assets/buna.png";
import amole from "../assets/amole.webp";
import abayBank from "../assets/abay.png";
import telebirr from "../assets/telebirr.jpg";
import ebirr from "../assets/ebirr.png";
import cbeBirr from "../assets/cbebirr.png";

const bankImages = {
  CBE: cbe,
  "Bank of Abyssinia": bankOfAbyssinia,
  "Awash Bank": awashBank,
  "Oromia Bank": oromiaBank,
  "Bunna Bank": bunnaBank,
  Amole: amole,
  "Abay Bank": abayBank,
};
const onlinePaymentImages = {
  Telebirr: telebirr,
  "E-Birr": ebirr,
  "CBE Birr": cbeBirr,
};
export default function PaymentPage() {
  const { bookingId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState({ value: false, message: "" });
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedMobile, setSelectedMobile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const history = useHistory();

  useEffect(() => {
    setIsLoading(true);
    const token = localStorage.getItem("liyu_login_token");

    axios
      .get(`${ApiUrl}/booking/${bookingId}/customer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setPaymentDetail(res.data);
      })
      .catch((err) =>
        setIsError({
          value: true,
          message: err.message || "Failed to fetch booking detail",
        })
      )
      .finally(() => setIsLoading(false));
  }, [bookingId]);

  const handleProceed = () => {
    if (!paymentDetail || !selectedBank) return;
    history.push(`/payment-instructions/${bookingId}`, {
      state: { bank: selectedBank },
    });
  };

  const handleSelectBank = (bank) => {
    setSelectedBank(bank);
    setSelectedMobile(null);
  };
  const handleMobilePayment = (method) => {
    setSelectedMobile(method);
    setSelectedBank(null);
  };
  const handleProceedMobile = async () => {
    if (!paymentDetail || !selectedMobile) return;

    if (selectedMobile !== "Telebirr") {
      alert("Only Telebirr is supported for mobile payment at this time.");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("liyu_login_token");

    // Calculate total amount
    const passengerCount = paymentDetail.passengers.split(",").length;
    const totalAmount = passengerCount * paymentDetail.trip.price;

    try {
      // Payment preOrder via Menahariya API
      const res = await axios.post(
        `${ApiUrl}/payment/preorder`,
        {
          amount: totalAmount.toString(),
          title: `Ticket Booking - ${paymentDetail.refNumber}`,
          notifyUrl: "https://your-domain.com/payment/callback",
          extra: {
            merch_order_id: paymentDetail.refNumber
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data && res.data.checkoutUrl) {
        // Start Pay - User's preferred redirection pattern
        const anchorEle = document.createElement("a");
        anchorEle.setAttribute("href", res.data.checkoutUrl);
        anchorEle.setAttribute("target", "_blank");
        anchorEle.setAttribute("rel", "external");
        anchorEle.style.display = "none";
        document.body.appendChild(anchorEle); // Append to body for safety
        anchorEle.click();
        document.body.removeChild(anchorEle); // Cleanup
      } else {
        alert(res.data.message || "Failed to create Telebirr order");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating Telebirr order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <NavBar />
        <Container maxWidth="sm">
          <Typography variant="h6" textAlign="center" mt={10}>
            Loading booking details...
          </Typography>
        </Container>
      </>
    );
  }

  if (isError.value) {
    return (
      <>
        <NavBar />
        <Container maxWidth="sm">
          <Typography variant="h6" color="error" textAlign="center" mt={10}>
            {isError.message}
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Container maxWidth="sm">
        <Stack spacing={4} my={10}>
          <Stepper activeStep={3} />
          <Paper elevation={3} sx={{ padding: 2 }}>
            {/* Countdown Header */}
            <Stack
              justifyContent="center"
              alignItems="center"
              sx={{ padding: 2 }}
            >
              <Typography variant="h5" component="p" gutterBottom>
                WAITING FOR PAYMENT
              </Typography>

              {paymentDetail && (
                <Countdown
                  date={
                    new Date(paymentDetail.firstSeatReserved).getTime() +
                    45 * 60 * 1000
                  }
                  renderer={({ minutes, seconds, completed }) => {
                    if (completed) {
                      return (
                        <p
                          style={{
                            color: "#1976D2",
                            fontWeight: "bold",
                            border: "4px solid #1976D2",
                            padding: 3,
                          }}
                        >
                          Expired
                        </p>
                      );
                    } else {
                      return (
                        <span style={{ color: "red" }}>
                          {minutes}:{seconds}
                        </span>
                      );
                    }
                  }}
                />
              )}

              <Typography
                variant="h5"
                component="p"
                gutterBottom
                color="primary"
              >
                Time Remaining
              </Typography>
            </Stack>

            {/* Booking info */}
            {paymentDetail && (
              <Box sx={{ padding: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" component="p" gutterBottom>
                    Reference number:{" "}
                    <span style={{ color: "red" }}>
                      {paymentDetail.refNumber}
                    </span>
                  </Typography>
                  <IconButton
                    color="primary"
                    onClick={() =>
                      navigator.clipboard.writeText(paymentDetail.refNumber)
                    }
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Stack>

                <Typography variant="h6" component="p" gutterBottom mb={3}>
                  Total amount:{" "}
                  {paymentDetail.passengers.split(",").length *
                    paymentDetail.trip.price}{" "}
                  Birr
                </Typography>

                {/* Payment Options Dropdowns */}

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Bank Transfer</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {Object.keys(bankImages).map((bank) => (
                        <Grid item xs={6} key={bank}>
                          <Card
                            sx={{
                              border:
                                selectedBank === bank
                                  ? "2px solid #1976D2"
                                  : "1px solid #ccc",
                            }}
                          >
                            <CardActionArea
                              onClick={() => handleSelectBank(bank)}
                            >
                              <CardContent sx={{ textAlign: "center" }}>
                                <img
                                  src={bankImages[bank]}
                                  alt={bank}
                                  style={{
                                    maxHeight: 50,
                                    objectFit: "contain",
                                  }}
                                />
                                <Typography sx={{ mt: 1 }}>{bank}</Typography>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Mobile Payment</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {Object.keys(onlinePaymentImages).map((mp) => (
                        <Grid item xs={6} key={mp}>
                          <Card
                            sx={{
                              border:
                                selectedMobile === mp
                                  ? "2px solid #1976D2"
                                  : "1px solid #ccc",
                            }}
                          >
                            <CardActionArea
                              onClick={() => handleMobilePayment(mp)}
                            >
                              <CardContent sx={{ textAlign: "center" }}>
                                <img
                                  src={onlinePaymentImages[mp]}
                                  alt={mp}
                                  style={{
                                    maxHeight: 50,
                                    objectFit: "contain",
                                  }}
                                />
                                <Typography sx={{ mt: 1 }}>{mp}</Typography>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                {selectedBank && (
                  <Box mt={3} textAlign="center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleProceed}
                    >
                      proceed with {selectedBank}
                    </Button>
                  </Box>
                )}

                {selectedMobile && (
                  <Box mt={3} textAlign="center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleProceedMobile}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : `Proceed with Telebirr`}
                    </Button>
                  </Box>
                )}

                <Box mt={3}>
                  <Typography variant="subtitle1" component="p" gutterBottom>
                    Note
                  </Typography>
                  <ul>
                    <li>Please do not pay when session time expire.</li>
                    <li>
                      The seat(s) will be released to the market if not paid on
                      time.
                    </li>
                    <li>
                      Please call 9439 or 0982117777 for Online assistance.
                    </li>
                  </ul>
                </Box>
              </Box>
            )}
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
