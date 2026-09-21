import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Grid, Button } from "@material-ui/core";

// const products = [
//   { name: "Product 1", desc: "A nice thing", price: "$9.99" },
//   { name: "Product 2", desc: "Another thing", price: "$3.45" },
//   { name: "Product 3", desc: "Something else", price: "$6.51" },
//   { name: "Product 4", desc: "Best thing of all", price: "$14.11" },
//   { name: "Shipping", desc: "", price: "Free" },
// ];
// const addresses = [
//   "1 Material-UI Drive",
//   "Reactville",
//   "Anytown",
//   "99999",
//   "USA",
// ];
// const payments = [
//   { name: "Card type", detail: "Visa" },
//   { name: "Card holder", detail: "Mr John Smith" },
//   { name: "Card number", detail: "xxxx-xxxx-xxxx-1234" },
//   { name: "Expiry date", detail: "04/2024" },
// ];

const useStyles = makeStyles((theme) => ({
  listItem: {
    padding: theme.spacing(1, 0),
  },
  total: {
    fontWeight: 700,
  },
  title: {
    marginTop: theme.spacing(2),
  },
}));

export default function Review(props) {
  const classes = useStyles();
  const { busInfo, pd } = props;
  const busInformation = [
    { name: "Bus association", value: busInfo?.busAssociation },
    { name: "Side number", value: busInfo?.sideNumber },
    { name: "Bus structure", value: busInfo?.busStructure },
  ];

  const tripInformation = [
    { name: "Route", value: props.route },
    { name: "Price", value: `${props.busInfo?.price} birr` },
    { name: "Date", value: props.travelDate },
    { name: "Departure", value: busInfo?.departureTime },
    { name: "Arrival", value: busInfo?.arrivalTime },
    { name: "Pickup", value: pd.pickup },
    { name: "Dropoff", value: pd.dropoff },
  ];
  return (
    <React.Fragment>
      <Grid container direction="row" justifyContent="space-between">
        <Grid item xs={6}>
          <Typography variant="h6" gutterBottom>
            Booking summary
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Button
            onClick={() => props.finishBooking()}
            variant="contained"
            color="primary"
          >
            Finish
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={12}>
          <Typography variant="h6" gutterBottom className={classes.title}>
            Passenger
          </Typography>
          <Typography gutterBottom>{props.phonenumber}</Typography>
          <Typography gutterBottom>
            {props.passengers
              .map((pass) => {
                return pass.charAt(0).toUpperCase() + pass.slice(1);
              })
              .join(", ")}
          </Typography>
        </Grid>
        <Grid item container direction="column" xs={12} sm={6}>
          <Typography variant="h6" gutterBottom className={classes.title}>
            Bus details
          </Typography>
          <Grid container>
            {busInformation.map((bus) => (
              <React.Fragment>
                <Grid item xs={6}>
                  <Typography gutterBottom>{bus.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography gutterBottom>{bus.value}</Typography>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Grid>
        <Grid item container direction="column" xs={12} sm={6}>
          <Typography variant="h6" gutterBottom className={classes.title}>
            Trip details
          </Typography>
          <Grid container>
            {tripInformation.map((trip) => (
              <React.Fragment>
                <Grid item xs={6}>
                  <Typography gutterBottom>{trip.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography gutterBottom>{trip.value}</Typography>
                </Grid>
              </React.Fragment>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
