import { test, expect, Page } from '@playwright/test';
import { fakerFR_SN as faker } from '@faker-js/faker';
import { getFirstPatientFromAPI, getHospitalName, login, loginWithCredentials, logout, navigateToPatientsList } from '../utils/patient-helpers';
import { envConfig } from '../../../config/env.loader';

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

    test('Création des prestations', async ({ page }) => {
        let patientName: string;
        let hospitalName: string;

        await test.step('TC-007 : Créer une prestation de type consultation depuis la file d\'attente', async () => {
            await loginWithCredentials(page, 'drsy@eyone.net', 'passe');  // Utilise automatiquement les identifiants de l'environnement
            // await page.locator('#vertical-menu-btn').click();
            await page.getByRole('link', { name: ' Prestations En attente' }).click();
            await createPEC(page, 'Consultation');
        });

        await test.step('TC-008 : Créer une prestation de type analyse depuis la file d\'attente', async () => {
            await page.goBack();
            await createPEC(page, 'Analyse');
        });

        await test.step('TC-009 : Créer une prestation de type radiologie depuis la file d\'attente', async () => {
            await page.goBack();
            await createPEC(page, 'Radiologie');
        });

        await test.step('TC : Créer une prestation de type hospitalisation depuis la file d\'attente', async () => {
            await page.goBack();
            await createPEC(page, 'Hospitalisation');
        });

        await test.step('TC- : Créer une prestation de type ambulatoire depuis la file d\'attente', async () => {
            await page.goBack();
            await createPEC(page, 'Ambulatoire');
        });

        await test.step('TC-010 : Créer une prestation médicale de type analyse depuis le menu prestation médicale', async () => {
            // await loginWithCredentials(page, 'drsy@eyone.net', 'passe');  // Utilise automatiquement les identifiants de l'environnement
            await page.locator('#vertical-menu-btn').click();
            await getHospitalName(page).then((name: string) => hospitalName = name);
            await navigateToPatientsList(page);
            // On récupère le premier patient de la liste via l'API pour s'assurer qu'il existe
            let patient = await getFirstPatientFromAPI(page);
            if (!patient) {
                throw new Error('Aucun patient trouvé via l\'API');
            }
            patientName = `${patient.firstName} ${patient.lastName}`;
            // Créer une consultation pour ce patient            
            await createPrestation(page, patientName, hospitalName, 'Analyse');
        });

        await test.step('TC-011 : Créer une prestation médicale de type radiologie depuis le menu prestation médicale', async () => {
            await page.waitForTimeout(500);
            await createPrestation(page, patientName, hospitalName, 'Imagerie');
        });

        await test.step('TC- : Créer une prestation médicale de type consultation depuis le menu prestation médicale', async () => {
            await page.waitForTimeout(500);
            await createPrestation(page, patientName, hospitalName, 'Consultation');
        });

        await test.step('TC- : Créer une prestation de type hospitalisation depuis le menu prestation', async () => {
            await page.waitForTimeout(500);
            await createPrestation(page, patientName, hospitalName, 'Hospitalisation');
        });

        await test.step('TC- : Créer une prestation médicale de type ambulatoire depuis le menu prestation médicale', async () => {
            await page.waitForTimeout(500);
            await createPrestation(page, patientName, hospitalName, 'Ambulatoire');
        });
    });

});

async function createPrestation(page: Page, patientName: string, hospitalName: string, prestationType: string) {
    await page.getByRole('link', { name: ' Prestations 󰅀' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('link', { name: 'Créer prestation' }).click();
    if (envConfig.baseUrl === 'https://dpp.eyone.net' || envConfig.baseUrl === 'https://web-simedical.dpi.sn') {
        // await createPrestationStep(page, patientName, 'Nouvelle consultation');
    } else {
        await page.waitForURL('**/patient-identification');
        await expect(page.getByText('Patient Interne')).toBeVisible();
        // Renseigner les informations du patient
        await page.getByPlaceholder('Prénom, Nom, Numéro de télé').fill(patientName);
        const searchButton = page.locator('button').filter({ hasText: 'Rechercher' });
        await expect(searchButton).toBeVisible();
        await searchButton.click();
        await page.locator('tbody tr').filter({ hasText: patientName }).first().click();
        await expect(page.getByText('Nouvelle prestation')).toBeVisible();
        // Créer une prestation de consultation
        await page.locator('button').filter({ hasText: prestationType }).click();
    }
    await expect(page.getByText('Service *')).toBeVisible();
    await page.locator('.ng-select-container').click();
    await page.getByRole('option', { name: hospitalName }).click();
    const acte = page.getByText('Veuillez sélectionner un acte');
    try {
        await acte.waitFor({ state: 'visible', timeout: 2000 });
        // Sélectionner un acte
        await page.getByRole('combobox', { name: 'Veuillez sélectionner un acte' }).click();
        await page.locator('span').filter({ hasText: 'CONSULTATION CARDIO' }).first().click();

    } catch (e) {
        console.log('Aucun acte détecté.');
    }
    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.waitForURL('**/patient/details/eps/m/**');
    await expect(page.getByText('Détails prestation:')).toBeVisible();
}

async function createPEC(page: Page, prestationType: string) {
    await expect(page.getByRole('heading', { name: 'Prestations en attente de' })).toBeVisible();
    await page.waitForTimeout(2000);
    await page.locator('tbody tr').filter({ hasText: prestationType })
        .getByRole('button', { name: 'Créer la prestation' }).first()
        .click({ force: true });
    await page.waitForURL('**/patient/details/eps/m/**');
    await expect(page.getByText('Détails prestation:')).toBeVisible();
}
