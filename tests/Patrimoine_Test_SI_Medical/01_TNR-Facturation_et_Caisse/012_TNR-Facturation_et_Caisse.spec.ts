import { test, expect, Page } from '@playwright/test';
import { fakerFR_SN as faker } from '@faker-js/faker';
import { createPatientWithDoubleInsurer, createPatientWithInsurer, getFirstPatientFromAPI, getHospitalName, login, navigateToPatientsList } from '../utils/patient-helpers';
import { envConfig } from '../../../config/env.loader';

test('01_TNR-Facturation et Caisse', async ({ page }) => {
    let patientName: string;

    await test.step('TC-037 : Encaisser une hospitalisation avec un patient assuré', async () => {
        await login(page);  // Utilise automatiquement les identifiants de l'environnement
        await page.getByRole('link', { name: ' Règlements à payer' }).click();
        const responseReglements = page.waitForURL('**/gestion-financiere/reglements-a-payer');
        await responseReglements;
        await encaisserPrestation(page, 'Hospitalisation');
    });

    await test.step('TC-049 : Encaisser une consultation avec un patient assuré', async () => {
        await page.getByRole('button', { name: 'Rafraîchir' }).click();
        await page.waitForLoadState('networkidle');
        await encaisserPrestation(page, 'Ambulatoire');
    });

    await test.step('TC-050 : Encaisser une analyse avec un patient assuré', async () => {
        await page.getByRole('button', { name: 'Rafraîchir' }).click();
        await page.waitForLoadState('networkidle');
        await encaisserPrestation(page, 'Analyse');
    });

    await test.step('TC-055 : Encaisser une ambulatoire avec un patient assuré', async () => {
        await page.getByRole('button', { name: 'Rafraîchir' }).click();
        await page.waitForLoadState('networkidle');
        await encaisserPrestation(page, 'Ambulatoire');
    });

    await test.step('TC-061 : Encaisser une hospitalisation contenant de la pharmacie avec un patient assuré', async () => {
        await page.getByRole('button', { name: 'Rafraîchir' }).click();
        await page.waitForLoadState('networkidle');
        await encaisserPrestation(page, 'Pharmacie');
    });


});

async function encaisserPrestation(page: Page, prestationName: string) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Attendre 2 secondes pour s'assurer que le tableau est bien chargé
    await expect(page.getByRole('heading', { name: 'à payer' })).toBeVisible({ timeout: 15000 });
    const rowsText = await page.locator('tbody tr').allTextContents();
    // console.log('Contenu du tableau :', rowsText);
    await page.locator('tbody tr').filter({ hasText: prestationName })
        .locator('[class*="mdi-dots"]').first().click({ force: true });
    await page.locator('.dropdown-menu.show .dropdown-item', { hasText: 'Encaisser' }).click();
    await expect(page.getByRole('heading', { name: 'Encaissement en espèces' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('dialog', { name: 'Encaissement en espèces' }).getByRole('button', { name: 'Oui' }).click();
    await page.waitForLoadState('networkidle');
}