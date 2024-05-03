import axios, { AxiosRequestConfig } from "axios";

export class FlowiseServices {
  private readonly urlFlow: string;
  private readonly tokenFlow: string;
  

  constructor(urlFlow: string, tokenFlow: string) {
    this.urlFlow = urlFlow;
    this.tokenFlow = tokenFlow;
    console.log(urlFlow);
  }

  async startFlow(question: string): Promise<any> {
    const flowResposta: AxiosRequestConfig = {
      method: "post",
      url: `${this.urlFlow}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.tokenFlow}`
      },
      data: {
        question,
      }
    };
  
    try {
      const response = await axios(flowResposta);
      console.log(response.data);
      return response.data;
      
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
 }


