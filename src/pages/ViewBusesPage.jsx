import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";
import axios from "axios";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import { ApiUrl } from "../config/api_url";
import NavBar from "../components/navBar";
import Stepper from "../components/stepper";
import ViewSeates from "../components/ViewSeats";

const weekday = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export default function ViewBusesPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [fromLoc, setFromLoc] = useState(
    query.get("fromLoc") ? query.get("fromLoc") : ""
  );
  const [toLoc, setToLoc] = useState(
    query.get("toLoc") ? query.get("toLoc") : ""
  );
  const [selectedDate, setSelectedDate] = useState(
    query.get("date") ? query.get("date") : ""
  );
  const currentDay = new Date(selectedDate).getDay();

  const [isLoading, setIsLoading] = useState(false);
  const [busInfo, setBusInfo] = useState([]);
  const [isError, setIsError] = useState({ value: false, message: "" });
  const [selectedBusId, setSelectedBusId] = useState("");

  useEffect(() => {
    setIsLoading(true);

    const token = localStorage.getItem("liyu_login_token");

    axios
      .post(
        `${ApiUrl}/trips/search/agent`,
        {
          from: fromLoc,
          to: toLoc,
          date: format(new Date(selectedDate), "yyyy-MM-dd"),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        setBusInfo(res.data);
      })
      .catch((err) =>
        setIsError({
          value: true,
          message: err,
        })
      )
      .finally(() => setIsLoading(false));
  }, [fromLoc, toLoc, selectedDate]);

  const getPreviousDate = () => {
    const currentDayInMilli = new Date(selectedDate).getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const previousDayInMilli = currentDayInMilli - oneDay;
    const previousDate = new Date(previousDayInMilli);

    setSelectedDate(previousDate);
  };

  const getNextDate = () => {
    const currentDayInMilli = new Date(selectedDate).getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const nextDayInMilli = currentDayInMilli + oneDay;
    const nextDate = new Date(nextDayInMilli);

    setSelectedDate(nextDate);
  };

  return (
    <>
      <NavBar />
      <Container>
        <Stack spacing={4} my={5}>
          <Stepper activeStep={1} />

          <Paper elevation={3} sx={{ padding: 2, mt: 8 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ padding: 2, background: "#111" }}
            >
              <Typography
                variant="p"
                component="p"
                gutterBottom
                sx={{ color: "#fff" }}
              >
                ROUTE: {fromLoc} - {toLoc}
              </Typography>

              <Typography
                variant="p"
                component="p"
                gutterBottom
                sx={{ color: "#fff" }}
              >
                {weekday[currentDay]}
              </Typography>

              <Typography
                variant="p"
                component="p"
                gutterBottom
                sx={{ color: "#fff" }}
              >
                DATE: {new Date(selectedDate).toLocaleDateString()}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  sx={{ background: "#fff", color: "#111" }}
                  disabled={
                    new Date(selectedDate).toLocaleDateString() ===
                      new Date().toLocaleDateString() && true
                  }
                  onClick={getPreviousDate}
                >
                  Previous
                </Button>
                <Button
                  variant="contained"
                  sx={{ background: "#fff", color: "#111" }}
                  onClick={getNextDate}
                >
                  Next
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {isLoading && (
            <Typography variant="h4" component="p" gutterBottom>
              Loading...
            </Typography>
          )}

          {isError.value && <Alert severity="error">Error Occured</Alert>}

          {!isLoading && busInfo && busInfo.length === 0 && (
            <Typography variant="h4" component="p" color="error" gutterBottom>
              No buses available
            </Typography>
          )}

          {!isLoading &&
            busInfo?.map((bus) => (
              <Box key={bus.id}>
                <Paper elevation={3} sx={{ padding: 2 }}>
                  <Stack
                    direction="row"
                    spacing={3}
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        variant="h5"
                        component="p"
                        gutterBottom
                        color="primary"
                      >
                        {bus.busAssociation}
                      </Typography>
                      <Typography variant="p" component="p" gutterBottom>
                        Plate No. ///// <br /> Side No. {bus.sideNumber}
                      </Typography>
                      <Typography variant="p" component="p" gutterBottom>
                        {bus.from} - {bus.to}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="p" component="p" gutterBottom>
                        DEPARTURE TIME
                      </Typography>
                      <Typography
                        variant="p"
                        component="p"
                        gutterBottom
                        color="primary"
                      >
                        {bus.departureTime}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="p" component="p" gutterBottom>
                        ARRIVAL TIME
                      </Typography>
                      <Typography
                        variant="p"
                        component="p"
                        gutterBottom
                        color="primary"
                      >
                        {bus.arrivalTime}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="p" component="p" gutterBottom>
                        AVAILABLE SEATS
                      </Typography>
                      <Typography
                        variant="p"
                        component="p"
                        gutterBottom
                        color="primary"
                      >
                        {bus.seatsLeft}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="h5" component="p" gutterBottom>
                        {bus.price} Birr
                      </Typography>
                    </Box>
                    <Box>
                      <Button
                        variant="contained"
                        sx={{ background: "#111", color: "#fff" }}
                        onClick={() => setSelectedBusId(bus.id)}
                      >
                        View Seats
                      </Button>
                    </Box>
                  </Stack>
                </Paper>

                {selectedBusId === bus.id && (
                  <ViewSeates
                    bus={bus}
                    journeyDate={new Date(selectedDate).toLocaleDateString()}
                  />
                )}
              </Box>
            ))}
        </Stack>
      </Container>
    </>
  );
}
