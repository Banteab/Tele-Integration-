import React from "react";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";

export default function Footer() {
  return (
    <Typography
      variant="body2"
      color="textSecondary"
      align="center"
      style={{ paddingBottom: 20 }}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://liyubus.com/">
        www.liyubus.com
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
