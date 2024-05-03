import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import { versionSystem } from "../../../package.json";
import { nomeEmpresa } from "../../../package.json";
import bk from "../../assets/bk.jpg"

import { AuthContext } from "../../context/Auth/AuthContext";
import logo from "../../assets/logologin.png";

const randomImageURL = "https://source.unsplash.com/random/?tech";
const Copyright = () => {
  return (
    <Typography variant="body2" color="textSecondary" align="center" style={{ marginTop: "-21px" }}>
      © {new Date().getFullYear()}
      {" - "}
      <Link color="inherit" href="#">
        { nomeEmpresa } - v { versionSystem }
      </Link>
      {"."}
    </Typography>
  );
};
const useStyles = makeStyles((theme) => ({
  container: {
    position: "relative",
    background: `url(${bk}) center/cover no-repeat`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  paper: {
    backgroundColor: theme.palette.type === 'dark' ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)", // Fundo semi-transparente
    borderRadius: "35px",
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    border: "6px solid transparent", // Adiciona uma borda transparente
    boxShadow: "0 0 180px rgba(0, 0, 0, 0.3)", // Adiciona um efeito de sombra azul
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    borderRadius: "20px",
    padding: "10px 20px",
    fontSize: "1.2em",
  },
  logo: {
    marginBottom: theme.spacing(4),
    width: "200px",
    height: "auto",
  },
  passwordIcon: {
    cursor: "pointer",
  },
  whatsappButton: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    backgroundColor: "#25d366",
    "&:hover": {
      backgroundColor: "#128c7e",
    },
  },
  whatsappIcon: {
    fontSize: 40,
    color: "#fff",
  },
}));

const Login = () => {
  const classes = useStyles();

  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const { handleLogin } = useContext(AuthContext);

  const handleChangeInput = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin(user);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={classes.container}>
      <img src={logo} alt="Logo da Empresa" className={classes.logo} />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Typography component="h1" variant="h5">
            Faça login na sua conta
          </Typography>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={user.email}
              onChange={handleChangeInput}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={user.password}
              onChange={handleChangeInput}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      className={classes.passwordIcon}
                      onClick={toggleShowPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
           <Grid container justify="flex-end">
  <Grid item xs={6} style={{ textAlign: "right" }}>
    <Link component={RouterLink} to="/forgetpsw" variant="body2">
      Esqueceu sua senha?
    </Link>
  </Grid>
</Grid>
            <Button
  type="submit"
  fullWidth
  variant="contained"
  color="primary"
  style={{ borderRadius: "10px", padding: "5px 12px", fontSize: "1em", marginTop: "20px" }}
>
  Entrar
</Button>
<Grid container justify="center" style={{ marginTop: "20px" }}>
  <Grid item>
    <Link component={RouterLink} to="/signup" variant="body2">
      {"Não tem uma conta? Registre-se"}
    </Link>
  </Grid>
  <Box mt={8}><Copyright /></Box>
</Grid>
          </form>
          
        </div>
      </Container>
      <IconButton
        href={`https://wa.me/${process.env.REACT_APP_NUMBER_SUPPORT}`}
        className={classes.whatsappButton}
        target="_blank"
        rel="noopener noreferrer"
      >
        <WhatsAppIcon className={classes.whatsappIcon} />
      </IconButton>
      
    </div>
  );
};

export default Login;
