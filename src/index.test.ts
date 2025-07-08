// @jest-environment node
import SerasaExperianAPI from './index';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockApiInstance = {
  post: jest.fn(),
  defaults: { baseURL: 'https://uat-api.serasaexperian.com.br' },
  interceptors: {
    request: { use: jest.fn() },
  },
};

const mockConfig = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  environment: 'homologation' as const,
};

describe('SerasaExperianAPI', () => {
  let api: SerasaExperianAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock axios.create para retornar a instância mockada
    (mockedAxios.create as jest.Mock).mockReturnValue(mockApiInstance);
    api = new SerasaExperianAPI(mockConfig);
  });

  describe('authenticate', () => {
    it('deve autenticar e armazenar o token', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          accessToken: 'token123',
          tokenType: 'bearer',
          expiresIn: '3600',
          scope: ['scope1'],
        },
      });
      // Forçar autenticação
      // @ts-ignore
      await api.authenticate();
      // @ts-ignore
      expect(api.accessToken).toBe('token123');
    });

    it('deve lançar erro se a autenticação falhar', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Auth error'));
      // @ts-ignore
      await expect(api.authenticate()).rejects.toThrow('Falha na autenticação com a API do Serasa Experian.');
    });
  });

  describe('getConsumerFraudScore', () => {
    it('deve retornar dados de score de fraude para pessoa física', async () => {
      const mockResponse = { enrichments: [] };
      mockApiInstance.post.mockResolvedValueOnce({ data: mockResponse });
      const data = { document: '12345678900' };
      const result = await api.getConsumerFraudScore(data);
      expect(result).toEqual(mockResponse);
    });

    it('deve lançar erro em caso de falha', async () => {
      mockApiInstance.post.mockRejectedValueOnce(new Error('Erro API'));
      const data = { document: '12345678900' };
      await expect(api.getConsumerFraudScore(data)).rejects.toThrow('Erro API');
    });
  });

  describe('getBusinessFraudScore', () => {
    it('deve retornar dados de score de fraude para empresa', async () => {
      const mockResponse = { enrichments: [] };
      mockApiInstance.post.mockResolvedValueOnce({ data: mockResponse });
      const data = { document: '12345678000199' };
      const result = await api.getBusinessFraudScore(data);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDadosAvulsosPF', () => {
    it('deve retornar dados avulsos PF', async () => {
      const mockResponse = { cpf: '12345678900', nome: 'Fulano' };
      mockApiInstance.post.mockResolvedValueOnce({ data: mockResponse });
      const data = { reportName: 'RELATORIO_TESTE' };
      const result = await api.getDadosAvulsosPF(data, '12345678900');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDadosAvulsosPJ', () => {
    it('deve retornar dados avulsos PJ', async () => {
      const mockResponse = { cnpj: '12345678000199', razaoSocial: 'Empresa X' };
      mockApiInstance.post.mockResolvedValueOnce({ data: mockResponse });
      const data = { reportName: 'RELATORIO_TESTE' };
      const result = await api.getDadosAvulsosPJ(data, '12345678000199');
      expect(result).toEqual(mockResponse);
    });
  });
}); 