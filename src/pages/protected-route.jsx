import React from "react";
import { Route, Redirect } from "react-router-dom";
export const ProtectedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        // Check for user's authentication token (from login)
        const authToken = localStorage.getItem("authtoken");
        if (authToken) {
          // User is authenticated, allow access
          return <Component {...props} />;
        } else {
          // No auth token, redirect to login
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: props.location,
              }}
            />
          );
        }
      }}
    />
  );
};

export const LoginRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        const authToken = localStorage.getItem("authtoken");
        if (authToken) {
          // If user is logged in, redirect to home page
          return (
            <Redirect
              to={{
                pathname: "/",
                state: props.location,
              }}
            />
          );
        } else {
          // No auth token (guest or unauthenticated), show login page
          return <Component {...props} />;
        }
      }}
    />
  );
};
