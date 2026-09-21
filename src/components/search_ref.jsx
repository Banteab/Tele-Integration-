import {
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@material-ui/core";
import axios from "axios";
import SearchBar from "material-ui-search-bar";
import React, { useState } from "react";
import { ApiUrl, AuthApiKey } from "../config/api_url";

export default function SearchReferenceNumber() {
  const [value, setValue] = useState("");
  const [searchResult, setSearchResult] = useState({
    loading: false,
    res: null,
    error: null,
  });

  const handleBookingSearch = () => {
    setSearchResult({ ...searchResult, loading: true });
    axios
      .get(`${ApiUrl}/bank/abay-bank/portal/${value}`, {
        headers: {
          ...(AuthApiKey ? { "x-api-key": AuthApiKey } : {}),
          "Content-Type": "application/json",
        },
      })
      .then((res) => setSearchResult({ loading: false, res: res.data }))
      .catch((err) => setSearchResult({ loading: false, error: err }));
  };

  return (
    <div style={{ paddingTop: 20, paddingBottom: 20, height: "60vh" }}>
      <Grid
        container
        spacing={5}
        direction="column"
        justify="center"
        alignItems="center"
      >
        <Grid container direction="row">
          <Grid item xs={4}></Grid>
          <Grid item xs={4}>
            <SearchBar
              value={value}
              onChange={(newValue) => setValue(newValue)}
              onRequestSearch={() => {
                handleBookingSearch();
              }}
            />
          </Grid>
        </Grid>

        {searchResult.loading ? (
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

        {searchResult.error ? (
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
        ) : null}

        {searchResult.res ? (
          searchResult.res.success && !searchResult.loading ? (
            <Grid
              container
              style={{ paddingTop: 20, paddingLeft: 15, paddingRight: 15 }}
            >
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
                            Phone: {searchResult.res.data.phoneNumber}
                          </Typography>
                          {searchResult.res.data.passengers
                            .split(",")
                            .map((passenger, index) => {
                              const seat =
                                searchResult.res.data.seat.split(",")[index];
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
                            {`Bus: ${searchResult.res.data.bus.busAssociation.name}`}
                          </Typography>
                          <Typography gutterBottom>
                            {`Side number: ${searchResult.res.data.bus.sideNumber}`}
                          </Typography>
                          <Typography gutterBottom>
                            {`Plate number: ${searchResult.res.data.bus.plateNumber}`}
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
                                  {`Route: ${searchResult.res.data.trip.from} - ${searchResult.res.data.trip.to}`}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography gutterBottom>
                                  {`Price: ${searchResult.res.data.trip.price}`}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography gutterBottom>
                                  {`Pick up: ${searchResult.res.data.pickup}`}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography gutterBottom>
                                  {`Drop off: ${searchResult.res.data.dropoff}`}
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
                                    searchResult.res.data.status === "ACTIVE" ||
                                    searchResult.res.data.status ===
                                      "SEAT_ADDED"
                                      ? "secondary"
                                      : searchResult.res.data.status ===
                                        "BOOKED"
                                      ? "primary"
                                      : ""
                                  }
                                  style={{ fontWeight: "bold" }}
                                >
                                  {searchResult.res.data.status === "ACTIVE" ||
                                  searchResult.res.data.status === "SEAT_ADDED"
                                    ? "Not paid for"
                                    : searchResult.res.data.status === "BOOKED"
                                    ? "Ticket booked"
                                    : ""}
                                </Typography>
                                {/* <Badge
                                  max={1000}
                                  badgeContent={
                                    searchResult.res.data.status === "ACTIVE" ||
                                    searchResult.res.data.status ===
                                      "SEAT_ADDED"
                                      ? "Not paid for"
                                      : searchResult.res.data.status ===
                                        "BOOKED"
                                      ? "Ticket booked"
                                      : ""
                                  }
                                  color="primary"
                                ></Badge> */}
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
          ) : searchResult.res.error ? (
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
          ) : (
            <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justify="center"
              style={{ minHeight: "50vh" }}
            >
              <Grid item xs={3}>
                <h1 style={{ color: "red" }}>BOOKING NOT FOUND</h1>
              </Grid>
            </Grid>
          )
        ) : null}
      </Grid>
    </div>
  );
}
