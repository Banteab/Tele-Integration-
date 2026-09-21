import React from "react";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { LoginRoute, ProtectedRoute } from "./pages/protected-route";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import RouteSearchPage from "./pages/RouteSearchPage";
import SchedulesPage from "./pages/SchedulesPage";
import SeatLayoutPage from "./pages/SeatLayoutPage";
import TicketSuccessPage from "./pages/TicketSuccessPage";

import CompleteProfilePage from "./pages/CompleteProfilePage";

import TicketHistoryPage from "./pages/TicketHistoryPage";

function App() {
  const [isAuthorizing, setIsAuthorizing] = React.useState(true);

  React.useEffect(() => {
    const initAuth = async () => {
      try {
        const { generateGuestToken } = await import("./services/authService");
        await generateGuestToken();
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setIsAuthorizing(false);
      }
    };
    initAuth();
  }, []);

  if (isAuthorizing) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Router basename="/portal">
      <Switch>
        <Box>
          <CssBaseline />
          {/* {routes.map((route, i) => ( */}
          <LoginRoute path="/login" component={LoginPage} />
          <LoginRoute path="/signup" component={SignupPage} />
          <ProtectedRoute
            path="/complete-profile"
            component={CompleteProfilePage}
          />
          <ProtectedRoute
            path="/ticket-history"
            component={TicketHistoryPage}
          />
          {/* <Route path="/verify-otp" component={VerifyOtpForm} /> */}
          {/* <ProtectedRoute exact path="/" component={HomePage} /> */}
          {/* <ProtectedRoute exact path="/view-buses" component={ViewBusesPage} /> */}
          {/* <ProtectedRoute
            exact
            path="/payment/:bookingId"
            component={PaymentPage}
          /> */}
          {/* <ProtectedRoute
            exact
            path="/payment-instructions/:bookingId"
            component={PaymentInstructionsPage}
          />
          <ProtectedRoute
            exact
            path="/pending-ticket"
            component={PendingTicketPage}
          /> */}
          <ProtectedRoute exact path="/" component={RouteSearchPage} />
          <ProtectedRoute exact path="/schedules" component={SchedulesPage} />
          <ProtectedRoute
            exact
            path="/seat-layout"
            component={SeatLayoutPage}
          />
          <ProtectedRoute
            exact
            path="/ticket-success"
            component={TicketSuccessPage}
          />
          {/* <ProtectedRoute exact path="/search-ticket" component={SearchTicketPage} /> */}
          {/* <ProtectedRoute exact path="/download-ticket" component={DownloadTicketPage} /> */}

          {/* <Route path="/test" component={Test} /> */}
          {/* ))} */}
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            my={6}
          >
           Powered by 
            <a
              href="https://www.liyubus.com/"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Liyubus
            </a>{" "}
          </Typography>
        </Box>
      </Switch>
    </Router>
  );
}

export default App;
