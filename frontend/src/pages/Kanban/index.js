import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from "react-trello";
import { ToastContainer, toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from "react-router-dom";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import BoardSettingsModal from "../../components/kanbanModal";
import IconButton from "@material-ui/core/IconButton";
import SettingsIcon from "@material-ui/icons/Settings";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid"; // Importe o componente Grid do Material-UI
import "./styles.css";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import ChatIcon from "@mui/icons-material/Chat";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Tooltip from "@material-ui/core/Tooltip";
import InstructionsModal from "./info"

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  header: {
    display: "flex",
    alignItems: "center",
  },
  search: {
    position: "relative",
    marginLeft: 0,
    width: "100%",
    backgroundColor: "rgba(252, 252, 252, 0.03)",
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.primary.main,
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    width: "100%",
  },
  button: {},
  container: {
    height: "100vh",
    overflow: "hidden", // Adicionado para esconder a barra de rolagem
  },
  paper: {
    width: "100%",
    height: "calc(80vh - 60px)",
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const history = useHistory();

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const [tags, setTags] = useState([]);
  const [reloadData, setReloadData] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenBoardSettings = () => {
    setSettingsModalOpen(true);
  };

  const handleSendDataToWebhook = async (tagId, tickets) => {
    try {
      // Coletar apenas os dados do quadro selecionado
      const selectedData = {
        tagId,
        tickets,
        // Adicione outros dados conforme necessário
      };

      // Enviar dados para a nova rota do webhook
      await api.get("/kanbanWebhook", selectedData);

      // Exibir uma notificação ou mensagem de sucesso
      toast.success(
        "Dados do quadro enviados com sucesso para a chamada webhook!"
      );
    } catch (error) {
      console.error(
        "Erro ao enviar dados para a chamada webhook:",
        error.message
      );
      // Exibir uma notificação ou mensagem de erro, se necessário
      toast.error("Erro ao enviar dados para a chamada webhook.");
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get("/tags/kanban");
      const fetchedTags = response.data.lista || [];

      setTags(fetchedTags);

      // Fetch tickets after fetching tags
      await fetchTickets(jsonString);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchTickets();
    popularCards();
  }, []);

  const [file, setFile] = useState({
    lanes: [],
  });

  const [tickets, setTickets] = useState([]);
  const { user } = useContext(AuthContext);
  const { profile, queues } = user;
  const jsonString = user.queues.map((queue) => queue.UserQueue.queueId);

  const fetchTickets = async (jsonString) => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          teste: true,
        },
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };
  const popularCards = async (jsonString) => {
    const cardStyle = {
      padding: "10px",
      margin: "5px",
      borderRadius: "14px",
      display: "flex",
      flexDirection: "column",
    };

    const iconStyle = {
      fontSize: "25px",
      color: "green",
    };

    const filteredTickets = tickets.filter(
      (ticket) => ticket.tags.length === 0
    );

    const lanes = [
      {
        id: 0,
        title: i18n.t("Em aberto"),
        label: "0",
        cards: filteredTickets
          .filter((ticket) => ticketMatchesSearchQuery(ticket))
          .map((ticket) => ({
            id: ticket.id.toString(),
            label: "Ticket nº " + ticket.id.toString(),
            description: (
              <div style={{ display: "flex", alignItems: "center" }}>
                <p>
                  <b>Numero:</b> {ticket.contact.number}
                  <br />
                  <b>Ultima Mensagem:</b> {ticket.lastMessage}
                </p>
                <Tooltip title="Ver Ticket" arrow>
                  <IconButton
                    color="primary"
                    className={classes.button}
                    onClick={() => handleCardClick(ticket.uuid)}
                    style={iconStyle}
                  >
                    <WhatsAppIcon style={iconStyle} />
                  </IconButton>
                </Tooltip>
              </div>
            ),
            title: ticket.contact.name,
            draggable: true,
            href: "/tickets/" + ticket.uuid,
            style: cardStyle,
          })),
        style: {
          borderRadius: "20px",
          marginBottom: 20,
          padding: "10px",
          overflowY: "auto",
        },
      },
      ...tags.map((tag) => {
        const filteredTickets = tickets.filter((ticket) => {
          const tagIds = ticket.tags.map((tag) => tag.id);
          return tagIds.includes(tag.id);
        });

        return {
          id: tag.id.toString(),
          title: tag.name,
          label: tag.id.toString(),
          cards: filteredTickets
            .filter((ticket) => ticketMatchesSearchQuery(ticket))
            .map((ticket) => ({
              id: ticket.id.toString(),
              label: "Ticket nº " + ticket.id.toString(),
              description: (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p>
                    <b>Numero:</b> {ticket.contact.number}
                    <br />
                    <b>Ultima Mensagem:</b> {ticket.lastMessage}
                  </p>
                  <Tooltip title="Ver Ticket" arrow>
                    <IconButton
                      color="primary"
                      className={classes.button}
                      onClick={() => handleCardClick(ticket.uuid)}
                      style={iconStyle}
                    >
                      <WhatsAppIcon style={iconStyle} />
                    </IconButton>
                  </Tooltip>
                </div>
              ),
              title: ticket.contact.name,
              draggable: true,
              href: "/tickets/" + ticket.uuid,
              style: cardStyle,
            })),
          style: {
            backgroundColor: tag.color, // Adicione a cor de fundo ao cabeçalho do lane
            color: "white",
            borderRadius: "20px",
            padding: "10px",
            marginBottom: 20,
          },
        };
      }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    history.push("/tickets/" + uuid);
  };

  useEffect(() => {
    popularCards(jsonString);
  }, [tags, tickets, reloadData, searchQuery]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      const movedTicket = tickets.find(
        (ticket) => ticket.id.toString() === targetLaneId
      );

      console.log(
        `Lane de entrada ${sourceLaneId}, Lane de saída ${targetLaneId}`
      );

      if (sourceLaneId === targetLaneId) {
        console.log(`Mesma lane de entrada e saída: ${sourceLaneId}`);
      }

      const response = await api.get("/schedules", {
        params: { contactId: movedTicket.contact.id },
      });

      const schedules = response.data.schedules;

      if (schedules.length === 0) {
        try {
          const tagResponse = await api.get(`/tags/${sourceLaneId}`);
          if (tagResponse.data.actCamp === 1){
            handleEmptySchedules(sourceLaneId, movedTicket);
          }

        }catch (error) {
          console.error("Erro ao buscar tag:", error);
          handleEmptySchedules(sourceLaneId, movedTicket);
        }
       
      } else {
        try {
          const tagResponse = await api.get(`/tags/${sourceLaneId}`);
          if (tagResponse.data.actCamp === 1){
            handleNonEmptySchedules(sourceLaneId, schedules, movedTicket);
          }

        }catch (error) {
          console.error("Erro ao buscar tag:", error);
          handleNonEmptySchedules(sourceLaneId, schedules, movedTicket);
        }
        
      }

      await api.delete(`/ticket-tags/${targetLaneId}`);
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);

      // Busque os tickets atualizados apenas quando necessário
    } catch (err) {
      console.log(err);
    }
    await fetchTickets(jsonString);
    popularCards(jsonString);
  };

  const handleEmptySchedules = (sourceLaneId, movedTicket) => {
    if (String(sourceLaneId) !== 0) {
      toast.success(
        `Campanha nº ${sourceLaneId} iniciada para ${movedTicket.contact.name}. Horario de envio as 18h`,
        {
          autoClose: 10000,
        }
      );
      campanhaInit(movedTicket, sourceLaneId);
    } else {
      toast.success(`Campanhas zeradas para ${movedTicket.contact.name}.`, {
        autoClose: 10000,
      });
    }
  };

  const handleNonEmptySchedules = (sourceLaneId, schedules, movedTicket) => {
    const campIdInSchedules = schedules[0].campId;

    if (String(sourceLaneId) === String(campIdInSchedules)) {
      toast.success(
        `Campanha nº ${sourceLaneId} já está em andamento para ${movedTicket.contact.name}.`,
        {
          autoClose: 10000,
        }
      );
    } else {
      const scheduleIdToDelete = schedules[0].id;

      if (String(sourceLaneId) !== 0) {
        handleDeleteScheduleAndInit(
          sourceLaneId,
          scheduleIdToDelete,
          campIdInSchedules,
          movedTicket
        );
      } else {
        handleDeleteSchedule(sourceLaneId, scheduleIdToDelete, movedTicket);
      }
    }
  };

  const handleDeleteScheduleAndInit = async (
    sourceLaneId,
    scheduleIdToDelete,
    campIdInSchedules,
    movedTicket
  ) => {
    try {
      await api.delete(`/schedules/${scheduleIdToDelete}`);
      toast.error(
        `Campanha nº ${campIdInSchedules} excluída para ${movedTicket.contact.name}.`,
        {
          autoClose: 10000,
        }
      );
      campanhaInit(movedTicket, sourceLaneId);
      toast.success(
        `Campanha nº ${sourceLaneId} iniciada para ${movedTicket.contact.name}. Horario de envio as 18h`,
        {
          autoClose: 10000,
        }
      );
    } catch (deleteError) {
      console.error("Erro ao excluir campanha:", deleteError);
      // Lógica adicional em caso de erro ao excluir
    }
  };

  const handleDeleteSchedule = async (
    sourceLaneId,
    scheduleIdToDelete,
    movedTicket
  ) => {
    try {
      await api.delete(`/schedules/${scheduleIdToDelete}`);
      toast.success(`Campanhas zeradas para ${movedTicket.contact.name}.`, {
        autoClose: 10000,
      });
    } catch (deleteError) {
      console.error("Erro ao excluir campanha:", deleteError);
      // Lógica adicional em caso de erro ao excluir
    }
  };

  const campanhaInit = async (ticket, campId) => {
    try {
      const tagResponse = await api.get(`/tags/${campId}`);
      const tagMsg = tagResponse.data.msgR;
      const rptDays = tagResponse.data.rptDays;
      const pathFile = tagResponse.data.mediaPath;
      const nameMedia = tagResponse.data.mediaName;
      console.log(tagMsg);

      const getRandomNumber = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      };
      // Função para obter a data de hoje às 18:00
      const getToday18h = () => {
        const today18h = new Date();
        today18h.setHours(18, 0, 0, 0);
        return today18h;
      };
      
      // Função para obter a data de amanhã às 18:00
      const getNextDay18h = () => {
        const nextDay18h = new Date();
        nextDay18h.setDate(nextDay18h.getDate() + 1);
        nextDay18h.setHours(18, 0, 0, 0);
        return nextDay18h;
      };
      
      // Obter a data de hoje às 18:00 e a data de amanhã às 18:00
      const today18h = getToday18h();
      const nextDay18h = getNextDay18h();
      
      // Gerar segundos aleatórios entre 1 e 60
      const randomSeconds = getRandomNumber(1, 60);
      
      // Gerar minutos aleatórios entre 1 e 30
      const randomMinutes = getRandomNumber(1, 30);
      
      // Construir a data com a hora fixa de 18:00 e os segundos e minutos aleatórios
      const currentDate = new Date();
      currentDate.setSeconds(randomSeconds);
      currentDate.setMinutes(randomMinutes);
      currentDate.setHours(18, 0, 0, 0);
      
    
      const getToday18hRandom = () => {
        const today18h = new Date();
        today18h.setHours(18);
        today18h.setMinutes(getRandomNumber(1, 30)); // Adiciona minutos aleatórios
        today18h.setSeconds(getRandomNumber(1, 60)); // Adiciona segundos aleatórios
        return today18h;
      };
      
      // Obter a data de hoje às 18:00 com minutos e segundos aleatórios
      const campDay = getToday18hRandom();
      
      const currentTime = new Date();
if (currentTime.getHours() >= 18) {
  // Se já passou das 18:00, definir o horário para amanhã
  campDay.setDate(campDay.getDate() + 1);
}

console.log(campDay); 
      

    

      const scheduleData = {
        body: tagMsg,
        sendAt: campDay,
        contactId: ticket.contact.id,
        userId: user.id,
        daysR: rptDays,
        campId: campId,
        mediaPath: pathFile,
        mediaName: nameMedia
      };

      try {
        const response = await api.post("/schedules", scheduleData);

        if (response.status === 200) {
          console.log("Agendamento criado com sucesso:", response.data);
        } else {
          console.error("Erro ao criar agendamento:", response.data);
        }
      } catch (error) {
        console.error("Erro ao criar agendamento:", error);
      }
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
    }
  };

  const ticketMatchesSearchQuery = (ticket) => {
    if (searchQuery.trim() === "") {
      return true;
    }

    const query = searchQuery.toLowerCase();
    return (
      ticket.contact.number.toLowerCase().includes(query) ||
      ticket.lastMessage.toLowerCase().includes(query) ||
      ticket.contact.name.toLowerCase().includes(query)
    );
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12} className={classes.container}>
        <div className={classes.root}>
          <div className={classes.header}>
            <Paper className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Pesquisar..."
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ "aria-label": "search" }}
                value={searchQuery}
                onChange={handleSearchQueryChange}
              />
            </Paper>
            {/* IconButton com o ícone de engrenagem */}
            <IconButton
              color="primary"
              className={classes.button}
              onClick={handleOpenBoardSettings}
            >
              <SettingsIcon />
            </IconButton>
            <InstructionsModal />

            {/* Modal de configurações do quadro */}
            {settingsModalOpen && (
              <BoardSettingsModal
                open={settingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
              />
            )}
          </div>

          <Board
            data={file}
            onCardMoveAcrossLanes={handleCardMove}
            style={{
              backgroundColor: "rgba(252, 252, 252, 0.03)",
              width: "100%",
              height: "700px",
            }}
          />
        </div>
      </Grid>
    </Grid>
  );
};

export default Kanban;
