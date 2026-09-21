import DateFnsUtils from "@date-io/date-fns";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Alert from "@material-ui/lab/Alert";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import React from "react";
import AutoCompleteSelect from "./autoComplete";

export default function CitiesAndDatea(props) {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Select origin and destination city and travel date
      </Typography>
      <Grid container spacing={3} style={{ paddingTop: 30 }}>
        <Grid item xs={12} sm={6}>
          <AutoCompleteSelect
            label="From"
            handleChange={(v) => props.fromChange(v)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AutoCompleteSelect
            label="To"
            handleChange={(v) => props.toChange(v)}
          />
        </Grid>
        <Grid item xs={4} sm={4}></Grid>
        <Grid item xs={4} sm={4}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              variant="inline"
              format="yyyy-MM-dd"
              margin="normal"
              id="date-picker-inline"
              value={props.selectedDate}
              onChange={(date) => props.handleSelectedChange(date)}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={4} sm={4}></Grid>
        <Grid item xs={12} sm={12}>
          {props.error.error ? (
            <Alert severity="warning">{props.error.message}</Alert>
          ) : null}
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
