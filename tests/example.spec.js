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

