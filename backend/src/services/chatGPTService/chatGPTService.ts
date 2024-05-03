import fetch from "node-fetch";
import dotenv from "dotenv";
import { getGreetingMessage } from "./getGreetingMessage";
dotenv.config();
export const chatGPTService = async (userMessage, whatsappId) => {
  console.log("Iniciando chatGPTService");
  try {
    const greetingMessage = await getGreetingMessage(whatsappId);
    console.log("Mensagem de saudação: ", greetingMessage);
    const fullMessage = `${greetingMessage}\n${userMessage}`;
    console.log("Mensagem completa enviada para OpenAI: ", fullMessage);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: fullMessage }]
      })
    });
    console.log("Status da resposta da OpenAI: ", response.status);
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log("Resposta da OpenAI: ", data);
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Erro ao comunicar com a API da OpenAI", error);
    throw new Error("Falha ao obter resposta do ChatGPT");
  }
};
export default chatGPTService;
