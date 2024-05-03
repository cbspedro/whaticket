import React, { useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Modal from "@material-ui/core/Modal";
import Typography from "@material-ui/core/Typography";
import InfoIcon from "@material-ui/icons/Info";
import CancelIcon from "@material-ui/icons/Cancel";
import typeUrl from "../../assets/typeUrl.png"
import nameBot from "../../assets/nameBot.png"

const InfoTypeBot = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const getEndpoint = () => {
    return process.env.REACT_APP_BACKEND_URL + '/api/messages/send'
  }

  return (
    <div>
      <IconButton onClick={handleOpen}>
        <InfoIcon style={{ color: "black" }} />
      </IconButton>
      <Modal open={open} onClose={handleClose}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: theme.palette.background.paper,
            padding: "20px",
            borderRadius: "5px",
            outline: "none",
            maxWidth: "80%",
            maxHeight: "80%",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            color: theme.palette.text.primary,
          }}
        >
          <IconButton
            style={{ position: "absolute", top: "5px", right: "5px" }}
            onClick={handleClose}
          >
            <CancelIcon />
          </IconButton>
          <div style={{ marginBottom: "20px" }} />
          <Typography variant="body1">
            <span>
              <strong>&#8505; TypeBot Viewer URL:</strong><br />
              - Insira o URL do viewer do seu TypeBot auto hospedado ou do TypeBot.io.<br />
              - <img src={typeUrl} alt="typeUrl" style={{ maxWidth: '900px', maxHeight: '600px' }} /><br />
              
              <strong>&#8505; Nome do Bot:</strong><br />
              - Insira o ID público do seu bot.<br />
              - <img src={nameBot} alt="nameBot" style={{ maxWidth: '900px', maxHeight: '600px' }} /><br />
              <strong>&#8505; Palavra para Reiniciar o Fluxo:</strong><br />
              - Insira uma palavra para reiniciar o fluxo quando o usuário a digitar.<br />
              - Exemplo: #sair<br /><br />
              <strong>&#8505; Transferir Ticket para Outra Fila:</strong><br />
              - No momento em que o cliente digitar o nome de uma fila durante qualquer etapa do fluxo, ele será automaticamente redirecionado para a fila desejada, mesmo que o nome digitado esteja um pouco diferente ou com letras erradas.<br />
              - Via chamada de API:<br />
                - <strong>Endpoint:</strong> {getEndpoint()}/api/ticket/QueueUpdate/(IdDoTicket)<br />
                - <strong>Método:</strong> POST<br />
                - <strong>Headers:</strong> Authorization (token cadastrado) e Content-Type (application/json)<br />
                - <strong>Body:</strong> {`{"queueId": Id Da Fila}`}<br />
              - <strong>Informativo:</strong> O ID do ticket é passado automaticamente para o TypeBot. Basta adicionar uma nova variável no fluxo chamada "ticketId".<br /><br />
              <strong>&#8505; Concluir Configurações do Tipo de Bot:</strong><br />
              - Ao concluir as configurações va na opção tipo de bot e altere para typeBot e marque a opção Enviar saudação quando houver somente 1 setor como ativo feito isso toda interação inicial será atendida pelo fluxo do typebot definido.
            </span>
          </Typography>
        </div>
      </Modal>
    </div>
  );
};

export default InfoTypeBot;
