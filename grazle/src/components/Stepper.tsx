import React from "react";
import { Step, StepLabel, Stepper, Box } from "@mui/material";

interface Props {
  steps: any;
  selectedStep: number;
}

const CustomStepper = (props: Partial<Props>) => {
  const { steps, selectedStep } = props;

  return (
    <Box sx={{ width: "100%", marginLeft: "20px" }}>
      <Stepper
        activeStep={selectedStep}
        sx={{
          "& .MuiStepLabel-label.Mui-completed": {
            fill: "#F70000",
            fontWeight: "500",
          },

          "& .MuiStepIcon-root.Mui-completed": {
            fill: "#F70000",
            border: "none",
          },
          "& .MuiStepIcon-root.Mui-active": {
            fill: "#F70000",
            border: "none",
            "& MuiStepIcon-text": {
              fontSize: "10px",
              fill: "white",
            },
          },
          "& .MuiStepIcon-root": {
            fill: "white",
            border: "2px solid #D9DDDD",
            borderRadius: "50%",
          },
          "& .MuiStepIcon-text": {
            fontSize: "14px",
            fill: "#D9DDDD",
          },
          "& MuiStepIcon-text.Mui-active": {
            fontSize: "14px",
            fill: "white",
          },
        }}
        alternativeLabel
      >
        {steps.map((obj: any) => (
          <Step key={obj.id}>
            <StepLabel color="red">{obj.lable}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default CustomStepper;
