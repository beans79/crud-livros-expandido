
---

# 📚 Biblioteca E2E Automation - Playwright

Este repositório contém a suíte de testes automatizados de ponta a ponta (E2E) para o sistema de gerenciamento de biblioteca. Os testes foram desenvolvidos utilizando **Playwright** para garantir a qualidade e a integridade dos fluxos principais da aplicação.

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** JavaScript
* **Framework de Teste:** [Playwright](https://playwright.dev/)
* **Ambiente:** Node.js

## 📋 Cenários de Teste Cobertos

A suíte de testes abrange 16 Casos de Teste (CTs) de FrontEnd críticos, divididos em módulos:

### 🔐 Autenticação e Segurança
* **CT-FE-001/003:** Sucesso no Registro e Login de usuários.
* **CT-FE-002:** Validação de erro quando as senhas não coincidem no registro.
* **CT-FE-004:** Tentativa de login com credenciais inválidas.
* **CT-FE-005:** Verificação de proteção de rotas (redirecionamento para login).
* **CT-FE-016:** Fluxo de logout e limpeza de sessão (utiliza o `localStorage`).

### 📊 Dashboard e Navegação
* **CT-FE-006:** Validação do carregamento de estatísticas e grid de livros recentes.
* **CT-FE-009:** Funcionamento de todos os links do menu de navegação.

### 📖 Gerenciamento de Livros
* **CT-FE-007:** Cadastro de novos livros com validação de persistência na lista.
* **CT-FE-008:** Validação de campos obrigatórios via atributos HTML5.
* **CT-FE-010:** Visualização detalhada de um livro específico.
* **CT-FE-014/015:** Fluxo de exclusão de livro (Confirmar vs. Cancelar).

### ❤️ Favoritos
* **CT-FE-011/012:** Adicionar e remover livros da lista de favoritos.
* **CT-FE-013:** Listagem de favoritos e tratamento de estado vazio.

## 🚀 Como Executar os Testes

### Pré-requisitos
* Node.js instalado.
* O servidor da aplicação deve estar rodando em `http://localhost:3000`.

### Instalação
1. Clone o repositório:
   ```bash
   git clone https://github.com/beans79/crud-livros-expandido.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Instale os browsers do Playwright:
   ```bash
   npm init playwright@latest
   ```

### Execução
* **Executar todos os testes:**
    ```bash
    npx playwright test
    ```
* **Executar em modo interface (UI):**
    ```bash
    npx playwright test --ui
    ```
* **Gerar relatório de testes:**
    ```bash
    npx playwright show-report
    ```
* **Executar um teste especifico em modo interface (UI):**
    ```bash
    npx playwright test --ui  -g 'CT-FE-016: Logout do Sistema'
    ```

---

## ⚙️ Estrutura do Código
Os testes utilizam scripts de inicialização (`addInitScript`) para manipular o `localStorage`, permitindo simular estados de login e preferências de usuário sem a necessidade de repetir o fluxo de login em todos os testes, otimizando o tempo de execução.

> **Nota:** Certifique-se de que a base URL configurada no código (`http://localhost:3000`) condiz com o seu ambiente local de desenvolvimento.

---
*Desenvolvido por Armando Teixeira*