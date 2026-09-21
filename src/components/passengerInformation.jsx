import { Button, Grid } from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import React from "react";

export default function PassengerInformation(props) {
  const pass = props.passengers;
  const { busInfo, pd } = props;
  const pickups = busInfo.pickup.split(",");
  const dropoffs = busInfo.dropoff.split(",");
  return (
    // <React.Fragment>
    <Grid
      container
      direction="column"
      spacing={3}
      style={{ paddingTop: "25px" }}
    >
      <Grid container direction="row" spacing={3}>
        <Grid item>
          <InputLabel id="demo-simple-select-label">Pickup</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            style={{ minWidth: 200 }}
            value={pd.pickup}
            onChange={(e) => props.handlePdChange(e.target.value, "pickup")}
          >
            {pickups.map((pickup, index) => (
              <MenuItem value={pickup}>{pickup}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item>
          <InputLabel id="demo-simple-select-label">Dropoff</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={pd.dropoff}
            style={{ minWidth: 200 }}
            onChange={(e) => props.handlePdChange(e.target.value, "dropoff")}
          >
            {dropoffs.map((dropoff, index) => (
              <MenuItem value={dropoff}>{dropoff}</MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      <Grid item>
        <TextField
          required
          id="cardName"
          value={props.phone}
          onChange={(e) => props.setPhone(e.target.value)}
          label="Phone number"
          fullWidth
          autoComplete="cc-name"
        />
      </Grid>
      {props.selectedSeats.map((seat, index) => {
        return (
          <Grid item>
            <TextField
              required
              value={pass[index]}
              onChange={(e) => {
                pass[index] = e.target.value;
                props.handlePassengerChange([...pass]);
              }}
              id="cardNumber"
              label={`Passenger ${index + 1}`}
              fullWidth
              autoComplete="cc-number"
            />
          </Grid>
        );
      })}
      <Grid item>
        <Button
          variant="contained"
          style={{ backgroundColor: "#123456", color: "white" }}
          onClick={() => props.viewReview()}
        >
          Book
        </Button>
      </Grid>
    </Grid>
    // </React.Fragment>
  );
}
