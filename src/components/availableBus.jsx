import Checkbox from "@material-ui/core/Checkbox";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import React from "react";
import BusCard from "./busCard";

export default function AvailableBus(props) {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Payment method
      </Typography>
      {props.busInfo.loading ? (
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: "25vh" }}
        >
          <Grid item xs={3}>
            <CircularProgress />
          </Grid>
        </Grid>
      ) : (
        <div />
      )}

      {props.busInfo.error ? (
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: "25vh" }}
        >
          <Grid item xs={3}>
            <Alert severity="error">Error occured</Alert>
          </Grid>
        </Grid>
      ) : (
        <div />
      )}

      {props.busInfo.res && !props.busInfo.loading ? (
        props.busInfo.res.length === 0 ? (
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ minHeight: "25vh" }}
          >
            <Grid item xs={3}>
              <h1>No buses available</h1>
            </Grid>
          </Grid>
        ) : (
          <div>
            {props.busInfo.res.map((bus, index) => {
              return (
                <Grid container spacing={3}>
                  <Grid item xs={1} md={1}>
                    <Checkbox
                      checked={props.checkedBus === index}
                      onChange={(event) => props.setBusChecked(index)}
                      inputProps={{ "aria-label": "primary checkbox" }}
                    />
                  </Grid>
                  <Grid item xs={11} md={11}>
                    <BusCard bus={bus} />
                  </Grid>
                </Grid>
              );
            })}
          </div>
        )
      ) : null}
    </React.Fragment>
  );
}
