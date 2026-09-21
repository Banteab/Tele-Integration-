import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import NavBar from "../components/navBar";
import Stepper from "../components/stepper";

export default function DownloadTicketPage() {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState({ value: false, message: "" });

  // useEffect(() => {
  //   setIsLoading(true);

  //   const token = localStorage.getItem("liyu_login_token");
  //   axios
  //     .get(`${ApiUrl}/bank/portal/booked?date=${date}`, {
  //       headers: {
  //         Authorization:  `Bearer ${token}`,
  //       },
  //     })
  //     .then((res) => {
  //       setPaymentDetail(
  //         res.data.find((paymentInfo) => paymentInfo.refNumber === refValue)
  //       );
  //     })
  //     .catch((err) =>
  //       setIsError({
  //         value: true,
  //         message: err,
  //       })
  //     )
  //     .finally(() => setIsLoading(false));
  // }, []);

  const columns = [
    {
      field: "trip",
      headerName: "Trip",
      width: 200,
    },
    {
      field: "passenger",
      headerName: "Passenger",
      width: 200,
    },
    {
      field: "phone",
      headerName: "Phone",
      width: 200,
    },
    {
      field: "seat",
      headerName: "Seat",
      width: 150,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
    },
    {
      field: "dateCreated",
      headerName: "Created Data",
      type: "date",
      width: 130,
    },
  ];

  const rows = [
    {
      id: "1",
      trip: "Addis Ababa - Bahirdar",
      passenger: "John",
      phone: "0987654321",
      seat: "6",
      status: "Paid",
      dateCreated: new Date(),
    },
    {
      id: "2",
      trip: "Addis Ababa - Bahirdar",
      passenger: "Doe",
      phone: "0987654321",
      seat: "1",
      status: "Paid",
      dateCreated: new Date(),
    },
  ];

  return (
    <>
      <NavBar />
      <Container>
        <Stack spacing={4} mt={10} mb={5}>
          <Box sx={{ height: "85vh", width: "100%" }}>
            <DataGrid rows={rows} columns={columns} />
          </Box>
        </Stack>
      </Container>
    </>
  );
}
