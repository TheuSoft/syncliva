This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Ambiente Docker para Desenvolvimento

Setup leve utilizando apenas Docker e docker compose (sem scripts extras):

Arquivos principais:
- `Dockerfile`: imagem Node 20 Alpine com dependências.
- `docker-compose.yml`: serviços `app` (Next.js) e `db` (Postgres), além de serviço utilitário `migrate`.
- `.dockerignore`: otimiza o build.
- `.env.docker.example`: exemplo de variáveis.

### Subir os serviços

```bash
docker compose up -d --build
```

Aplicação: http://localhost:3000

Migrações são aplicadas automaticamente (serviço migrate) antes do app subir.

### Rodar migrações manualmente (opcional)

```bash
docker compose run --rm migrate
```

### Logs em tempo real

```bash
docker compose logs -f app
```

### Acesso ao banco

```bash
docker compose exec db psql -U postgres -d syncliva
```

### Adicionar dependência

```bash
docker compose run --rm app npm install <pacote>
```

### Regenerar artefatos Drizzle

```bash
docker compose run --rm app npx drizzle-kit generate
```

### Encerrar

```bash
docker compose down
```

Remover volumes (apagar dados):
```bash
docker compose down -v
```

### Observações
- Montagem bind (. -> /app) garante hot reload; `node_modules` isolado com volume anônimo.
- Serviço `migrate` executa `npx drizzle-kit push` a cada `up` (idempotente).
- Ajuste variáveis criando `.env.docker` a partir de `.env.docker.example`.
- Apenas comandos padrão Docker/npx utilizados (sem scripts customizados).
