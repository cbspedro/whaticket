import React, { useState, useEffect } from "react";
import qs from 'query-string'

import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import usePlans from "../../hooks/usePlans";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";
import Avatar from "@material-ui/core/Avatar";
import { versionSystem } from "../../../package.json";
import { nomeEmpresa } from "../../../package.json";
import Button from "@material-ui/core/Button";
import {
    IconButton,
    InputAdornment,
  } from "@material-ui/core";
  import Visibility from "@material-ui/icons/Visibility";
  import VisibilityOff from "@material-ui/icons/VisibilityOff";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import { i18n } from "../../translate/i18n";

import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import moment from "moment";
import logo from "../../assets/logo.png";
import bk from "../../assets/bk.jpg";

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

const randomImageURL = "https://source.unsplash.com/random/?tech";
const useStyles = makeStyles(theme => ({
    root: {
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${bk})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
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
    avatar: {
        margin: theme.spacing(1),  
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: "100%",
        marginTop: theme.spacing(2),
    },
    inputLabel: {
        color: "#ffffff",
    },
    underline: {
        "&::before": {
            borderBottom: "1px solid #ffffff",
        },
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    powered: {
        color: "#666666",
        textAlign: "center",
        marginTop: "20px",
    },
    whatsappButton: {
        background: "#00826a",
        color: "#ffffff",
        padding: "10px 20px",
        borderRadius: "5px",
        textDecoration: "none",
        display: "flex",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        "&:hover": {
            background: "#0c6a58",
            textAlign: "center",
            alignItems: "center",
            justifyContent: "center",
        },
    },
    logo: {
        marginBottom: theme.spacing(4), // Espaço entre o logo e o título
        width: "220px", // ou a largura desejada
        height: "auto", // ou a altura desejada
      },
}));

const handleNewUserMessage = newMessage => {
    window.open(
        `https://api.whatsapp.com/send?phone=5583996226002&text=${encodeURIComponent(newMessage)}`,
      "_blank"
    );
};

const UserSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Muito curto!")
        .max(50, "Muito extenso!")
        .required("Obrigatório"),
    password: Yup.string().min(5, "Muito curto!").max(50, "Muito extenso!"),
    email: Yup.string().email("Email inválido").required("Obrigatório"),
});

const SignUp = () => {
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    const [showPassword, setShowPassword] = useState(false);
    const classes = useStyles();
    const history = useHistory();
    const { getPlanList } = usePlans();
    const [loading, setLoading] = useState(false);
    let companyId = null;

    const params = qs.parse(window.location.search);
    if (params.companyId !== undefined) {
        companyId = params.companyId;
    }

    const initialState = { name: "", email: "", password: "", phone: "", companyId, companyName: "", planId: "" };

    const [user] = useState(initialState);

    // Defina um estado para a variável 'plans'
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            const planList = await getPlanList();

            setPlans(planList);
            setLoading(false);
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const dueDate = moment().add(7, "day").format();
    const handleSignUp = async values => {
        Object.assign(values, { recurrence: "MENSAL" });
        Object.assign(values, { dueDate: dueDate });
        Object.assign(values, { status: "t" });
        Object.assign(values, { campaignsEnabled: true });
        try {
            
            await openApi.post("/auth/signup", values);
            toast.success(i18n.t("signup.toasts.success", { autoClose: 10000 }));
            history.push("/login");
        } catch (err) {
            toastError(err);
        }
    };

    const { list: listPlans } = usePlans();

    useEffect(() => {
        async function fetchData() {
            const list = await listPlans({listPublic: "false"});
            setPlans(list);
        }
        fetchData();
    }, []);

    return (
        <div className={classes.root} >
            <img src={logo} alt="Logo da Empresa" className={classes.logo} />
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>
                    
                    <Typography component="h1" variant="h5">
                        {i18n.t("signup.title")}
                    </Typography>
                    <Formik
                        initialValues={user}
                        enableReinitialize={true}
                        validationSchema={UserSchema}
                        onSubmit={(values, actions) => {
                            setTimeout(() => {
                                handleSignUp(values);
                                actions.setSubmitting(false);
                            }, 400);
                        }}
                    >
                        {({ touched, errors, isSubmitting }) => (
                            <Form className={classes.form}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            variant="outlined"
                                            fullWidth
                                            id="companyName"
                                            label={i18n.t("signup.form.company")}
                                            error={touched.companyName && Boolean(errors.companyName)}
                                            helperText={touched.companyName && errors.companyName}
                                            name="companyName"
                                            autoComplete="companyName"
                                            autoFocus
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            autoComplete="name"
                                            name="name"
                                            error={touched.name && Boolean(errors.name)}
                                            helperText={touched.name && errors.name}
                                            variant="outlined"
                                            fullWidth
                                            id="name"
                                            label={i18n.t("signup.form.name")}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            variant="outlined"
                                            fullWidth
                                            id="email"
                                            label={i18n.t("signup.form.email")}
                                            name="email"
                                            error={touched.email && Boolean(errors.email)}
                                            helperText={touched.email && errors.email}
                                            autoComplete="email"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                    <Field
                                    as={TextField}
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    error={touched.password && Boolean(errors.password)}
                                    helperText={touched.password && errors.password}
                                    label={i18n.t("signup.form.password")}
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    autoComplete="current-password"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={toggleShowPassword}
                                                >
                                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field
                                            as={TextField}
                                            variant="outlined"
                                            fullWidth
                                            id="phone"
                                            label={i18n.t("signup.form.phone")}
                                            name="phone"
                                            autoComplete="phone"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <InputLabel htmlFor="plan-selection">Plano</InputLabel>
                                        <Field
                                            as={Select}
                                            variant="outlined"
                                            fullWidth
                                            id="plan-selection"
                                            label="Plano"
                                            name="planId"
                                            required
                                        >
                                            {plans.map((plan, key) => (
                                                <MenuItem key={key} value={plan.id}>
                                                    {plan.name} - Atendentes: {plan.users} - Conexões: {plan.connections} - Filas: {plan.queues} - $ {plan.amount}
                                                </MenuItem>
                                            ))}
                                        </Field>
                                    </Grid>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        style={{ borderRadius: "10px", padding: "5px 12px", fontSize: "1em", marginTop: "20px" }}
                                        className={classes.submit}
                                    >
                                        {i18n.t("signup.buttons.submit")}
                                    </Button>
                                    <Grid container justify="flex-end">
                                        <Grid item>
                                            <Link
                                                href="#"
                                                variant="body2"
                                                component={RouterLink}
                                                to="/login"
                                            >
                                                {i18n.t("signup.buttons.login")}
                                            </Link>
                                        </Grid>
                                    </Grid>
                                    
                                </Grid>

                            </Form>
                        )}
                    </Formik>
                    <Box mt={8}><Copyright /></Box>
                </div>
            </Container>
        </div>
    );
};

export default SignUp;
