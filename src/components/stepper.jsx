import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

const steps = [
  "Select Router & Schedule",
  "Book Seat",
  "Passenger Details",
  "Payment",
  "Download Ticket",
];

export default function StepCounter({ activeStep }) {
  return (
    <Box sx={{ width: "70%", mx: "auto", mt: activeStep === 2 ? 0 : 7 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
