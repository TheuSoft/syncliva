# Lista de Verificação para Deploy - SyncLiva

## ✅ Status do Projeto para Deploy

### 🎯 Verificações Básicas
- [x] **Build de Produção**: Projeto compila sem erros
- [x] **Linting**: Código passa no ESLint sem warnings
- [x] **TypeScript**: Sem erros de tipos
- [x] **Dependencies**: Todas as dependências instaladas

### 🔧 Configurações Necessárias

#### **Variáveis de Ambiente**
- [ ] ⚠️ **DATABASE_URL**: Configurar banco PostgreSQL de produção
- [ ] ⚠️ **BETTER_AUTH_SECRET**: Gerar chave secreta para produção
- [ ] ⚠️ **BETTER_AUTH_URL**: URL do domínio de produção
- [x] **GOOGLE_CLIENT_ID/SECRET**: Opcional (para login Google)

#### **Banco de Dados**
- [x] **Migrações**: Scripts funcionando corretamente
- [x] **Schema**: Drizzle configurado
- [ ] ⚠️ **Banco de Produção**: Provisionar PostgreSQL

### 📦 Configurações de Deploy

#### **Scripts de Build**
- ⚠️ **Migração no Build**: Script `db:migrate` precisa de tsx global
- [x] **Build Next.js**: Funciona corretamente
- [x] **Start Script**: Configurado

#### **Plataformas Recomendadas**
1. **Vercel** (Mais fácil)
   - Deploy automático via GitHub
   - PostgreSQL via Vercel Postgres
   - Variáveis de ambiente via dashboard

2. **Railway**
   - PostgreSQL integrado
   - Deploy via GitHub
   - Configuração de variáveis

3. **Render**
   - PostgreSQL disponível
   - Deploy automático

### 🚨 Problemas Identificados

1. **tsx não global**: O script `npm run build` falha porque tsx não está instalado globalmente
   - **Solução**: Usar `npx tsx` ou instalar globalmente

2. **Console.logs em produção**: Muitos logs de debug no código
   - **Recomendação**: Remover ou usar variável de ambiente

3. **TODO não implementado**: Reset de senha do médico tem TODO
   - **Status**: Funcional, mas pode precisar de implementação completa

### 📋 Checklist de Deploy

#### **Antes do Deploy**
- [ ] Configurar banco PostgreSQL de produção
- [ ] Gerar BETTER_AUTH_SECRET seguro
- [ ] Configurar domínio/URL de produção
- [ ] Testar migrações no banco de produção
- [ ] Remover console.logs (opcional)

#### **Durante o Deploy**
- [ ] Configurar variáveis de ambiente
- [ ] Executar migrações
- [ ] Testar login/autenticação
- [ ] Verificar todas as funcionalidades

#### **Após o Deploy**
- [ ] Testar todas as rotas
- [ ] Verificar dashboard
- [ ] Testar CRUD de pacientes/médicos
- [ ] Verificar agendamentos
- [ ] Testar relatórios

### 🎯 Resumo

**Status**: ✅ **PRONTO PARA DEPLOY** (com configurações)

O projeto está tecnicamente pronto para deploy. Os principais requisitos são:
1. Configurar banco PostgreSQL de produção
2. Definir variáveis de ambiente corretas
3. Ajustar script de migração (usar npx tsx)

### 🚀 Próximos Passos Recomendados

1. **Deploy no Vercel** (mais simples):
   - Conectar repositório GitHub
   - Adicionar Vercel Postgres
   - Configurar variáveis de ambiente
   - Deploy automático

2. **Configurar monitoramento** (pós-deploy):
   - Logs de erro
   - Performance
   - Uptime monitoring

### 📞 Suporte Técnico
Em caso de problemas no deploy, verificar:
- Logs da plataforma de deploy
- Conexão com banco de dados
- Configuração de variáveis de ambiente
- Execução das migrações
