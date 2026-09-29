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
- A tela de equipe usa `GET` e `POST /api/professional-team/employees`, `PUT /api/professional-team/employees/{employeeId}` e `DELETE` nesse mesmo caminho para inativar. O backend obtém o proprietário pela identidade autenticada; não envie `ownerUserId` pelo frontend.
- O cadastro de funcionário envia nome, e-mail, senha inicial, telefone, especialidade e fuso horário.
- O login aceita o papel `employee`; esse perfil só recebe navegação de dashboard, agenda, clientes (consulta), serviços (consulta), financeiro e perfil.
- Chamadas autenticadas enviam o token da sessão em `Authorization: Bearer`. Respostas `401` encerram a sessão; `403` exibem a mensagem de acesso negado retornada pela API.
