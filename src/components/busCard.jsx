import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import React from "react";
import CardActionArea from "@material-ui/core/CardActionArea";

export default function BusCard({selected, bus, selectBus}) {
  const current = selected?.id === bus?.id;
  return ( 
    <Card elevation={4} style={{backgroundColor: current ? "#123456": 'transparent'}}>
      <CardActionArea onClick={() => selectBus()}>
        <CardContent>
          <Typography variant="h5" component="h2" style={{color: current ? "white" : "gray"}}>
            {`${bus.busAssociation} - ${bus.sideNumber}`}
          </Typography>
          <Typography variant="body2" component="p" style={{color: current ? "white" : "gray"}}>
            {`${bus.busAssociation} | ${bus.arrivalTime} AT | ${bus.departureTime} DT | ${bus.price} birr`}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
