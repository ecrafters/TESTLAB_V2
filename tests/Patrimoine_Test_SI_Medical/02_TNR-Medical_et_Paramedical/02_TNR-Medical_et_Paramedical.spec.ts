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
        await test.step('TC-001 : Ajouter un motif à un seul professionnel de la santé', async () => {
            await login(page);  // Utilise automatiquement les identifiants de l'environnement
            await page.locator('#vertical-menu-btn').click();
            const appointmentsLink = page.getByRole('link', { name: ' Rendez-vous 󰅀' });
            await appointmentsLink.scrollIntoViewIfNeeded();
            await appointmentsLink.click();
            await page.waitForTimeout(500);
            await page.click('a[href*="/appointment/reasons"]');
            await expect(page.getByRole('heading', { name: 'Motifs de Rendez-vous' })).toBeVisible();
        });

        await test.step('TC-002 : Ajouter un motif valable à plusieurs professionnels de la santé', async () => {
        });

    });

});