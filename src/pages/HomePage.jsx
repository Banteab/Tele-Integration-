import { useState } from "react";
import { useHistory } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import SearchIcon from "@mui/icons-material/Search";

import NavBar from "../components/navBar";
import Stepper from "../components/stepper";
import CitiesList from "../components/CitiesList";

export default function Homepage() {
  const history = useHistory();
  const [fromLoc, setFromLoc] = useState("");
  const [toLoc, setToLoc] = useState("");
  const [date, setDate] = useState("");
  const [isError, setIsError] = useState({ value: false, message: "" });

  const onSubmit = (e) => {
    e.preventDefault();

    if (!fromLoc || !toLoc) {
      setIsError({ value: true, message: "All fields are required!" });
      return;
    }
    history.push(
      `/view-buses?fromLoc=${fromLoc}&toLoc=${toLoc}&date=${date || new Date()}`
    );
  };

  return (
    <Box>
      <NavBar />
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          height: "100vh",
          backgroundColor: "#0093E9",
          backgroundImage: "linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)",
          // py: 10,
        }}
      >
        <Container sx={{ textAlign: "center" }}>
          <Box>
            <Typography
              // variant="h2"
              component="h2"
              gutterBottom
              sx={{ color: "#fff", fontSize: 48, fontWeight: "500" }}
            >
              Welcome To Liyu Bus Ticket
            </Typography>
            <Typography
              // variant="h4"
              component="h2"
              gutterBottom
              sx={{ color: "#fff", fontSize: 28 }}
            >
              The easiest way to book bus ticket in Ethiopia
            </Typography>
          </Box>

          <Stepper activeStep={0} />

          <Paper elevation={9} sx={{ padding: { xs: 2, sm: 4 }, mt: 3 }}>
            {isError.value && <Alert severity="error">{isError.message}</Alert>}

            <form onSubmit={onSubmit}>
              <Stack direction="row" alignItems="center" spacing={4}>
                <CitiesList label="From" handleChange={(v) => setFromLoc(v)} />
                <CitiesList label="To" handleChange={(v) => setToLoc(v)} />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Stack spacing={3}>
                    <DesktopDatePicker
                      label="Pick Date"
                      inputFormat="dd/MM/yyyy"
                      value={date || new Date()}
                      onChange={(newDate) => setDate(newDate)}
                      renderInput={(params) => <TextField {...params} />}
                      minDate={new Date()}
                    />
                  </Stack>
                </LocalizationProvider>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SearchIcon />}
                  sx={{ width: "25%" }}
                >
                  Search Bus
                </Button>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Stack>

      {/* <Stack my={5}>
        <Container sx={{ textAlign: "center" }}>
          <Typography variant="h4" component="h2" gutterBottom>
            PARTNER WITH
          </Typography>
          <Stack direction="row" spacing={4} my={5}>
            {[8, 7, 6, 5].map((item) => (
              <Card sx={{ maxWidth: 345 }}>
                <CardMedia
                  component="img"
                  height="140"
                  image="https://mui.com/static/images/cards/contemplative-reptile.jpg"
                  alt="green iguana"
                />
              </Card>
            ))}
          </Stack>
        </Container>
      </Stack>

      <Stack
        py={5}
        sx={{
          backgroundColor: "#0093E9",
          backgroundImage: "linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)",
        }}
      >
        <Container sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ color: "#fff" }}
          >
            HOW IT WORKS
          </Typography>
          <Stack direction="row" spacing={4} my={5}>
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} sx={{ maxWidth: 345 }}>
                <CardMedia
                  component="img"
                  height="140"
                  image="https://mui.com/static/images/cards/contemplative-reptile.jpg"
                  alt="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Lizard
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lizards are a widespread group of squamate reptiles, with
                    over 6,000 species, ranging across all continents except
                    Antarctica
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Container>
      </Stack> */}
    </Box>
  );
}
