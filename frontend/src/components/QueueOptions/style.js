import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
    root: {
      width: "100%",
      //height: 400,
      [theme.breakpoints.down("sm")]: {
        maxHeight: "20vh",
      },
    },
    button: {
      marginRight: theme.spacing(1),
    },
    input: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    addButton: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  }));