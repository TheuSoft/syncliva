# SyncLiva - Sistema de Gestão de Clínicas Médicas

Sistema completo de gestão para clínicas médicas desenvolvido com Next.js 15, React 19, TypeScript e PostgreSQL.

## 🚀 Funcionalidades

- **Gestão de Pacientes**: Cadastro, edição e histórico completo de pacientes
- **Agendamento de Consultas**: Sistema de agendamento com disponibilidade em tempo real
- **Gestão de Médicos**: Cadastro de médicos, especialidades e horários
- **Dashboard Administrativo**: Relatórios e métricas da clínica
- **Autenticação Segura**: Sistema de login com better-auth
- **Relatórios**: Geração de relatórios em PDF
- **Interface Responsiva**: Design moderno com Tailwind CSS e shadcn/ui
- **Modo Escuro/Claro**: Tema personalizável

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL com Drizzle ORM
- **Authentication**: better-auth
- **Validação**: Zod
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **PDF**: jsPDF
- **Charts**: Recharts

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- npm ou yarn

## ⚙️ Configuração e Instalação

1. **Clone o repositório**
```bash
git clone <your-repo-url>
cd syncliva
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/syncliva"
GOOGLE_CLIENT_ID="your-google-client-id" # Opcional
GOOGLE_CLIENT_SECRET="your-google-client-secret" # Opcional
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
```

4. **Execute as migrações do banco de dados**
```bash
npm run db:migrate
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação rodando.

## 🚀 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run db:migrate` - Executa migrações do banco
- `npm run db:generate` - Gera migrações do Drizzle
- `npm run db:push` - Aplica schema ao banco

## 📁 Estrutura do Projeto

```
src/
├── actions/          # Server Actions (Next.js)
├── app/             # App Router (páginas e layouts)
├── components/      # Componentes reutilizáveis
├── db/              # Configuração do banco e schemas
├── lib/             # Utilitários e configurações
├── types/           # Definições TypeScript
└── hooks/           # Custom hooks
```

## 🔐 Autenticação

O sistema utiliza better-auth para autenticação segura, suportando:
- Login com email e senha
- Login com Google (opcional)
- Gerenciamento de sessões
- Proteção de rotas

## 📊 Dashboard

- Métricas em tempo real
- Gráficos de consultas
- Relatórios de faturamento
- Gestão de agendamentos

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub
2. Conecte o repositório no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático a cada push

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Node.js:
- Railway
- Render
- Heroku
- AWS
- DigitalOcean

### Variáveis de Ambiente para Produção

```env
DATABASE_URL="postgresql://..." # URL do banco PostgreSQL
BETTER_AUTH_SECRET="..." # Chave secreta aleatória
BETTER_AUTH_URL="https://yourdomain.com" # URL de produção
GOOGLE_CLIENT_ID="..." # Opcional
GOOGLE_CLIENT_SECRET="..." # Opcional
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte, entre em contato através do email: seu-email@exemplo.com
