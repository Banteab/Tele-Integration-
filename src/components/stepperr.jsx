import DateFnsUtils from "@date-io/date-fns";
import { CircularProgress, Tooltip } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { green, red } from "@material-ui/core/colors";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import Typography from "@material-ui/core/Typography";
import {
  Search,
  Fastfood,
  Description,
  CancelPresentation,
} from "@material-ui/icons";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import MuiAlert from "@material-ui/lab/Alert";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import axios from "axios";
import { format } from "date-fns";
import React, { useState } from "react";
import AutoCompleteSelect from "./autoComplete";
import BusCard from "./busCard";
import SeatStructure from "./busStructure";
import PassengerInformation from "./passengerInformation";
import Review from "./review";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { ApiUrl } from "../config/api_url";
export default function Stepperr() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [error, setError] = useState({ error: false, message: "" });
  const [busInfo, setBusInfo] = useState({
    loading: false,
    res: null,
    error: null,
  });
  const [selectedBus, setSelectedBus] = useState();
  const [selectedSeat, setSelectedSeat] = useState([]);
  const [viewReview, setViewReview] = useState(false);
  const [phonenumber, setPhonenumber] = useState("");
  const [passengers, setPassengers] = useState([]);
  const [pickupDropoff, setPickupDropoff] = useState({
    pickup: "",
    dropoff: "",
  });
  const [bookingInfo, setBookingInfo] = useState({
    loading: true,
    res: null,
    error: null,
  });
  const [open, setOpen] = useState(false);
  const [busInformation, setBusInformation] = useState({
    tac: false,
    am: false,
    cp: false,
  });

  const token = localStorage.getItem("liyu_login_token");
  const handleBusFetch = () => {
    setBusInfo({ loading: true, error: null, res: null });
    axios
      .post(
        `${ApiUrl}/bank/portal/search-trip`,
        {
          from: from,
          to: to,
          date: format(selectedDate, "yyyy-MM-dd"),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        setBusInfo({ loading: false, res: res.data, error: null });
      })
      .catch((err) => setBusInfo({ loading: false, error: err, res: null }));
  };

  const handleBooking = () => {
    setOpen(true);
    axios
      .post(
        `${ApiUrl}/bank/portal/issue`,
        {
          phoneNumber: phonenumber,
          passengers: passengers.join(","),
          seat: selectedSeat.join(","),
          bus: selectedBus.busId,
          trip: selectedBus.id,
          pickup: pickupDropoff.pickup,
          dropoff: pickupDropoff.dropoff,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        handleBusFetch();
        setSelectedBus();
        setTimeout(() => {
          setOpen(false);
          setViewReview(false);
        }, 5);
      })
      .catch((err) =>
        setBookingInfo({ loading: false, res: null, error: err })
      );
  };

  if (error.error) {
    setInterval(() => {
      setError({ error: false, message: "" });
    }, 3000);
  }

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  console.log("==============");
  console.log(selectedBus);
  console.log("==============");
  return (
    <div style={{ padding: 15, height: "auto" }}>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={6}
        style={{ height: "auto" }}
      >
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={6}
        >
          <Grid item xs={3}>
            <AutoCompleteSelect label="From" handleChange={(v) => setFrom(v)} />
          </Grid>
          <Grid item xs={3}>
            <AutoCompleteSelect label="To" handleChange={(v) => setTo(v)} />
          </Grid>
          <Grid item xs={3}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="yyyy-MM-dd"
                margin="normal"
                id="date-picker-inline"
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
            </MuiPickersUtilsProvider>
          </Grid>
          <Grid item xs={3}>
            <IconButton
              style={{ backgroundColor: "#123456" }}
              aria-label="Search"
              onClick={() => {
                setBusInfo(null);
                setSelectedBus(null);
                setSelectedSeat([]);
                if (!from || !to || !selectedDate) {
                  setError({
                    error: true,
                    message: "All feilds can not be empty",
                  });
                } else {
                  setError({ error: false, message: "" });
                  handleBusFetch();
                }
              }}
            >
              <Search style={{ color: "white" }} />
            </IconButton>
          </Grid>
        </Grid>

        <Grid
          container
          direction="row"
          style={{ paddingTop: "25px" }}
          spacing={6}
        >
          <Grid item sm={4}>
            {busInfo.loading ? (
              <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{ height: "60vh" }}
              >
                <Grid item xs={3}>
                  <CircularProgress />
                </Grid>
              </Grid>
            ) : (
              <div />
            )}

            {busInfo.error ? (
              <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{ height: "60vh" }}
              >
                <Grid item xs={3}>
                  <Alert severity="error">Error occured</Alert>
                </Grid>
              </Grid>
            ) : (
              <div />
            )}

            {busInfo.res && !busInfo.loading ? (
              busInfo.res.length === 0 ? (
                <Grid
                  container
                  spacing={0}
                  direction="column"
                  alignItems="center"
                  justify="center"
                  style={{ height: "60vh" }}
                >
                  <Grid item xs={3}>
                    <h1>No buses available</h1>
                  </Grid>
                </Grid>
              ) : (
                <Grid
                  container
                  spacing={2}
                  direction="column"
                  style={{ minHeight: "60vh" }}
                >
                  {busInfo.res.map((bus, index) => (
                    <Grid item>
                      <BusCard
                        selected={selectedBus}
                        selectBus={() => {
                          setSelectedBus(bus);
                          setSelectedSeat([]);
                        }}
                        bus={bus}
                      />
                    </Grid>
                  ))}
                </Grid>
              )
            ) : null}
          </Grid>

          <Grid item sm={4}>
            <Grid container direction="column" alignItems="center" spacing={2}>
              {selectedBus ? (
                <Grid item sm={12}>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
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
                        <Fastfood />
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
                        <Description />
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
                        <CancelPresentation />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              ) : null}

              <Grid item sm={12}>
                {selectedBus ? (
                  <SeatStructure
                    key={Date.now()}
                    selectedBus={selectedBus}
                    selectedSeats={selectedSeat}
                    addSeat={(id) => {
                      setSelectedSeat([...selectedSeat, id]);
                    }}
                    removeSeat={(id) => {
                      const formatted = selectedSeat.filter(
                        (seat) => seat !== id
                      );
                      setSelectedSeat(formatted);
                    }}
                    error={error}
                  />
                ) : null}
              </Grid>
            </Grid>
          </Grid>

          <Grid item sm={4}>
            {selectedBus ? (
              <PassengerInformation
                busInfo={selectedBus}
                selectedSeats={selectedSeat}
                phone={phonenumber}
                setPhone={(phone) => setPhonenumber(phone)}
                passengers={passengers}
                handlePassengerChange={(pass) => setPassengers(pass)}
                error={error}
                pd={pickupDropoff}
                viewReview={() => {
                  if (phonenumber === "") {
                    setError({
                      error: true,
                      message: "Phone number can not be emtpy",
                    });
                  } else if (passengers.length === 0) {
                    setError({
                      error: true,
                      message: "Passengers can not be empty",
                    });
                  } else {
                    setViewReview(true);
                  }
                }}
                handlePdChange={(v, name) => {
                  if (name === "pickup") {
                    setPickupDropoff({ ...pickupDropoff, pickup: v });
                  } else {
                    setPickupDropoff({ ...pickupDropoff, dropoff: v });
                  }
                }}
              />
            ) : null}
          </Grid>
        </Grid>
      </Grid>

      <Dialog
        onClose={() => setOpen(false)}
        aria-labelledby="simple-dialog-title"
        open={open}
        fullWidth={true}
        maxWidth="sm"
      >
        <DialogContent>
          {bookingInfo.loading ? (
            <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justify="center"
              style={{ minHeight: "20vh" }}
            >
              <Grid item xs={3}>
                <CircularProgress size={80} />
              </Grid>
            </Grid>
          ) : (
            <div />
          )}
          {bookingInfo.error ? (
            <div>
              <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{ minHeight: "20vh" }}
              >
                <Grid item xs={3}>
                  <CloseIcon style={{ color: red[500], fontSize: 90 }} />
                </Grid>
                <Grid item xs={5}>
                  <h1 style={{ color: red[500] }}>Error Occured</h1>
                </Grid>
              </Grid>
            </div>
          ) : (
            <div />
          )}
          {bookingInfo.res ? (
            bookingInfo.res.success ? (
              <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{ minHeight: "20vh" }}
              >
                <Grid item xs={3}>
                  <CheckIcon style={{ color: green[500], fontSize: 90 }} />
                </Grid>
                <Grid item xs={5}>
                  <h1 style={{ color: green[500] }}>
                    {bookingInfo.res.message}
                  </h1>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h6" component="h6">
                    {`Reference number: ${bookingInfo.res.data.refNumber}`}
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <div />
            )
          ) : (
            <div />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => window.location.reload(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        onClose={() => setViewReview(false)}
        aria-labelledby="simple-dialog-title"
        open={viewReview}
        fullWidth={true}
        maxWidth="md"
      >
        <DialogContent>
          <Review
            phonenumber={phonenumber}
            seats={selectedSeat}
            passengers={passengers}
            busInfo={selectedBus}
            route={`${from} - ${to}`}
            travelDate={format(selectedDate, "yyyy-MM-dd")}
            pd={pickupDropoff}
            finishBooking={() => {
              handleBooking();
            }}
          />
        </DialogContent>
        {/* <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Finish
          </Button>
        </DialogActions> */}
      </Dialog>

      <Snackbar
        open={error.error}
        autoHideDuration={6000}
        onClose={() => setError({ error: false, message: "" })}
      >
        <Alert
          onClose={() => setError({ error: false, message: "" })}
          severity="error"
        >
          {error.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={busInformation.am || busInformation.cp || busInformation.tac}
        onClose={() => setBusInformation({ am: false, cp: false, tac: false })}
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
              ? selectedBus.amenities.map((amenity) => <p>{amenity}</p>)
              : busInformation.tac
              ? selectedBus.terms
              : busInformation.cp
              ? selectedBus.cancellationPolicy.map((cancell) => (
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
    </div>
  );
}
