import React, { useEffect, useState, useContext } from "react";

import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog'; // Importe Dialog
import DialogActions from '@material-ui/core/DialogActions'; // Importe DialogActions
import DialogContent from '@material-ui/core/DialogContent'; // Importe DialogContent
import DialogTitle from '@material-ui/core/DialogTitle'; // Importe DialogTitle
import TextField from "@material-ui/core/TextField";
import Title from "../Title";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { ToastContainer, toast } from 'react-toastify';
import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { Tabs, Tab } from "@material-ui/core";
import api from "../../services/api";
import { head } from "lodash";
import InfoTypeBot from "./infoTypeBot"
import InfoMP from "./infoMP"

import useSettings from "../../hooks/useSettings";

import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
    tab: {
    background: "#f2f5f3",
    borderRadius: 4,
    width: "100%",
    "& .MuiTab-wrapper": {
      color: "#128c7e"
    },
    "& .MuiTabs-flexContainer": {
      justifyContent: "center"
    }


  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
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
}));

export default function Options(props) {
  const { settings, scheduleTypeChanged } = props;
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [userRating, setUserRating] = useState("disabled");
  const [scheduleType, setScheduleType] = useState("disabled");
  const [chatBotType, setChatBotType] = useState("text");

  const [loadingUserRating, setLoadingUserRating] = useState(false);
  const [loadingScheduleType, setLoadingScheduleType] = useState(false);

  const [UserCreation, setUserCreation] = useState("disabled");
  const [loadingUserCreation, setLoadingUserCreation] = useState(false);

  // recursos a mais
  const [CheckMsgIsGroup, setCheckMsgIsGroup] = useState("enabled");
  const [loadingCheckMsgIsGroup, setLoadingCheckMsgIsGroup] = useState(false);

  const [SendGreetingAccepted, setSendGreetingAccepted] = useState("enabled");
  const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] = useState(false);

  const [UserRandom, setUserRandom] = useState("enabled");
  const [loadingUserRandom, setLoadingUserRandom] = useState(false);

  const [SettingsTransfTicket, setSettingsTransfTicket] = useState("enabled");
  const [loadingSettingsTransfTicket, setLoadingSettingsTransfTicket] = useState(false);

  const [AcceptCallWhatsapp, setAcceptCallWhatsapp] = useState("enabled");
  const [loadingAcceptCallWhatsapp, setLoadingAcceptCallWhatsapp] = useState(false);

  const [HoursCloseTicketsAuto, setHoursCloseTicketsAuto] = useState("enabled");
  const [loadingHoursCloseTicketsAuto, setLoadingHoursCloseTicketsAuto] = useState(false);

  const [sendSignMessage, setSendSignMessage] = useState("enabled");
  const [loadingSendSignMessage, setLoadingSendSignMessage] = useState(false);

  const [sendGreetingMessageOneQueues, setSendGreetingMessageOneQueues] = useState("enabled");
  const [loadingSendGreetingMessageOneQueues, setLoadingSendGreetingMessageOneQueues] = useState(false);

  const [sendQueuePosition, setSendQueuePosition] = useState("enabled");
  const [loadingSendQueuePosition, setLoadingSendQueuePosition] = useState(false);

  const [sendFarewellWaitingTicket, setSendFarewellWaitingTicket] = useState("enabled");
  const [loadingSendFarewellWaitingTicket, setLoadingSendFarewellWaitingTicket] = useState(false);

  const [acceptAudioMessageContact, setAcceptAudioMessageContact] = useState("enabled");
  const [loadingAcceptAudioMessageContact, setLoadingAcceptAudioMessageContact] = useState(false);
  
  const [ipixcType, setIpIxcType] = useState("");
  const [loadingIpIxcType, setLoadingIpIxcType] = useState(false);
  const [tokenixcType, setTokenIxcType] = useState("");
  const [loadingTokenIxcType, setLoadingTokenIxcType] = useState(false);

  const [smtpauthType, setUrlSmtpauthType] = useState("");
  const [loadingUrlSmtpauthType, setLoadingUrlSmtpauthType] = useState(false);
  const [usersmtpauthType, setUserSmtpauthType] = useState("");
  const [loadingSmtpauthType, setLoadingSmptauthType] = useState(false);
  const [clientsecretsmtpauthType, setClientSecrectSmtpauthType] = useState("");
  const [loadingClientSecrectSmtpauthType, setLoadingClientSecrectSmtpauthType] = useState(false);


  const [ipmkauthType, setIpMkauthType] = useState("");
  const [loadingIpMkauthType, setLoadingIpMkauthType] = useState(false);
  const [clientidmkauthType, setClientIdMkauthType] = useState("");
  const [loadingClientIdMkauthType, setLoadingClientIdMkauthType] = useState(false);
  const [clientsecretmkauthType, setClientSecrectMkauthType] = useState("");
  const [loadingClientSecrectMkauthType, setLoadingClientSecrectMkauthType] = useState(false);

  const [urlTypeBot, setUrlTypeBot] = useState("");
  const [loadingUrlTypeBot, setLoadingUrlTypeBot] = useState(false);
  const [viewerTypeBot, setViewerTypeBot] = useState("");
  const [loadingViewerTypeBot, setLoadingViewerTypeBot] = useState(false);
  const [tokenTypebot, setTokenTypebot] = useState("");
  const [loadingTokenTypebot, setLoadingTokenTypebot] = useState(false);

  const [urlN8N, setUrlN8N] = useState("");
  const [loadingUrlN8N, setLoadingUrlN8N] = useState(false);

  const [keyMp, setKeyMp] = useState("");
  const [loadingKeyMp, setLoadingKeyMp] = useState(false);

  const [urlFlowise, setUrlFlowise] = useState("");
  const [loadingUrlFlowise, setLoadingUrlFlowise] = useState(false);
  const [tokenFlowise, setTokenFlowise] = useState("");
  const [loadingTokenFlowise, setLoadingTokenFlowise] = useState(false);
  
  const [typeTimer, setTypeTimer] = useState("");
  const [loadingtypeTimer, setLoadingtypeTimer] = useState(false);
  const [recordTimer, setRecordTimer] = useState("");
  const [loadingrecordTimer, setLoadingrecordTimer] = useState(false);



  const [asaasType, setAsaasType] = useState("");
  const [loadingAsaasType, setLoadingAsaasType] = useState(false);
  const [companyId, setCompanyId] = useState('')

  const { update } = useSettings();

  const isSuper = () => {
    return user.super;
  };

  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {

      const userCreation = settings.find((s) => s.key === "userCreation");
      if (userCreation) {
        setUserRating(userCreation.value);
      }

      const userRating = settings.find((s) => s.key === "userRating");
      if (userRating) {
        setUserRating(userRating.value);
      }

      const scheduleType = settings.find((s) => s.key === "scheduleType");
      if (scheduleType) {
        setScheduleType(scheduleType.value);
      }

      const chatBotType = settings.find((s) => s.key === "chatBotType");
      if (chatBotType) {
        setChatBotType(chatBotType.value);
      }

      const CheckMsgIsGroup = settings.find((s) => s.key === "CheckMsgIsGroup");
      if (CheckMsgIsGroup) {
        setCheckMsgIsGroup(CheckMsgIsGroup.value);
      }

      const SendGreetingAccepted = settings.find((s) => s.key === "sendGreetingAccepted");
      if (SendGreetingAccepted) {
        setSendGreetingAccepted(SendGreetingAccepted.value);
      }

      const UserRandom = settings.find((s) => s.key === "userRandom");
      if (UserRandom) {
        setUserRandom(UserRandom.value);
      }

      const SettingsTransfTicket = settings.find((s) => s.key === "sendMsgTransfTicket");
      if (SettingsTransfTicket) {
        setSettingsTransfTicket(SettingsTransfTicket.value);
      }

      const AcceptCallWhatsapp = settings.find((s) => s.key === "acceptCallWhatsapp");
      if (AcceptCallWhatsapp) {
        setAcceptCallWhatsapp(AcceptCallWhatsapp.value);
      }

      const HoursCloseTicketsAuto = settings.find((s) => s.key === "hoursCloseTicketsAuto");
      if (HoursCloseTicketsAuto) {
        setHoursCloseTicketsAuto(HoursCloseTicketsAuto.value);
      }

      const sendSignMessage = settings.find((s) => s.key === "sendSignMessage");
      if (sendSignMessage) {
        setSendSignMessage(sendSignMessage.value)
      }

      const sendGreetingMessageOneQueues = settings.find((s) => s.key === "sendGreetingMessageOneQueues");
      if (sendGreetingMessageOneQueues) {
        setSendGreetingMessageOneQueues(sendGreetingMessageOneQueues.value)
      }

      const sendQueuePosition = settings.find((s) => s.key === "sendQueuePosition");
      if (sendQueuePosition) {
        setSendQueuePosition(sendQueuePosition.value)
      }

      const sendFarewellWaitingTicket = settings.find((s) => s.key === "sendFarewellWaitingTicket");
      if (sendFarewellWaitingTicket) {
        setSendFarewellWaitingTicket(sendFarewellWaitingTicket.value)
      }

      const acceptAudioMessageContact = settings.find((s) => s.key === "acceptAudioMessageContact");
      if (acceptAudioMessageContact) {
        setAcceptAudioMessageContact(acceptAudioMessageContact.value)
      }

      const ipixcType = settings.find((s) => s.key === "ipixc");
      if (ipixcType) {
        setIpIxcType(ipixcType.value);
      }

      const tokenixcType = settings.find((s) => s.key === "tokenixc");
      if (tokenixcType) {
        setTokenIxcType(tokenixcType.value);
      }

      const ipmkauthType = settings.find((s) => s.key === "ipmkauth");
      if (ipmkauthType) {
        setIpMkauthType(ipmkauthType.value);
      }

      const clientidmkauthType = settings.find((s) => s.key === "clientidmkauth");
      if (clientidmkauthType) {
        setClientIdMkauthType(clientidmkauthType.value);
      }

      const clientsecretmkauthType = settings.find((s) => s.key === "clientsecretmkauth");
      if (clientsecretmkauthType) {
        setClientSecrectMkauthType(clientsecretmkauthType.value);
      }

      //mercado pago

      const keyMp = settings.find((s) => s.key === "keyMp");
      if (keyMp) {
        setKeyMp(keyMp.value);
      }

      //N8N

      const urlN8N = settings.find((s) => s.key === "n8nUrl");
      if (urlN8N) {
        setUrlN8N(urlN8N.value);
      }

      //FLOWISE

      const urlFlowise = settings.find((s) => s.key === "urlFlow");
      if (urlFlowise) {
        setUrlFlowise(urlFlowise.value);
      }
      const tokenFlowise = settings.find((s) => s.key === "tokenFlow");
      if (tokenFlowise) {
        setTokenFlowise(tokenFlowise.value);
      }

      //typebot

      const urlTypeBot = settings.find((s) => s.key === "urlTypeBot");
      if (urlTypeBot) {
        setUrlTypeBot(urlTypeBot.value);
      }

      const viewerTypeBot = settings.find((s) => s.key === "viewerTypeBot");
      if (viewerTypeBot) {
        setViewerTypeBot(viewerTypeBot.value);
      }

      const tokenTypebot = settings.find((s) => s.key === "apiKeyTypeBot");
      if (tokenTypebot) {
        setTokenTypebot(tokenTypebot.value);
      }
      //
      //type e record


      const typeTimer = settings.find((s) => s.key === "typeTimer");
      if (typeTimer) {
        setTypeTimer(typeTimer.value);
      }

      const recordTimer = settings.find((s) => s.key === "recordTimer");
      if (recordTimer) {
        setRecordTimer(recordTimer.value);
      }



      //

      const smtpauthType = settings.find((s) => s.key === "smtpauth");
      if (smtpauthType) {
        setUrlSmtpauthType(smtpauthType.value);
      }

      const usersmtpauthType = settings.find((s) => s.key === "usersmtpauth");
      if (usersmtpauthType) {
        setUserSmtpauthType(usersmtpauthType.value);
      }

      const clientsecretsmtpauthType = settings.find((s) => s.key === "clientsecretsmtpauth");
      if (clientsecretsmtpauthType) {
        setClientSecrectSmtpauthType(clientsecretsmtpauthType.value);
      }

      const asaasType = settings.find((s) => s.key === "asaas");
      if (asaasType) {
        setAsaasType(asaasType.value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  async function handleChangeUserCreation(value) {
    setUserCreation(value);
    setLoadingUserCreation(true);
    await update({
      key: "userCreation",
      value,
    });
    setLoadingUserCreation(false);
  }

  async function handleChangeUserRating(value) {
    setUserRating(value);
    setLoadingUserRating(true);
    await update({
      key: "userRating",
      value,
    });
    setLoadingUserRating(false);
  }

  async function handleScheduleType(value) {
    setScheduleType(value);
    setLoadingScheduleType(true);
    await update({
      key: "scheduleType",
      value,
    });
    setLoadingScheduleType(false);
    if (typeof scheduleTypeChanged === "function") {
      scheduleTypeChanged(value);
    }
  }

  async function handleChatBotType(value) {
    setChatBotType(value);
    await update({
      key: "chatBotType",
      value,
    });
    if (typeof scheduleTypeChanged === "function") {
      setChatBotType(value);
    }
  }

  async function handleCheckMsgIsGroup(value) {
    setCheckMsgIsGroup(value);
    setLoadingCheckMsgIsGroup(true);
    await update({
      key: "CheckMsgIsGroup",
      value,
    });
    setLoadingCheckMsgIsGroup(false);
  }

  async function handleSendGreetingAccepted(value) {
    setSendGreetingAccepted(value);
    setLoadingSendGreetingAccepted(true);
    await update({
      key: "sendGreetingAccepted",
      value,
    });
    setLoadingSendGreetingAccepted(false);
  }

  async function handleUserRandom(value) {
    setUserRandom(value);
    setLoadingUserRandom(true);
    await update({
      key: "userRandom",
      value,
    });
    setLoadingUserRandom(false);
  }

  async function handleSettingsTransfTicket(value) {
    setSettingsTransfTicket(value);
    setLoadingSettingsTransfTicket(true);
    await update({
      key: "sendMsgTransfTicket",
      value,
    });
    setLoadingSettingsTransfTicket(false);
  }

  async function handleAcceptCallWhatsapp(value) {
    setAcceptCallWhatsapp(value);
    setLoadingAcceptCallWhatsapp(true);
    await update({
      key: "acceptCallWhatsapp",
      value,
    });
    setLoadingAcceptCallWhatsapp(false);
  }

  async function handleHoursCloseTicketsAuto(value) {
    setHoursCloseTicketsAuto(value);
    setLoadingHoursCloseTicketsAuto(true);
    await update({
      key: "hoursCloseTicketsAuto",
      value,
    });
    setLoadingHoursCloseTicketsAuto(false);
  }

  async function handleSendSignMessage(value) {
    setSendSignMessage(value);
    setLoadingSendSignMessage(true);
    await update({
      key: "sendSignMessage",
      value,
    });
    setLoadingSendSignMessage(false);
  }

  async function handleSendGreetingMessageOneQueues(value) {
    setSendGreetingMessageOneQueues(value);
    setLoadingSendGreetingMessageOneQueues(true);
    await update({
      key: "sendGreetingMessageOneQueues",
      value,
    });
    setLoadingSendGreetingMessageOneQueues(false);
  }

  async function handleSendQueuePosition(value) {
    setSendQueuePosition(value);
    setLoadingSendQueuePosition(true);
    await update({
      key: "sendQueuePosition",
      value,
    });
    setLoadingSendQueuePosition(false);
  }

  async function handleSendFarewellWaitingTicket(value) {
    setSendFarewellWaitingTicket(value);
    setLoadingSendFarewellWaitingTicket(true);
    await update({
      key: "sendFarewellWaitingTicket",
      value,
    });
    setLoadingSendFarewellWaitingTicket(false);
  }

  async function handleAcceptAudioMessageContact(value) {
    setAcceptAudioMessageContact(value);
    setLoadingAcceptAudioMessageContact(true);
    await update({
      key: "acceptAudioMessageContact",
      value,
    });
    setLoadingAcceptAudioMessageContact(false);
  }
  
    async function handleChangeIPIxc(value) {
    setIpIxcType(value);
    setLoadingIpIxcType(true);
    await update({
      key: "ipixc",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingIpIxcType(false);
  }

  async function handleChangeTokenIxc(value) {
    setTokenIxcType(value);
    setLoadingTokenIxcType(true);
    await update({
      key: "tokenixc",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingTokenIxcType(false);
  }

  //mercado pago
  async function handleChangeKeyMp(value) {
    setKeyMp(value);
    setLoadingKeyMp(true);
    await update({
      key: "keyMp",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingKeyMp(false);
  }

  //N8N
  async function handleChangeUrlN8N(value) {
    setUrlN8N(value);
    setLoadingUrlN8N(true);
    await update({
      key: "n8nUrl",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingUrlN8N(false);
  }

  //FLOWISE
  async function handleChangeUrlFlowise(value) {
    setUrlFlowise(value);
    setLoadingUrlFlowise(true);
    await update({
      key: "urlFlow",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingUrlFlowise(false);
  }
  async function handleChangeTokenFlowise(value) {
    setTokenFlowise(value);
    setLoadingTokenFlowise(true);
    await update({
      key: "tokenFlow",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingTokenFlowise(false);
  }
  //typebot

  async function handleChangeUrlTypebot(value) {
    setUrlTypeBot(value);
    setLoadingUrlTypeBot(true);
    await update({
      key: "urlTypeBot",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingUrlTypeBot(false);
  }
  async function handleChangeViewerTypebot(value) {
    setViewerTypeBot(value);
    setLoadingViewerTypeBot(true);
    await update({
      key: "viewerTypeBot",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingViewerTypeBot(false);
  }

  async function handleChangeTokenTypebot(value) {
    setTokenTypebot(value);
    setLoadingTokenTypebot(true);
    await update({
      key: "apiKeyTypeBot",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingTokenTypebot(false);
  }
  
//
  
// Record e Timer
  
 
async function handleChangeTypeTimer(value) {
  setTypeTimer(value);
  setLoadingtypeTimer(true);
  await update({
    key: "typeTimer",
    value,
  });
  toast.success("Operação atualizada com sucesso.");
  setLoadingtypeTimer(false);
}

async function handleChangeRecordTimer(value) {
  setRecordTimer(value);
  setLoadingrecordTimer(true);
  await update({
    key: "recordTimer",
    value,
  });
  toast.success("Operação atualizada com sucesso.");
  setLoadingrecordTimer(false);
}



//






  async function handleChangeIpMkauth(value) {
    setIpMkauthType(value);
    setLoadingIpMkauthType(true);
    await update({
      key: "ipmkauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingIpMkauthType(false);
  }
  

  async function handleChangeClientIdMkauth(value) {
    setClientIdMkauthType(value);
    setLoadingClientIdMkauthType(true);
    await update({
      key: "clientidmkauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingClientIdMkauthType(false);
  }

  async function handleChangeClientSecrectMkauth(value) {
    setClientSecrectMkauthType(value);
    setLoadingClientSecrectMkauthType(true);
    await update({
      key: "clientsecretmkauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingClientSecrectMkauthType(false);
  }

  async function handleChangeUrlSmtpauth(value) {
    setUrlSmtpauthType(value);
    setLoadingUrlSmtpauthType(true);
    await update({
      key: "smtpauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingUrlSmtpauthType(false);
  }

  async function handleChangeUserSmptauth(value) {
    setUserSmtpauthType(value);
    setLoadingSmptauthType(true);
    await update({
      key: "usersmtpauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingSmptauthType(false);
  }

  async function handleChangeClientSecrectSmtpauth(value) {
    setClientSecrectSmtpauthType(value);
    setLoadingClientSecrectSmtpauthType(true);
    await update({
      key: "clientsecretsmtpauth",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingClientSecrectSmtpauthType(false);
  }

  async function handleChangeAsaas(value) {
    setAsaasType(value);
    setLoadingAsaasType(true);
    await update({
      key: "asaas",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingAsaasType(false);
  }


  return (
    <>
      <Grid spacing={3} container>

        {/* CRIAÇÃO DE COMPANY/USERS */}
        {isSuper() ?
          <Grid xs={12} sm={6} md={4} item>
            <FormControl className={classes.selectContainer}>
              <InputLabel id="UserCreation-label">Criação de Empresa/Usuário</InputLabel>
              <Select
                labelId="UserCreation-label"
                value={UserCreation}
                onChange={async (e) => {
                  handleChangeUserCreation(e.target.value);
                }}
              >
                <MenuItem value={"disabled"}>Desabilitadas</MenuItem>
                <MenuItem value={"enabled"}>Habilitadas</MenuItem>
              </Select>
              <FormHelperText>
                {loadingUserCreation && "Atualizando..."}
              </FormHelperText>
            </FormControl>
          </Grid>
          : null}



        {/* AVALIAÇÕES */}
        {/*<Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="ratings-label">Avaliações</InputLabel>
            <Select
              labelId="ratings-label"
              value={userRating}
              onChange={async (e) => {
                handleChangeUserRating(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitadas</MenuItem>
              <MenuItem value={"enabled"}>Habilitadas</MenuItem>
            </Select>
            <FormHelperText>
              {loadingUserRating && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid> */}

        {/* AGENDAMENTO DE EXPEDIENTE */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="schedule-type-label">Agendamento de Expediente</InputLabel>
            <Select
              labelId="schedule-type-label"
              value={scheduleType}
              onChange={async (e) => {
                handleScheduleType(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"queue"}>Gerenciamento Por Fila/Setor</MenuItem>
              <MenuItem value={"company"}>Gerenciamento Por Empresa</MenuItem>
            </Select>
            <FormHelperText>
              {loadingScheduleType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* ENVIAR SAUDAÇÃO AO ACEITAR O TICKET */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendGreetingAccepted-label">Enviar saudação ao aceitar o atendimento</InputLabel>
            <Select
              labelId="sendGreetingAccepted-label"
              value={SendGreetingAccepted}
              onChange={async (e) => {
                handleSendGreetingAccepted(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendGreetingAccepted && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* ESCOLHER OPERADOR ALEATORIO */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="userRandom-label">Escolher Operador Aleatório Ao Escolher Setor</InputLabel>
            <Select
              labelId="userRandom-label"
              value={UserRandom}
              onChange={async (e) => {
                handleUserRandom(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingUserRandom && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* ENVIAR MENSAGEM DE TRANSFERENCIA DE SETOR/ATENDENTE */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendMsgTransfTicket-label">Enviar mensagem de transferência de Setor/Atendente</InputLabel>
            <Select
              labelId="sendMsgTransfTicket-label"
              value={SettingsTransfTicket}
              onChange={async (e) => {
                handleSettingsTransfTicket(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSettingsTransfTicket && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* IGNORAR MENSAGEM DE GRUPOS */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="CheckMsgIsGroup-label">Ignorar mensagens de grupo</InputLabel>
            <Select
              labelId="CheckMsgIsGroup-label"
              value={CheckMsgIsGroup}
              onChange={async (e) => {
                handleCheckMsgIsGroup(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingCheckMsgIsGroup && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* TIPO DO BOT */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="schedule-type-label">Tipo do Bot</InputLabel>
            <Select
              labelId="schedule-type-label"
              value={chatBotType}
              onChange={async (e) => {
                handleChatBotType(e.target.value);
              }}
            >
              <MenuItem value={"text"}>Texto</MenuItem>
              {/*<MenuItem value={"button"}>Botões</MenuItem>
              <MenuItem value={"list"}>Lista</MenuItem>*/}
              <MenuItem value={"typeBot"}>typeBot</MenuItem>
              <MenuItem value={"floWise"}>floWise</MenuItem>
            </Select>
            <FormHelperText>
              {loadingScheduleType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* AVISO SOBRE LIGAÇÃO DO WHATSAPP */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="acceptCallWhatsapp-label">Informar que não aceita ligação no whatsapp</InputLabel>
            <Select
              labelId="acceptCallWhatsapp-label"
              value={AcceptCallWhatsapp}
              onChange={async (e) => {
                handleAcceptCallWhatsapp(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingAcceptCallWhatsapp && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* HABILITAR PARA O ATENDENTE RETIRAR O ASSINATURA 
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendSignMessage-label">Permite atendente escolher ENVIAR Assinatura</InputLabel>
            <Select
              labelId="sendSignMessage-label"
              value={sendSignMessage}
              onChange={async (e) => {
                handleSendSignMessage(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendSignMessage && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>*/}

        {/* ENVIAR SAUDAÇÃO QUANDO HOUVER SOMENTE 1 FILA */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendGreetingMessageOneQueues-label">Enviar saudação quando houver somente 1 setor</InputLabel>
            <Select
              labelId="sendGreetingMessageOneQueues-label"
              value={sendGreetingMessageOneQueues}
              onChange={async (e) => {
                handleSendGreetingMessageOneQueues(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendGreetingMessageOneQueues && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* ENVIAR MENSAGEM COM A POSIÇÃO DA FILA */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendQueuePosition-label">Enviar mensagem com a posicão na fila</InputLabel>
            <Select
              labelId="sendQueuePosition-label"
              value={sendQueuePosition}
              onChange={async (e) => {
                handleSendQueuePosition(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendQueuePosition && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* ENVIAR MENSAGEM DE DESPEDIDA NO AGUARDANDO */}
        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="sendFarewellWaitingTicket-label">Enviar mensagem de despedida quando aguardando</InputLabel>
            <Select
              labelId="sendFarewellWaitingTicket-label"
              value={sendFarewellWaitingTicket}
              onChange={async (e) => {
                handleSendFarewellWaitingTicket(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingSendFarewellWaitingTicket && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={6} md={4} item>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="acceptAudioMessageContact-label">Aceita receber audio de todos contatos</InputLabel>
            <Select
              labelId="acceptAudioMessageContact-label"
              value={acceptAudioMessageContact}
              onChange={async (e) => {
                handleAcceptAudioMessageContact(e.target.value);
              }}
            >
              <MenuItem value={"disabled"}>Desabilitado</MenuItem>
              <MenuItem value={"enabled"}>Habilitado</MenuItem>
            </Select>
            <FormHelperText>
              {loadingAcceptAudioMessageContact && "Atualizando..."}
            </FormHelperText>
          </FormControl>
          </Grid>
      </Grid>
       
       {/*-----------------MercadoPago-----------------*/}
       {isSuper() ? <Grid spacing={3} container
        style={{ marginBottom: 10 }}>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
        >
          <Tab label="Mercado Pago" />
          <InfoMP></InfoMP>

        </Tabs>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="MercadoPago"
              name="MercadoPago"
              margin="dense"
              label="API Key"
              variant="outlined"
              value={keyMp}
              onChange={async (e) => {
                handleChangeKeyMp(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingKeyMp && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        
      </Grid>
      : null}

   {/*-----------------TypeBot-----------------*/}

      <Grid spacing={3} container
        style={{ marginBottom: 10 }}>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
        >
          <Tab label="TypeBot" />
          <InfoTypeBot></InfoTypeBot>

        </Tabs>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="typeBotUrl"
              name="typeBot Url"
              margin="dense"
              label="TypeBot Viewer Url"
              variant="outlined"
              value={urlTypeBot}
              onChange={async (e) => {
                handleChangeUrlTypebot(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingUrlTypeBot && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="typeBot Viewer"
              name="typeBot Viewer"
              margin="dense"
              label="Public Id TypeBot - Nome Do Bot"
              variant="outlined"
              value={viewerTypeBot}
              onChange={async (e) => {
                handleChangeViewerTypebot(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingViewerTypeBot && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="typeBot Token"
              name="typeBot Token"
              margin="dense"
              label="Palavra Para Reiniciar Fluxo"
              variant="outlined"
              value={tokenTypebot}
              onChange={async (e) => {
                handleChangeTokenTypebot(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingTokenTypebot && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>

      {/*Timer Type e Record*/}

        {/*<Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="Tempo Gravando Áudio "
              name="Tempo Gravando Áudio "
              margin="dense"
              label="Tempo Gravando Áudio "
              variant="outlined"
              type="number"
              value={recordTimer}
              onChange={async (e) => {
                handleChangeRecordTimer(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingrecordTimer && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="Tempo Digitando"
              name="Tempo Digitando"
              margin="dense"
              label="Tempo Digitando"
              variant="outlined"
              type="number"
              value={typeTimer}
              onChange={async (e) => {
                handleChangeTypeTimer(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingtypeTimer && "Atualizando..."}
            </FormHelperText>
          </FormControl>
            </Grid>*/}
      </Grid>

      {/*-----------------N8N-----------------*/}
      <Grid spacing={3} container
        style={{ marginBottom: 10 }}>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
        >
          <Tab label="N8N/WebHook" />

        </Tabs>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="n8nUrl"
              name="n8n Url"
              margin="dense"
              label="N8N/WebHook Url"
              variant="outlined"
              value={urlN8N}
              onChange={async (e) => {
                handleChangeUrlN8N(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingUrlN8N && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        
      </Grid>


            {/*-----------------FLOWISE-----------------*/}
            <Grid spacing={3} container
        style={{ marginBottom: 10 }}>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
        >
          <Tab label="FloWise" />

        </Tabs>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="flowiseUrl"
              name="Flowise Url"
              margin="dense"
              label="Flowise Url"
              variant="outlined"
              value={urlFlowise}
              onChange={async (e) => {
                handleChangeUrlFlowise(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingUrlFlowise && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="flowiseToken"
              name="Flowise Token"
              margin="dense"
              label="Flowise Token"
              variant="outlined"
              value={tokenFlowise}
              onChange={async (e) => {
                handleChangeTokenFlowise(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingTokenFlowise && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        
      </Grid>



      {/*-----------------MK-AUTH-----------------*/}
      <Grid spacing={3} container
        style={{ marginBottom: 10 }}>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
        >
          <Tab label="MK-AUTH" />

        </Tabs>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="ipmkauth"
              name="ipmkauth"
              margin="dense"
              label="Ip Mk-Auth"
              variant="outlined"
              value={ipmkauthType}
              onChange={async (e) => {
                handleChangeIpMkauth(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingIpMkauthType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="clientidmkauth"
              name="clientidmkauth"
              margin="dense"
              label="Client Id"
              variant="outlined"
              value={clientidmkauthType}
              onChange={async (e) => {
                handleChangeClientIdMkauth(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingClientIdMkauthType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="clientsecretmkauth"
              name="clientsecretmkauth"
              margin="dense"
              label="Client Secret"
              variant="outlined"
              value={clientsecretmkauthType}
              onChange={async (e) => {
                handleChangeClientSecrectMkauth(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingClientSecrectMkauthType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      {/*-----------------ASAAS-----------------*/}
      <Grid spacing={3} container
        style={{ marginBottom: 10 }}>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
        >
          <Tab label="ASAAS" />

        </Tabs>
        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="asaas"
              name="asaas"
              margin="dense"
              label="Token Asaas"
              variant="outlined"
              value={asaasType}
              onChange={async (e) => {
                handleChangeAsaas(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingAsaasType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
       {/*-----------------IXC-----------------*/}
       <Grid spacing={3} container
        style={{ marginBottom: 10 }}>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
        >
          <Tab

            label="IXC" />

        </Tabs>
        <Grid xs={12} sm={6} md={6} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="ipixc"
              name="ipixc"
              margin="dense"
              label="IP do IXC"
              variant="outlined"
              value={ipixcType}
              onChange={async (e) => {
                handleChangeIPIxc(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingIpIxcType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={6} md={6} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="tokenixc"
              name="tokenixc"
              margin="dense"
              label="Token do IXC"
              variant="outlined"
              value={tokenixcType}
              onChange={async (e) => {
                handleChangeTokenIxc(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingTokenIxcType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      {/*-----------------SMTP-AUTH-----------------*/}
      <Grid spacing={3} container
        style={{ marginBottom: 10 }}>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
        >
          <Tab label="SMPT" />

        </Tabs>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="smtpauth"
              name="smtpauth"
              margin="dense"
              label="Url SMTP"
              variant="outlined"
              value={smtpauthType}
              onChange={async (e) => {
                handleChangeUrlSmtpauth(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingUrlSmtpauthType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="usersmtpauth"
              name="usersmtpauth"
              margin="dense"
              label="User Smpt"
              variant="outlined"
              value={usersmtpauthType}
              onChange={async (e) => {
                handleChangeUserSmptauth(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingSmtpauthType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={12} sm={12} md={4} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="clientsecretsmtpauth"
              name="clientsecretsmtpauth"
              margin="dense"
              label="PassWord Smpt"
              variant="outlined"
              value={clientsecretsmtpauthType}
              onChange={async (e) => {
                handleChangeClientSecrectSmtpauth(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingClientSecrectSmtpauthType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
}
