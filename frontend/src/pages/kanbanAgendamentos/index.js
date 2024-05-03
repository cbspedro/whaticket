import React, {
    useState,
    useEffect,
    useReducer,
    useCallback,
    useContext,
  } from "react";
  import { toast } from "react-toastify";
  import { useHistory } from "react-router-dom";
  import { makeStyles } from "@material-ui/core/styles";
  import Paper from "@material-ui/core/Paper";
  import Button from "@material-ui/core/Button";
  import Table from "@material-ui/core/Table";
  import TableBody from "@material-ui/core/TableBody";
  import TableCell from "@material-ui/core/TableCell";
  import TableHead from "@material-ui/core/TableHead";
  import TableRow from "@material-ui/core/TableRow";
  import IconButton from "@material-ui/core/IconButton";
  import SearchIcon from "@material-ui/icons/Search";
  import TextField from "@material-ui/core/TextField";
  import InputAdornment from "@material-ui/core/InputAdornment";
  
  import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
  import EditIcon from "@material-ui/icons/Edit";
  
  import MainContainer from "../../components/MainContainer";
  import MainHeader from "../../components/MainHeader";
  import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
  import Title from "../../components/Title";
  
  import api from "../../services/api";
  import { i18n } from "../../translate/i18n";
  import TableRowSkeleton from "../../components/TableRowSkeleton";
  import ScheduleModal from "../../components/ScheduleModal";
  import ConfirmationModal from "../../components/ConfirmationModal";
  import toastError from "../../errors/toastError";
  import moment from "moment";
  import { capitalize } from "lodash";
  import { socketConnection } from "../../services/socket";
  import { AuthContext } from "../../context/Auth/AuthContext";
  import usePlans from "../../hooks/usePlans";
  
  // A custom hook that builds on useLocation to parse
  // the query string for you.
  const getUrlParam = (param) => {
    return new URLSearchParams(window.location.search).get(param);
  };
  
  const reducer = (state, action) => {
    if (action.type === "LOAD_SCHEDULES") {
      const schedules = action.payload;
      const newSchedules = [];
  
      schedules.forEach((schedule) => {
        const scheduleIndex = state.findIndex((s) => s.id === schedule.id);
        if (scheduleIndex !== -1) {
          state[scheduleIndex] = schedule;
        } else {
          newSchedules.push(schedule);
        }
      });
  
      return [...state, ...newSchedules];
    }
  
    if (action.type === "UPDATE_SCHEDULES") {
      const schedule = action.payload;
      const scheduleIndex = state.findIndex((s) => s.id === schedule.id);
  
      if (scheduleIndex !== -1) {
        state[scheduleIndex] = schedule;
        return [...state];
      } else {
        return [schedule, ...state];
      }
    }
  
    if (action.type === "DELETE_SCHEDULE") {
      const scheduleId = action.payload;
  
      const scheduleIndex = state.findIndex((s) => s.id === scheduleId);
      if (scheduleIndex !== -1) {
        state.splice(scheduleIndex, 1);
      }
      return [...state];
    }
  
    if (action.type === "RESET") {
      return [];
    }
  };
  
  const useStyles = makeStyles((theme) => ({
    mainContainer: {
      padding: theme.spacing(2),
      borderRadius: theme.spacing(1),
      boxShadow: theme.shadows[3],
    },
    mainPaper: {
      boxShadow: theme.shadows[3],
      borderRadius: theme.spacing(1),
      overflow: 'hidden', // Forcing overflow to be hidden to prevent shadow clipping
    },
    mainHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(2),
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
    },
  }));
  
  const Schedules = () => {
    const classes = useStyles();
    const history = useHistory();
  
    const { user } = useContext(AuthContext);
  
    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [deletingSchedule, setDeletingSchedule] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [searchParam, setSearchParam] = useState("");
    const [schedules, dispatch] = useReducer(reducer, []);
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [contactId, setContactId] = useState(+getUrlParam("contactId"));
  
    const { getPlanCompany } = usePlans();
  
    useEffect(() => {
      async function fetchData() {
        const companyId = localStorage.getItem("companyId");
        const planConfigs = await getPlanCompany(undefined, companyId);
        if (!planConfigs.plan.useSchedules) {
          toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
          setTimeout(() => {
            history.push(`/`)
          }, 1000);
        }
      }
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
          const { data } = await api.get("/schedules/", {
            params: { searchParam, pageNumber },
          });
    
          // Atualize os agendamentos com informações das tags
          const updatedSchedules = await Promise.all(
            data.schedules.map(async (schedule) => {
              const tagResponse = await api.get(`/tags/${schedule.campId}`);
              const tag = tagResponse.data;
              return { ...schedule, tag };
            })
          );
    
          dispatch({ type: "LOAD_SCHEDULES", payload: updatedSchedules });
          setHasMore(data.hasMore);
        } catch (err) {
          toastError(err);
        } finally {
          setLoading(false);
        }
      }, [searchParam, pageNumber]);
  
    const handleOpenScheduleModalFromContactId = useCallback(() => {
      if (contactId) {
        handleOpenScheduleModal();
      }
    }, [contactId]);
  
    useEffect(() => {
      dispatch({ type: "RESET" });
      setPageNumber(1);
    }, [searchParam]);
  
    useEffect(() => {
      setLoading(true);
      const delayDebounceFn = setTimeout(() => {
        fetchSchedules();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }, [
      searchParam,
      pageNumber,
      contactId,
      fetchSchedules,
      handleOpenScheduleModalFromContactId,
    ]);
  
    useEffect(() => {
      handleOpenScheduleModalFromContactId();
      const socket = socketConnection({ companyId: user.companyId });
  
      socket.on("user", (data) => {
        if (data.action === "update" || data.action === "create") {
          dispatch({ type: "UPDATE_SCHEDULES", payload: data.schedules });
        }
  
        if (data.action === "delete") {
          dispatch({ type: "DELETE_USER", payload: +data.scheduleId });
        }
      });
  
      return () => {
        socket.disconnect();
      };
    }, [handleOpenScheduleModalFromContactId, user]);
  
    const cleanContact = () => {
      setContactId("");
    };
  
    const handleOpenScheduleModal = () => {
      setSelectedSchedule(null);
      setScheduleModalOpen(true);
    };
  
    const handleCloseScheduleModal = () => {
      setSelectedSchedule(null);
      setScheduleModalOpen(false);
    };
  
    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
      };
  
    const handleEditSchedule = (schedule) => {
      setSelectedSchedule(schedule);
      setScheduleModalOpen(true);
    };
  
    const handleDeleteSchedule = async (scheduleId) => {
      try {
        await api.delete(`/schedules/${scheduleId}`);
        toast.success(i18n.t("schedules.toasts.deleted"));
      } catch (err) {
        toastError(err);
      }
      setDeletingSchedule(null);
      setSearchParam("");
      setPageNumber(1);
  
      dispatch({ type: "RESET" });
      setPageNumber(1);
      await fetchSchedules();
    };
  
    const loadMore = () => {
      setPageNumber((prevState) => prevState + 1);
    };
  
    const handleScroll = (e) => {
      if (!hasMore || loading) return;
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - (scrollTop + 100) < clientHeight) {
        loadMore();
      }
    };
  
    const truncate = (str, len) => {
      if (str.length > len) {
        return str.substring(0, len) + "...";
      }
      return str;
    };
    return (
        <div className={classes.mainContainer}>
          <div className={classes.mainHeader}>
            <div className={classes.title}>
              {i18n.t("Campanhas Ativas")} ({schedules.length})
            </div>
            <TextField
              placeholder={i18n.t("contacts.searchPlaceholder")}
              type="search"
              value={searchParam}
              onChange={(e) => setSearchParam(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: "gray" }} />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <Paper className={classes.mainPaper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">{i18n.t("Campanha")}</TableCell>
                  <TableCell align="center">{i18n.t("schedules.table.contact")}</TableCell>
                  <TableCell align="center">{i18n.t("schedules.table.body")}</TableCell>
                  <TableCell align="center">{i18n.t("schedules.table.sendAt")}</TableCell>
                  <TableCell align="center">{i18n.t("schedules.table.status")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id} style={{ backgroundColor: schedule.tag.color }}>
                    <TableCell align="center">{schedule.tag.name}</TableCell>
                    <TableCell align="center">{schedule.contact.name}</TableCell>
                    <TableCell align="center">{schedule.body}</TableCell>
                    <TableCell align="center">{moment(schedule.sendAt).format("DD/MM/YYYY HH:mm:ss")}</TableCell>
                    <TableCell align="center">{capitalize(schedule.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </div>
      );
    };
    
    export default Schedules;
  