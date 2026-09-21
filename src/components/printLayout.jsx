import React, { useRef } from "react";
import ReactToPrint from "react-to-print";
import { Paper, Grid, Typography, Divider, Button } from "@material-ui/core";
import QRCode from "react-qr-code";
     
class ComponentToPrint extends React.PureComponent {
  render() {
    const { ticket } = this.props;
    return (
      <div style={{ padding: "20px" }}>
        <Paper variant="outlined" elevation={3} style={{ height: "auto" }}>
          <Grid container direction="column">
            <Grid xs={12}>
              <Paper
                style={{
                  padding: "5px",
                  textAlign: "center",
                  backgroundColor: "#123456",
                  color: "white",
                }}
              >
                <Typography variant="h5" component="h5">
                  LiyuBus
                </Typography>
              </Paper>
            </Grid>
            <Grid
              xs={12}
              style={{
                paddingLeft: "100px",
                paddingRight: "100px",
                paddingTop: "15px",
                paddingBottom: "15px",
              }}
            >
              <Grid container direction="column">
                <Grid item xs={12}>
                  <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Grid item xs={4}>
                      {" "}
                      <Typography
                        style={{ fontWeight: "bold" }}
                        variant="subtitle1"
                      >
                        Ticket Number
                      </Typography>
                      <Typography variant="subtitle2">
                        {ticket.ticketNo}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}></Grid>
                    <Grid item xs={4}>
                      <QRCode size={80} value={ticket.ticketNo} />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} style={{ paddingTop: "0px" }}>
                  <Typography
                    style={{ fontWeight: "bold", color: "#123456" }}
                    variant="h6"
                    component="h5"
                  >
                    Trip Information
                  </Typography>
                  <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                    <Divider style={{ paddingTop: "5px" }} />
                  </div>
                </Grid>
                <Grid container direction="row">
                  {/* //// this is the first data content */}
                  <Grid item xs={12}>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={4}>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="subtitle1"
                        >
                          From
                        </Typography>
                        <Typography variant="subtitle2">
                          {ticket.booking.trip.from}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}></Grid>
                      <Grid item xs={4}>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="subtitle1"
                        >
                          To
                        </Typography>
                        <Typography variant="subtitle2">
                          {ticket.booking.trip.to}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* ////////////////////////////////////////////////////////// */}
                  {/* //// this is the first data content */}
                  <Grid item xs={12}>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={4}>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="subtitle1"
                        >
                          Seat
                        </Typography>
                        <Typography variant="subtitle2">
                          {ticket.seat}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}></Grid>
                      <Grid item xs={4}>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="subtitle1"
                        >
                          Price
                        </Typography>
                        <Typography variant="subtitle2">
                          {ticket.booking.trip.price}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* ////////////////////////////////////////////////////////// */}
                  {/* //// this is the first data content */}
                  <Grid item xs={12}>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={4}>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="subtitle1"
                        >
                          Bus
                        </Typography>
                        <Typography variant="subtitle2">
                          {ticket.booking.bus.busAssociation.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}></Grid>
                      <Grid item xs={4}>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="subtitle1"
                        >
                          Side Number
                        </Typography>
                        <Typography variant="subtitle2">
                          {ticket.booking.bus.sideNumber}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* ////////////////////////////////////////////////////////// */}
                </Grid>
                <Grid item xs={12} style={{ paddingTop: "10px" }}>
                  <Typography
                    style={{ fontWeight: "bold", color: "#123456" }}
                    variant="h6"
                    component="h5"
                  >
                    Passenger Information
                  </Typography>
                  <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                    <Divider style={{ paddingTop: "5px" }} />
                  </div>
                </Grid>
                <Grid container direction="row">
                  {/* //// this is the first data content */}
                  <Grid item xs={12}>
                    <Grid
                      container
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={4}>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="subtitle1"
                        >
                          Passenger
                        </Typography>
                        <Typography variant="subtitle2">
                          {ticket.booking.passengers}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}></Grid>
                      <Grid item xs={4}>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="subtitle1"
                        >
                          Phone number
                        </Typography>
                        <Typography variant="subtitle2">
                          {ticket.booking.phoneNumber}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* ////////////////////////////////////////////////////////// */}
                </Grid>
                <hr />
                <Grid container direction="row">
                  <Grid item xs={12}>
                    <Typography variant="caption" display="block" gutterBottom>
                      Dear customer your reservation is confirmed , please get
                      your travel ticket from assistant driver early in check in
                      .
                    </Typography>
                  </Grid>
                </Grid>
                {/* <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  style={{ paddingTop: "25px" }}
                >
                  <Grid item xs={4}>
                    <QRCode value={ticket.ticketNo} />
                  </Grid>
                </Grid> */}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}
export default function PrintLayout(props) {
  const componentRef = useRef();
  return (
    <div>
      <ReactToPrint
        trigger={() => (
          <Button size="small" variant="contained" color="primary">
            Print
          </Button>
        )}
        content={() => componentRef.current}
      />
      <ComponentToPrint ref={componentRef} ticket={props.ticket} />
    </div>
  );
}
