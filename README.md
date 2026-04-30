# Scheduler Frontend Integrado

Front-end React + TypeScript integrado com a API .NET do projeto.

## O que já está integrado

- Login em `/login`
- Dashboard consumindo `/api/dashboard`
- Agendamentos consumindo `/api/appointments`
- Novo agendamento consumindo `POST /api/appointments`
- Clientes consumindo `/api/clients`
- Serviços consumindo `/api/services`
- Disponibilidade consumindo `/api/availability`
- Perfil consumindo `/api/profile`
- Configurações consumindo `/api/settings`

## Pré-requisitos

- Node.js 20+
- API .NET rodando em `http://localhost:5080`

## Configuração

1. Copie o arquivo `.env.example` para `.env`
2. Se necessário, ajuste `VITE_API_URL`

```bash
cp .env.example .env
```

## Instalação

```bash
npm install
npm run dev
```

## Login de teste

Use o usuário seedado no banco:

- e-mail: `renan@email.com`
- senha: qualquer valor não vazio

## Observações

- Este front usa a sessão salva no `localStorage`
- O backend atual já aceita o usuário seedado do script SQL
- Os botões de criação de cliente, serviço e edição de disponibilidade ainda estão visuais e prontos para a próxima etapa de CRUD
