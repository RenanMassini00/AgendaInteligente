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
- Equipe consumindo `/api/professional-team/employees`
- Perfil consumindo `/api/profile`
- Configurações consumindo `/api/settings`
- Agendamento público com seleção de profissional da equipe

## Pré-requisitos

- Node.js 20+
- API .NET rodando em `https://macroloapp.com.br`

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
- Serviços e disponibilidade são associados ao `userId` do funcionário selecionado.
- O agendamento público usa os profissionais e serviços de `GET /api/public/professionals/{slug}` e envia o `professionalUserId` escolhido ao consultar horários e criar o agendamento.
- A tela de equipe usa `GET` e `POST /api/professional-team/employees?ownerUserId={id}`, `PUT /api/professional-team/employees/{employeeId}?ownerUserId={id}` e `DELETE` nesse mesmo caminho para inativar.
- O formulário da equipe está tipado com `id`, `userId`, `fullName`, `email`, `phone` e `isActive`; confirme esses campos com os DTOs da API antes de publicar, pois o README anterior não documentava o contrato de request/response.
- **Não publique a gestão da equipe até a API validar a identidade autenticada e derivar o proprietário da sessão.** `ownerUserId` enviado pelo frontend não é autorização; o aviso da tela não substitui a proteção no backend.
