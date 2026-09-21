import React, { useRef } from "react";
import ReactToPrint from "react-to-print";
import { Paper, Grid, Typography, Divider, Button } from "@material-ui/core";
import QRCode from "react-qr-code";

class ComponentToPrint extends React.PureComponent {
  render() {
    return (
      <div style={{ padding: "20px" }}>
        <Paper variant="outlined" elevation={3} style={{ height: "auto" }}>
          <Grid container direction="column">
            <Grid xs={12}>
              <Paper
                style={{
                  padding: "30px",
                  textAlign: "center",
                  backgroundColor: "#123456",
                  color: "white",
                }}
              >
                <Typography variant="h4" component="h4">
                  LiyuBus
                </Typography>
              </Paper>
            </Grid>
            <Grid
              xs={12}
              style={{
                paddingLeft: "150px",
                paddingRight: "150px",
                paddingTop: "25px",
                paddingBottom: "25px",
              }}
            >
              <Grid container direction="column">
                <Grid item xs={12}>
                  <Typography
                    style={{ fontWeight: "bold" }}
                    variant="h6"
                    component="h6"
                  >
                    Ticket Number
                  </Typography>
                  <Typography variant="h6" component="h6">
                    refkjsbdfs
                  </Typography>
                </Grid>
                <Grid item xs={12} style={{ paddingTop: "25px" }}>
                  <Typography
                    style={{ fontWeight: "bold", color: "#123456" }}
                    variant="h4"
                    component="h4"
                  >
                    Trip Information
                  </Typography>
                  <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                    <Divider style={{ paddingTop: "5px" }} />
                  </div>
                </Grid>
                <Grid container direction="row" spacing={3}>
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
                          variant="h6"
                          component="h6"
                        >
                          From
                        </Typography>
                        <Typography variant="h6" component="h6">
                          Addis Ababa
                        </Typography>
                      </Grid>
                      <Grid item xs={4}></Grid>
                      <Grid item xs={4}>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="h6"
                          component="h6"
                        >
                          To
                        </Typography>
                        <Typography variant="h6" component="h6">
                          Gondor
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
                          variant="h6"
                          component="h6"
                        >
                          Seat
                        </Typography>
                        <Typography variant="h6" component="h6">
                          1
                        </Typography>
                      </Grid>
                      <Grid item xs={4}></Grid>
                      <Grid item xs={4}>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="h6"
                          component="h6"
                        >
                          Price
                        </Typography>
                        <Typography variant="h6" component="h6">
                          500
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
                          variant="h6"
                          component="h6"
                        >
                          Bus
                        </Typography>
                        <Typography variant="h6" component="h6">
                          Golden Bus
                        </Typography>
                      </Grid>
                      <Grid item xs={4}></Grid>
                      <Grid item xs={4}>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="h6"
                          component="h6"
                        >
                          Side Number
                        </Typography>
                        <Typography variant="h6" component="h6">
                          #123456W
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* ////////////////////////////////////////////////////////// */}
                </Grid>
                <Grid item xs={12} style={{ paddingTop: "25px" }}>
                  <Typography
                    style={{ fontWeight: "bold", color: "#123456" }}
                    variant="h4"
                    component="h4"
                  >
                    Passenger Information
                  </Typography>
                  <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                    <Divider style={{ paddingTop: "5px" }} />
                  </div>
                </Grid>
                <Grid container direction="row" spacing={3}>
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
                          variant="h6"
                          component="h6"
                        >
                          Passenger Name
                        </Typography>
                        <Typography variant="h6" component="h6">
                          Abel Girma
                        </Typography>
                      </Grid>
                      <Grid item xs={4}></Grid>
                      <Grid item xs={4}>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          variant="h6"
                          component="h6"
                        >
                          Phone number
                        </Typography>
                        <Typography variant="h6" component="h6">
                          0953442540
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  {/* ////////////////////////////////////////////////////////// */}
                </Grid>
                <Grid
                  container
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  style={{ paddingTop: "25px" }}
                >
                  <Grid item xs={4}>
                    <QRCode value="hey" />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}
export default function Test() {
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
      <ComponentToPrint ref={componentRef} />
    </div>
  );
}
