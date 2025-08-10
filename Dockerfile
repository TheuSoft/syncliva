FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências somente quando package.json/lock mudam
COPY package.json* package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Se nenhum lock existir, npm criará package-lock automaticamente
RUN npm install --no-audit --no-fund

# Copiar restante do código (em dev teremos bind mount sobrescrevendo)
COPY . .

# Expor porta padrão do Next.js
EXPOSE 3000

# Comando padrão: ambiente de desenvolvimento
CMD ["npm","run","dev"]
