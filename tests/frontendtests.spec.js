// @ts-check
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

/*
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});
*/
//////teste do login//// ver se funciona o login com email e senha corretos, e se aparece a mensagem de sucesso, e se o objeto usuario é retornado sem a senha

test.describe('CT-FE-001: Fluxo Completo de Registro  (Sucesso)', () => {
    test('Validar criação de conta de novo usuário', async ({ page }) => {
        await page.goto(`${BASE}/login.html`);
        await page.getByRole('textbox', { name: 'Email:' }).click();
        await page.getByRole('textbox', { name: 'Email:' }).fill('admin@biblioteca.com');
        await page.getByRole('textbox', { name: 'Senha:' }).click();
        await page.getByRole('textbox', { name: 'Senha:' }).fill('123456');
        page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.dismiss().catch(() => { });
        });
        await page.getByRole('button', { name: 'Entrar' }).click();
    });

});

///////////////////////////////CT-FE-002: Validação de Senhas Não Correspondentes///////////////////////

test.describe('CT-FE-002: Validação de Senhas Não Correspondentes ', () => {
    test(' Validar mensagem de erro quando senhas não coincidem', async ({ page }) => {
        await page.goto(`${BASE}/registro.html`);

        await page.getByRole('textbox', { name: 'Nome:' }).click();
        await page.getByRole('textbox', { name: 'Nome:' }).fill('midas');
        await page.getByRole('textbox', { name: 'Email:' }).click();
        await page.getByRole('textbox', { name: 'Email:' }).fill('midas@noemail.com');
        await page.getByRole('textbox', { name: 'Senha:', exact: true }).click();
        await page.getByRole('textbox', { name: 'Senha:', exact: true }).fill('123');
        await page.getByRole('textbox', { name: 'Confirmar Senha:' }).click();
        await page.getByRole('textbox', { name: 'Confirmar Senha:' }).fill('123456');
        await page.getByRole('button', { name: 'Registrar' }).click();
        await page.click('button:has-text("Registrar")');
        page.on('dialog', async dialog => {
            expect(dialog.message()).toBe('As senhas não coincidem!');
            await dialog.accept();
        });

        await expect(page).toHaveURL(`${BASE}/registro.html`);
    });
});


/////////////////////CT-FE-003: Login com Sucesso///////////////////////
test.describe('CT-FE-003: Login com Sucesso', () => {
    test('Validar fluxo de autenticação bem-sucedida', async ({ page }) => {
        await page.goto(`${BASE}/login.html`);
        await page.getByRole('textbox', { name: 'Email:' }).click();
        await page.getByRole('textbox', { name: 'Email:' }).fill('admin@biblioteca.com');
        await page.getByRole('textbox', { name: 'Senha:' }).click();
        await page.getByRole('textbox', { name: 'Senha:' }).fill('123456');
        await page.getByRole('button', { name: 'Entrar' }).click();
        page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.dismiss().catch(() => { });
        });


        await expect(page).toHaveURL(`${BASE}/dashboard.html`);


    });
});


test.describe('CT-FE-004: Login com Credenciais Inválidas', () => {
    test('Validar tratamento de erro de autenticação', async ({ page }) => {
        await page.goto(`${BASE}/login.html`);
        await page.getByRole('textbox', { name: 'Email:' }).click();
        await page.getByRole('textbox', { name: 'Email:' }).fill('admin@biblioteca.com');
        await page.getByRole('textbox', { name: 'Senha:' }).click();
        await page.getByRole('textbox', { name: 'Senha:' }).fill('1234589');
        await page.getByRole('button', { name: 'Entrar' }).click();
        page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.dismiss().catch(() => { });
        });

        await expect(page).toHaveURL(`${BASE}/login.html`);
        page.on('dialog', async dialog => {
            expect(dialog.message()).toBe('Email ou senha incorretos');
            //await dialog.accept();
        });
    });
});

test.describe('CT-FE-005: Verificar Proteção de Rotas', () => {
    test(' Validar que páginas protegidas exigem autenticação ', async ({ page }) => {
        await page.goto(`${BASE}/dashboard.html`);

        await expect(page).toHaveURL(`${BASE}/login.html`);
    });
});


//////////////////////CT-FE-006 — Visualizar Dashboard//////////////////////    

test.describe('CT-FE-006: Visualizar Dashboard', () => {
    test('Validar carregamento correto do dashboard', async ({ page }) => {

        // Pré-condição: usuário autenticado
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ nome: 'Admin' }));
        });

        await page.goto(`${BASE}/dashboard.html`);

        // --- Validação dos cards de estatísticas ---
        await expect(page.getByRole('heading', { name: 'Total de Livros' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Total de Páginas' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Usuários Cadastrados' })).toBeVisible();

        // Validação dos valores numéricos (devem existir e ser números)
        //const totalLivros = await page.locator('#totalLivros').innerText();

        const totallivros = page.locator('.stat-card', { hasText: 'Total de Livros' }).locator('.number');
        const valorLivros = Number((await totallivros.innerText()).replace(/\D/g, ''));
        expect(valorLivros).toBeGreaterThan(0);


        const paginas = page.locator('.stat-card', { hasText: 'Total de Páginas' }).locator('.number');
        const valorPaginas = Number((await paginas.innerText()).replace(/\D/g, ''));
        expect(valorPaginas).toBeGreaterThan(0);


        const usuarios = page.locator('.stat-card', { hasText: 'Usuários Cadastrados' }).locator('.number');
        const valorUsuarios = Number((await usuarios.innerText()).replace(/\D/g, ''));
        expect(valorUsuarios).toBeGreaterThan(0);


        // --- Grid de "Últimos Livros Adicionados" é carregado  ---
        await expect(page.locator('#livros-recentes')).toBeVisible();


        // Máximo de 5 livros recentes são exibidos 
        const livrosCarregados = await page.locator('#livros-recentes').evaluate(el => el.childElementCount);
        expect(livrosCarregados).toBeLessThanOrEqual(5);



        // Cada card de livro contém imagem, nome e autor
        for (let i = 0; i < livrosCarregados; i++) {
            const card = page.locator('.book-card').nth(i);

            await expect(card.locator('img')).toBeVisible();
            await expect(card.locator('p:has-text("Autor:")')).toBeVisible();
            await expect(card.locator('p:has-text("Páginas:")')).toBeVisible();
        }
    });
});
