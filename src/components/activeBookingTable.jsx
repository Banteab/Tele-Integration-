import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import axios from "axios";
import { CircularProgress, Grid } from "@material-ui/core";
import Countdown from "react-countdown";
import IconButton from "@material-ui/core/IconButton";
import { OpenInNew } from "@material-ui/icons";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";
import { ApiUrl } from "../config/api_url";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function createData(trip, passengers, seats, phone, timeLeft) {
  return { trip, passengers, seats, phone, timeLeft };
}

export default function ActiveBookingTable() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState({
    refNumber: "",
    phoneNumber: "",
    passengers: "",
    seat: "",
    status: "SEAT_ADDED",
    pickup: "",
    dropoff: "",
    bus: {
      sideNumber: "",
      plateNumber: "",
      status: "",
      busAssociation: {
        name: "",
        phone: "",
        email: "",
        websiteUrl: "",
        address: "",
        tinNumber: "",
        subCity: "",
        woreda: "",
        houseNo: "",
        status: "",
      },
    },
    trip: {
      from: "",
      to: "",
      price: 0,
      travelDate: "2021-07-21T21:00:00.000Z",
      blockedSeats: null,
      status: "",
    },
  });
  const [bookingRes, setBookingRes] = useState({
    loading: true,
    error: null,
    res: null,
  });
  const [deleteRes, setDeleteRes] = useState({
    loading: false,
    error: null,
    res: null,
  });
  const token = localStorage.getItem("liyu_login_token");

  const getActiveBooking = () => {
    axios
      .get(`${ApiUrl}/bank/portal/active-booking`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) =>
        setBookingRes({ loading: false, error: null, res: res.data })
      )
      .catch((err) =>
        setBookingRes({ loading: false, error: err.message, res: null })
      );
  };

  useEffect(() => {
    getActiveBooking();
  }, []);

  const deleteBooking = (id) => {
    setDeleteRes({ loading: true, error: null, res: null });
    axios
      .delete(`${ApiUrl}/bank/portal/booking/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setBookingRes({ loading: true, error: null, res: null });
        setDeleteRes({ loading: false, error: null, res: null });
        getActiveBooking();
        setOpen(false);
      })
      .catch((err) =>
        setDeleteRes({ loading: false, error: err.message, res: null })
      );
  };

  const error = bookingRes.error
    ? bookingRes.error
    : bookingRes.res
    ? !bookingRes.res.success
      ? bookingRes.res.message
      : false
    : false;

  const getDistance = (bookingDate) => {
    const now = new Date();
    const bd = new Date(bookingDate);
    const distance = 1800000 - (now - bd);
    return Date.now() + distance;
  };

  const bookingData = [];
  if (bookingRes.res) {
    if (bookingRes.res.length !== 0) {
      bookingRes.length = 0;
      bookingRes.res.forEach((booking) => {
        bookingData.push(
          createData(
            `${booking.trip.from} - ${booking.trip.to}`,
            booking.passengers,
            booking.seat,
            booking.phoneNumber,
            booking.timeLeft
          )
        );
      });
    }
  }

  console.log("BOOKING RES");
  console.log(bookingRes);
  console.log("BOOKING RES");

  return (
    <div>
      {bookingRes.loading ? (
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: "50vh" }}
        >
          <Grid item xs={3}>
            <CircularProgress />
          </Grid>
        </Grid>
      ) : null}
      {error ? (
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: "50vh" }}
        >
          <Grid item xs={3}>
            <h2 style={{ color: "red" }}>{error}</h2>
          </Grid>
        </Grid>
      ) : null}
      {bookingRes.res ? (
        bookingRes.res.length === 0 ? (
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ minHeight: "50vh" }}
          >
            <Grid item xs={3}>
              <h2 style={{ color: "red" }}>No Active booking</h2>
            </Grid>
          </Grid>
        ) : (
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Trip</TableCell>
                  <TableCell>Passengers</TableCell>
                  <TableCell>Seats</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Countdown</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookingData.map((row, index) => (
                  <TableRow key={row.name}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.trip}</TableCell>
                    <TableCell>{row.passengers}</TableCell>
                    <TableCell>{row.seats}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>
                      <Countdown
                        date={row.timeLeft}
                        renderer={({ minutes, seconds, completed }) => {
                          if (completed) {
                            return <p style={{ color: "red" }}>Expired</p>;
                          } else {
                            return (
                              <span style={{ color: "red" }}>
                                {minutes}:{seconds}
                              </span>
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => {
                          setSelectedDistance(Date.now() + row.distance);
                          setOpen(true);
                          setSelectedBooking(bookingRes.res[index]);
                        }}
                        aria-label="delete"
                        color="primary"
                      >
                        <OpenInNew />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : null}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Grid
            container
            direction="column"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>{`Booking: ${selectedBooking.refNumber ?? ""}`}</Grid>
            <Grid item>
              {deleteRes.res === null && deleteRes.loading === false ? (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => deleteBooking(selectedBooking.id)}
                >
                  Delete
                </Button>
              ) : deleteRes.loading ? (
                <CircularProgress />
              ) : deleteRes.res ? (
                deleteRes.res.success ? (
                  <p style={{ color: "green" }}>Deleted</p>
                ) : (
                  <p style={{ color: "red" }}>Error</p>
                )
              ) : null}
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Grid container>
            <Grid item xs={12}>
              <Card elevation={8}>
                <CardContent>
                  <React.Fragment>
                    <Typography variant="h5" color="primary" gutterBottom>
                      Search result
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" gutterBottom>
                          Passenger info.
                        </Typography>
                        <Typography gutterBottom>
                          Phone: {selectedBooking.phoneNumber}
                        </Typography>
                        {selectedBooking.passengers
                          .split(",")
                          .map((passenger, index) => {
                            const seat = selectedBooking.seat.split(",")[index];
                            return (
                              <Typography gutterBottom>
                                {`Passenger ${
                                  index + 1
                                } : ${passenger}, ${seat}`}
                              </Typography>
                            );
                          })}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" gutterBottom>
                          Bus info.
                        </Typography>
                        <Typography gutterBottom>
                          {`Bus: ${selectedBooking.bus.busAssociation.name}`}
                        </Typography>
                        <Typography gutterBottom>
                          {`Side number: ${selectedBooking.bus.sideNumber}`}
                        </Typography>
                        <Typography gutterBottom>
                          {`Plate number: ${selectedBooking.bus.plateNumber}`}
                        </Typography>
                      </Grid>
                      <Grid item container direction="column" xs={6} sm={6}>
                        <Typography variant="h6" gutterBottom>
                          Trip details
                        </Typography>
                        <Grid container>
                          <React.Fragment>
                            <Grid item xs={12}>
                              <Typography gutterBottom>
                                {`Route: ${selectedBooking.trip.from} - ${selectedBooking.trip.to}`}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography gutterBottom>
                                {`Price: ${selectedBooking.trip.price}`}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography gutterBottom>
                                {`Pick up: ${selectedBooking.pickup}`}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography gutterBottom>
                                {`Drop off: ${selectedBooking.dropoff}`}
                              </Typography>
                            </Grid>
                          </React.Fragment>
                        </Grid>
                      </Grid>
                      <Grid item container direction="column" xs={6} sm={6}>
                        <Typography variant="h6" gutterBottom>
                          Status
                        </Typography>
                        <Grid container>
                          <React.Fragment>
                            <Grid item xs={12}>
                              <Typography
                                align="center"
                                color={
                                  selectedBooking.status === "ACTIVE" ||
                                  selectedBooking.status === "SEAT_ADDED"
                                    ? "secondary"
                                    : selectedBooking.status === "BOOKED"
                                    ? "primary"
                                    : ""
                                }
                                style={{ fontWeight: "bold" }}
                              >
                                {selectedBooking.status === "ACTIVE" ||
                                selectedBooking.status === "SEAT_ADDED"
                                  ? "Not paid for"
                                  : selectedBooking.status === "BOOKED"
                                  ? "Ticket booked"
                                  : ""}
                              </Typography>
                            </Grid>
                          </React.Fragment>
                        </Grid>
                        <Typography variant="h6" gutterBottom>
                          Timer
                        </Typography>
                        <Grid container>
                          <React.Fragment>
                            <Grid item xs={12}>
                              <Countdown
                                date={selectedBooking.timeLeft}
                                renderer={({ minutes, seconds, completed }) => {
                                  if (completed) {
                                    return (
                                      <Typography
                                        align="center"
                                        color="secondary"
                                        style={{ fontWeight: "bold" }}
                                      >
                                        Expired
                                      </Typography>
                                    );
                                  } else {
                                    return (
                                      <Typography
                                        align="center"
                                        color="secondary"
                                        style={{ fontWeight: "bold" }}
                                      >
                                        {minutes}:{seconds}
                                      </Typography>
                                    );
                                  }
                                }}
                              />
                            </Grid>
                          </React.Fragment>
                        </Grid>
                      </Grid>
                    </Grid>
                  </React.Fragment>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={() => setOpen(false)} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
