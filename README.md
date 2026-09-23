# 🚀 LigaPokemon ➔ Melhor Envio (`Rocket TCG Bridge`)

Conversor e despachante inteligente de pedidos exportados da **LigaPokemon / LigaMagic (CSV)** diretamente para o **Carrinho do Melhor Envio** (via API oficial v2 ou exportação em lote por planilha).

Ideal para lojistas e vendedores de **Pokémon TCG / Magic: The Gathering** que enviam cartas avulsas (*singles*) e produtos selados pelos Correios (Mini Envios, PAC, SEDEX) ou Jadlog.

---

## ✨ Funcionalidades

- **Importação Inteligente de CSV**:
  - Suporta arquivos separados por ponto-e-vírgula (`;`) ou vírgula (`,`).
  - Detecta automaticamente a modalidade de envio escolhida pelo comprador (*Mini Envios / Carta Registrada*, *PAC*, *SEDEX* ou *Jadlog*) e marca pedidos de *"Retirar no balcão"* para não gerar etiqueta por engano.
- **Validação Automática de Dados**:
  - Verifica CEP (8 dígitos), CPF/CNPJ do destinatário, endereço, número, cidade e UF antes do envio.
  - Permite editar qualquer pedido diretamente na tabela ou em modal sem precisar mexer na planilha original.
- **Integração Direta com a API do Melhor Envio (`/me/cart`)**:
  - Suporte aos ambientes **Sandbox (Testes)** e **Produção**.
  - Preenche automaticamente a **Declaração de Conteúdo** (`non_commercial: true`) e o valor segurado de cada pedido.
  - **Modo Simulação**: teste todo o fluxo mesmo sem informar um token da API.
- **Exportação de Planilha em Lote (Fallback Anti-CORS)**:
  - Gera com 1 clique a planilha oficial de importação em lote do Melhor Envio (`.csv`).
- **Persistência Automática (`localStorage` + `.env.local`)**:
  - Os dados do remetente, chave de API, ambiente e medidas padrão de embalagem ficam salvos automaticamente no navegador.

---

## 🛠️ Tecnologias Utilizadas

- **[React 19](https://react.dev/) + [Vite 8](https://vite.dev/)** (com proxy reverso configurado para evitar bloqueios de CORS na API do Melhor Envio)
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[Lucide React](https://lucide.dev/)** (Ícones)

---

## 🚀 Como Executar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/dan-dealmeida/ligapokemon-melhor-envio.git
   cd ligapokemon-melhor-envio
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento (porta fixa `5173`):**
   ```bash
   npm run dev
   ```
   Acesse **`http://localhost:5173`** no navegador.

---

## 🔑 Configuração Opcional via `.env.local`

Todos os dados preenchidos na aba **Remetente & API** já ficam salvos automaticamente no `localStorage` do seu navegador.  
Se desejar deixar seus dados e token pré-carregados localmente (sem nunca enviá-los ao GitHub), crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_MELHOR_ENVIO_ENV=production
VITE_MELHOR_ENVIO_TOKEN=seu_bearer_token_aqui

VITE_SENDER_NAME=Minha Loja TCG
VITE_SENDER_COMPANY=Minha Loja Colecionaveis LTDA
VITE_SENDER_DOCUMENT=00.000.000/0001-00
VITE_SENDER_EMAIL=contato@minhaloja.com.br
VITE_SENDER_PHONE=11999999999
VITE_SENDER_CEP=01001-000
VITE_SENDER_ADDRESS=Rua Exemplo
VITE_SENDER_NUMBER=100
VITE_SENDER_COMPLEMENT=Sala 1
VITE_SENDER_DISTRICT=Centro
VITE_SENDER_CITY=São Paulo
VITE_SENDER_UF=SP
```

---

## 📂 Estrutura do Projeto

```text
src/
├── components/
│   ├── ActivityLog.jsx      # Console de logs de processamento em tempo real
│   ├── CsvUploader.jsx      # Área de upload drag-and-drop e dados de demonstração
│   ├── EditOrderModal.jsx   # Modal para edição rápida de endereço/CPF do pedido
│   ├── Header.jsx           # Navegação principal e emblema Rocket Bridge
│   ├── OrdersTable.jsx      # Tabela de pedidos, ações em lote e edição inline
│   ├── SenderSettings.jsx   # Configurações de remetente, token da API e cubagem
│   ├── StatsCards.jsx       # Indicadores de pedidos válidos, enviados e pendentes
│   └── Toast.jsx            # Notificações flutuantes
├── constants/
│   └── shipping.js          # Serviços de frete, cubagem padrão (16x11x2cm) e mocks
├── hooks/
│   └── useLocalStorage.js   # Persistência automática no navegador
├── services/
│   └── melhorEnvio.js       # Montagem do payload e envio para /api/v2/me/cart
├── utils/
│   ├── csv.js               # Parser de CSV da LigaPokemon e exportador Melhor Envio
│   └── validators.js        # Validação de CPF/CNPJ, CEP e formatação de preços
└── App.jsx                  # Orquestrador principal da aplicação
```
