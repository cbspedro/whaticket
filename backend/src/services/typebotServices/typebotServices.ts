import axios, { AxiosRequestConfig } from "axios";

export class TypebotService {
  private readonly apiUrl: string;
  private readonly token: string;

  constructor(apiUrl: string, token: string) {
    this.apiUrl = apiUrl;
    this.token = token;
  }

  async getWorkspaces(): Promise<any> {
    const config: AxiosRequestConfig = {
      method: "get",
      url: `${this.apiUrl}/api/v1/workspaces`,
      headers: {
        Authorization: `Bearer ${this.token}`
      }
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async startChat(publicId: string, message: string, queueValues: string[], nome: string, numero: string, ticketId: number): Promise<any> {
    const startChatConfig: AxiosRequestConfig = {
      method: "post",
      url: `${this.apiUrl}/api/v1/typebots/${publicId}/startChat`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`
      },
      data: {
        message,
        isStreamEnabled: true,
        isOnlyRegistering: false,
        prefilledVariables: {
          "fila1": queueValues[0] || "",
          "fila2": queueValues[1] || "",
          "fila3": queueValues[2] || "",
          "fila4": queueValues[3] || "",
          "fila5": queueValues[4] || "",
          "fila6": queueValues[5] || "",
          "fila7": queueValues[6] || "",
          "fila8": queueValues[7] || "",
          "fila9": queueValues[8] || "",
          "fila10": queueValues[9] || "",
          "fila11": queueValues[10] || "",
          "fila12": queueValues[11] || "",
          "fila13": queueValues[12] || "",
          "fila14": queueValues[13] || "",
          "fila15": queueValues[14] || "",
          "fila16": queueValues[15] || "",
          "fila17": queueValues[16] || "",
          "fila18": queueValues[17] || "",
          "fila19": queueValues[18] || "",
          "fila20": queueValues[19] || "",
          "nome": nome,
          "numero": numero,
          "ticketId": ticketId,
        }
      }
    };
  
    try {
      const response = await axios(startChatConfig);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async startNewChat(publicId: string, queueValues: string[], nome: string, numero: string): Promise<any> {
    const startChatConfig: AxiosRequestConfig = {
      method: "post",
      url: `${this.apiUrl}/api/v1/typebots/${publicId}/startChat`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`
      },
      data: {
        isStreamEnabled: true,
        isOnlyRegistering: true,
        prefilledVariables: {
          "fila1": queueValues[0] || "",
          "fila2": queueValues[1] || "",
          "fila3": queueValues[2] || "",
          "fila4": queueValues[3] || "",
          "fila5": queueValues[4] || "",
          "fila6": queueValues[5] || "",
          "fila7": queueValues[6] || "",
          "fila8": queueValues[7] || "",
          "fila9": queueValues[8] || "",
          "fila10": queueValues[9] || "",
          "fila11": queueValues[10] || "",
          "fila12": queueValues[11] || "",
          "fila13": queueValues[12] || "",
          "fila14": queueValues[13] || "",
          "fila15": queueValues[14] || "",
          "fila16": queueValues[15] || "",
          "fila17": queueValues[16] || "",
          "fila18": queueValues[17] || "",
          "fila19": queueValues[18] || "",
          "fila20": queueValues[19] || "",
          "nome": nome,
          "numero": numero,
        }
      }
    };
  
    try {
      const response = await axios(startChatConfig);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  

  async continueChat(sessionId: string, message: string): Promise<any> {
    const continueChatConfig: AxiosRequestConfig = {
      method: "post",
      url: `${this.apiUrl}/api/v1/sessions/${sessionId}/continueChat`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`
      },
      data: {
        message
      }
    };

    try {
      const response = await axios(continueChatConfig);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
