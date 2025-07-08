import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

interface SerasaExperianAPIConfig {
  clientId: string;
  clientSecret: string;
  environment?: 'production' | 'homologation';
}

interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  scope: string[];
}

interface FraudScoreRequestPerson {
  document: string;
  email?: string;
  address?: {
    zipCode: string;
  };
  phones?: Array<{
    areaCode: string;
    number: string;
  }>;
}

interface FraudScoreRequestCompany {
  document: string;
  email?: string;
  address?: {
    zipCode: string;
  };
  phones?: Array<{
    areaCode: string;
    number: string;
  }>;
}

interface FraudScoreResponseItem {
  document: string;
  scores: Array<{
    model: string;
    score: number;
    recomendationRiskEnum: string;
  }>;
}

interface FraudScoreResponse {
  enrichments: FraudScoreResponseItem[];
}

interface ReportParameter {
  name: string;
  value: string;
}

interface DadosAvulsosRequest {
  reportName: string;
  optionalFeatures?: string;
  reportParameters?: ReportParameter[];
}

interface DadosAvulsosPFResponse {
  // Definir a estrutura de resposta para Dados Avulsos PF com base na documentação
  // Exemplo parcial, precisa ser completado com base na documentação completa
  cpf: string;
  nome: string;
  features?: {
    acao?: any; // Ações judiciais e falência
    protesto?: any; // Protestos nacionais
    participacaoSocietaria?: any; // Participações societárias
    anotacoesSPC?: any; // Anotações no SPC
    consultasSPC?: any; // Consultas no SPC
    alertaObito?: any; // Alerta de óbito
    scorePositivo?: any; // Score Positivo
    consultasSerasa?: any; // Consultas feitas à Serasa Experian
    indiceRelacionamentoMercadoSetorPF?: any; // Índice de relacionamento com mercado e setor
    atributoCustomizado?: any; // Atributos diversos
    scoreFraudePF?: any; // Score de fraude
    scoreCustomizado?: any; // Scores customizados ou especializados
    rendaEstimadaPF?: any; // Renda estimada padrão
    pontualidadePagamentoPF?: any; // Pontualidade de Pagamento
    capacidadePagamentoPF?: any; // Capacidade de Pagamento
    comprometimentoRendaPF?: any; // Comprometimento de Renda
  };
}

interface DadosAvulsosPJResponse {
  // Definir a estrutura de resposta para Dados Avulsos PJ com base na documentação
  // Exemplo parcial, precisa ser completado com base na documentação completa
  cnpj: string;
  razaoSocial: string;
  features?: {
    juntaComercial?: any; // Dado específico para SPC
    acao?: any; // Ações judiciais e falências
    protesto?: any; // Protestos nacionais
    qsa?: any; // Quadro social e administrativo
    participacoes?: any; // Participações em outras empresas
    consultasSerasa?: any; // Consultas à Serasa Experian
    scorePositivo?: any; // Serasa Score Empresas
    limiteCredito?: any; // Limite de crédito
    pontualidadePagamento?: any; // Pontualidade de pagamento
    gastoEstimadoPositivo?: any; // Gasto estimado
    faturamentoEstimadoPositivo?: any; // Faturamento estimado
    capacidadeMensalPagamento?: any; // Capacidade mensal de pagamento
    indiceRelacionamentoMercadoSetorPJ?: any; // Índice de relacionamento com mercado e setor
    scoreFraudePJ?: any; // Score de fraude
    scoreCustomizado?: any; // Scores customizados
    acaoFacon?: any; // Acao Facon
  };
}

class SerasaExperianAPI {
  private clientId: string;
  private clientSecret: string;
  private environment: 'production' | 'homologation';
  private accessToken: string | null = null;
  private tokenExpiresIn: number = 0;
  private api: AxiosInstance;

  constructor(config: SerasaExperianAPIConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.environment = config.environment || 'homologation';

    this.api = axios.create({
      baseURL: this.environment === 'production'
        ? 'https://api.serasaexperian.com.br'
        : 'https://uat-api.serasaexperian.com.br',
    });

    this.api.interceptors.request.use(async (request) => {
      if (!this.accessToken || Date.now() >= this.tokenExpiresIn) {
        await this.authenticate();
      }
      if (this.accessToken) {
        request.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return request;
    });
  }

  private async authenticate(): Promise<void> {
    const authUrl = `/security/iam/v1/client-identities/login`;
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    try {
      const response = await axios.post<AuthResponse>(
        `${this.api.defaults.baseURL}${authUrl}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`,
          },
        }
      );

      this.accessToken = response.data.accessToken;
      this.tokenExpiresIn = Date.now() + (parseInt(response.data.expiresIn) * 1000) - 60000; // 1 minute buffer
      console.log('Token de autenticação gerado com sucesso.');
    } catch (error) {
      console.error('Erro ao autenticar com a API do Serasa Experian:', error);
      throw new Error('Falha na autenticação com a API do Serasa Experian.');
    }
  }

  public async getConsumerFraudScore(data: FraudScoreRequestPerson): Promise<FraudScoreResponse> {
    try {
      const response = await this.api.post<FraudScoreResponse>('/people/enrichment', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar Consumer Fraud Score:', error);
      throw error;
    }
  }

  public async getBusinessFraudScore(data: FraudScoreRequestCompany): Promise<FraudScoreResponse> {
    try {
      const response = await this.api.post<FraudScoreResponse>('/companies/enrichment', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar Business Fraud Score:', error);
      throw error;
    }
  }

  public async getDadosAvulsosPF(data: DadosAvulsosRequest, cpf: string, retailerDocumentId?: string): Promise<DadosAvulsosPFResponse> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'X-Document-Id': cpf,
      };
      if (retailerDocumentId) {
        headers['X-Retailer-Document-Id'] = retailerDocumentId;
      }
      const response = await this.api.post<DadosAvulsosPFResponse>('/consumer-information-report', data, { headers });
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar Dados Avulsos PF:', error);
      throw error;
    }
  }

  public async getDadosAvulsosPJ(data: DadosAvulsosRequest, cnpj: string, retailerDocumentId?: string): Promise<DadosAvulsosPJResponse> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
        'X-Document-Id': cnpj,
      };
      if (retailerDocumentId) {
        headers['X-Retailer-Document-Id'] = retailerDocumentId;
      }
      const response = await this.api.post<DadosAvulsosPJResponse>('/business-information-report', data, { headers });
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar Dados Avulsos PJ:', error);
      throw error;
    }
  }
}

export default SerasaExperianAPI;


