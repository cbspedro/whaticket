import fs from 'fs';
import { Op } from "sequelize";
import User from "../../models/User";
import Chat from "../../models/Chat";
import ChatUser from "../../models/ChatUser";
import ChatMessage from "../../models/ChatMessage";

export interface ChatMessageData {
  senderId: number;
  chatId: number;
  message: string;
  mediaPath?:string | undefined | null;
  mediaName?:string | undefined | null;
  typeFile?:string | undefined | null;
}

const encodeImageToBase64 = async(imagePath) => {
  try {
    // Lê a imagem do sistema de arquivos
    const imageBuffer = fs.readFileSync(imagePath);

    // Converte a imagem para base64
    const base64Image = imageBuffer.toString('base64');

    return base64Image;
  } catch (error) {
    console.error('Erro ao codificar a imagem em base64:', error);
    return null;
  }
};

const converterBase64 = async (mediaPath: string, typeFile:string) =>{

  if(mediaPath !== null){
      if (mediaPath) {
          const imagePath = `public\\${mediaPath}`;
          const base64Image = await encodeImageToBase64(imagePath);
          
          if (base64Image) {
            // Retorna a imagem codificada em base64
              const imageBase64 = `data:${typeFile};base64,`+base64Image

            return imageBase64;
          }
          return null;
        }
      }
      
      return null;
    };
    
    export default async function CreateMessageService({
      senderId,
      chatId,
      message,
      mediaPath,
      mediaName,
      typeFile
    }: ChatMessageData) {
      const base64 = await converterBase64(mediaPath,typeFile)


    const newMessage = await ChatMessage.create({
      senderId,
      chatId,
      message,
      mediaPath: base64,
      mediaName,
    });

  await newMessage.reload({
    include: [
      { model: User, as: "sender", attributes: ["id", "name"] },
      {
        model: Chat,
        as: "chat",
        include: [{ model: ChatUser, as: "users" }]
      }
    ]
  });

  const sender = await User.findByPk(senderId);

  const lastMessage = `${sender.name}: ${message}` + (mediaName ? ` - Media: ${mediaName}` : '');

  await newMessage.chat.update({ lastMessage });

  const chatUsers = await ChatUser.findAll({
    where: { chatId }
  });

  for (let chatUser of chatUsers) {
    if (chatUser.userId === senderId) {
      await chatUser.update({ unreads: 0 });
    } else {
      await chatUser.update({ unreads: chatUser.unreads + 1 });
    }
  }

  return newMessage;
}
