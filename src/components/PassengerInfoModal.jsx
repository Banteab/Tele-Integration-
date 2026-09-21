import { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { ApiUrl, AuthApiKey } from "../config/api_url";
import Stepper from "./stepper";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", sm: 400 },
  bgcolor: "background.paper",
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
};

export default function PassengerInfoModal(props) {
  const history = useHistory();
  const [openCollapse, setOpenCollapse] = useState(false);

  const {
    setOpenModal,
    bus,
    busAssociation,
    selectedSeat,
    passengers,
    fromLoc,
    toLoc,
    price,
    departureTime,
    terms,
    journeyDate,
    boardingLoc,
    droppingLoc,
    mobile,
    tripId,
  } = props;

  const token = localStorage.getItem("liyu_login_token");
  const handleBooking = async () => {
    const bookingId = selectedSeat[0].bookingId;
    try {
      await axios.post(
        `${ApiUrl}/booking/passgenger-data-customer/${bookingId}`,
        {
          phoneNumber: mobile,
          passengers: passengers.join(","),
          pickup: boardingLoc,
          dropoff: droppingLoc,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(AuthApiKey ? { "x-api-key": AuthApiKey } : {}),
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.removeItem(`selected_seats_${tripId}`);

      history.push(`/payment/${bookingId}`);
    } catch (err) {
      console.error("Booking error:", err);
    }
  };

  return (
    <Box>
      <Modal open={true} onClose={() => setOpenModal(false)}>
        <Stack style={style} spacing={4}>
          <Paper elevation={3} sx={{ borderRadius: 1, p: 4 }}>
            <Stepper activeStep={2} />
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{
                mt: 3,
                textAlign: "center",
                width: "100%",
                background: "#111",
                color: "#fff",
                padding: 1,
              }}
            >
              PLEASE CHECK YOUR DATA, CONFIRM!
            </Typography>

            <Stack
              direction="row"
              spacing={4}
              justifyContent="space-between"
              my={4}
            >
              <Paper elevation={3} sx={{ padding: 2, width: 350 }}>
                <Typography
                  variant="p"
                  component="p"
                  gutterBottom
                  sx={{
                    textAlign: "center",
                    width: "100%",
                    background: "#111",
                    color: "#fff",
                    padding: 1,
                  }}
                >
                  DETAILS OF THE TRIP
                </Typography>
                <List>
                  <ListItem disablePadding>
                    <ListItemText primary="Bus Association:" />
                    <ListItemText secondary={busAssociation} />
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemText primary="Route:" />
                    <ListItemText secondary={`${fromLoc} - ${toLoc}`} />
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemText primary="Price" />
                    <ListItemText secondary={`${price} birr`} />
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemText primary="Boarding point:" />
                    <ListItemText secondary={boardingLoc} />
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemText primary="Dropping point:" />
                    <ListItemText secondary={droppingLoc} />
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemText primary="Departure time:" />
                    <ListItemText secondary={departureTime} />
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemText primary="Journey date:" />
                    <ListItemText secondary={journeyDate} />
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemText primary="Total Seat:" />
                    <ListItemText secondary={selectedSeat.length} />
                  </ListItem>
                  <Divider />
                </List>
              </Paper>

              <Paper elevation={3} sx={{ padding: 2, width: 350 }}>
                <Typography
                  variant="p"
                  component="p"
                  gutterBottom
                  sx={{
                    textAlign: "center",
                    width: "100%",
                    background: "#111",
                    color: "#fff",
                    padding: 1,
                  }}
                >
                  PASSENGER INFO
                </Typography>
                <ListItem disablePadding>
                  <ListItemText primary="Mobile:" />
                  <ListItemText secondary={mobile} />
                </ListItem>
                <Divider />
                {passengers?.map((passenger, index) => (
                  <List>
                    <ListItem disablePadding>
                      <ListItemText primary={`${index + 1} Full Name:`} />
                      <ListItemText secondary={passenger} />
                    </ListItem>
                    <Divider />
                  </List>
                ))}
              </Paper>

              <Paper elevation={3} sx={{ padding: 2, width: 350 }}>
                <Typography
                  variant="p"
                  component="p"
                  gutterBottom
                  sx={{
                    textAlign: "center",
                    width: "100%",
                    background: "#111",
                    color: "#fff",
                    padding: 1,
                  }}
                >
                  PAYMENT DETAILS
                </Typography>
                <List>
                  <ListItem disablePadding>
                    <ListItemText primary="Subtotal:" />
                    <ListItemText secondary={`${price} birr`} />
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemText primary="Total amount:" />
                    <ListItemText
                      secondary={`${price * selectedSeat.length} birr`}
                    />
                  </ListItem>
                  <Divider />
                  <ListItemButton
                    onClick={() => setOpenCollapse(!openCollapse)}
                  >
                    <ListItemText secondary="Terms & Condition" />
                    {openCollapse ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={openCollapse} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <ListItemText primary={terms} />
                    </List>
                  </Collapse>
                </List>
              </Paper>
            </Stack>

            <Box sx={{ textAlign: "right" }}>
              <Button variant="contained" onClick={handleBooking}>
                Proceed to Pay
              </Button>
            </Box>
          </Paper>
        </Stack>
      </Modal>
    </Box>
  );
}
