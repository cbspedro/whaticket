import path, { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import fs from "fs";
import * as Sentry from "@sentry/node";
import { isNil, isNull, head, forIn } from "lodash";
import { Request, Response } from 'express';
import {
  downloadContentFromMessage,
  extractMessageContent,
  getContentType,
  GroupMetadata,
  Contact as ContactBaileys,
  jidNormalizedUser,
  MediaType,
  MessageUpsertType,
  PresenceData,
  proto,
  WAMessage,
  WAMessageStubType,
  WAMessageUpdate,
  WASocket
} from "@whiskeysockets/baileys";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import Settings from "../../models/Setting";
import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ListQueuesService from "../QueueService/ListQueuesService";
import addTicketToQueue from "../QueueService/addTicketToQueue";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { debounce } from "../../helpers/Debounce";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import { chatGPTService } from "../chatGPTService/chatGPTService";
import formatBody from "../../helpers/Mustache";
import { Store } from "../../libs/store";
import TicketTraking from "../../models/TicketTraking";
import UserRating from "../../models/UserRating";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import moment from "moment";
import Queue from "../../models/Queue";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import VerifyCurrentSchedule from "../CompanyService/VerifyCurrentSchedule";
import Campaign from "../../models/Campaign";
import CampaignShipping from "../../models/CampaignShipping";
import { Op } from "sequelize";
import { campaignQueue, parseToMilliseconds, randomValue } from "../../queues";
import User from "../../models/User";
import Setting from "../../models/Setting";
import { sayChatbot } from "./ChatBotListener";
import MarkDeleteWhatsAppMessage from "./MarkDeleteWhatsAppMessage";
import { SendAckBYRemoteJid } from "./SendAck";
import ListUserQueueServices from "../UserQueueServices/ListUserQueueServices";
import ShowChatBotServices from "../ChatBotServices/ShowChatBotServices";
import Rating from "../../models/Rating";
import RatingOption from "../../models/RatingOption";
import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import { cacheLayer } from "../../libs/cache";
import Whatsapp from "../../models/Whatsapp";
import { TypebotService } from "../../services/typebotServices/typebotServices";
import { FlowiseServices } from "../../services/flowiseServices/flowiseServices";
import { getMessageOptions } from "./SendWhatsAppMedia";
import Company from "../../models/Company";
import { webhook } from "../../controllers/SubscriptionController";
import { log } from "console";

const stringSimilarity = require("string-similarity");
var axios = require("axios");
ffmpeg.setFfmpegPath(ffmpegPath);
type Session = WASocket & { id?: number; store?: Store };
interface ImessageUpsert {
  messages: proto.IWebMessageInfo[];
  type: MessageUpsertType;
}
interface IMe {
  name: string;
  id: string;
}
const writeFileAsync = promisify(writeFile);
function removeFile(directory) {
  fs.unlink(directory, error => {
    if (error) throw error;
  });
}
const getTimestampMessage = (msgTimestamp: any) => {
  return msgTimestamp * 1;
};
const multVecardGet = function (param: any) {
  let output = " ";
  let name = param
    .split("\n")[2]
    .replace(";;;", "\n")
    .replace("N:", "")
    .replace(";", "")
    .replace(";", " ")
    .replace(";;", " ")
    .replace("\n", "");
  let inicio = param.split("\n")[4].indexOf("=");
  let fim = param.split("\n")[4].indexOf(":");
  let contact = param
    .split("\n")[4]
    .substring(inicio + 1, fim)
    .replace(";", "");
  let contactSemWhats = param.split("\n")[4].replace("item1.TEL:", "");
  if (contact != "item1.TEL") {
    output = output + name + ": 📞" + contact + "" + "\n";
  } else output = output + name + ": 📞" + contactSemWhats + "" + "\n";
  return output;
};
const contactsArrayMessageGet = (msg: any) => {
  let contactsArray = msg.message?.contactsArrayMessage?.contacts;
  let vcardMulti = contactsArray.map(function (item, indice) {
    return item.vcard;
  });
  let bodymessage = ``;
  vcardMulti.forEach(function (vcard, indice) {
    bodymessage += vcard + "\n\n" + "";
  });
  let contacts = bodymessage.split("BEGIN:");
  contacts.shift();
  let finalContacts = "";
  for (let contact of contacts) {
    finalContacts = finalContacts + multVecardGet(contact);
  }
  return finalContacts;
};
const getTypeMessage = (msg: proto.IWebMessageInfo): string => {
  const msgType = getContentType(msg.message);
  if (msg.message?.viewOnceMessageV2) {
    return "viewOnceMessageV2";
  }
  return msgType;
};
const getBodyButton = (msg: proto.IWebMessageInfo): string => {
  if (msg.key.fromMe && msg.message.buttonsMessage?.contentText) {
    let bodyMessage = `${msg?.message?.buttonsMessage?.contentText}`;
    for (const buton of msg.message?.buttonsMessage?.buttons) {
      bodyMessage += `\n\n${buton.buttonText?.displayText}`;
    }
    return bodyMessage;
  }
  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.listMessage) {
    let bodyMessage = `${msg?.message?.viewOnceMessage?.message?.listMessage?.description}`;
    for (const buton of msg.message?.viewOnceMessage?.message?.listMessage
      ?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }
    return bodyMessage;
  }
};
const getBodyList = (msg: proto.IWebMessageInfo): string => {
  if (msg.key.fromMe && msg.message.listMessage?.description) {
    let bodyMessage = `${msg.message.listMessage?.description}`;
    for (const buton of msg.message.listMessage?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }
    return bodyMessage;
  }
  if (msg.key.fromMe && msg?.message?.viewOnceMessage?.message?.listMessage) {
    let bodyMessage = `${msg?.message?.viewOnceMessage?.message?.listMessage?.description}`;
    for (const buton of msg.message?.viewOnceMessage?.message?.listMessage
      ?.sections) {
      for (const rows of buton.rows) {
        bodyMessage += `\n\n${rows.title}`;
      }
    }
    return bodyMessage;
  }
};
const msgLocation = (image, latitude, longitude) => {
  if (image) {
    var b64 = Buffer.from(image).toString("base64");
    let data = `data:image/png;base64, ${b64} | https://maps.google.com/maps?q=${latitude}%2C${longitude}&z=17&hl=pt-BR|${latitude}, ${longitude} `;
    return data;
  }
};
export const getBodyMessage = (msg: proto.IWebMessageInfo): string | null => {
  try {
    let type = getTypeMessage(msg);
    const types = {
      conversation: msg.message?.conversation,
      imageMessage: msg.message?.imageMessage?.caption,
      videoMessage: msg.message?.videoMessage?.caption,
      extendedTextMessage: msg.message.extendedTextMessage?.text,
      buttonsResponseMessage:
        msg.message.buttonsResponseMessage?.selectedDisplayText,
      listResponseMessage:
        msg.message.listResponseMessage?.title ||
        msg.message.listResponseMessage?.singleSelectReply?.selectedRowId,
      templateButtonReplyMessage:
        msg.message?.templateButtonReplyMessage?.selectedId,
      messageContextInfo:
        msg.message.buttonsResponseMessage?.selectedButtonId ||
        msg.message.listResponseMessage?.title,
      buttonsMessage:
        getBodyButton(msg) || msg.message.listResponseMessage?.title,
      stickerMessage: "sticker",
      contactMessage: msg.message?.contactMessage?.vcard,
      contactsArrayMessage:
        msg.message?.contactsArrayMessage?.contacts &&
        contactsArrayMessageGet(msg),
      locationMessage: msgLocation(
        msg.message?.locationMessage?.jpegThumbnail,
        msg.message?.locationMessage?.degreesLatitude,
        msg.message?.locationMessage?.degreesLongitude
      ),
      liveLocationMessage: `Latitude: ${msg.message.liveLocationMessage?.degreesLatitude} - Longitude: ${msg.message.liveLocationMessage?.degreesLongitude}`,
      documentMessage: msg.message?.documentMessage?.title,
      audioMessage: "Áudio",
      listMessage: getBodyList(msg) || msg.message.listResponseMessage?.title,
      viewOnceMessage: getBodyButton(msg),
      reactionMessage: msg.message.reactionMessage?.text || "reaction",
      senderKeyDistributionMessage:
        msg?.message?.senderKeyDistributionMessage
          ?.axolotlSenderKeyDistributionMessage,
      documentWithCaptionMessage:
        msg.message?.documentWithCaptionMessage?.message?.documentMessage
          ?.caption,
      viewOnceMessageV2:
        msg.message?.viewOnceMessageV2?.message?.imageMessage?.caption
    };
    const objKey = Object.keys(types).find(key => key === type);
    if (!objKey) {
      logger.warn(`#### Nao achou o type 152: ${type}
${JSON.stringify(msg)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, type });
      Sentry.captureException(
        new Error("Novo Tipo de Mensagem em getTypeMessage")
      );
    }
    return types[type];
  } catch (error) {
    Sentry.setExtra("Error getTypeMessage", { msg, BodyMsg: msg.message });
    Sentry.captureException(error);
    console.log(error);
  }
};
export const getQuotedMessage = (msg: proto.IWebMessageInfo) => {
  const body = extractMessageContent(msg.message)[
    Object.keys(msg?.message).values().next().value
  ];
  if (!body?.contextInfo?.quotedMessage) return;
  const quoted = extractMessageContent(
    body?.contextInfo?.quotedMessage[
      Object.keys(body?.contextInfo?.quotedMessage).values().next().value
    ]
  );
  return quoted;
};
export const getQuotedMessageId = (msg: proto.IWebMessageInfo) => {
  const body = extractMessageContent(msg.message)[
    Object.keys(msg?.message).values().next().value
  ];
  let reaction = msg?.message?.reactionMessage
    ? msg?.message?.reactionMessage?.key?.id
    : "";
  return reaction ? reaction : body?.contextInfo?.stanzaId;
};
const getMeSocket = (wbot: Session): IMe => {
  return {
    id: jidNormalizedUser((wbot as WASocket).user.id),
    name: (wbot as WASocket).user.name
  };
};
const getSenderMessage = (
  msg: proto.IWebMessageInfo,
  wbot: Session
): string => {
  const me = getMeSocket(wbot);
  if (msg.key.fromMe) return me.id;
  const senderId =
    msg.participant || msg.key.participant || msg.key.remoteJid || undefined;
  return senderId && jidNormalizedUser(senderId);
};
const getContactMessage = async (msg: proto.IWebMessageInfo, wbot: Session) => {
  const isGroup = msg.key.remoteJid.includes("g.us");
  const rawNumber = msg.key.remoteJid.replace(/\D/g, "");
  return isGroup
    ? { id: getSenderMessage(msg, wbot), name: msg.pushName }
    : {
        id: msg.key.remoteJid,
        name: msg.key.fromMe ? rawNumber : msg.pushName
      };
};
const downloadMedia = async (msg: proto.IWebMessageInfo) => {
  const mineType =
    msg.message?.imageMessage ||
    msg.message?.audioMessage ||
    msg.message?.videoMessage ||
    msg.message?.stickerMessage ||
    msg.message?.documentMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.imageMessage ||
    msg.message?.documentWithCaptionMessage?.message?.documentMessage;
  const messageType = msg.message?.documentMessage
    ? "document"
    : mineType.mimetype.split("/")[0].replace("application", "document")
    ? (mineType.mimetype
        .split("/")[0]
        .replace("application", "document") as MediaType)
    : (mineType.mimetype.split("/")[0] as MediaType);
  let stream;
  let contDownload = 0;
  while (contDownload < 10 && !stream) {
    try {
      stream = await downloadContentFromMessage(
        msg.message.audioMessage ||
          msg.message.videoMessage ||
          msg.message.documentMessage ||
          msg.message.imageMessage ||
          msg.message.stickerMessage ||
          msg.message.extendedTextMessage?.contextInfo.quotedMessage
            .imageMessage ||
          msg.message?.buttonsMessage?.imageMessage ||
          msg.message?.templateMessage?.fourRowTemplate?.imageMessage ||
          msg.message?.templateMessage?.hydratedTemplate?.imageMessage ||
          msg.message?.templateMessage?.hydratedFourRowTemplate?.imageMessage ||
          msg.message?.interactiveMessage?.header?.imageMessage ||
          msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
          msg.message?.viewOnceMessageV2?.message?.imageMessage,
        messageType
      );
    } catch (error) {
      contDownload++;
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * contDownload * 2)
      );
      logger.warn(
        `>>>> erro ${contDownload} de baixar o arquivo ${msg?.key.id}`
      );
    }
  }
  let buffer = Buffer.from([]);
  try {
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
  } catch (error) {
    return { data: "error", mimetype: "", filename: "" };
  }
  if (!buffer) {
    Sentry.setExtra("ERR_WAPP_DOWNLOAD_MEDIA", { msg });
    Sentry.captureException(new Error("ERR_WAPP_DOWNLOAD_MEDIA"));
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }
  let filename = msg.message?.documentMessage?.fileName || "";
  if (!filename) {
    const ext = mineType.mimetype.split("/")[1].split(";")[0];
    filename = `${new Date().getTime()}.${ext}`;
  }
  const media = { data: buffer, mimetype: mineType.mimetype, filename };
  return media;
};
const verifyContact = async (
  msgContact: IMe,
  wbot: Session,
  companyId: number
): Promise<Contact> => {
  let profilePicUrl: string;
  try {
    profilePicUrl = await wbot.profilePictureUrl(msgContact.id);
  } catch (e) {
    Sentry.captureException(e);
    profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;
  }
  const contactData = {
    name: msgContact?.name || msgContact.id.replace(/\D/g, ""),
    number: msgContact.id.replace(/\D/g, ""),
    profilePicUrl,
    isGroup: msgContact.id.includes("g.us"),
    companyId
  };
  const contact = CreateOrUpdateContactService(contactData);
  return contact;
};
const verifyQuotedMessage = async (
  msg: proto.IWebMessageInfo
): Promise<Message | null> => {
  if (!msg) return null;
  const quoted = getQuotedMessageId(msg);
  if (!quoted) return null;
  const quotedMsg = await Message.findOne({ where: { id: quoted } });
  if (!quotedMsg) return null;
  return quotedMsg;
};
const verifyMediaMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const media = await downloadMedia(msg);
  if (!media) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }
  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${new Date().getTime()}.${ext}`;
  } else {
    let originalFilename = media.filename ? `-${media.filename}` : "";
    media.filename = `${new Date().getTime()}${originalFilename}`;
  }
  try {
    const folder = `public/company${ticket.companyId}`;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
      fs.chmodSync(folder, 0o777);
    }
    await writeFileAsync(
      join(__dirname, "..", "..", "..", folder, media.filename),
      media.data,
      "base64"
    );
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
  const body = getBodyMessage(msg);
  const messageData = {
    id: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body: body ? body : media.filename,
    fromMe: msg.key.fromMe,
    read: msg.key.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0],
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg)
  };
  await ticket.update({ lastMessage: body || media.filename });
  const newMessage = await CreateMessageService({
    messageData,
    companyId: ticket.companyId
  });
  if (!msg.key.fromMe && ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" }
      ]
    });
    io.to("closed").emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });
    io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });
  }
  return newMessage;
};
export const verifyMessage = async (
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
) => {
  const io = getIO();
  const quotedMsg = await verifyQuotedMessage(msg);
  const body = getBodyMessage(msg);
  const messageData = {
    id: msg.key.id,
    ticketId: ticket.id,
    contactId: msg.key.fromMe ? undefined : contact.id,
    body,
    fromMe: msg.key.fromMe,
    mediaType: getTypeMessage(msg),
    read: msg.key.fromMe,
    quotedMsgId: quotedMsg?.id,
    ack: msg.status,
    remoteJid: msg.key.remoteJid,
    participant: msg.key.participant,
    dataJson: JSON.stringify(msg)
  };
  await ticket.update({ lastMessage: body });
  await CreateMessageService({ messageData, companyId: ticket.companyId });
  if (!msg.key.fromMe && ticket.status === "closed") {
    await ticket.update({ status: "pending" });
    await ticket.reload({
      include: [
        { model: Queue, as: "queue" },
        { model: User, as: "user" },
        { model: Contact, as: "contact" }
      ]
    });
    io.to("closed").emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });
    io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });
  }
};
const isValidMsg = (msg: proto.IWebMessageInfo): boolean => {
  if (msg.key.remoteJid === "status@broadcast") return false;
  try {
    const msgType = getTypeMessage(msg);
    if (!msgType) {
      return;
    }
    const ifType =
      msgType === "conversation" ||
      msgType === "extendedTextMessage" ||
      msgType === "audioMessage" ||
      msgType === "videoMessage" ||
      msgType === "imageMessage" ||
      msgType === "documentMessage" ||
      msgType === "stickerMessage" ||
      msgType === "buttonsResponseMessage" ||
      msgType === "buttonsMessage" ||
      msgType === "messageContextInfo" ||
      msgType === "locationMessage" ||
      msgType === "liveLocationMessage" ||
      msgType === "contactMessage" ||
      msgType === "voiceMessage" ||
      msgType === "mediaMessage" ||
      msgType === "contactsArrayMessage" ||
      msgType === "reactionMessage" ||
      msgType === "ephemeralMessage" ||
      msgType === "protocolMessage" ||
      msgType === "listResponseMessage" ||
      msgType === "listMessage" ||
      msgType === "viewOnceMessage" ||
      msgType === "documentWithCaptionMessage" ||
      msgType === "viewOnceMessageV2";
    if (!ifType) {
      logger.warn(`#### Nao achou o type em isValidMsg: ${msgType}
${JSON.stringify(msg?.message)}`);
      Sentry.setExtra("Mensagem", { BodyMsg: msg.message, msg, msgType });
      Sentry.captureException(new Error("Novo Tipo de Mensagem em isValidMsg"));
    }
    return !!ifType;
  } catch (error) {
    Sentry.setExtra("Error isValidMsg", { msg });
    Sentry.captureException(error);
  }
};
async function handleChatGPTInteraction(
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  wbot: Session,
  contact: Contact
) {
  console.log("Iniciando handleChatGPTInteraction");
  console.log("Verificando se o ChatGPT está habilitado");
  const chatGPTEnabled = await Whatsapp.findOne({
    where: { companyId: ticket.companyId, chatGPTEnabled: true }
  });
  console.log(
    "Status do ChatGPT:",
    chatGPTEnabled ? "Habilitado" : "Desabilitado"
  );
  if (chatGPTEnabled && ticket.status === "pending") {
    console.log("ChatGPT habilitado e ticket pendente");
    const userMessage =
      msg.message.extendedTextMessage?.text || msg.message.conversation;
    console.log("Mensagem recebida para processamento:", userMessage);
    if (userMessage) {
      try {
        const whatsappId = ticket.whatsappId;
        console.log("Processando mensagem com ChatGPT:", userMessage);
        const chatGPTResponse = await chatGPTService(userMessage, whatsappId);
        console.log("Resposta do ChatGPTService:", chatGPTResponse);
        if (chatGPTResponse && chatGPTResponse.trim() !== "") {
          await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            { text: chatGPTResponse }
          );
          console.log("Mensagem processada e enviada pelo ChatGPT");
          return true;
        } else {
          console.log("Resposta do ChatGPT vazia ou inválida");
        }
      } catch (error) {
        console.error("Erro ao processar mensagem com ChatGPT:", error);
      }
    }
  }
  console.log("Mensagem não foi processada pelo ChatGPT");
  return false;
}
async function sendQueueOptions(
  wbot: Session,
  contact: Contact,
  queues: Queue[]
) {
  const queueOptions = queues
    .map((queue, index) => `[ ${index + 1} ] ${queue.name}`)
    .join("\n");
  await wbot.sendMessage(
    `${contact.number}@${contact.isGroup ? "g.us" : "s.whatsapp.net"}`,
    { text: `Escolha uma das seguintes filas:\n${queueOptions}` }
  );
}
const verifyTypebot = async (
  wbot: Session,
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
) => {
  const { queues, greetingMessage, maxUseBotQueues } =
    await ShowWhatsAppService(wbot.id!, ticket.companyId);
  const queueValues = queues.map(queue => queue.name);
  const queueId = queues.map(queue => queue.id);
  const nome = contact.name;
  const numero = contact.number;
  const menssagem = getBodyMessage(msg);
  const typeBotIn = async () => {
    try {
      const resetFlux = await Setting.findOne({
        where: {
          key: "apiKeyTypeBot",
          companyId: ticket.companyId
        }
      });

      const fila = await Queue.findOne({
        where: {
          id: ticket.queue.id
        }
      });

      const apiUrl = fila ? fila.typebotUrl : null;
      const token = fila ? fila.typebotName : null;

      if (!apiUrl || !token) {
        if (!apiUrl) {
          console.error("Url Inválido ou não fornecido");
        }
        if (!token) {
          console.error("Nome Inválido ou não fornecido");
        }
        return;
      }

      const typebotService = new TypebotService(apiUrl, token);

      let startChatResponse;

      const ticketId = ticket.id;
      const publicId = token; // Substitua pelo valor correto
      const message = "oi"; // Substitua pela mensagem desejada

      const foundQueue = queues.find(queue => {
        const similarity = stringSimilarity.compareTwoStrings(
          queue.name.toLowerCase(),
          menssagem.toLowerCase()
        );

        // Defina um limite de similaridade que considera aceitável
        const similarityThreshold = 0.5; // Pode ajustar conforme necessário

        return similarity >= similarityThreshold;
      });
      let foundQueueError = false;

      if (foundQueue) {
        const foundQueueId = foundQueue.id;
        console.log(
          `Fila encontrada - Nome: ${foundQueue.name}, ID: ${foundQueueId}`
        );

        // Chame a função UpdateTicketService com o ID da fila
        await UpdateTicketService({
          ticketData: { queueId: foundQueueId },
          ticketId: ticket.id,
          companyId: ticket.companyId,
          ratingId: undefined
        });
        await ticket.contact.updateTypebotToken(null);
        await wbot.sendPresenceUpdate("composing", msg.key.remoteJid);
        const delayInMilliseconds = 3000; // 1 segundo
        await new Promise(resolve => setTimeout(resolve, delayInMilliseconds));
        const body = formatBody(`${foundQueue.greetingMessage}`, ticket);
        await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: body }
        );
        await wbot.sendPresenceUpdate("available", msg.key.remoteJid);
      } else {
        if (menssagem === resetFlux?.value) {
          console.log("Reiniciando Fluxo no TypeBot");
          startChatResponse = await typebotService.startChat(
            token,
            menssagem,
            queueValues,
            nome,
            numero,
            ticketId
          );
          
          await contact.updateTypebotToken(startChatResponse.sessionId);
        } else {
          try {
            
            // Tente chamar continueChat
            startChatResponse = await typebotService.continueChat(
              contact.typebotToken,
              menssagem
            );
          } catch (continueChatError) {
            // Se houver um erro no continueChat, chame startChat
            console.error(
              "Erro ao continuar o TypeBot. Iniciando um novo TypeBot.",
            );
            console.log("Criando Novo Fluxo No TypeBot");
            
            startChatResponse = await typebotService.startChat(
              token,
              menssagem,
              queueValues,
              nome,
              numero,
              ticketId
            );

            await contact.updateTypebotToken(startChatResponse.sessionId);
          
          }
        }

        const messages = startChatResponse.messages;
 
      
        for (const message of messages) {
          // Verifica se o ID da mensagem está presente em lastBubbleBlockId
          let matchingAction;

          try {
            matchingAction = startChatResponse.clientSideActions.find(
              action => action.lastBubbleBlockId === message.id
            );

            if (matchingAction) {
              const secondsToWait = matchingAction.wait?.secondsToWaitFor || 0;
              console.log(
                `Bloco de espera encontrado: ${matchingAction.lastBubbleBlockId}`
              );
              console.log(`Espere por ${secondsToWait} segundos...`);
              await wait(secondsToWait);
            }
          } catch (matchingActionError) {
            try {
              console.log("Nenhum Bloco de espera encontrado");
            } catch (nestedError) {
              console.log("Prosseguindo");
            }
            // Lidar com o erro, se necessário, ou apenas continuar a execução
          }
          if (message.type === 'text') {
            let formattedText = '';
  
            let linkPreview = false;
  
            for (const richText of message.content.richText) {
              if (richText.type === 'variable') {
                for (const child of richText.children) {
                  for (const grandChild of child.children) {
                    formattedText += grandChild.text;
                  }
                }
              } else {
                for (const element of richText.children) {
                  let text = '';
  
                  if (element.type === 'inline-variable') {
                    for (const child of element.children) {
                      for (const grandChild of child.children) {
                        text += grandChild.text;
                      }
                    }
                  } else if (element.text) {
                    text = element.text;
                  }
  
                  // if (element.text) {
                  //   text = element.text;
                  // }
  
                  if (element.bold) {
                    text = `*${text}*`;
                  }
  
                  if (element.italic) {
                    text = `_${text}_`;
                  }
  
                  if (element.underline) {
                    text = `*${text}*`;
                  }
  
                  if (element.url) {
                    const linkText = element.children[0].text;
                    text = `[${linkText}](${element.url})`;
                    linkPreview = true;
                  }
  
                  formattedText += text;
                }
              }
              formattedText += '\n';
            }
  
            formattedText = formattedText.replace(/\n$/, '');
            console.log(formattedText);
          
            await wbot.sendPresenceUpdate("composing", msg.key.remoteJid);
            const delayInMilliseconds = 5000; // 1 segundo
            await new Promise(resolve =>
              setTimeout(resolve, delayInMilliseconds)
            );
          
            await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              {
                text: formattedText
              }
            );
            await wbot.sendPresenceUpdate("available", msg.key.remoteJid);
          }
          
          

          if (message.type === "image" /*|| message.type === 'video'*/) {
            console.log(`url da imagem: ${message.content?.url}`);
            try {
              const url = message.content?.url; // URL da imagem
              const caption = ""; // Substitua pela legenda desejada
              const localFilePath = `./public/company${
                ticket.companyId
              }/${makeid(10)}`;

              // Baixar a imagem da URL e salvar localmente
              //const response = await axios.get(url, { responseType: 'stream' });
              //const imageStream = response.data;
              // fileStream = fs.createWriteStream(localFilePath);
              const fileName = localFilePath.substring(
                localFilePath.lastIndexOf("/") + 1
              );

              //imageStream.pipe(fileStream);

              await wbot.sendMessage(
                `${contact.number}@${
                  ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  image: url
                    ? { url }
                    : fs.readFileSync(
                        `./public/company${
                          ticket.companyId
                        }/${fileName}-${makeid(10)}`
                      ),
                  fileName: caption,
                  caption: caption,
                  mimetype: "image/jpeg"
                }
              );
            } catch (e) {}
          }
          if (message.type === "video") {
            console.log(`url do video: ${message.content?.url}`);
            try {
              const url = message.content?.url; // URL da imagem
              const caption = ""; // Substitua pela legenda desejada
              const localFilePath = `./public/company${
                ticket.companyId
              }/${makeid(10)}`;

              const fileName = localFilePath.substring(
                localFilePath.lastIndexOf("/") + 1
              );

              await wbot.sendMessage(
                `${contact.number}@${
                  ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  video: url
                    ? { url }
                    : fs.readFileSync(
                        `./public/company${
                          ticket.companyId
                        }/${fileName}-${makeid(10)}`
                      ),
                  fileName: caption,
                  caption: caption
                  //mimetype: 'image/jpeg'
                }
              );
            } catch (e) {}
          }
          if (message.type === "audio") {
            console.log(`url do audio: ${message.content?.url}`);
            try {
              const url = message.content?.url; // URL do arquivo de áudio
              const caption = ""; // Substitua pela legenda desejada
              const localFilePath = `./public/company${
                ticket.companyId
              }/${makeid(10)}.mp3`; // Nome do arquivo local

              // Baixar o arquivo de áudio da URL e salvar localmente
              const response = await axios.get(url, {
                responseType: "stream"
              });
              const audioStream = response.data;
              const fileStream = fs.createWriteStream(localFilePath);

              audioStream.pipe(fileStream);

              await new Promise((resolve, reject) => {
                fileStream.on("finish", resolve);
                fileStream.on("error", reject);
              });

              await wbot.sendPresenceUpdate("recording", msg.key.remoteJid);
              const delayInMilliseconds = 10000; // 1 segundo
              await new Promise(resolve =>
                setTimeout(resolve, delayInMilliseconds)
              );
              await wbot.sendMessage(
                `${contact.number}@${
                  ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  audio: fs.readFileSync(localFilePath),
                  fileName: caption,
                  caption: caption,
                  mimetype: "audio/mp4", // Defina o tipo de mídia correto para arquivos de áudio
                  ptt: true
                }
              );
              wbot.sendPresenceUpdate("available", msg.key.remoteJid);

              // Excluir o arquivo local após o envio (se necessário)
              fs.unlinkSync(localFilePath);
            } catch (e) {
              console.error(e);
            }
          }
          // Função para esperar o tempo especificado em segundos
          // Função para esperar o tempo especificado em segundos
          async function wait(seconds) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
          }
        }
        const input = startChatResponse.input;
        if (input) {
          if (input.type === "choice input") {
            let formattedText = "";
            const items = input.items;
            for (const item of items) {
              formattedText += `▶️ ${item.content}\n`;
            }
            formattedText = formattedText.replace(/\n$/, "");

            await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              {
                text: formattedText
              }
            );
          }
        }
      }
      if (foundQueueError) {
        // Se houve um erro na busca da fila, não execute este bloco
        return;
      }
    } catch (error) {
      // Trate qualquer erro que possa ocorrer durante a chamada da API
      console.error("Erro ao iniciar o chat:", error);
    }
  };
  return typeBotIn();
};

const verifyQueue = async (
  wbot: Session,
  msg: proto.IWebMessageInfo,
  ticket: Ticket,
  contact: Contact
) => {
  if (ticket.status === "pending" && !ticket.queueId) {
    const chatGPTEnabled = await Whatsapp.findOne({
      where: { companyId: ticket.companyId, chatGPTEnabled: true }
    });
    if (chatGPTEnabled) {
      console.log(
        "ChatGPT está habilitado e o ticket está pendente e não em fila"
      );
      const processedByChatGPT = await handleChatGPTInteraction(
        msg,
        ticket,
        wbot,
        contact
      );
      if (processedByChatGPT) {
        console.log("Mensagem processada pelo ChatGPT.");
        return;
      }
    }
  }
  const { queues, greetingMessage, maxUseBotQueues } =
    await ShowWhatsAppService(wbot.id!, ticket.companyId);
  console.log("ticket.amountUsedBotQueues", ticket.amountUsedBotQueues);
  let queuePosition = await Setting.findOne({
    where: { key: "sendQueuePosition", companyId: ticket.companyId }
  });
  const chatGPTEnabled = await Whatsapp.findOne({
    where: { companyId: ticket.companyId, chatGPTEnabled: true }
  });
  console.log(
    "Verificando se o ChatGPT está habilitado e o ticket está pendente"
  );
  if (chatGPTEnabled && ticket.status === "pending") {
    console.log("ChatGPT está habilitado e o ticket está pendente");
    console.log("Mensagem recebida (objeto completo):", msg);
    console.log(
      "Mensagem recebida (campo conversation):",
      msg.message?.conversation
    );
    if (msg.message?.conversation) {
      const whatsappId = ticket.whatsappId;
      const chatGPTResponse = await chatGPTService(
        msg.message.conversation,
        whatsappId
      );
      await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        { text: chatGPTResponse }
      );
    } else {
      if (queues.length === 1) {
        const sendGreetingMessageOneQueues = await Setting.findOne({
          where: {
            key: "sendGreetingMessageOneQueues",
            companyId: ticket.companyId
          }
        });
        if (
          greetingMessage.length > 1 &&
          sendGreetingMessageOneQueues?.value === "enabled"
        ) {
          const body = formatBody(`${greetingMessage}`, ticket);
          await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            { text: body }
          );
        }
        await UpdateTicketService({
          ticketData: { queueId: queues[0].id },
          ticketId: ticket.id,
          companyId: ticket.companyId,
          ratingId: undefined
        });
        const count = await Ticket.findAndCountAll({
          where: {
            userId: null,
            status: "pending",
            companyId: ticket.companyId,
            queueId: queues[0].id,
            isGroup: false
          }
        });
        if (queuePosition?.value === "enabled") {
          const qtd = count.count === 0 ? 1 : count.count;
          const msgFila = `*Asistente Virtual:*\n{{ms}} *{{name}}*, sua posição é: *${qtd}*`;
          const bodyFila = formatBody(`${msgFila}`, ticket);
          const debouncedSentMessagePosicao = debounce(
            async () => {
              await wbot.sendMessage(
                `${contact.number}@${
                  ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                { text: bodyFila }
              );
            },
            3000,
            ticket.id
          );
          debouncedSentMessagePosicao();
        }
      }
    }
    return;
  }
  if (
    maxUseBotQueues &&
    maxUseBotQueues !== 0 &&
    ticket.amountUsedBotQueues >= maxUseBotQueues
  ) {
    const whats = await Whatsapp.findByPk(ticket.whatsappId);
    if(whats.maxUseBotQueueId && whats.maxUseBotQueueId != null && whats.maxUseBotQueueId > 0 ){
      UpdateTicketService({
        ticketData: { queueId: whats.maxUseBotQueueId },
        ticketId: ticket.id,
        companyId: ticket.companyId,
        ratingId: undefined
      })
    }
    return;
  }
  if (contact.disableBot) {
    return;
  }
  const selectedOption =
    msg?.message?.buttonsResponseMessage?.selectedButtonId ||
    msg?.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
    getBodyMessage(msg);
  const choosenQueue = queues[+selectedOption - 1];
  const buttonActive = await Setting.findOne({
    where: { key: "chatBotType", companyId: ticket.companyId }
  });
  const typeBot = buttonActive?.value || "text";
  let randomUserId;
  if (choosenQueue) {
    try {
      const userQueue = await ListUserQueueServices(choosenQueue.id);
      if (userQueue.userId > -1) {
        randomUserId = userQueue.userId;
      }
    } catch (error) {
      console.error(error);
    }
  }
  let settingsUserRandom = await Setting.findOne({
    where: { key: "userRandom", companyId: ticket.companyId }
  });
  const botText = async () => {
    console.log("APTXT2");
    if (choosenQueue) {
      await UpdateTicketService({
        ticketData: { queueId: choosenQueue.id },
        ticketId: ticket.id,
        companyId: ticket.companyId,
        ratingId: undefined
      });
      if (choosenQueue.chatbots.length > 0) {
        let options = "";
        choosenQueue.chatbots.forEach((chatbot, index) => {
          options += `*${index + 1}* - ${chatbot.name}\n`;
        });
        const body = formatBody(
          `${choosenQueue.greetingMessage}\n\n${options}\n*#* Voltar ao menu principal`,
          ticket
        );
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: body }
        );
        await verifyMessage(sentMessage, ticket, contact);
        if (settingsUserRandom?.value === "enabled") {
          await UpdateTicketService({
            ticketData: { userId: randomUserId },
            ticketId: ticket.id,
            companyId: ticket.companyId,
            ratingId: undefined
          });
        }
      }
      if (
        !choosenQueue.chatbots.length &&
        choosenQueue.greetingMessage.length !== 0
      ) {
        const body = formatBody(`${choosenQueue.greetingMessage}`, ticket);
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: body }
        );
        await verifyMessage(sentMessage, ticket, contact);
      }
      const count = await Ticket.findAndCountAll({
        where: {
          userId: null,
          status: "pending",
          companyId: ticket.companyId,
          queueId: choosenQueue.id,
          isGroup: false
        }
      });
      console.log("ticket.queueId2", ticket.queueId);
      console.log("count2", count.count);
      if (queuePosition?.value === "enabled" && !choosenQueue.chatbots.length) {
        const qtd = count.count === 0 ? 1 : count.count;
        const msgFila = `*Asistente Virtual:*\n{{ms}} *{{name}}*, sua posição de atendimento é o :  *${qtd}*`;
        const bodyFila = formatBody(`${msgFila}`, ticket);
        const debouncedSentMessagePosicao = debounce(
          async () => {
            await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              { text: bodyFila }
            );
          },
          3000,
          ticket.id
        );
        debouncedSentMessagePosicao();
      }
    } else {
      let options = "";
      queues.forEach((queue, index) => {
        options += `*${index + 1}* - ${queue.name}\n`;
      });
      const body = formatBody(`${greetingMessage}\n\n${options}`, ticket);
      const debouncedSentMessage = debounce(
        async () => {
          const sentMessage = await wbot.sendMessage(
            `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
            { text: body }
          );
          verifyMessage(sentMessage, ticket, contact);
        },
        1000,
        ticket.id
      );
      await UpdateTicketService({
        ticketData: { amountUsedBotQueues: ticket.amountUsedBotQueues + 1 },
        ticketId: ticket.id,
        companyId: ticket.companyId,
        ratingId: undefined
      });
      const whatsapp = await Whatsapp.findByPk(ticket.whatsappId);
      debouncedSentMessage();
    }
  };
  const botButton = async () => {
    if (choosenQueue) {
      await UpdateTicketService({
        ticketData: { queueId: choosenQueue.id },
        ticketId: ticket.id,
        companyId: ticket.companyId,
        ratingId: undefined
      });
      if (choosenQueue.chatbots.length > 0) {
        const buttons = [];
        choosenQueue.chatbots.forEach((queue, index) => {
          buttons.push({
            buttonId: `${index + 1}`,
            buttonText: { displayText: queue.name },
            type: 1
          });
        });
        const buttonMessage = {
          text: formatBody(`${choosenQueue.greetingMessage}`, ticket),
          buttons: buttons,
          headerType: 4
        };
        const sendMsg = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          buttonMessage
        );
        await verifyMessage(sendMsg, ticket, contact);
      }
      if (!choosenQueue.chatbots.length) {
        const body = formatBody(`${choosenQueue.greetingMessage}`, ticket);
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: body }
        );
        await verifyMessage(sentMessage, ticket, contact);
      }
    } else {
      const buttons = [];
      queues.forEach((queue, index) => {
        buttons.push({
          buttonId: `${index + 1}`,
          buttonText: { displayText: queue.name },
          type: 4
        });
      });
      const buttonMessage = {
        text: formatBody(`${greetingMessage}`, ticket),
        buttons: buttons,
        headerType: 4
      };
      const sendMsg = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        buttonMessage
      );
      await verifyMessage(sendMsg, ticket, contact);
      await UpdateTicketService({
        ticketData: { amountUsedBotQueues: ticket.amountUsedBotQueues + 1 },
        ticketId: ticket.id,
        companyId: ticket.companyId,
        ratingId: undefined
      });
    }
  };
  const botList = async () => {
    if (choosenQueue) {
      await UpdateTicketService({
        ticketData: { queueId: choosenQueue.id },
        ticketId: ticket.id,
        companyId: ticket.companyId,
        ratingId: undefined
      });
      if (choosenQueue.chatbots.length > 0) {
        const sectionsRows = [];
        choosenQueue.chatbots.forEach((queue, index) => {
          sectionsRows.push({ title: queue.name, rowId: `${index + 1}` });
        });
        const sections = [{ title: "Menu", rows: sectionsRows }];
        const listMessage = {
          text: formatBody(`${choosenQueue.greetingMessage}`, ticket),
          buttonText: "Escoge una opción",
          sections
        };
        const sendMsg = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          listMessage
        );
        await verifyMessage(sendMsg, ticket, contact);
      }
      if (!choosenQueue.chatbots.length) {
        const body = formatBody(`${choosenQueue.greetingMessage}`, ticket);
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: body }
        );
        await verifyMessage(sentMessage, ticket, contact);
      }
    } else {
      const sectionsRows = [];
      queues.forEach((queue, index) => {
        sectionsRows.push({ title: queue.name, rowId: `${index + 1}` });
      });
      const sections = [{ title: "Menu", rows: sectionsRows }];
      const listMessage = {
        text: formatBody(`${greetingMessage}`, ticket),
        buttonText: "Escoge una opción",
        sections
      };
      const sendMsg = await wbot.sendMessage(
        `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
        listMessage
      );
      await verifyMessage(sendMsg, ticket, contact);
      await UpdateTicketService({
        ticketData: { amountUsedBotQueues: ticket.amountUsedBotQueues + 1 },
        ticketId: ticket.id,
        companyId: ticket.companyId,
        ratingId: undefined
      });
    }
  };

  const queueValues = queues.map(queue => queue.name);
  const queueId = queues.map(queue => queue.id);
  const nome = contact.name;
  const numero = contact.number;
  const menssagem = getBodyMessage(msg);

  console.log(queues);
  const typeBotIn = async () => {
    try {
      const resetFlux = await Setting.findOne({
        where: {
          key: "apiKeyTypeBot",
          companyId: ticket.companyId
        }
      });

      const urlTypeBot = await Setting.findOne({
        where: {
          key: "urlTypeBot",
          companyId: ticket.companyId
        }
      });

      const nameTypeBot = await Setting.findOne({
        where: {
          key: "viewerTypeBot",
          companyId: ticket.companyId
        }
      });

      const apiUrl = urlTypeBot?.value;
      const token = nameTypeBot?.value;

      if (!apiUrl || !token) {
        if (!apiUrl) {
          console.error("Url Inválido ou não fornecido");
        }
        if (!token) {
          console.error("Nome Inválido ou não fornecido");
        }
        return;
      }

      const typebotService = new TypebotService(apiUrl, token);

      let startChatResponse;

      const ticketId = ticket.id;
      const publicId = token; // Substitua pelo valor correto
      const message = "oi"; // Substitua pela mensagem desejada

      const foundQueue = queues.find(queue => {
        const similarity = stringSimilarity.compareTwoStrings(
          queue.name.toLowerCase(),
          menssagem.toLowerCase()
        );

        // Defina um limite de similaridade que considera aceitável
        const similarityThreshold = 0.5; // Pode ajustar conforme necessário

        return similarity >= similarityThreshold;
      });
      let foundQueueError = false;

      if (foundQueue) {
        const foundQueueId = foundQueue.id;
        console.log(
          `Fila encontrada - Nome: ${foundQueue.name}, ID: ${foundQueueId}`
        );

        // Chame a função UpdateTicketService com o ID da fila
        await UpdateTicketService({
          ticketData: { queueId: foundQueueId },
          ticketId: ticket.id,
          companyId: ticket.companyId,
          ratingId: undefined
        });
        await ticket.contact.updateTypebotToken(null);
        await wbot.sendPresenceUpdate("composing", msg.key.remoteJid);
        const delayInMilliseconds = 3000; // 1 segundo
        await new Promise(resolve => setTimeout(resolve, delayInMilliseconds));
        const body = formatBody(`${foundQueue.greetingMessage}`, ticket);
        await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: body }
        );
        await wbot.sendPresenceUpdate("available", msg.key.remoteJid);
      } else {
        if (menssagem === resetFlux?.value) {
          console.log("Reiniciando Fluxo no TypeBot");
          startChatResponse = await typebotService.startChat(
            token,
            menssagem,
            queueValues,
            nome,
            numero,
            ticketId
          );
          await contact.updateTypebotToken(startChatResponse.sessionId);
        } else {
          console.log("Verificando Se Fluxo Existe No TypeBot");
          try {
            // Tente chamar continueChat
            startChatResponse = await typebotService.continueChat(
              contact.typebotToken,
              menssagem
            );
          } catch (continueChatError) {
            // Se houver um erro no continueChat, chame startChat
            console.error(
              "Erro ao continuar o TypeBot. Iniciando um novo TypeBot.",
              continueChatError
            );
            console.log("Criando Novo Fluxo No TypeBot");
            startChatResponse = await typebotService.startChat(
              token,
              menssagem,
              queueValues,
              nome,
              numero,
              ticketId
            );
            // Atualize o typebotToken no objeto Contact correspondente
            await contact.updateTypebotToken(startChatResponse.sessionId);
          }
        }

        console.log("TypeBot Id:", ticket.contact.typebotToken);
        console.log("Start Chat Response:", startChatResponse);

        const messages = startChatResponse.messages;

        for (const message of messages) {
          // Verifica se o ID da mensagem está presente em lastBubbleBlockId
          let matchingAction;

          try {
            matchingAction = startChatResponse.clientSideActions.find(
              action => action.lastBubbleBlockId === message.id
            );

            if (matchingAction) {
              const secondsToWait = matchingAction.wait?.secondsToWaitFor || 0;
              console.log(
                `Bloco de espera encontrado: ${matchingAction.lastBubbleBlockId}`
              );
              console.log(`Espere por ${secondsToWait} segundos...`);
              await wait(secondsToWait);
            }
          } catch (matchingActionError) {
            try {
              console.log("Nenhum Bloco de espera encontrado");
            } catch (nestedError) {
              console.log("Prosseguindo");
            }
            // Lidar com o erro, se necessário, ou apenas continuar a execução
          }
          if (message.type === "text") {
            let formattedText = "";

            for (const richText of message.content.richText) {
              for (const element of richText.children) {
                let text = "";
                let isBold = false;

                if (element.text) {
                  text = element.text;
                  isBold = element.bold || isBold;
                } else if (
                  element.type === "inline-variable" &&
                  element.children[0]?.children[0]?.text
                ) {
                  const inlineText = element.children[0].children[0].text;
                  text = inlineText;
                  isBold = element.bold || isBold;
                } else if (element.type === "a") {
                  // Manipula o elemento de link
                  //const linkText = element.children[0].text;
                  const linkUrl = element.url;
                  text += `${linkUrl}`;
                } else if (element.type === "p") {
                  for (const childElement of element.children) {
                    if (childElement.text) {
                      if (childElement.bold) {
                        text += `*${childElement.text}*`;
                      } else {
                        text += childElement.text;
                      }
                    } else if (childElement.type === "a") {
                      // Manipula o elemento de link dentro do parágrafo
                      const linkUrl = childElement.url;
                      text += `${linkUrl}`;
                    }
                  }
                }

                if (isBold) {
                  text = `*${text}*`;
                }
                if (element.italic) {
                  text = `_${text}_`;
                }
                if (element.underline) {
                  text = `~${text}~`;
                }

                formattedText += text;
              }

              formattedText += "\n";
            }

            formattedText = formattedText.replace(/\n$/, "");
            console.log(formattedText);

            await wbot.sendPresenceUpdate("composing", msg.key.remoteJid);
            const delayInMilliseconds = 5000; // 1 segundo
            await new Promise(resolve =>
              setTimeout(resolve, delayInMilliseconds)
            );

            await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              {
                text: formattedText
              }
            );
            await wbot.sendPresenceUpdate("available", msg.key.remoteJid);
          }

          if (message.type === "image" /*|| message.type === 'video'*/) {
            console.log(`url da imagem: ${message.content?.url}`);
            try {
              const url = message.content?.url; // URL da imagem
              const caption = ""; // Substitua pela legenda desejada
              const localFilePath = `./public/company${
                ticket.companyId
              }/${makeid(10)}`;

              // Baixar a imagem da URL e salvar localmente
              //const response = await axios.get(url, { responseType: 'stream' });
              //const imageStream = response.data;
              // fileStream = fs.createWriteStream(localFilePath);
              const fileName = localFilePath.substring(
                localFilePath.lastIndexOf("/") + 1
              );

              //imageStream.pipe(fileStream);

              await wbot.sendMessage(
                `${contact.number}@${
                  ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  image: url
                    ? { url }
                    : fs.readFileSync(
                        `./public/company${
                          ticket.companyId
                        }/${fileName}-${makeid(10)}`
                      ),
                  fileName: caption,
                  caption: caption,
                  mimetype: "image/jpeg"
                }
              );
            } catch (e) {}
          }
          if (message.type === "video") {
            console.log(`url do video: ${message.content?.url}`);
            try {
              const url = message.content?.url; // URL da imagem
              const caption = ""; // Substitua pela legenda desejada
              const localFilePath = `./public/company${
                ticket.companyId
              }/${makeid(10)}`;

              const fileName = localFilePath.substring(
                localFilePath.lastIndexOf("/") + 1
              );

              await wbot.sendMessage(
                `${contact.number}@${
                  ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  video: url
                    ? { url }
                    : fs.readFileSync(
                        `./public/company${
                          ticket.companyId
                        }/${fileName}-${makeid(10)}`
                      ),
                  fileName: caption,
                  caption: caption
                  //mimetype: 'image/jpeg'
                }
              );
            } catch (e) {}
          }
          if (message.type === "audio") {
            console.log(`url do audio: ${message.content?.url}`);
            try {
              const url = message.content?.url; // URL do arquivo de áudio
              const caption = ""; // Substitua pela legenda desejada
              const localFilePath = `./public/company${
                ticket.companyId
              }/${makeid(10)}.mp3`; // Nome do arquivo local

              // Baixar o arquivo de áudio da URL e salvar localmente
              const response = await axios.get(url, { responseType: "stream" });
              const audioStream = response.data;
              const fileStream = fs.createWriteStream(localFilePath);

              audioStream.pipe(fileStream);

              await new Promise((resolve, reject) => {
                fileStream.on("finish", resolve);
                fileStream.on("error", reject);
              });

              await wbot.sendPresenceUpdate("recording", msg.key.remoteJid);
              const delayInMilliseconds = 10000; // 1 segundo
              await new Promise(resolve =>
                setTimeout(resolve, delayInMilliseconds)
              );
              await wbot.sendMessage(
                `${contact.number}@${
                  ticket.isGroup ? "g.us" : "s.whatsapp.net"
                }`,
                {
                  audio: fs.readFileSync(localFilePath),
                  fileName: caption,
                  caption: caption,
                  mimetype: "audio/mp4", // Defina o tipo de mídia correto para arquivos de áudio
                  ptt: true
                }
              );
              wbot.sendPresenceUpdate("available", msg.key.remoteJid);

              // Excluir o arquivo local após o envio (se necessário)
              fs.unlinkSync(localFilePath);
            } catch (e) {
              console.error(e);
            }
          }
          // Função para esperar o tempo especificado em segundos
          // Função para esperar o tempo especificado em segundos
          async function wait(seconds) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
          }
        }
        const input = startChatResponse.input;
        if (input) {
          if (input.type === "choice input") {
            let formattedText = "";
            const items = input.items;
            for (const item of items) {
              formattedText += `▶️ ${item.content}\n`;
            }
            formattedText = formattedText.replace(/\n$/, "");

            await wbot.sendMessage(
              `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
              {
                text: formattedText
              }
            );
          }
        }
      }
      if (foundQueueError) {
        // Se houve um erro na busca da fila, não execute este bloco
        return;
      }
    } catch (error) {
      // Trate qualquer erro que possa ocorrer durante a chamada da API
      console.error("Erro ao iniciar o chat:", error);
    }
  };

  const floWIseIn = async () => {
    const urlFlow = await Setting.findOne({
      where: {
        key: "urlFlow",
        companyId: ticket.companyId
      }
    });
    const tokenFlow = await Setting.findOne({
      where: {
        key: "tokenFlow",
        companyId: ticket.companyId
      }
    });
    const menssagem = getBodyMessage(msg);

    try {
      let flowiseResposta;
      const flowiseServices = new FlowiseServices(
        urlFlow?.value,
        tokenFlow?.value
      );

      const foundQueue = queues.find(queue => {
        const similarity = stringSimilarity.compareTwoStrings(
          queue.name.toLowerCase(),
          menssagem.toLowerCase()
        );

        // Defina um limite de similaridade que considera aceitável
        const similarityThreshold = 0.5; // Pode ajustar conforme necessário

        return similarity >= similarityThreshold;
      });
      let foundQueueError = false;

      if (foundQueue) {
        const foundQueueId = foundQueue.id;
        console.log(
          `Fila encontrada - Nome: ${foundQueue.name}, ID: ${foundQueueId}`
        );

        // Chame a função UpdateTicketService com o ID da fila
        await UpdateTicketService({
          ticketData: { queueId: foundQueueId },
          ticketId: ticket.id,
          companyId: ticket.companyId,
          ratingId: undefined
        });
        await ticket.contact.updateTypebotToken(null);
        await wbot.sendPresenceUpdate("composing", msg.key.remoteJid);
        const delayInMilliseconds = 3000; // 1 segundo
        await new Promise(resolve => setTimeout(resolve, delayInMilliseconds));
        const body = formatBody(`${foundQueue.greetingMessage}`, ticket);
        await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          { text: body }
        );
        await wbot.sendPresenceUpdate("available", msg.key.remoteJid);
      } else {
        flowiseResposta = await flowiseServices.startFlow(menssagem);

        const messages = flowiseResposta.text;

        const formattedMessage = messages
          // Remover espaços em branco no início e no final
          .trim()
          // Remover quebras de linha no início
          .replace(/^\s+/, "")
          // Remover quebras de linha duplicadas
          .replace(/\n{2,}/g, "\n")
          // Remover quebras de linha extras no final
          .replace(/\n\s*$/, "\n")
          // Tratar links para evitar formatação incorreta
          .replace(/(https?:\/\/\S+)/g, "<$1>")
          // Adicionar formatação para texto em negrito
          .replace(/\*([^*]+)\*/g, "<b>$1</b>");

        await wbot.sendPresenceUpdate("composing", msg.key.remoteJid);
        const delayInMilliseconds = 5000; // 1 segundo
        await new Promise(resolve => setTimeout(resolve, delayInMilliseconds));

        await wbot.sendMessage(
          `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
          {
            text: formattedMessage
          }
        );
        await wbot.sendPresenceUpdate("available", msg.key.remoteJid);
      }

      if (foundQueueError) {
        // Se houve um erro na busca da fila, não execute este bloco
        return;
      }
    } catch (error) {
      // Trate qualquer erro que possa ocorrer durante a chamada da API
      console.error("Erro ao iniciar o chat:", error);
    }
  };

  if (typeBot === "text") {
    return botText();
  }
  if (typeBot === "button" && queues.length > 3) {
    return botText();
  }
  if (typeBot === "button" && queues.length <= 3) {
    return botButton();
  }
  if (typeBot === "list") {
    return botList();
  }
  if (typeBot === "typeBot") {
    return typeBotIn();
  }
  if (typeBot === "floWise") {
    return floWIseIn();
  }
};
export function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const verifyRating = (ticketTraking: TicketTraking) => {
  if (
    ticketTraking &&
    ticketTraking.finishedAt === null &&
    ticketTraking.userId !== null &&
    ticketTraking.ratingAt !== null
  ) {
    return true;
  }
  return false;
};
const handleRating = async (
  msg: WAMessage,
  ticket: Ticket,
  ticketTraking: TicketTraking
) => {
  const io = getIO();
  let rate: any | null = null;
  if (msg.message?.conversation) {
    rate = +msg.message?.conversation;
  }
  if (!isNull(rate) && ticketTraking.ratingId) {
    const { complationMessage } = await ShowWhatsAppService(
      ticket.whatsappId,
      ticket.companyId
    );
    const optionRating = rate;
    const rating = await Rating.findByPk(ticketTraking.ratingId, {
      include: [{ model: RatingOption, as: "options" }]
    });
    if (rating) {
      const ratingOptionsSelected = rating.options.filter(
        option => `${option.value}` === `${optionRating}`
      );
      let sendFarewellWaitingTicket = await Setting.findOne({
        where: { key: "sendFarewellWaitingTicket", companyId: ticket.companyId }
      });
      if (ratingOptionsSelected.length > 0) {
        await UserRating.create({
          ticketId: ticketTraking.ticketId,
          companyId: ticketTraking.companyId,
          userId: ticketTraking.userId,
          ratingId: ticketTraking.ratingId,
          ratingIdOption: ratingOptionsSelected[0].id
        });
        if (!isNil(complationMessage) && complationMessage !== "") {
          if (
            ticket.status !== "pending" ||
            (ticket.status === "pending" &&
              sendFarewellWaitingTicket?.value === "enabled")
          ) {
            const body = `\u200e${complationMessage}`;
            await SendWhatsAppMessage({ body, ticket });
          }
        }
        await ticketTraking.update({
          finishedAt: moment().toDate(),
          rated: true
        });
        await ticket.update({
          queueId: null,
          chatbot: null,
          queueOptionId: null,
          userId: null,
          status: "closed"
        });
        io.to("open").emit(`company-${ticket.companyId}-ticket`, {
          action: "delete",
          ticket,
          ticketId: ticket.id
        });
        io.to(ticket.status)
          .to(ticket.id.toString())
          .emit(`company-${ticket.companyId}-ticket`, {
            action: "update",
            ticket,
            ticketId: ticket.id
          });
      } else {
        if (!isNil(complationMessage) && complationMessage !== "") {
          if (
            ticket.status !== "pending" ||
            (ticket.status === "pending" &&
              sendFarewellWaitingTicket?.value === "enabled")
          ) {
            const body = `\u200e${complationMessage}`;
            await SendWhatsAppMessage({ body, ticket });
          }
        }
        await ticketTraking.update({
          finishedAt: moment().toDate(),
          rated: true
        });
        await ticket.update({
          queueId: null,
          userId: null,
          status: "closed",
          amountUsedBotQueues: 0
        });
        io.to("open").emit(`company-${ticket.companyId}-ticket`, {
          action: "delete",
          ticket,
          ticketId: ticket.id
        });
        io.to(ticket.status)
          .to(ticket.id.toString())
          .emit(`company-${ticket.companyId}-ticket`, {
            action: "update",
            ticket,
            ticketId: ticket.id
          });
      }
    }
  }
};
const handleMessage = async (
  msg: proto.IWebMessageInfo,
  wbot: Session,
  companyId: number
): Promise<void> => {
  if (!isValidMsg(msg)) {
    return;
  }
  try {
    let msgContact: IMe;
    let groupContact: Contact | undefined;
    const bodyMessage = getBodyMessage(msg);
    const msgType = getTypeMessage(msg);
    if (msgType === "protocolMessage") return;
    const hasMedia =
      msg.message?.audioMessage ||
      msg.message?.imageMessage ||
      msg.message?.videoMessage ||
      msg.message?.documentMessage ||
      msg.message.stickerMessage ||
      msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
        ?.imageMessage ||
      msg.message?.documentWithCaptionMessage?.message?.documentMessage ||
      msg.message?.viewOnceMessageV2?.message?.imageMessage;
    if (msg.key.fromMe) {
      if (
        !hasMedia &&
        msgType !== "conversation" &&
        msgType !== "extendedTextMessage" &&
        msgType !== "vcard" &&
        msgType !== "reactionMessage" &&
        msgType !== "ephemeralMessage" &&
        msgType !== "protocolMessage" &&
        msgType !== "viewOnceMessage"
      )
        return;
      msgContact = await getContactMessage(msg, wbot);
    } else {
      msgContact = await getContactMessage(msg, wbot);
    }
    const isGroup = msg.key.remoteJid?.endsWith("@g.us");
    const msgIsGroupBlock = await Settings.findOne({
      where: { key: "CheckMsgIsGroup", companyId }
    });
    if (msgIsGroupBlock?.value === "enabled" && isGroup) return;
    if (isGroup) {
      const grupoMeta = await wbot.groupMetadata(msg.key.remoteJid);
      const msgGroupContact = { id: grupoMeta.id, name: grupoMeta.subject };
      groupContact = await verifyContact(msgGroupContact, wbot, companyId);
    }
    const whatsapp = await ShowWhatsAppService(wbot.id!, companyId);
    const contact = await verifyContact(msgContact, wbot, companyId);
    let unreadMessages = 0;
    if (msg.key.fromMe) {
      await cacheLayer.set(`contacts:${contact.id}:unreads`, "0");
    } else {
      const unreads = await cacheLayer.get(`contacts:${contact.id}:unreads`);
      unreadMessages = +unreads + 1;
      await cacheLayer.set(
        `contacts:${contact.id}:unreads`,
        `${unreadMessages}`
      );
    }
    const _ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      companyId,
      groupContact
    );
    if (
      unreadMessages === 0 &&
      whatsapp.farewellMessage &&
      formatBody(whatsapp.farewellMessage, _ticket) === bodyMessage
    ) {
      return;
    }
    const ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      companyId,
      groupContact
    );
    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      whatsappId: whatsapp?.id
    });
    try {
      if (!msg.key.fromMe) {
        if (ticketTraking !== null && verifyRating(ticketTraking)) {
          handleRating(msg, ticket, ticketTraking);
          return;
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }
    if (hasMedia) {
      await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(msg, ticket, contact);
    }
    const currentSchedule = await VerifyCurrentSchedule(companyId);
    const scheduleType = await Setting.findOne({
      where: { companyId, key: "scheduleType" }
    });
    try {
      if (!msg.key.fromMe && scheduleType && !ticket.isGroup) {
        if (
          scheduleType.value === "company" &&
          !isNil(currentSchedule) &&
          (!currentSchedule || currentSchedule.inActivity === false)
        ) {
          if (whatsapp.outOfHoursMessage !== "") {
            const body = `${whatsapp.outOfHoursMessage}`;
            const debouncedSentMessage = debounce(
              async () => {
                await wbot.sendMessage(
                  `${ticket.contact.number}@${
                    ticket.isGroup ? "g.us" : "s.whatsapp.net"
                  }`,
                  { text: body }
                );
              },
              1000,
              ticket.id
            );
            debouncedSentMessage();
            return;
          }
          return;
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }
    if (
      !ticket.queue &&
      !isGroup &&
      !msg.key.fromMe &&
      !ticket.userId &&
      whatsapp.queues.length >= 1
    ) {
      await verifyQueue(wbot, msg, ticket, contact);
    }
    if (
      getTypeMessage(msg) === "audioMessage" &&
      !msg.key.fromMe &&
      !isGroup &&
      !contact.acceptAudioMessage
    ) {
      const sentMessage = await wbot.sendMessage(
        `${contact.number}@c.us`,
        {
          text: "*Asistente Virtual*:\nInfelizmente, não podemos ouvir ou enviar áudio através deste canal de serviço, envie uma mensagem de *texto*."
        },
        {
          quoted: {
            key: msg.key,
            message: { extendedTextMessage: msg.message.extendedTextMessage }
          }
        }
      );
      await verifyMessage(sentMessage, ticket, contact);
    }
    if (
      ticket.queue &&
      ticket.queueId &&
      !msg.key.fromMe &&
      !ticket.queue.typebotUrl &&
      !ticket.queue.typebotName
    ) {
      if (!ticket.user) {
        await sayChatbot(ticket.queueId, wbot, ticket, contact, msg);
      }
    }
    if (ticket.queueId && !msg.key.fromMe && !isGroup) {
      if (!ticket.user) {
        await verifyTypebot(wbot, msg, ticket, contact);
      }
    }
    await ticket.reload();
    try {
      if (!msg.key.fromMe && scheduleType && ticket.queueId !== null) {
        const queue = await Queue.findByPk(ticket.queueId);
        const { schedules }: any = queue;
        const now = moment();
        const weekday = now.format("dddd").toLowerCase();
        let schedule = null;
        if (Array.isArray(schedules) && schedules.length > 0) {
          schedule = schedules.find(
            s =>
              s.weekdayEn === weekday &&
              s.startTime !== "" &&
              s.startTime !== null &&
              s.endTime !== "" &&
              s.endTime !== null
          );
        }
        if (
          scheduleType.value === "queue" &&
          queue.outOfHoursMessage !== null &&
          queue.outOfHoursMessage !== "" &&
          !isNil(schedule)
        ) {
          const startTime = moment(schedule.startTime, "HH:mm");
          const endTime = moment(schedule.endTime, "HH:mm");
          if (now.isBefore(startTime) || now.isAfter(endTime)) {
            const body = `${queue.outOfHoursMessage}`;
            const debouncedSentMessage = debounce(
              async () => {
                await wbot.sendMessage(
                  `${ticket.contact.number}@${
                    ticket.isGroup ? "g.us" : "s.whatsapp.net"
                  }`,
                  { text: body }
                );
              },
              1000,
              ticket.id
            );
            debouncedSentMessage();
            return;
          }
        }
      }
    } catch (e) {
      Sentry.captureException(e);
      console.log(e);
    }
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
    logger.error(`Error handling whatsapp message: Err: ${err}`);
  }
};
const handleMsgAck = async (
  msg: WAMessage,
  chat: number | null | undefined
) => {
  await new Promise(r => setTimeout(r, 500));
  const io = getIO();
  try {
    const messageToUpdate = await Message.findByPk(msg.key.id, {
      include: [
        "contact",
        { model: Message, as: "quotedMsg", include: ["contact"] }
      ]
    });
    if (!messageToUpdate) return;
    await messageToUpdate.update({ ack: chat });
    io.to(messageToUpdate.ticketId.toString()).emit(
      `company-${messageToUpdate.companyId}-appMessage`,
      { action: "update", message: messageToUpdate }
    );
  } catch (err) {
    Sentry.captureException(err);
    logger.error(`Error handling message ack. Err: ${err}`);
  }
};
const verifyRecentCampaign = async (
  message: proto.IWebMessageInfo,
  companyId: number
) => {
  if (!isValidMsg(message)) {
    return;
  }
  if (!message.key.fromMe) {
    const number = message.key.remoteJid.replace(/\D/g, "");
    const campaigns = await Campaign.findAll({
      where: { companyId, status: "EM_ANDAMENTO", confirmation: true }
    });
    if (campaigns) {
      const ids = campaigns.map(c => c.id);
      const campaignShipping = await CampaignShipping.findOne({
        where: { campaignId: { [Op.in]: ids }, number, confirmation: null }
      });
      if (campaignShipping) {
        await campaignShipping.update({
          confirmedAt: moment(),
          confirmation: true
        });
        await campaignQueue.add(
          "DispatchCampaign",
          {
            campaignShippingId: campaignShipping.id,
            campaignId: campaignShipping.campaignId
          },
          { delay: parseToMilliseconds(randomValue(0, 10)) }
        );
      }
    }
  }
};
const verifyCampaignMessageAndCloseTicket = async (
  message: proto.IWebMessageInfo,
  companyId: number
) => {
  if (!isValidMsg(message)) {
    return;
  }
  const io = getIO();
  const body = getBodyMessage(message);
  const isCampaign = /\u200c/.test(body);
  if (message.key.fromMe && isCampaign) {
    const messageRecord = await Message.findOne({
      where: { id: message.key.id!, companyId }
    });
    const ticket = await Ticket.findByPk(messageRecord.ticketId);
    await ticket.update({ status: "closed", amountUsedBotQueues: 0 });
    io.to("open").emit(`company-${ticket.companyId}-ticket`, {
      action: "delete",
      ticket,
      ticketId: ticket.id
    });
    io.to(ticket.status)
      .to(ticket.id.toString())
      .emit(`company-${ticket.companyId}-ticket`, {
        action: "update",
        ticket,
        ticketId: ticket.id
      });
  }
};
const filterMessages = (msg: WAMessage): boolean => {
  if (msg.message?.protocolMessage) return false;
  if (
    [
      WAMessageStubType.REVOKE,
      WAMessageStubType.E2E_DEVICE_CHANGED,
      WAMessageStubType.E2E_IDENTITY_CHANGED,
      WAMessageStubType.CIPHERTEXT
    ].includes(msg.messageStubType as WAMessageStubType)
  )
    return false;
  return true;
};

async function enviarWebhook(numero: any, menssagem: any, urlWebhook: any) {
  try {
    // Se você precisar enviar dados no corpo da solicitação, você pode passá-los como um objeto para o segundo parâmetro.
    const dadosDoWebhook = {
      NUMERO: numero,
      MENSSAGEM: menssagem
    };

    const resposta = await axios.post(urlWebhook, dadosDoWebhook);

    console.log("Resposta do Webhook:", resposta.data);
  } catch (erro) {
    console.error("Erro ao enviar o Webhook:", erro.message);
  }
}
export const wbotMessageListenerWeb = async (req: Request, res: Response): Promise<void> => {
  try {
    const wbot: Session = req.body.wbot;
    const companyId: number = req.body.companyId;

    const messages = req.body.messages;

    // Verifica se a requisição contém o companyId e as mensagens
    if (!companyId || !messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Invalid request format' });
    }
    const filteredMessages = messages.filter(filterMessages);
    // Processa as mensagens recebidas
    for (const message of messages) {
      const messageExists = await Message.count({
        where: { id: message.key.id!, companyId }
      });
      
      if (!messageExists) await handleMessage(message, wbot, companyId);
      await verifyRecentCampaign(message, companyId);
      await verifyCampaignMessageAndCloseTicket(message, companyId);
   
      // Aqui você pode adicionar a lógica para lidar com cada mensagem, como armazená-las em um banco de dados, enviar notificações, etc.
      console.log('Nova mensagem recebida:', message);
    }

    // Responde à chamada de API com sucesso
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    // Responde à chamada de API com erro
    res.status(500).json({ error: 'Internal server error' });
  }
};
const wbotMessageListener = (wbot: Session, companyId: number): void => {
  wbot.ev.on("messages.upsert", async ({ messages }) => {
    const filteredMessages = messages.filter(filterMessages);

    for (const message of filteredMessages) {
      const urlRequest = await Setting.findOne({
        where: {
          key: "n8nUrl",
          companyId: companyId
        }
      });
      const messageExists = await Message.count({
        where: { id: message.key.id!, companyId }
      });
      if (!message.key.remoteJid.endsWith("@g.us") && !message.key.fromMe) {
        const urlWebhook = urlRequest?.value;
        const numero = message.key.remoteJid.split("@")[0];
        const menssagem = message.message.conversation;
        enviarWebhook(numero, menssagem, urlWebhook);
      }

      if (!messageExists) await handleMessage(message, wbot, companyId);
      await verifyRecentCampaign(message, companyId);
      await verifyCampaignMessageAndCloseTicket(message, companyId);
    }
  });

  wbot.ev.on("messages.update", (messageUpdate: WAMessageUpdate[]) => {
    if (messageUpdate.length === 0) return;
    messageUpdate.forEach(async (message: WAMessageUpdate) => {
      (wbot as WASocket)!.readMessages([message.key]);
      const msgUp = { ...messageUpdate };
      if (
        msgUp["0"]?.update.messageStubType === 1 &&
        msgUp["0"]?.key.remoteJid !== "status@broadcast"
      ) {
        MarkDeleteWhatsAppMessage(
          msgUp["0"]?.key.remoteJid,
          null,
          msgUp["0"]?.key.id,
          companyId
        );
      }
      handleMsgAck(message, message.update.status);
    });
  });
  wbot.ev.on("groups.update", (groupUpdate: GroupMetadata[]) => {
    if (groupUpdate.length === 0) return;
    groupUpdate.forEach(async (group: GroupMetadata) => {
      const number = group.id.replace(/\D/g, "");
      const nameGroup = group.subject || number;
      const contactData = {
        name: nameGroup,
        number: number,
        isGroup: group.id.includes("g.us"),
        companyId: companyId
      };
      const contact = await CreateOrUpdateContactService(contactData);
    });
  });
};

export { wbotMessageListener, handleMessage };
