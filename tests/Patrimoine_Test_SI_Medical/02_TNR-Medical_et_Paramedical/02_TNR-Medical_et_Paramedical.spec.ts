import { test, expect, Page } from '@playwright/test';
import { fakerFR_SN as faker } from '@faker-js/faker';
import { login, loginWithCredentials, logout } from '../utils/patient-helpers';

test.describe('TNR Medical et Paramedical', () => {
    // let page: Page;

    // test.beforeEach(async ({ browser }) => {
    //     page = await browser.newPage();
    //     // await page.goto('/');
    // });

    // test.afterEach(async () => {
    //     await page.close();
    // });

    // test.beforeEach(async ({ page }) => {
    //     // Go to the starting url before each test.
    //     await page.goto('/');
    // });

    test('TNR-Rdv', async ({ page }) => {
        await test.step('TC-007 : Créer une prestation de type consultation depuis la file d\'attente', async () => {
            await login(page);  // Utilise automatiquement les identifiants de l'environnement
            await page.locator('#vertical-menu-btn').click();
        });

        await test.step('TC-002 : Ajouter un motif valable à plusieurs professionnels de la santé', async () => {
        });

    });

});