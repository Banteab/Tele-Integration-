import { useState } from "react";
import { useHistory } from "react-router-dom";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Unstable_Grid2";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import DescriptionIcon from "@mui/icons-material/Description";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import axios from "axios";
import SeatStructure from "./busStructure";
import PassengerInfoModal from "../components/PassengerInfoModal";
import { ApiUrl, AuthApiKey } from "../config/api_url";

export default function ViewSeates({ bus, journeyDate }) {
  const history = useHistory();
  const currentDate = new Date();
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [boardingLoc, setBoardingLoc] = useState("");
  const [droppingLoc, setDroppingLoc] = useState("");
  const [mobile, setMobile] = useState("");
  const [isError, setIsError] = useState({ value: false, message: "" });
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [boardingPoints, setBoardingPoints] = useState(
    bus.pickup ? bus.pickup.split(",") : []
  );
  const [droppingPoints, setDroppingPoints] = useState(
    bus.dropoff ? bus.dropoff.split(",") : []
  );
  const [passengers, setPassengers] = useState([]);
  const [busInformation, setBusInformation] = useState({
    tac: false,
    am: false,
    cp: false,
  });

  const handleModal = async () => {
    if (!boardingLoc || !droppingLoc || !mobile) {
      setIsError({
        value: true,
        message: "All fields are required!",
      });
      return;
    }
    if (passengers.length < selectedSeats.length) {
      setIsError({
        value: true,
        message: "All name fields are required!",
      });
      return;
    }

    if (selectedSeats.length === 0) {
      setIsError({
        value: true,
        message: "Please select at least one seat",
      });
      return;
    }

    const bookingId = selectedSeats[0].bookingId;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("liyu_login_token");
      const res = await axios.post(
        `${ApiUrl}/booking/update-status/${bookingId}`,
        { status: "SEAT_ADDED" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(AuthApiKey ? { "x-api-key": AuthApiKey } : {}),
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        setOpenModal(true);
        setIsError({ value: false, message: "" });
      } else {
        setIsError({
          value: true,
          message: res.data.message || "Failed to update booking status",
        });
      }
    } catch (err) {
      setIsError({
        value: true,
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <Container>
      <Stack spacing={4} my={5}>
        <Grid container spacing={2}>
          <Grid xs={4}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                mb={2}
              >
                <Box width="30%">
                  <Box style={{ height: 3, background: "#ff0000" }}></Box>
                  <Typography variant="subtitle2" component="p">
                    Sold
                  </Typography>
                </Box>
                <Box width="30%">
                  <Box style={{ height: 3, background: "#00ff00" }}></Box>
                  <Typography variant="subtitle2" component="p">
                    Selected
                  </Typography>
                </Box>
                <Box width="30%">
                  <Box style={{ height: 3, background: "#1976D2" }}></Box>
                  <Typography variant="subtitle2" component="p">
                    Available
                  </Typography>
                </Box>
              </Stack>
              <Box width="100%" mb={2} ml={6}>
                <SeatStructure
                  key={bus.id}
                  selectedBus={bus}
                  selectedSeats={selectedSeats.map((seat) => seat.seatNo)}
                  addSeat={(seatNo, bookingId) => {
                    setSelectedSeats((prev) => [
                      ...prev,
                      { seatNo, bookingId },
                    ]);
                  }}
                  removeSeat={(seatId) => {
                    setSelectedSeats((prev) =>
                      prev.filter((seat) => seat.seatNo !== seatId)
                    );
                    setPassengers((prev) => {
                      const seatIndex = selectedSeats.findIndex(
                        (seat) => seat.seatNo === seatId
                      );
                      if (seatIndex !== -1) {
                        const newPassengers = [...prev];
                        newPassengers.splice(seatIndex, 1);
                        return newPassengers;
                      }
                      return prev;
                    });
                  }}
                  error={isError.message}
                />
              </Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Tooltip title="Amenities">
                  <IconButton
                    onClick={() =>
                      setBusInformation({
                        tac: false,
                        am: true,
                        cp: false,
                      })
                    }
                  >
                    <FastfoodIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Terms and conditions">
                  <IconButton
                    onClick={() =>
                      setBusInformation({
                        tac: true,
                        am: false,
                        cp: false,
                      })
                    }
                  >
                    <DescriptionIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancellation policy">
                  <IconButton
                    onClick={() =>
                      setBusInformation({
                        tac: false,
                        am: false,
                        cp: true,
                      })
                    }
                  >
                    <CancelPresentationIcon />
                  </IconButton>
                </Tooltip>
                <Dialog
                  open={
                    busInformation.am || busInformation.cp || busInformation.tac
                  }
                  onClose={() =>
                    setBusInformation({ am: false, cp: false, tac: false })
                  }
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                  fullWidth={true}
                  maxWidth="sm"
                >
                  <DialogTitle id="alert-dialog-title">
                    {busInformation.am
                      ? "Amenities"
                      : busInformation.tac
                      ? "Terms and conditions"
                      : busInformation.cp
                      ? "Cancellation Policy"
                      : null}
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                      {busInformation.am
                        ? bus.amenities.map((amenity) => <p>{amenity}</p>)
                        : busInformation.tac
                        ? bus.terms
                        : busInformation.cp
                        ? bus.cancellationPolicy.map((cancell) => (
                            <p>
                              {cancell.name} days - {cancell.value}%
                            </p>
                          ))
                        : null}
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() =>
                        setBusInformation({ am: false, cp: false, tac: false })
                      }
                      color="primary"
                      autoFocus
                    >
                      Cancel
                    </Button>
                  </DialogActions>
                </Dialog>
              </Stack>
            </Paper>
          </Grid>
          <Grid xs={8}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              {isError.value && (
                <Alert severity="error">{isError.message}</Alert>
              )}
              <form onSubmit={onSubmit}>
                <Stack
                  direction="row"
                  spacing={3}
                  justifyContent="center"
                  my={3}
                  // sx={{ p: 1, border: "1px solid #111" }}
                >
                  <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel id="boardingPoint">Boarding Point</InputLabel>
                    <Select
                      labelId="boardingPoint"
                      value={boardingLoc}
                      onChange={(e) => setBoardingLoc(e.target.value)}
                      label="Boarding Point"
                    >
                      {boardingPoints.map((loc) => (
                        <MenuItem
                          key={loc + "boarding"}
                          value={loc ? loc : "bus station"}
                        >
                          {loc ? loc : "Bus Station"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl variant="outlined" size="small" fullWidth>
                    <InputLabel id="droppingPoint">Dropping Point</InputLabel>
                    <Select
                      labelId="droppingPoint"
                      value={droppingLoc}
                      onChange={(e) => setDroppingLoc(e.target.value)}
                      label="Dropping Point"
                    >
                      {droppingPoints.map((loc) => (
                        <MenuItem
                          key={loc + "dropping"}
                          value={loc ? loc : "bus station"}
                        >
                          {loc ? loc : "Bus Station"}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                {selectedSeats.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={3}
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                    // sx={{ p: 1, border: "1px solid #111" }}
                  >
                    <Box>
                      {selectedSeats?.map((seat, index) => (
                        <>
                          <Typography variant="p" component="p" gutterBottom>
                            Passenger {index + 1}
                            <br />
                            Seat No.: {seat.seatNo}
                          </Typography>
                          <Divider />
                        </>
                      ))}
                    </Box>
                    <Box>
                      <Box>
                        <Divider />
                        <Stack spacing={3} justifyContent="center" my={3}>
                          <TextField
                            type="number"
                            id="mobile"
                            label="Mobile"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                          />
                          {selectedSeats?.map((seat, index) => {
                            return (
                              <TextField
                                key={`passenger-${seat.seatNo}-${index}`}
                                type="text"
                                id={`fullName-${index}`}
                                label={`${index + 1} Full Name`}
                                variant="outlined"
                                size="small"
                                value={passengers[index] || ""}
                                onChange={(e) => {
                                  setPassengers((prev) => {
                                    const newPassengers = [...prev];
                                    newPassengers[index] = e.target.value;
                                    return newPassengers;
                                  });
                                }}
                              />
                            );
                          })}
                        </Stack>
                        <Divider />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="h6" component="p" gutterBottom>
                        {bus.price} Birr
                      </Typography>
                    </Box>
                  </Stack>
                )}
                <Stack
                  direction="row"
                  spacing={4}
                  justifyContent="space-between"
                  mb={3}
                  // sx={{ p: 1, border: "1px solid #111" }}
                >
                  <Typography variant="h5" component="p" gutterBottom>
                    Total
                  </Typography>
                  <Typography variant="h5" component="p" gutterBottom>
                    {bus.price * selectedSeats.length} Birr
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleModal}
                >
                  Continue
                </Button>

                {openModal && (
                  <PassengerInfoModal
                    setOpenModal={setOpenModal}
                    bus={bus}
                    busAssociation={bus.busAssociation}
                    selectedSeat={selectedSeats}
                    passengers={passengers}
                    mobile={mobile}
                    fromLoc={bus.from}
                    toLoc={bus.to}
                    price={bus.price}
                    departureTime={bus.departureTime}
                    terms={bus.terms}
                    journeyDate={journeyDate}
                    boardingLoc={boardingLoc}
                    droppingLoc={droppingLoc}
                    tripId={bus.id}
                  />
                )}
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
