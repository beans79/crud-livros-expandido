// @ts-check
import { test, expect } from '@playwright/test';

//////teste do login//// ver se funciona o login com email e senha corretos, e se aparece a mensagem de sucesso, e se o objeto usuario é retornado sem a senha
test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login.html');
  await page.getByRole('textbox', { name: 'Email:' }).click();
  await page.getByRole('textbox', { name: 'Email:' }).fill('admin@biblioteca.com');
  await page.getByRole('textbox', { name: 'Senha:' }).click();
  await page.getByRole('textbox', { name: 'Senha:' }).fill('123456');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Entrar' }).click();
});