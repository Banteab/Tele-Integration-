import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ApiUrl } from "../config/api_url";
import PrintLayout from "./printLayout";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { format } from "date-fns";

export default function BookedTicket() {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [data, setData] = useState({ loading: true, data: null, error: null });
  const [open, setOpen] = useState(false);
  const [ticket, setTicket] = useState({
    ticketNo: "",
    booking: {
      phoneNumber: "0953442540",
      passengers: "kdbsjf",
      seat: "6",
      status: "BOOKED",
      pickup: "lam beret",
      dropoff: "bus station",
      bus: {
        sideNumber: "1111",
        plateNumber: "3-05743",
        busAssociation: {
          name: "Dream liner",
        },
      },
      trip: {
        id: 7,
        from: "addis ababa",
        to: "gondar",
        price: 600,
      },
    },
  });
  const token = localStorage.getItem("liyu_login_token");

  useEffect(() => {
    const date = format(selectedDate, "yyyy-MM-dd");
    setData({ loading: true, data: null, error: null });
    axios
      .get(`${ApiUrl}/bank/portal/booked?date=${date}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setData({ loading: false, data: res.data }))
      .catch((err) => setData({ loading: false, error: err }));
  }, [selectedDate]);

  const capitalizeFirst = (name) => {
    const newName = name?.split(" ").map((n) => {
      return n.charAt(0).toUpperCase() + n.slice(1);
    });
    return newName?.join(" ");
  };

  const handleDataSearch = (key) => {
    const newD = data?.data?.data?.filter((d) =>
      d.ticketNo.toLowerCase().includes(key.toLowerCase())
    );
    setData({
      loading: false,
      error: null,
      data: { ...data.data, data: newD },
    });
  };

  console.log("------");
  console.log(data);
  console.log("--------");

  return (
    <div>
      <div>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Grid container justifyContent="space-around" className="pb-100">
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="dd/MM/yyyy"
              margin="normal"
              id="date-picker-inline"
              label="Ticket date"
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
            />
          </Grid>
        </MuiPickersUtilsProvider>
      </div>
      <div style={{ paddingTop: 20, paddingBottom: 20 }}>
        {data.loading ? (
          <div style={{ height: "55vh" }}>
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
          </div>
        ) : (
          <div />
        )}

        {data.error ? (
          <div style={{ height: "55vh" }}>
            <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justify="center"
              style={{ minHeight: "50vh" }}
            >
              <Grid item xs={3}>
                <h1 style={{ color: "red" }}>ERROR OCCURED</h1>
              </Grid>
            </Grid>
          </div>
        ) : (
          <div />
        )}

        {data.data ? (
          data.data.success ? (
            data.data.data.length === 0 ? (
              <div style={{ maxHeight: "50vh", overflow: "auto" }}>
                <Grid
                  container
                  spacing={0}
                  direction="column"
                  alignItems="center"
                  justify="center"
                  style={{ minHeight: "50vh" }}
                >
                  <Grid item xs={3}>
                    <h1 style={{ color: "red" }}>No Data Found</h1>
                  </Grid>
                </Grid>
              </div>
            ) : (
              <Grid
                container
                spacing={4}
                direction="column"
                alignItems="center"
                justify="center"
              >
                <div
                  style={{ maxHeight: "50vh", overflow: "auto", width: "80%" }}
                >
                  {data.data.data.map((ticket) => {
                    return (
                      <Grid item>
                        <CardActionArea
                          onClick={() => {
                            setTicket(ticket);
                            setOpen(true);
                          }}
                          style={{ padding: 10 }}
                        >
                          <Card elevation={5}>
                            {/* <CardContent> */}
                            <div style={{ padding: 10 }}>
                              <Typography component="h2" variant="h5">
                                {`${capitalizeFirst(
                                  ticket.booking?.trip?.from
                                )} - ${capitalizeFirst(
                                  ticket.booking?.trip?.to
                                )}`}
                              </Typography>
                              <Typography
                                variant="subtitle1"
                                color="textSecondary"
                              >
                                {ticket.booking?.bus?.busAssociation?.name}
                                <br />
                                {`Ticket No: ${ticket?.ticketNo} | Passenger: ${ticket.booking?.passengers} | Phone number: ${ticket.booking?.phoneNumber}`}
                              </Typography>
                            </div>
                            {/* </CardContent> */}
                          </Card>
                        </CardActionArea>
                      </Grid>
                    );
                  })}
                </div>
              </Grid>
            )
          ) : (
            <div style={{ height: "55vh" }}>
              <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{ minHeight: "50vh" }}
              >
                <Grid item xs={3}>
                  <h1 style={{ color: "red" }}>ERROR OCCURED</h1>
                </Grid>
              </Grid>
            </div>
          )
        ) : null}
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="lg"
      >
        {/* <DialogTitle id="alert-dialog-title">
          {`Ticket: ${ticket.ticketNo ?? ""}`}
        </DialogTitle> */}
        <DialogContent>
          <PrintLayout ticket={ticket} />
          {/* <Grid container>
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
                          Phone: {ticket.booking.phoneNumber}
                        </Typography>
                        {ticket.booking.passengers
                          .split(",")
                          .map((passenger, index) => {
                            const seat = ticket.booking.seat.split(",")[index];
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
                          {`Bus: ${ticket.booking.bus.busAssociation.name}`}
                        </Typography>
                        <Typography gutterBottom>
                          {`Side number: ${ticket.booking.bus.sideNumber}`}
                        </Typography>
                        <Typography gutterBottom>
                          {`Plate number: ${ticket.booking.bus.plateNumber}`}
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
                                {`Route: ${ticket.booking.trip.from} - ${ticket.booking.trip.to}`}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography gutterBottom>
                                {`Price: ${ticket.booking.trip.price}`}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography gutterBottom>
                                {`Pick up: ${ticket.booking.pickup}`}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography gutterBottom>
                                {`Drop off: ${ticket.booking.dropoff}`}
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
                                  ticket.booking.status === "ACTIVE" ||
                                  ticket.booking.status === "SEAT_ADDED"
                                    ? "secondary"
                                    : ticket.booking.status === "BOOKED"
                                    ? "primary"
                                    : ""
                                }
                                style={{ fontWeight: "bold" }}
                              >
                                {ticket.booking.status === "ACTIVE" ||
                                ticket.booking.status === "SEAT_ADDED"
                                  ? "Not paid for"
                                  : ticket.booking.status === "BOOKED"
                                  ? "Ticket booked"
                                  : ""}
                              </Typography>
                            </Grid>
                          </React.Fragment>
                        </Grid>
                      </Grid>
                    </Grid>
                  </React.Fragment>
                </CardContent>
              </Card>
            </Grid>
          </Grid> */}
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
