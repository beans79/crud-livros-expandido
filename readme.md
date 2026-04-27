
Markdown
# 📚 Sistema de Gestão de Biblioteca (QA)

Este repositório contém uma aplicação completa de Gestão de Biblioteca, integrando o desenvolvimento de uma **API REST**, uma interface de utilizador dinâmica e uma suíte robusta de **Testes Automatizados (E2E e API)** utilizando Playwright.

---

## 🛠️ Tecnologias Utilizadas

### **Backend (API)**
- **Node.js** & **Express**: Servidor e framework web.
- **Swagger (UI & JSDoc)**: Documentação interativa dos endpoints.

### **Frontend**
- **HTML5 / CSS3 / JavaScript (ES6+)**: Interface responsiva e consumo de API.

### **QA & Automação**
- **Playwright**: Framework principal para testes de ponta a ponta e de integração.
- **Arquitetura**: Testes organizados por funcionalidades com validação de contratos e fluxos de utilizador.

---

## 📋 Estrutura do Projeto

```text
crud-livros-expandido/
├── server.js                # Servidor Express e Definição da API
├── package.json             # Dependências e scripts
├── tests/                   # Suíte de Testes Automatizados
│   ├── frontend.spec.js     # 16 Testes E2E (Interface)
│   └── backend.spec.js      # 13 Testes de API (Endpoints)
└── public/                  # Frontend Estático
```

# 🧪 Cobertura de Testes Automatizados
O projeto conta com uma cobertura abrangente dividida em duas frentes:

1. Testes de API (Backend - 13 Casos de Teste)
Localizados em backend.spec.js, validam a lógica de negócio e integridade dos dados:

		Autenticação: Registro de utilizadores (sucesso e email duplicado) e login com validação de tempo de resposta (<2s).

		Gestão de Livros (CRUD): Listagem completa, busca por ID (existente/inexistente), criação, atualização e remoção de livros.

		Estatísticas: Validação do cálculo de total de livros, páginas e utilizadores.

		Favoritos: Fluxo de adição e listagem de favoritos por utilizador.

2. Testes de Frontend (E2E - 16 Casos de Teste)
Localizados em frontend.spec.js, validam a experiência do utilizador final:

		Fluxos de Acesso: Login/Registro com alertas de erro (senhas não correspondentes, credenciais inválidas).

		Segurança: Proteção de Rotas (redirecionamento para login ao tentar aceder a páginas protegidas) e Logout funcional.

		Dashboard: Validação de carregamento de estatísticas e grid de livros recentes.

		Gestão Visual: Cadastro de livros com validação HTML5, visualização de detalhes, exclusão com diálogos de confirmação e sistema de favoritos.

		Navegação: Verificação de links entre módulos sem erros de consola.

# 🧪 Descrição Detalhada dos Casos de Teste
Testes de API (Backend - 13 Casos)
Estes testes garantem que a lógica do servidor e os endpoints estão a funcionar corretamente:

		CT-API-001: Verifica o registo de um novo utilizador com dados válidos e se o ID é gerado.

		CT-API-002: Garante que o sistema não permite registar emails duplicados.

		CT-API-003: Valida o login com sucesso e verifica se o tempo de resposta é inferior a 2 segundos.

		CT-API-004: Testa o bloqueio de acesso com senhas incorretas.

		CT-API-005: Valida se a lista de livros retorna todos os campos obrigatórios e o formato de data correto.

		CT-API-006 & 007: Verifica a procura de livros por ID (sucesso para ID existente e erro 404 para inexistente).

		CT-API-008: Testa a criação de um novo livro e valida a persistência dos dados enviados.

		CT-API-009: Valida a atualização de informações de um livro já existente.

		CT-API-010: Garante a remoção de um livro e confirma que ele deixa de estar acessível.

		CT-API-011: Verifica se o cálculo das estatísticas (total de livros, páginas e utilizadores) está correto.

		CT-API-012 & 013: Testa o sistema de favoritos, garantindo que os livros são associados corretamente ao utilizador.

Testes de Frontend (E2E - 16 Casos)
Estes testes simulam a interação real do utilizador no navegador:

	CT-FE-001: Valida o fluxo completo de registo de conta.

	CT-FE-002: Verifica se o sistema alerta quando as senhas não coincidem no registo.

	CT-FE-003 & 004: Valida o login visual com sucesso (redirecionamento) e o tratamento de erros em credenciais inválidas.

	CT-FE-005: Garante a Proteção de Rotas, impedindo o acesso ao Dashboard sem login.

	CT-FE-006: Verifica se o Dashboard carrega corretamente os cards de estatísticas e os livros recentes.

	CT-FE-007: Valida a funcionalidade de adicionar um novo livro através do formulário.

	CT-FE-008: Testa a validação de campos obrigatórios (HTML5) no cadastro de livros.

	CT-FE-009: Garante que a navegação entre os menus (Dashboard, Livros, Favoritos) funciona sem erros de consola.

	CT-FE-010: Valida a exibição correta de todos os detalhes técnicos de um livro específico.

	CT-FE-011 & 012: Testa a funcionalidade visual de adicionar e remover livros dos favoritos via ícones (❤️/🤍).

	CT-FE-013: Verifica a listagem de favoritos e a mensagem de "lista vazia".

	CT-FE-014 & 015: Valida o fluxo de eliminação de livros, testando tanto a confirmação como o cancelamento da ação.

	CT-FE-016: Testa o Logout, garantindo a limpeza do localStorage e o redirecionamento seguro.

# 🚀 Como Executar
Instalação de Dependências
	Primeiro, instala as bibliotecas do Node.js e, em seguida, os executáveis dos browsers que o Playwright utiliza:
	1. Instalação
		Bash
		npm install
	3. Instalar os browsers do Playwright (passo obrigatório)
		npx playwright install
	4. Iniciar Aplicação
		Bash
		npm start
		App: http://localhost:3000/login.html

		API Docs: http://localhost:3000/api-docs

	5. Executar Testes
		Bash
		# Executar todos os testes (Frontend + Backend)
			npx playwright test

		# Executar apenas testes de API
			npx playwright test tests/backend.spec.js

		# Abrir interface visual do Playwright
			npx playwright test --ui
		# Executar testes individualmente:
			npx playwright test --ui 'nome do caso de teste. ex:
				npx playwright test --ui 'CT-FE-013: Listar Livros Favoritos'
Nota: Deve ter em conta as pré-condições de cada teste.
Projeto desenvolvido para demonstração de competências em Testes - Armando Teixeira

