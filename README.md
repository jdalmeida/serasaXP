# Serasa Experian API Library

Uma biblioteca TypeScript para consumir as APIs do Serasa Experian, com foco inicial em score de crédito e dados para CNPJ e CPF.

## Instalação

```bash
npm install serasa-experian-api-library
# ou
yarn add serasa-experian-api-library
```

## Uso

### Autenticação

Para usar a biblioteca, você precisará do seu `CLIENT_ID` e `CLIENT_SECRET` fornecidos pela Serasa Experian. É recomendado armazená-los em variáveis de ambiente (`.env`).

```typescript
import SerasaExperianAPI from 'serasa-experian-api-library';

// Carrega as variáveis de ambiente (se estiver usando dotenv)
// require('dotenv').config();

const clientId = process.env.SERASA_CLIENT_ID || 'YOUR_CLIENT_ID';
const clientSecret = process.env.SERASA_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';

const serasaApi = new SerasaExperianAPI({
  clientId,
  clientSecret,
  environment: 'homologation', // ou 'production'
});
```

### Exemplos de Uso

#### Consultar Score de Fraude para Pessoa Física (CPF)

```typescript
import SerasaExperianAPI from 'serasa-experian-api-library';

// ... (configuração da instância da API)

async function consultarScoreFraudePF() {
  try {
    const data = {
      person: {
        document: '00000000000', // Substitua pelo CPF real
      },
      score: ['FRAUD_SCORE_PF'],
    };
    const response = await serasaApi.getConsumerFraudScore(data);
    console.log('Resposta Score de Fraude PF:', response);
  } catch (error) {
    console.error('Erro ao consultar Score de Fraude PF:', error);
  }
}

consultarScoreFraudePF();
```

#### Consultar Score de Fraude para Pessoa Jurídica (CNPJ)

```typescript
import SerasaExperianAPI from 'serasa-experian-api-library';

// ... (configuração da instância da API)

async function consultarScoreFraudePJ() {
  try {
    const data = {
      company: {
        document: '00000000000000', // Substitua pelo CNPJ real
      },
      score: ['FRAUD_SCORE_PJ'],
    };
    const response = await serasaApi.getBusinessFraudScore(data);
    console.log('Resposta Score de Fraude PJ:', response);
  } catch (error) {
    console.error('Erro ao consultar Score de Fraude PJ:', error);
  }
}

consultarScoreFraudePJ();
```

#### Consultar Dados Avulsos para Pessoa Física (CPF)

```typescript
import SerasaExperianAPI from 'serasa-experian-api-library';

// ... (configuração da instância da API)

async function consultarDadosAvulsosPF() {
  try {
    const cpf = '00000000000'; // Substitua pelo CPF real
    const data = {
      reportName: 'RELATORIO_DADOS_AVULSOS_PF',
      optionalFeatures: 'SCORE_POSITIVO,RENDA_ESTIMADA_PF', // Exemplo de features opcionais
      // reportParameters: [{ name: 'VAR_1', value: 'VALUE_1' }], // Se necessário
    };
    const response = await serasaApi.getDadosAvulsosPF(data, cpf);
    console.log('Resposta Dados Avulsos PF:', response);
  } catch (error) {
    console.error('Erro ao consultar Dados Avulsos PF:', error);
  }
}

consultarDadosAvulsosPF();
```

#### Consultar Dados Avulsos para Pessoa Jurídica (CNPJ)

```typescript
import SerasaExperianAPI from 'serasa-experian-api-library';

// ... (configuração da instância da API)

async function consultarDadosAvulsosPJ() {
  try {
    const cnpj = '00000000000000'; // Substitua pelo CNPJ real
    const data = {
      reportName: 'RELATORIO_DADOS_AVULSOS_PJ',
      optionalFeatures: 'SCORE_POSITIVO,FATURAMENTO_ESTIMADO_POSITIVO', // Exemplo de features opcionais
      // reportParameters: [{ name: 'VAR_1', value: 'VALUE_1' }], // Se necessário
    };
    const response = await serasaApi.getDadosAvulsosPJ(data, cnpj);
    console.log('Resposta Dados Avulsos PJ:', response);
  } catch (error) {
    console.error('Erro ao consultar Dados Avulsos PJ:', error);
  }
}

consultarDadosAvulsosPJ();
```

## Contribuição

Sinta-se à vontade para contribuir com melhorias, correções de bugs ou a adição de novas APIs. Crie um pull request com suas alterações.

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.


