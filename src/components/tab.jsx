import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles((theme) => ({
  paper: {
    // marginTop: theme.spacing(3),
    // marginBottom: theme.spacing(3),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      // padding: theme.spacing(3),
    },
  },
  button: {
    marginTop: theme.spacing(3),
    // marginLeft: theme.spacing(1),
  },
}));

export default function TabBar(props) {
  const classes = useStyles();
  const [value, setValue] = React.useState("one");

  function a11yProps(index) {
    return {
      id: `wrapped-tab-${index}`,
      "aria-controls": `wrapped-tabpanel-${index}`,
    };
  }

  return (
    <Paper className={classes.paper} elevation={5}>
      <Tabs
        value={value}
        indicatorColor="secondary"
        textColor="primary"
        onChange={(v, n) => setValue(n)}
        aria-label="disabled tabs example"
        style={{ backgroundColor: "#123456" }}
      >
        <Tab
          value="one"
          style={{ color: "white" }}
          label="Ticket booking"
          wrapped
          {...a11yProps("one")}
        />
        <Tab
          style={{ color: "white" }}
          value="two"
          label="Live booking"
          {...a11yProps("two")}
        />
        <Tab
          style={{ color: "white" }}
          value="three"
          label="Tickets"
          {...a11yProps("three")}
        />
        <Tab
          style={{ color: "white" }}
          value="four"
          label="Checker"
          {...a11yProps("four")}
        />
        
      </Tabs>
      <Tabpanel value={value} index="one">
        {props.tab1}
      </Tabpanel>
      <Tabpanel value={value} index="two">
        {props.tab2}
      </Tabpanel>
      <Tabpanel value={value} index="three">
        {props.tab3}
      </Tabpanel>
      <Tabpanel value={value} index="four">
        {props.tab4}
      </Tabpanel>
      
    </Paper>
  );
}

function Tabpanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
