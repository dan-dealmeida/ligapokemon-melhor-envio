export const SERVICES = [
  { id: 17, name: 'Correios Mini Envios', carrier: 'Correios', code: 'MINI' },
  { id: 1, name: 'Correios PAC', carrier: 'Correios', code: 'PAC' },
  { id: 2, name: 'Correios SEDEX', carrier: 'Correios', code: 'SEDEX' },
  { id: 3, name: 'Jadlog .Package', carrier: 'Jadlog', code: '.Package' },
  { id: 4, name: 'Jadlog .Com', carrier: 'Jadlog', code: '.Com' },
];

export const DEFAULT_SENDER = {
  name: import.meta.env.VITE_SENDER_NAME || 'PokeStore Brasil TCG',
  company: import.meta.env.VITE_SENDER_COMPANY || 'PokeStore Colecionáveis LTDA',
  document: import.meta.env.VITE_SENDER_DOCUMENT || '32.145.987/0001-50',
  email: import.meta.env.VITE_SENDER_EMAIL || 'contato@pokestorebrasil.com.br',
  phone: import.meta.env.VITE_SENDER_PHONE || '11988887777',
  postal_code: import.meta.env.VITE_SENDER_CEP || '01310-100',
  address: import.meta.env.VITE_SENDER_ADDRESS || 'Avenida Paulista',
  number: import.meta.env.VITE_SENDER_NUMBER || '1000',
  complement: import.meta.env.VITE_SENDER_COMPLEMENT || 'Sala 42',
  district: import.meta.env.VITE_SENDER_DISTRICT || 'Bela Vista',
  city: import.meta.env.VITE_SENDER_CITY || 'São Paulo',
  state_abbr: import.meta.env.VITE_SENDER_UF || 'SP',
};

export const DEFAULT_API_TOKEN = import.meta.env.VITE_MELHOR_ENVIO_TOKEN || '';
export const DEFAULT_ENV = import.meta.env.VITE_MELHOR_ENVIO_ENV || 'sandbox';

export const DEFAULT_PACKAGE = {
  height: 2, // cm (envelope bolha padrão para singles / cartas)
  width: 11, // cm
  length: 16, // cm
  weight: 0.1, // kg (100g mínimo seguro)
};

export const MOCK_CSV_ORDERS = `Pedido;Destinatário;CPF;Telefone;CEP;Endereço;Número;Complemento;Bairro;Cidade;UF;Valor Total
#LP-8921;Lucas Oliveira Silveira;123.456.789-00;11987654321;04571-010;Avenida Engenheiro Luís Carlos Berrini;500;Apto 102;Itaim Bibi;São Paulo;SP;189.90
#LP-8922;Mariana Santos Costa;987.654.321-99;21998761234;22041-001;Rua Barata Ribeiro;200;;Copacabana;Rio de Janeiro;RJ;450.00
#LP-8923;Rafael Albuquerque;456.789.123-55;31988776655;30130-100;Avenida Afonso Pena;1500;Bloco B;Centro;Belo Horizonte;MG;85.50
#LP-8924;Camila Souza Mendes; ;41977665544;80020-310;Rua Marechal Deodoro;100;Conj 12;Centro;Curitiba;PR;320.00
#LP-8925;Gabriel Duarte Lima;321.654.987-11; ;01001-000;Praça da Sé;S/N;;Sé;São Paulo;SP;65.00`;

