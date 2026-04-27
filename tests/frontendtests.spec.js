// @js-check
import { test, expect } from '@playwright/test';
import { expectFailure } from 'node:test';

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

//////////////////////CT-FE-007: Adicionar Novo Livro//////////////////////    

test.describe('CT-FE-007: Adicionar Novo Livro', () => {
    test('Validar formulário de cadastro de livro', async ({ page }) => {
        // Pré-condição: usuário autenticado
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ nome: 'Admin' }));
        });

        await page.goto('http://localhost:3000/livros.html');
        // Dados do livro a ser adicionado
        const nomeDoLivro = 'O Hobbit';
        const autorDoLivro = 'J.R.R.Tolkien';
        const numeroDePaginas = '310';
        const descricaoDoLivro = 'Livro interessante.' + Date.now();
        const urlDaImagem = 'https://i.pinimg.com/originals/1b/e3/fe/1be3fe3ee9604392b410efcba2b39d6f.png';

        // Mapeamento dos locators
        const campoNome = page.getByRole('textbox', { name: 'Nome do Livro:' });
        const campoAutor = page.getByRole('textbox', { name: 'Autor:' });
        const campoPaginas = page.getByRole('spinbutton', { name: 'Número de Páginas:' });
        const campoDescricao = page.getByRole('textbox', { name: 'Descrição:' });
        const campoUrl = page.getByRole('textbox', { name: 'URL da Imagem:' });
        const totalAdicionados = await page.locator('#lista-livros > *').count();

        // Preenchimento dos campos com os dados do livro
        await campoNome.fill(nomeDoLivro);
        await campoAutor.fill(autorDoLivro);
        await campoPaginas.fill(numeroDePaginas);
        await campoDescricao.fill(descricaoDoLivro);
        await campoUrl.fill(urlDaImagem);

        // Configurar listener para o diálogo de sucesso, 
        // garante que o playwright capture o evento correctamente
        page.once('dialog', async dialog => {
            expect(dialog.message()).toBe('Livro adicionado com sucesso!');
            await dialog.accept();
        });

        // Ação: Clicar no botão "Adicionar Livro"
        await page.getByRole('button', { name: 'Adicionar Livro' }).click();

        // Validar se todos os campos ficaram vazios
        await expect(campoNome).toHaveValue('');
        await expect(campoAutor).toHaveValue('');
        await expect(campoPaginas).toHaveValue('');
        await expect(campoDescricao).toHaveValue('');
        await expect(campoUrl).toHaveValue('');

        // Localizo o primeiro elemento filho dentro da lista do childElementCount ( ver nas properties)
        const primeiroLivro = page.locator('#lista-livros > *').first();

        // Valido se o texto do primeiro elemento contém o título esperado
        await expect(primeiroLivro).toContainText(nomeDoLivro);

        // Validar o número total de elementos na lista de livros, após ter sido adicionado um livro.
        const totalAposAdicionar = await page.locator('#lista-livros > *').count();
        expect(totalAposAdicionar).toBe(totalAdicionados + 1); // Compara o valor atual de livros carregados 
        // com o valor antes de adicionr o livro

        // Validar se a url /livros.html aparece após adicionar o livro
        await expect(page).toHaveURL(/.*livros.html/);
        //Validar os campos do formulário Adicionar Livro estão visiveis.
        await expect(campoNome).toBeVisible();
        await expect(campoAutor).toBeVisible();
        await expect(campoPaginas).toBeVisible();
        await expect(campoDescricao).toBeVisible();
        await expect(campoUrl).toBeVisible();
        await expect(page.getByRole('button', { name: 'Adicionar Livro' })).toBeVisible();
        //validar se a lista de Livros está visivel e se o total de livros é superior a Zero.
        await expect(page.locator('#lista-livros')).toBeVisible();
        await expect(page.locator('#lista-livros > *').first()).toBeVisible();
        expect(totalAposAdicionar).not.toBeLessThan(0);

    });

});
test.describe('CT-FE-008: Validação de Campos Obrigatórios', () => {
    test(': Validar que campos obrigatórios são verificados', async ({ page }) => {
        // Pré-condição: usuário autenticado
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ nome: 'Admin' }));
        });

        const totalAdicionados = await page.locator('#lista-livros > *').count();
        const campoNome = page.getByRole('textbox', { name: 'Nome do Livro:' });
        const btnAdicionar = page.getByRole('button', { name: 'Adicionar Livro' });
        const campoAutor = page.getByRole('textbox', { name: 'Autor:' });

        //Aceder á página /livros.html
        await page.goto(`${BASE}/livros.html`);

        //Clicar no botão "Adicionar Livro" com campos vazios
        await btnAdicionar.click();

        page.on('dialog', async dialog => {
            expect(dialog.message()).toBe('Please fill out this fields.');
            //await dialog.accept();
        });


        // Tentar submeter formulário vazio
        await btnAdicionar.click();

        // Validação: Verificar se o campo Nome (primeiro obrigatório) disparou o erro de HTML5
        const isInvalid = await campoNome.evaluate((node) =>
            node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement
                ? node.validity.valueMissing
                : false
        );
        expect(isInvalid).toBe(true);

        // Submeter com apenas alguns campos preenchidos
        await campoNome.fill('O Desejo de uma Vida');
        await btnAdicionar.click();

        // Validação: Verificar que o campo Autor (agora o próximo vazio) também está inválido
        /*
                const autorInvalid = await campoAutor.evaluate((node) =>
                    node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement
                        ? node.validity.valueMissing
                        : false
                );
                expect(autorInvalid).toBe(true);
        
                // Validação final: Garantir que o formulário NÃO foi submetido (lista não deve ter mudado)
                // Se a página recarregasse ou limpasse, o campo Nome estaria vazio
                await expect(campoNome).toHaveValue('O Desejo de uma Vida');
        
                 const validit = campoAutor.evaluate(el => el.validity.valueMissing);
          expect(validit).toBe(true);
        */


        //  evaluate lê propriedades nativas:
        const isValid = await campoNome.evaluate(el => el.checkValidity());
        const message = await campoNome.evaluate(el => el.validationMessage);

        // Validações

        const validit = await campoNome.evaluate(el => el.validity.valueMissing);
        expect(validit).toBe(false); // O campo Nome não deve estar vazio, então valueMissing deve ser false
        // Imprime a mensagem para ver o que o browser diz
        console.log('Mensagem de erro do browser:', validit);

    });
});

test.describe('CT-FE-009: Navegação Entre Páginas', () => {

    test('Validar funcionamento dos links de navegação', async ({ page }) => {

        // Capturar os erros do console.
        //Definio o array ANTES de qualquer uso
        const errosNoConsole = [];

        //Configuro o listener para capturar erros
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errosNoConsole.push(msg.text());
            }
        });

        // Pré-condição: usuário autenticado
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ nome: 'Admin' }));
        });

        //Mapeamento da variaveis dos links de navegação
        const linkDashboard = await page.getByRole('link', { name: 'Dashboard' });
        const linkGerenciarLivros = await page.getByRole('link', { name: 'Gerenciar Livros' });
        const linkFavoritos = page.getByRole('link', { name: 'Meus Favoritos' });

        //Aceder ao link Dashboard
        await page.goto(`${BASE}/dashboard.html`);
        // Aceder ao link  Livros
        await linkGerenciarLivros.click();
        await expect(page).toHaveURL(`${BASE}/livros.html`);

        // Aceder ao link Favoritos
        await linkFavoritos.waitFor({ state: 'visible' });
        await linkFavoritos.click()
        await page.waitForLoadState('domcontentloaded'); //Aguarda o carregamento da página, assim não dá erro.
        await expect(page).toHaveURL(/.*favoritos.html/);

        // Valida se volta para o dashboard.
        await linkDashboard.click();
        await expect(page).toHaveURL(`${BASE}/dashboard.html`);

        // Validar que não houve erros de console. Utilizo um console.log para ver os erros, caso ocorram.
        expect(errosNoConsole).toHaveLength(0);
        console.log('Erros de console capturados durante o teste:', errosNoConsole);

    });

});

test.describe('CT-FE-010: Visualizar Detalhes de Livro', () => {

    test('Validar página de detalhes do livro', async ({ page }) => {
        // Pré-condição: Usuário autenticado
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ nome: 'Admin' }));
        });

        //Aceder a /livros.html
        await page.goto(`${BASE}/livros.html`);

        // --- VALIDAÇÕES ---

        // Redirecionamento para /detalhes.html?id=1
        await page.goto(`${BASE}/detalhes.html?id=1`);
        // Valida o redirecionamento para a página de detalhes do livro com id=1
        await expect(page).toHaveURL(/.*detalhes.html\?id=1/);

        //Localiza a imagem dentro da div específica
        const imagem = page.locator('div.book-image img');

        //Valida se está visível
        await expect(imagem).toBeVisible();

        //Valida se tem o SRC e o ALT corretos
        //await expect(imagem).toHaveAttribute('src', 'https://exemplo.com/nova-imagem.jpg');
        await expect(imagem).toHaveAttribute('src', 'https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg');
        //await expect(imagem).toHaveAttribute('alt', 'Clean Code - Edição Atualizada');
        await expect(imagem).toHaveAttribute('alt', 'Clean Code')

        // Valida se todos os campos (nome, autor, páginas, descrição, data) são exibidos
        // Validamos a existência das labels e os seus valores 
        //await expect(page.getByRole('heading', { name: 'Clean Code - Edição Atualizada' })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Clean Code' })).toBeVisible();
        await expect(page.getByText('Autor:')).toBeVisible();
        await expect(page.getByText(/Autor: Robert C. Martin/i)).toBeVisible();
        await expect(page.getByText('Páginas:')).toBeVisible();
        await expect(page.getByText(/Páginas: 464/i)).toBeVisible();
        await expect(page.getByText('Descrição:')).toBeVisible();
        await expect(page.getByText('Descrição: Um guia completo sobre boas práticas de programação')).toBeVisible();
        await expect(page.getByText('Data de Cadastro:')).toBeVisible();
        await expect(page.getByText(/Data de Cadastro:/i)).toBeVisible();

        //Os Botões de ação estão visíveis
        const btnVoltar = page.locator('button.btn-secondary');
        const BtnFavoritos = page.locator('button.btn.btn-primary');
        const btnDeletarLivro = page.locator('button.btn.btn-danger');
        await expect(btnVoltar).toBeVisible();
        await expect(BtnFavoritos).toBeVisible();
        await expect(btnDeletarLivro).toBeVisible();


        // Validar funcionalidade (Botão funcional)
        await btnVoltar.click();
        await expect(page).toHaveURL(/.*livros.html/);
    });
});

test.describe('CT-FE-011: Adicionar Livro aos Favoritos', () => {

    test('Validar funcionalidade de favoritar ', async ({ page }) => {

        // Pré-condição: Usuário autenticado
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ nome: 'Admin' }));
        });


        //Aceder a /livros.html
        await page.goto(`${BASE}/livros.html`);

        // --- VALIDAÇÕES ---

        //Redirecionamento para /detalhes.html?id=1
        await page.goto(`${BASE}/detalhes.html?id=1`);
        // Valida o redirecionamento para a página de detalhes do livro com id=1
        await expect(page).toHaveURL(/.*detalhes.html\?id=1/);

        // Configurar o listener para o Alert ANTES do clique

        page.once('dialog', async dialog => {
            expect(dialog.message()).toBe('Adicionado aos favoritos!');
            await dialog.accept();
            console.log(`Dialog message: ${dialog.message()}`);
        });

        //Clicar no botão Adicionar aosFavoritos.
        const btnFavoritos = page.locator('button.btn.btn-primary');
        await btnFavoritos.waitFor({ state: 'visible' });
        await expect(btnFavoritos).toBeVisible();
        //await expect(btnFavoritos).toContainText('🤍 Adicionar aos Favoritos');
        page.once('dialog', async dialog => {
            expect(dialog.message()).toBe('Adicionado aos favoritos!');
            await dialog.accept();
            console.log(`Dialog message: ${dialog.message()}`);

        });
        await expect(btnFavoritos).toHaveAttribute('onclick', 'toggleFavorito(1, false)');


        //await page.click('button:has-text("Adicionar aos Favoritos")');
        await btnFavoritos.click({ delay: 3000 }); // Clica no botão de favoritos

        //Validar que o botão mudou para remover dos favoritos
        await expect(btnFavoritos).toHaveAttribute('onclick', 'toggleFavorito(1, true)');
        await expect(btnFavoritos).toContainText('/Remover dos Favoritos/i');
        await expect(btnFavoritos).toContainText('❤️');
        page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.dismiss().catch(() => { });
        });

        // --- Validar na página dos favoritos ---

        //Navegar para a página de favoritos
        await page.goto(`${BASE}/favoritos.html`);

        //Localizo o container da lista de favoritos
        const listaFavoritos = page.locator('#lista-favoritos');
        /*
                //Validar se o livro específico aparece na lista
                await expect(listaFavoritos).toContainText('Clean Code');
        
                //Validar que a imagem também está presente nos favoritos
                const imagemFavorito = listaFavoritos.getByRole('img', { name: 'Clean Code' });
                await expect(imagemFavorito).toBeVisible();
        
        */


    });


});
test.describe('CT-FE-012: Remover Livro dos Favoritos ', () => {
    test('Validar remoção de favorito ', async ({ page }) => {
        //Pré-condição Usuário autenticado e livro já adicionado via LocalStorage
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ nome: 'Admin' }));
            //Forço o ID 1 como favorito para garantir o estado inicial do teste
            localStorage.setItem('favoritos', JSON.stringify());
            //localStorage.setItem('favoritos', JSON.stringify([1]));
        });


        //Aceder a /detalhes.html?id=1
        await page.goto(`${BASE}/detalhes.html?id=1`);

        const btnFavoritos = page.locator('button.btn.btn-primary');

        // Garantir que o botão começou no estado de "Remover"
        //await expect(btnFavoritos).toContainText(/Remover dos Favoritos/i);
        await expect(btnFavoritos).toHaveAttribute('onclick', 'toggleFavorito(1, false)');
        //Configurar listener para o Alert de remoção
        /*page.once('dialog', async dialog => {
            expect(dialog.message()).toBe('Removido dos favoritos!');
            await dialog.accept();
        });
        */
        page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.dismiss().catch(() => { });
        });
        //Clicar em "Remover dos Favoritos"
        await btnFavoritos.click();
        // await page.locator('button.btn.btn-primary', { hasText: 'Adicionar aos Favoritos' }).click();

        // --- VALIDAÇÕES ---

        //Botão volta para "Adicionar aos Favoritos"
        await expect(btnFavoritos).toHaveAttribute('onclick', 'toggleFavorito(1, false)')
        await expect(btnFavoritos).toContainText(/Adicionar aos Favoritos/i);
        await expect(btnFavoritos).toContainText('🤍');

        //Aceder a /favoritos.html
        await page.goto(`${BASE}/favoritos.html`);

        //Livro não aparece mais em /favoritos.html
        // Usamos .not.toContainText para garantir que o título desapareceu
        const listaFavoritos = page.locator('#lista-favoritos');
        await expect(listaFavoritos).not.toContainText('Clean Code');
        // Verifica se não existem cards de livros dentro da lista dos favoritos.
        await expect(listaFavoritos.locator('.book-card')).toHaveCount(0);
    });
});

test.describe('CT-FE-013: Listar Livros Favoritos', () => {

    test('Validar página de favoritos', async ({ page }) => {
        //Pré-condição: Injetar livros no localStorage antes de aceder à página
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ nome: 'Admin' }));
            // Simulamos que os livros com ID 1 e 2 estão favoritados
            localStorage.setItem('favoritos', JSON.stringify([1, 2]));
        });

        //Aceder /favoritos.html
        await page.goto(`${BASE}/favoritos.html`);

        // --- VALIDAÇÕES ---
        const grid = page.locator('#lista-favoritos');

        //Grid de livros favoritos é exibido
        await expect(grid).toBeVisible();

        //Apenas livros favoritados aparecem (verificamos se existem cards na lista)
        const cards = grid.locator('.book-card');
        await expect(cards).toHaveCount(2);

        // Validação específica de um conteúdo
        await expect(grid).toContainText('Clean Code');
    });

    test('Deve exibir mensagem quando não há favoritos', async ({ page }) => {
        //Pré-condição: Garantir que a lista de favoritos está vazia
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ nome: 'Admin' }));
            localStorage.setItem('favoritos', JSON.stringify([]));
        });

        await page.goto(`${BASE}/favoritos.html`);

        // --- VALIDAÇÕES ---
        //Mensagem específica é exibida quando a lista está vazia
        const mensagemVazia = page.getByText('Você ainda não tem livros favoritos');
        await expect(mensagemVazia).toBeVisible();

        // Garantir que a grid não tem nenhum card
        const cards = page.locator('#lista-favoritos .book-card');
        await expect(cards).toHaveCount(0);
    });
});
test.describe('CT-FE-014: Deletar Livro com Confirmação', () => {
    test(' Validar exclusão de livro ', async ({ page }) => {
        //Pré-condição: Usuário autenticado e na página de detalhes
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ nome: 'Admin' }));
        });

        // Usar o "Clean Code" como exemplo
        const tituloLivro = 'Clean Code';
        await page.goto(`${BASE}/detalhes.html?id=1`);

        //Configurar o listener para lidar com os DOIS dialog em sequência
        page.on('dialog', async dialog => {
            if (dialog.type() === 'confirm') {
                // Valida e aceita o pedido de confirmação ("Tem certeza que deseja deletar?")
                expect(dialog.message()).toContain('deletar');
                await dialog.accept();
            } else if (dialog.type() === 'alert') {
                // Valida e aceita o alerta de sucesso final
                expect(dialog.message()).toBe('Livro deletado com sucesso!');
                await dialog.accept();
            }
        });

        //Clicar em "Deletar Livro"
        const btnDeletar = page.locator('button.btn.btn-danger');
        await btnDeletar.click();

        // --- VALIDAÇÕES ---

        // Redireciona para /livros.html
        await expect(page).toHaveURL(/.*livros.html/);

        // Valida que o livro não aparece na lista
        const listaLivros = page.locator('#lista-livros');
        await expect(listaLivros).not.toContainText(tituloLivro);
    });
});
test.describe('CT-FE-015: Cancelar Deleção de Livro', () => {

    test('CT-FE-015: Cancelar Deleção de Livro', async ({ page }) => {
        // 1. Pré-condição: Usuário autenticado na página de detalhes do livro 1
        await page.addInitScript(() => {
            localStorage.setItem('usuario', JSON.stringify({ nome: 'Admin' }));
        });

        await page.goto(`${BASE}/detalhes.html?id=1`);
        const urlAntesDoClique = page.url();

        //Configurar o listener para CANCELAR a ação
        page.once('dialog', async dialog => {
            // Valida se o diálogo é do tipo 'confirm'
            expect(dialog.type()).toBe('confirm');
            // Clica em "Cancelar"
            await dialog.dismiss();
        });

        // 3. Clicar em "Deletar Livro" usando a classe solicitada anteriormente
        const btnDeletar = page.locator('button.btn-danger[onclick="deletarLivro(1)"]');
        await btnDeletar.click();

        // --- VALIDAÇÕES ---

        // O usuário permanece na página de detalhes.
        await expect(page).toHaveURL(urlAntesDoClique);

        //O livro continua existindo, caso o nome esteja no heading.
        await expect(page.getByRole('heading', { level: 2 })).toBeVisible();

        //Garantir que não há redirecionamento para a lista
        await expect(page).not.toHaveURL(/.*livros.html/);
    });

});
test.describe('CT-FE-016: Logout do Sistema', () => {

    test('Validar funcionalidade de sair', async ({ page }) => {
        await page.goto(`${BASE}/login.html`);
        ///Dados de Login.
        await page.getByRole('textbox', { name: 'Email:' }).click();
        await page.getByRole('textbox', { name: 'Email:' }).fill('admin@biblioteca.com');
        await page.getByRole('textbox', { name: 'Senha:' }).click();
        await page.getByRole('textbox', { name: 'Senha:' }).fill('123456');
        await page.getByRole('button', { name: 'Entrar' }).click();
        //Fica á escutade qualquer dialog.
        page.once('dialog', dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            dialog.dismiss().catch(() => { });
        });
        //Navegar primeiro para definir o domínio 
        await page.goto(`${BASE}/dashboard.html`);

        // Recarregar para a aplicação reconhecer a sessão injetada
        await page.reload();

        //Executar o Logout
        const btnSair = page.locator('button.nav-btn.logout:has-text("Sair")');
        await expect(btnSair).toBeVisible();
        await btnSair.click();

        // --- VALIDAÇÕES ---

        //Aguarda redirecionamento para o login
        await expect(page).toHaveURL(/.*login.html/);

        //Verifica se o localStorage foi limpo (uso a poll para aguardar o processo assíncrono)
        await expect.poll(async () => {
            return await page.evaluate(() => localStorage.getItem('usuario'));
        }).toBeNull();

        //Validar que os campos de login estão vazios
        const campoEmail = page.getByLabel('Email:');
        const campoSenha = page.getByLabel('Senha:');
        await expect(campoEmail).toHaveValue('');
        await expect(campoSenha).toHaveValue('');

        //Validação de rota protegida: Tentar voltar ao dashboard sem estar logado
        await page.goto(`${BASE}/dashboard.html`);

        // Deve ser expulso de volta para o login
        await expect(page).toHaveURL(/.*login.html/);
    });

});
