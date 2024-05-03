import React, { useContext, useState, useEffect } from "react";
import { i18n } from "../../translate/i18n";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import Typography from "@material-ui/core/Typography";
import { Button } from "@material-ui/core";

import SpeedIcon from "@material-ui/icons/Speed";
import GroupIcon from "@material-ui/icons/Group";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PersonIcon from "@material-ui/icons/Person";
import CallIcon from "@material-ui/icons/Call";
import RecordVoiceOverIcon from "@material-ui/icons/RecordVoiceOver";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ForumIcon from "@material-ui/icons/Forum";
import FilterListIcon from "@material-ui/icons/FilterList";
import ClearIcon from "@material-ui/icons/Clear";
import SendIcon from "@material-ui/icons/Send";
import MessageIcon from "@material-ui/icons/Message";
import AccessAlarmIcon from "@material-ui/icons/AccessAlarm";
import TimerIcon from "@material-ui/icons/Timer";

import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";

import Chart from "./Chart";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";

import CardCounter from "../../components/Dashboard/CardCounter";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray } from "lodash";

import { AuthContext } from "../../context/Auth/AuthContext";

import useDashboard from "../../hooks/useDashboard";
import useTickets from "../../hooks/useTickets";
import useUsers from "../../hooks/useUsers";
import useContacts from "../../hooks/useContacts";
import useMessages from "../../hooks/useMessages";
import { ChatsUser } from "./ChartsUser";

import Filters from "./Filters";
import { isEmpty } from "lodash";
import moment from "moment";
import { ChartsDate } from "./ChartsDate";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.padding,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 240,
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  iconWithEffect: {
    fontSize: 100,
    color: "#ffffff",
    transition: "transform 0.3s",
    "&:hover": {
      transform: "scale(1.1)",
    },
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  iframeDashboard: {
    width: "100%",
    height: "calc(100vh - 64px)",
    border: "none",
  },
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  fixedHeightPaper: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  customFixedHeightPaper: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 120,
  },
  customFixedHeightPaperLg: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  }, //EM ATENDIMENTO
  roundedPaper: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s",
    "&:hover": {
      transform: "scale(1.02)",
    },
  },
  card1: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#007fad",
    color: "#eee",
  }, //AGUARDANDO ATENDIMENTO
  card2: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#007fad",
    color: "#eee",
  }, //ATENDIMENTOS FINALIZADOS
  card3: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#007fad",
    color: "#eee",
  }, //NOVOS LEADS
  card4: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#007fad",
    color: "#eee",
  }, // TOTAL MENSAGENS RECEBIDAS
  card5: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#007fad",
    color: "#eee",
  }, //ATENDIMENTOS EM ABERTO
  card6: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#007fad",
    color: "#eee",
  }, // TOTAL DE MENSAGENS ENVIADAS
  card7: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#007fad",
    color: "#eee",
  }, // TEMPO MÉDIO DE ATENDIMENTOS
  card8: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#007fad",
    color: "#eee",
  }, // TEMPO DE ESPERA
  card9: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#007fad",
    color: "#eee",
  },
  fixedHeightPaper2: {
    padding: theme.spacing(3),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [period, setPeriod] = useState(0);
  const [dateFrom, setDateFrom] = useState(
    moment("1", "D").format("YYYY-MM-DD")
  );
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();

  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  let now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${
    date < 10 ? `0${date}` : `${date}`
  }`;

  const [showFilter, setShowFilter] = useState(false);
  const [dateStartTicket, setDateStartTicket] = useState(now);
  const [dateEndTicket, setDateEndTicket] = useState(now);
  const [queueTicket, setQueueTicket] = useState(false);

  const { user } = useContext(AuthContext);
  var userQueueIds = [];

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format("YYYY-MM-DD"),
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);

    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const GetUsers = () => {
    let count;
    let userOnline = 0;
    attendants.forEach((user) => {
      if (user.online === true) {
        userOnline = userOnline + 1;
      }
    });
    count = userOnline === 0 ? 0 : userOnline;
    return count;
  };

  const GetContacts = (all) => {
    let props = {};
    if (all) {
      props = {};
    } else {
      props = {
        dateStart: dateStartTicket,
        dateEnd: dateEndTicket,
      };
    }
    const { count } = useContacts(props);
    return count;
  };

  const GetMessages = (all, fromMe) => {
    let props = {};
    if (all) {
      if (fromMe) {
        props = {
          fromMe: true,
        };
      } else {
        props = {
          fromMe: false,
        };
      }
    } else {
      if (fromMe) {
        props = {
          fromMe: true,
          dateStart: dateStartTicket,
          dateEnd: dateEndTicket,
        };
      } else {
        props = {
          fromMe: false,
          dateStart: dateStartTicket,
          dateEnd: dateEndTicket,
        };
      }
    }
    const { count } = useMessages(props);
    return count;
  };

  function toggleShowFilter() {
    setShowFilter(!showFilter);
  }

  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3} justifyContent="flex-end">
          {/* FILTROS */}
          <Grid item xs={12}>
            <Button
              onClick={toggleShowFilter}
              style={{ float: "right" }}
              color="primary"
            >
              {!showFilter ? <FilterListIcon /> : <ClearIcon />}
            </Button>
          </Grid>

          {showFilter && (
            <Filters
              classes={classes}
              setDateStartTicket={setDateStartTicket}
              setDateEndTicket={setDateEndTicket}
              dateStartTicket={dateStartTicket}
              dateEndTicket={dateEndTicket}
              setQueueTicket={setQueueTicket}
              queueTicket={queueTicket}
            />
          )}

          {/* EM ATENDIMENTO */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={`${classes.roundedPaper} ${classes.card1}`}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    {i18n.t("dashboard.title.inservice")}
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {counters.supportHappening}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={2}>
                  <CallIcon
                    style={{
                      fontSize: 100,
                      color: "#ffffff",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* AGUARDANDO */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={`${classes.roundedPaper} ${classes.card2}`}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    {i18n.t("dashboard.title.waiting")}
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {counters.supportPending}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <HourglassEmptyIcon
                    style={{
                      fontSize: 100,
                      color: "#ffffff",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* ATENDENTES ATIVOS */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={`${classes.roundedPaper} ${classes.card6}`}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    {i18n.t("dashboard.title.onlineAgents")}
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {GetUsers()}
                      <span style={{ color: "#ffffff" }}>
                        /{attendants.length}
                      </span>
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <RecordVoiceOverIcon
                    style={{
                      fontSize: 100,
                      color: "#ffffff",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* FINALIZADOS */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={`${classes.roundedPaper} ${classes.card3}`}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    {i18n.t("dashboard.title.completedTickets")}
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {counters.supportFinished}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <CheckCircleIcon
                    style={{
                      fontSize: 100,
                      color: "#ffffff",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* MINHAS MENSAGEM ENVIADAS */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={`${classes.roundedPaper} ${classes.card7}`}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    {i18n.t("dashboard.title.totalSentMessages")}
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {GetMessages(false, true)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <SendIcon
                    style={{
                      fontSize: 100,
                      color: "#ffffff",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* MINHAS MENSAGEM RECEBIDAS */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={`${classes.roundedPaper} ${classes.card5}`}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    {i18n.t("dashboard.title.totalReceivedMessages")}
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {GetMessages(false, false)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <MessageIcon
                    style={{
                      fontSize: 100,
                      color: "#ffffff",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* CARD DE GRAFICO */}
          {/*<Grid item xs={12}>
            <Paper
              elevation={6}
              className={classes.fixedHeightPaper}
            >
              <Chart
                dateStartTicket={dateStartTicket}
                dateEndTicket={dateEndTicket}
                queueTicket={queueTicket}
              />
            </Paper>
                  </Grid> *}

          {/* INFO DOS USUARIOS bugg*/}
          {/*<Grid item xs={12}>
            {attendants.length ? (
              <TableAttendantsStatus
                attendants={attendants}
                loading={loading}
              />
            ) : null}
            </Grid>*/}

          
          {/* NOVOS CONTATOS */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={`${classes.roundedPaper} ${classes.card4}`}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    {i18n.t("dashboard.title.newLeads")}
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {GetContacts(true)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <GroupAddIcon
                    style={{
                      fontSize: 100,
                      color: "#ffffff",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* T.M. DE ATENDIMENTO */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={`${classes.roundedPaper} ${classes.card8}`}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    {i18n.t("dashboard.title.averageHandlingTime")}
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {formatTime(counters.avgSupportTime)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <AccessAlarmIcon
                    style={{
                      fontSize: 100,
                      color: "#ffffff",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* T.M. DE ESPERA */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              className={`${classes.roundedPaper} ${classes.card9}`}
              elevation={6}
            >
              <Grid container spacing={3}>
                <Grid item xs={8}>
                  <Typography component="h3" variant="h6" paragraph>
                    {i18n.t("dashboard.title.averageWaitTime")}
                  </Typography>
                  <Grid item>
                    <Typography component="h1" variant="h4">
                      {formatTime(counters.avgWaitTime)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={4}>
                  <TimerIcon
                    style={{
                      fontSize: 100,
                      color: "#ffffff",
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          {/* TOTAL DE ATENDIMENTOS POR USUARIO */}
          <Grid container spacing={2}>
            {/* Componente ChatsUser */}
            <Grid item xs={12} md={6}>
              <Paper className={classes.roundedPaper}>
                <ChatsUser />
              </Paper>
            </Grid>

            {/* Componente ChartsDate */}
            <Grid item xs={12} md={6}>
              <Paper className={classes.roundedPaper}>
                <ChartsDate />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;
