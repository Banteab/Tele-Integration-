import { useState } from "react";
import { useHistory } from "react-router-dom";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import NavBar from "../components/navBar";
import Stepper from "../components/stepper";

export default function SearchTicketPage() {
  const [refNum, setRefNum] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState({ value: false, message: "" });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!refNum) {
      setIsError({
        value: true,
        message: "Search field is required",
      });
      return;
    }

    // setIsLoading(true);
    //   axios
    //     .get(`${ApiUrl}/bank/abay-bank/portal/${refNum}`, {
    //       headers: {
    //         "x-api-key": "0QLEUZ8W6FE1CZH",
    //         "Content-Type": "application/json",
    //       },
    //     })
    //     .then((res) => {
    //       console.log("res", res);
    //     })
    //     .catch((err) =>
    //       setIsError({
    //         value: true,
    //         message: err,
    //       })
    //     )
    //     .finally(() => setIsLoading(false));
  };

  return (
    <>
      <NavBar />
      <Container>
        <Stack spacing={4} mt={10} mb={5}>
          <Stepper activeStep={5} />
          <Paper elevation={3} sx={{ padding: { xs: 2, sm: 4 } }}>
            {isError.value && <Alert severity="error">{isError.message}</Alert>}
            <form onSubmit={onSubmit}>
              <Stack direction="row" spacing={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Reference Number"
                  variant="standard"
                  value={refNum}
                  onChange={(e) => setRefNum(e.target.value)}
                />
                <Button fullWidth type="submit" variant="contained">
                  Search
                </Button>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
