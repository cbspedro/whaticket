import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import { Badge, Collapse, List } from "@material-ui/core";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import CodeRoundedIcon from "@material-ui/icons/CodeRounded";
import EventIcon from "@material-ui/icons/Event";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PeopleIcon from "@material-ui/icons/People";
import ListIcon from "@material-ui/icons/ListAlt";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import ForumIcon from "@material-ui/icons/Forum";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import BusinessIcon from "@material-ui/icons/Business";
import StarOutlineIcon from "@material-ui/icons/StarOutline";
import { AddToQueueRounded } from "@material-ui/icons";
import { CalendarToday, LoyaltyRounded } from "@material-ui/icons";
import MailOutlineIcon from "@material-ui/icons/MailOutline"; // Importe o ícone de e-mail
import SendIcon from "@material-ui/icons/Send"; // Importe o ícone de enviar
import ScheduleIcon from "@material-ui/icons/Schedule";
import LiveHelpIcon from "@material-ui/icons/LiveHelp";
import Typography from "@material-ui/core/Typography";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { socketConnection } from "../services/socket";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import useVersion from "../hooks/useVersion";
import RotateRight from "@material-ui/icons/RotateRight";
import logo from "../assets/logo.png";

import {
  PieChart,
  MessageCircle,
  KanbanSquare,
  MessagesSquare,
  Bookmark,
  HelpCircle,
  ListChecks,
  Users,
  CalendarPlus,
  Zap,
  TrendingUp,
  Settings2,
  Contact,
  ListTodo,
  BookOpen,
  MonitorCheck,
  Workflow,
  UserPlus,
  PlugZap,
  Landmark,
  Settings,
} from "lucide-react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  ListSubheader: {
    height: 26,
    marginTop: "-15px",
    marginBottom: "20px",
  },
  listItem: {
    borderRadius: 10,
    margin: "5px 0",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: "#fff",
    },
  },
  subMenu: {
    paddingLeft: 15,
    borderLeft: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
  },
  logoutButton: {
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: theme.palette.error.main,
    color: "#fff",
    "&:hover": {
      backgroundColor: theme.palette.error.dark,
    },
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, className } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem dense button component={renderLink} className={className}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = (props, { collapsed }) => {
  const classes = useStyles();
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, handleLogout } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  // novas features
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [openKanbanSubmenu, setOpenKanbanSubmenu] = useState(false);
  const [openEmailSubmenu, setOpenEmailSubmenu] = useState(false);

  const history = useHistory();

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [version, setVersion] = useState(false);

  const { getPlanCompany } = usePlans();

  const { getVersion } = useVersion();

  const handleClickLogout = () => {
    //handleCloseMenu();
    handleLogout();
  };

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = localStorage.getItem("companyId");
      const planConfigs = await getPlanCompany(undefined, companyId);
      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    socket.on(`company-${companyId}-chat`, (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  // useEffect(() => {
  //   if (localStorage.getItem("cshow")) {
  //     setShowCampaigns(true);
  //   }
  // }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div onClick={drawerClose}>
      <Can
        role={user.profile}
        perform="dashboard:view"
        yes={() => (
          <ListItemLink to="/" primary="Dashboard" icon={<PieChart />} />
        )}
      />

      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<MessageCircle />}
      />

      <ListItem button onClick={() => setOpenEmailSubmenu((prev) => !prev)}>
        <ListItemIcon>
          <MailOutlineIcon />
        </ListItemIcon>
        <ListItemText primary={i18n.t("Email")} />
        {openEmailSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </ListItem>
      <Collapse in={openEmailSubmenu} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem
            onClick={() => history.push("/Email")}
            button
            style={{ paddingLeft: 15 }}
          >
            <ListItemIcon>
              <SendIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t("Enviar")} />
          </ListItem>
          <ListItem
            onClick={() => history.push("/EmailLis")}
            button
            style={{ paddingLeft: 15 }}
          >
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t("Enviados")} />
          </ListItem>
          {/* Adicione aqui a nova rota para agendamento de e-mails */}
          <ListItem
            onClick={() => history.push("/EmailScheduler")}
            button
            style={{ paddingLeft: 15 }}
          >
            <ListItemIcon>
              <ScheduleIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t("Agendar")} />
          </ListItem>
          {/* Adicione aqui a nova rota para e-mails agendados */}
          <ListItem
            onClick={() => history.push("/EmailsAgendado")}
            button
            style={{ paddingLeft: 15 }}
          >
            <ListItemIcon>
              <ScheduleIcon /> {/* Ícone apropriado para agendamento */}
            </ListItemIcon>
            <ListItemText primary={i18n.t("Agendados")} />{" "}
            {/* Nome apropriado para a nova rota */}
          </ListItem>
        </List>
      </Collapse>

      <ListItem button onClick={() => setOpenKanbanSubmenu((prev) => !prev)}>
        <ListItemIcon>
          <KanbanSquare />
        </ListItemIcon>
        <ListItemText primary={i18n.t("Kanban")} />
        {openKanbanSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </ListItem>
      <Collapse
        style={{ paddingLeft: 15 }}
        in={openKanbanSubmenu}
        timeout="auto"
        unmountOnExit
      >
        <List component="div" disablePadding>
          <ListItem onClick={() => history.push("/kanban")} button>
            <ListItemIcon>
              <ListIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t("Painel")} />
          </ListItem>
          <ListItem onClick={() => history.push("/tagsKanban")} button>
            <ListItemIcon>
              <CalendarToday />
            </ListItemIcon>
            <ListItemText primary={i18n.t("Tags")} />
          </ListItem>
          {/*<ListItem onClick={() => history.push("/campanhas")} button>
            <ListItemIcon>
              <EventAvailableIcon />
            </ListItemIcon>
            <ListItemText primary={i18n.t("Em Andamento")} />
          </ListItem>*/}
        </List>
      </Collapse>

      <ListItemLink
        to="/quick-messages"
        primary={i18n.t("mainDrawer.listItems.quickMessages")}
        icon={<Zap />}
      />

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<Users />}
      />

      <ListItemLink
        to="/todolist"
        primary={i18n.t("Tarefas")}
        icon={<ListChecks />}
      />

      {/*
        <ListItemLink
          to="/Calendario"
          primary={i18n.t("Calendario")}
          icon={<CalendarToday />}
        />
        */}

      {showSchedules && (
        <>
          <ListItemLink
            to="/schedules"
            primary={i18n.t("mainDrawer.listItems.schedules")}
            icon={<CalendarPlus />}
          />
        </>
      )}

      <ListItemLink
        to="/tags"
        primary={i18n.t("mainDrawer.listItems.tags")}
        icon={<Bookmark />}
      />

      {showInternalChat && (
        <>
          <ListItemLink
            to="/chats"
            primary={i18n.t("mainDrawer.listItems.chats")}
            icon={
              <Badge
                color="secondary"
                variant="dot"
                invisible={invisible}
                overlap="rectangular"
              >
                <MessagesSquare />
              </Badge>
            }
          />
        </>
      )}

{/*<ListItemLink
        to="/ChatGPT"
        primary={i18n.t("ChatGPT")}
        icon={<LiveHelpIcon />}
          />*/}

      <ListItemLink
        to="/helps"
        primary={i18n.t("mainDrawer.listItems.helps")}
        icon={<HelpCircle />}
      />

      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider />
            {/*<ListSubheader inset>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>*/ }
            {showCampaigns && (
              <>
                <ListItem
                  dense
                  button
                  onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                >
                  <ListItemIcon>
                    <TrendingUp />
                  </ListItemIcon>
                  <ListItemText
                    primary={i18n.t("mainDrawer.listItems.campaigns")}
                  />
                  {openCampaignSubmenu ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </ListItem>
                <Collapse
                  style={{ paddingLeft: 15 }}
                  in={openCampaignSubmenu}
                  timeout="auto"
                  unmountOnExit
                >
                  <List dense component="div" disablePadding>
                    <ListItem onClick={() => history.push("/campaigns")} button>
                      <ListItemIcon>
                        <ListTodo />
                      </ListItemIcon>
                      <ListItemText primary="Listagem" />
                    </ListItem>
                    <ListItem
                      onClick={() => history.push("/contact-lists")}
                      button
                    >
                      <ListItemIcon>
                        <Contact />
                      </ListItemIcon>
                      <ListItemText primary="Listas de Contatos" />
                    </ListItem>
                    <ListItem
                      onClick={() => history.push("/campaigns-config")}
                      button
                    >
                      <ListItemIcon>
                        <Settings2 />
                      </ListItemIcon>
                      <ListItemText primary="Configurações" />
                    </ListItem>
                  </List>
                </Collapse>
              </>
            )}

            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<BookOpen />}
              />
            )}
            {/*user.super && (
              <ListItemLink
                to="/campanhaAvancada"
                primary={i18n.t("Campanha Avancada")}
                icon={<PlaylistAddCheckIcon />}
              />
            )*/}

            {showExternalApi && (
              <>
                <ListItemLink
                  to="/messages-api"
                  primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                  icon={<PlugZap />}
                />
              </>
            )}

            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<UserPlus />}
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<Workflow />}
            />
            <ListItemLink
              to="/connections"
              primary={i18n.t("mainDrawer.listItems.connections")}
              icon={
                <Badge
                  badgeContent={connectionWarning ? "!" : 0}
                  color="error"
                  overlap="rectangular"
                >
                  <MonitorCheck />
                </Badge>
              }
            />

           {/*<ListItemLink
              to="/ratings"
              primary={i18n.t("mainDrawer.listItems.ratings")}
              icon={<StarOutlineIcon />}
            /> 

            {
              <ListItemLink
                to="/integrations"
                primary={"Integrações"}
                icon={<AddToQueueRounded />}
              />
            }*/}
            <ListItemLink
              to="/financeiro"
              primary={i18n.t("mainDrawer.listItems.financeiro")}
              icon={<Landmark />}
            />
            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<Settings />}
            />

            {/* {user.super && (
              <ListSubheader inset>
                {i18n.t("mainDrawer.listItems.administration")}
              </ListSubheader>
            )} */}

            {user.super && (
              <ListItemLink
                to="/companies"
                primary={i18n.t("mainDrawer.listItems.companies")}
                icon={<BusinessIcon />}
              />
            )}

            {!collapsed && (
              <React.Fragment>
                <Divider />
                {/*
              // IMAGEM NO MENU
              <Hidden only={['sm', 'xs']}>
                <img style={{ width: "100%", padding: "10px" }} src={logo} alt="image" />            
              </Hidden> 
              */}
                <Typography
                  style={{
                    fontSize: "12px",
                    padding: "10px",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  V:{version}
                </Typography>
              </React.Fragment>
            )}
          </>
        )}
      />
      <Divider />
      <li>
        <ListItem
          button
          dense
          onClick={handleClickLogout}
          className={classes.logoutButton}
        >
          <ListItemIcon>
            <RotateRight />
          </ListItemIcon>
          <ListItemText primary={i18n.t("Sair")} />
        </ListItem>
      </li>
    </div>
  );
};

export default MainListItems;
