// @ts-check
import { test, expect } from '@playwright/test';

/*
const BASE_URL = 'http://localhost:3000'


test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/CRUD de Livros/);
});
*/


test.describe('CT-API-001: Registro de Novo Usuário (Sucesso)', () => {

  test('Deve registrar um novo usuário com dados válidos', async ({ request }) => {

    const payload = {
      nome: "Maria Silva",
      email: `maria.silva.${Date.now()}@teste.com`, // garante email único
      senha: "senha123"
    };

    const response = await request.post('/registro', {
      data: payload
    });

    // 1. Status code
    expect(response.status()).toBe(201);

    const body = await response.json();

    // 2. Mensagem esperada
    expect(body.mensagem).toBe("Usuário criado com sucesso");

    // 3. Objeto usuario deve existir
    expect(body.usuario).toBeDefined();

    // 4. Validar campos do objeto usuario
    expect(body.usuario.nome).toBe(payload.nome);
    expect(body.usuario.email).toBe(payload.email);

    // 5. Campo senha NÃO deve estar presente
    expect(body.usuario.senha).toBeUndefined();

    // 6. Validar ID positivo
    expect(typeof body.usuario.id).toBe("number");
    expect(body.usuario.id).toBeGreaterThan(0);
  });
});

/////////////////////CT-API-002: Registro com Email Duplicado (Falha)/////////////////////////////

test.describe('CT-API-002: Registro com Email Duplicado (Falha)', () => {

  test('Não deve permitir registro com email já existente', async ({ request }) => {

    const payload = {
      nome: "João Santos",
      email: "admin@biblioteca.com",
      senha: "senha456"
    };

    const response = await request.post('/registro', {
      data: payload
    });

    // 1. Status code esperado
    expect(response.status()).toBe(400);

    const body = await response.json();

    // 2. Mensagem de erro esperada
    expect(body.mensagem).toBe("Email já cadastrado");
  });

});
/////////////////////CT-API-003: Login com Credenciais Válidas/////////////////////////////
test.describe('CT-API-003: Login com Credenciais Válidas', () => {

  test('Deve autenticar com sucesso', async ({ request }) => {
    const payload = {
      email: "admin@biblioteca.com",
      senha: "123456"
    };

    const inicio = Date.now();

    const response = await request.post('/login', { data: payload });

    const fim = Date.now();
    const tempoResposta = fim - inicio;

    // Status
    expect(response.status()).toBe(200);

    const body = await response.json();

    // Mensagem
    expect(body.mensagem).toBe("Login realizado com sucesso");

    // Objeto usuario sem senha
    expect(body.usuario).toBeDefined();
    expect(body.usuario.email).toBe(payload.email);
    expect(body.usuario.senha).toBeUndefined();

    // Tempo < 2 segundos
    expect(tempoResposta).toBeLessThan(2000);
  });

});

/////////////////////CT-API-004: Login com Credenciais Inválidas/////////////////////////////
test.describe('CT-API-004: Login com Credenciais Inválidas', () => {

  test('Não deve autenticar com senha incorreta', async ({ request }) => {
    const payload = {
      email: "admin@biblioteca.com",
      senha: "senhaerrada"
    };

    const response = await request.post('/login', { data: payload });

    expect(response.status()).toBe(401);

    const body = await response.json();

    expect(body.mensagem).toBe("Email ou senha incorretos");
  });

});

/////////////////////CT-API-005: Listar Todos os Livros/////////////////////////////

test.describe('CT-API-005: Listar Todos os Livros', () => {

  test('Deve retornar lista completa de livros', async ({ request }) => {
    const response = await request.get('/livros');

    expect(response.status()).toBe(200);

    const body = await response.json();

    // Deve ser array
    expect(Array.isArray(body)).toBe(true);

    for (const livro of body) {
      expect(livro).toHaveProperty('id');
      expect(livro).toHaveProperty('nome');
      expect(livro).toHaveProperty('autor');
      expect(livro).toHaveProperty('paginas');
      expect(livro).toHaveProperty('descricao');
      expect(livro).toHaveProperty('imagemUrl');
      expect(livro).toHaveProperty('dataCadastro');

      expect(typeof livro.paginas).toBe("number");
      expect(livro.paginas).toBeGreaterThan(0);

      // ISO 8601
      expect(() => new Date(livro.dataCadastro).toISOString()).not.toThrow();
    }
  });

});

/////////////////////CT-API-006: Buscar Livro por ID (Existente)/////////////////////////////

test.describe('CT-API-006: Buscar Livro por ID (Existente)', () => {

  test('Deve retornar o livro com ID 1', async ({ request }) => {
    const response = await request.get('/livros/1');

    expect(response.status()).toBe(200);

    const livro = await response.json();

    expect(livro.id).toBe(1);

    expect(livro.nome).toBeTruthy(); // não vazio

    expect(livro).toHaveProperty('autor');
    expect(livro).toHaveProperty('paginas');
    expect(livro).toHaveProperty('descricao');
    expect(livro).toHaveProperty('imagemUrl');
    expect(livro).toHaveProperty('dataCadastro');
  });

});

/////////////////////CT-API-007: Buscar Livro por ID (Inexistente)/////////////////////////////

test.describe('CT-API-007: Buscar Livro por ID (Inexistente)', () => {

  test('Deve retornar 404 para ID inexistente', async ({ request }) => {
    const response = await request.get('/livros/9999');

    expect(response.status()).toBe(404);

    const body = await response.json();

    expect(body.mensagem).toBe("Livro não encontrado");
  });

});


/////////////////////CT-API-008: Adicionar Novo Livro/////////////////////////////

test.describe('CT-API-008: Adicionar Novo Livro', () => {

  test('Deve criar um novo livro', async ({ request }) => {
    const payload = {
      nome: "Código Limpo",
      autor: "Robert C. Martin",
      paginas: 425,
      descricao: "Manual de boas práticas",
      imagemUrl: "https://exemplo.com/imagem.jpg"
    };

    const response = await request.post('/livros', { data: payload });

    expect(response.status()).toBe(201);

    const livro = await response.json();

    expect(livro.id).toBeDefined();
    expect(livro.id).toBeGreaterThan(0);

    expect(livro.nome).toBe(payload.nome);
    expect(livro.autor).toBe(payload.autor);
    expect(livro.paginas).toBe(payload.paginas);
    expect(livro.descricao).toBe(payload.descricao);
    expect(livro.imagemUrl).toBe(payload.imagemUrl);

    expect(() => new Date(livro.dataCadastro).toISOString()).not.toThrow();
  });

});


/////////////////////CT-API-009: Atualizar Livro Existente/////////////////////////////

test.describe('CT-API-009: Atualizar Livro Existente', () => {

  test('Deve atualizar os dados do livro', async ({ request }) => {
    const payload = {
      nome: "Clean Code - Edição Atualizada",
      autor: "Robert C. Martin",
      paginas: 464,
      descricao: "Guia completo atualizado",
      imagemUrl: "https://exemplo.com/nova-imagem.jpg"
    };

    const response = await request.put('/livros/1', { data: payload });

    expect(response.status()).toBe(200);

    const livro = await response.json();

    expect(livro.id).toBe(1); // id não muda

    expect(livro.nome).toBe(payload.nome);
    expect(livro.autor).toBe(payload.autor);
    expect(livro.paginas).toBe(payload.paginas);
    expect(livro.descricao).toBe(payload.descricao);
    expect(livro.imagemUrl).toBe(payload.imagemUrl);
  });

});


/////////////////////CT-API-010: Deletar Livro/////////////////////////////

test.describe('CT-API-010: Deletar Livro', () => {

  test('Deve remover o livro e garantir que não existe mais', async ({ request }) => {

    const response = await request.delete('/livros/2');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.mensagem).toBe("Livro removido com sucesso");

    // Verifica se realmente foi removido
    const getResponse = await request.get('/livros/2');
    expect(getResponse.status()).toBe(404);
  });

});

