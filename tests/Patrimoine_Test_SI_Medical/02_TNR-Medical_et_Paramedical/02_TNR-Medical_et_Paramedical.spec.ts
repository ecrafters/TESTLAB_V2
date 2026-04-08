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

        await test.step.skip('TC-007 : Créer une prestation de type consultation depuis la file d\'attente', async () => {
            await loginWithCredentials(page, 'drsy@eyone.net', 'passe');  // Utilise automatiquement les identifiants de l'environnement
            // await page.locator('#vertical-menu-btn').click();
            await page.getByRole('link', { name: ' Prestations En attente' }).click();
            await createPEC(page, 'Consultation');
        });

        await test.step.skip('TC-008 : Créer une prestation de type analyse depuis la file d\'attente', async () => {
            await page.goBack();
            await createPEC(page, 'Analyse');
        });

        await test.step.skip('TC-009 : Créer une prestation de type radiologie depuis la file d\'attente', async () => {
            await page.goBack();
            await createPEC(page, 'Radiologie');
        });

        await test.step.skip('TC : Créer une prestation de type hospitalisation depuis la file d\'attente', async () => {
            await page.goBack();
            await createPEC(page, 'Hospitalisation');
        });

        await test.step.skip('TC- : Créer une prestation de type ambulatoire depuis la file d\'attente', async () => {
            await page.goBack();
            await createPEC(page, 'Ambulatoire');
        });

        await test.step('TC-010 : Créer une prestation médicale de type analyse depuis le menu prestation médicale', async () => {
            await loginWithCredentials(page, 'drsy@eyone.net', 'passe');  // Utilise automatiquement les identifiants de l'environnement
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
            await createPrestation(page, patientName, hospitalName, 'Imagerie');
        });

        await test.step('TC- : Créer une prestation médicale de type consultation depuis le menu prestation médicale', async () => {
            await createPrestation(page, patientName, hospitalName, 'Consultation');
        });

        await test.step('TC- : Créer une prestation médicale de type ambulatoire depuis le menu prestation médicale', async () => {
            await createPrestation(page, patientName, hospitalName, 'Ambulatoire');
        });

        await test.step('TC- : Créer une prestation de type hospitalisation depuis le menu prestation', async () => {
            await createPrestation(page, patientName, hospitalName, 'Hospitalisation');
        });

        await test.step('TC- : Ajouter un traitement à une hospitalisation', async () => {
            await page.getByRole('button', { name: 'Traitements ou soins' }).click();
            await expect(page.getByRole('button', { name: ' Ajouter un traitement/soin' })).toBeVisible();
            await page.getByRole('button', { name: ' Ajouter un traitement/soin' }).click();
            await expect(page.getByText('Ajouter un traitment/soin')).toBeVisible();
            const treatmentName = `Traitement Test ${faker.number.int(1000)}`;
            await page.getByRole('textbox').first().fill(treatmentName);
            await page.getByRole('combobox', { name: 'Rechercher un produit' }).pressSequentially('DOLI', { delay: 100 });;
            await page.locator('span').filter({ hasText: 'Doliprane' }).first().click();
            await page.getByRole('textbox').nth(1).fill('1 fois par jour pendant une semaine');
            await page.locator('#dd').fill(faker.date.recent().toISOString().split('T')[0]);
            await page.locator('#hd').fill(faker.date.recent().toISOString().split('T')[1].split(':')[0] + ':' + faker.date.recent().toISOString().split('T')[1].split(':')[1]);
            await page.getByRole('button', { name: 'Enregistrer' }).click();
            const treatmentRow = page.locator('tbody tr').filter({ hasText: treatmentName });
            await expect(treatmentRow).toBeVisible();
            await treatmentRow.locator('button').filter({ hasText: 'Visualiser' }).click();
            await expect(page.getByText('Doliprane')).toBeVisible();
            await expect(page.getByText('1 fois par jour pendant une semaine')).toBeVisible();
            await page.getByText('Retour à la liste').click();
        });

        await test.step('TC- : Effectuer la planification d\'un traitement', async () => {
            await expect(page.getByText('Planifier un traitement/soin')).toBeVisible();
            await page.getByText('Planifier un traitement/soin').click();
            await page.getByText('Planifier un traitment/soin').click();
            const planificationName = `Planification Test ${faker.number.int(1000)}`;
            await page.locator('form').filter({ hasText: 'Description *' }).getByRole('textbox').fill(planificationName);
            await page.getByRole('combobox', { name: 'Rechercher un produit' }).pressSequentially('DOLI', { delay: 100 });;
            await page.locator('span').filter({ hasText: 'Doliprane' }).first().click();
            await page.locator('form').filter({ hasText: 'MédicamentDétail Posologie' }).getByRole('textbox').fill('Une fois par jour');
            await page.locator('#method').getByRole('combobox').click();
            await page.getByRole('option', { name: 'abdou ndiaye' }).first().click();
            await page.getByRole('listbox').filter({ hasText: 'Veuillez sélectionner une' }).getByRole('combobox').click();
            await page.getByRole('option', { name: 'Unique' }).click();
            await page.locator('#dd').fill(faker.date.recent().toISOString().split('T')[0]);
            await page.locator('#hd').fill(faker.date.recent().toISOString().split('T')[1].split(':')[0] + ':' + faker.date.recent().toISOString().split('T')[1].split(':')[1]);
            await page.getByRole('button', { name: 'Enregistrer' }).click();
        });

        await test.step('TC- : Effectuer la planification d\'un traitement', async () => {
            await expect(page.getByText('Feuille de surveillance')).toBeVisible();
            await page.getByText('Feuille de surveillance').click();
            await expect(page.getByText('Ajouter une saisie')).toBeVisible();
            await page.getByText('Ajouter une saisie').click();
            await expect(page.getByText('Effectuer l\'examen')).toBeVisible();
            await page.getByPlaceholder('JJ/MM/AAAA').nth(2).fill(faker.date.recent().toISOString().split('T')[0]);
            await page.getByPlaceholder('JJ/MM/AAAA').nth(3).fill(faker.date.recent().toISOString().split('T')[1].split(':')[0] + ':' + faker.date.recent().toISOString().split('T')[1].split(':')[1]);
            await expect(page.getByRole('heading', { name: 'Constantes' })).toBeVisible();
            await page.locator('.d-flex.flex-column > .form-control').first().fill(faker.number.int(100).toString());
            await page.locator('div:nth-child(2) > .d-flex > .form-control').first().fill(faker.number.int(100).toString());
            await page.locator('div:nth-child(3) > div > .d-flex > .form-control').first().fill(faker.number.int(100).toString());
            await page.locator('div:nth-child(3) > div:nth-child(2) > .d-flex > .form-control').fill(faker.number.int(100).toString());
            await page.getByRole('button', { name: 'Enregistrer' }).click();
            await expect(page.getByText('Feuille de surveillance')).toBeVisible();
        });

        await test.step('TC- : Effectuer la planification d\'une surveillance', async () => {
            await expect(page.getByText('Planifier')).toBeVisible();
            await page.getByText('Planifier').click();
            await expect(page.getByText('Effectuer l\'examen')).toBeVisible();
            await page.locator('#method').getByRole('combobox').click();
            await page.getByRole('option', { name: 'abdou ndiaye' }).first().click();
            await page.getByRole('listbox').filter({ hasText: 'Veuillez sélectionner une' }).getByRole('combobox').click();
            await page.getByRole('option', { name: 'Unique' }).click();
            await page.locator('#dd').fill(faker.date.recent().toISOString().split('T')[0]);
            await page.locator('#hd').fill(faker.date.recent().toISOString().split('T')[1].split(':')[0] + ':' + faker.date.recent().toISOString().split('T')[1].split(':')[1]);
            await page.getByRole('button', { name: 'Enregistrer' }).click();
            await expect(page.getByText('Planifié', { exact: true })).toBeVisible();
        });

        await test.step('TC- : Ajouter un examen de type analyse dans une prestation de type hospitalisation', async () => {
            await expect(page.getByText('Examens demandés')).toBeVisible();
            await page.getByText('Examens demandés').click();
            await expect(page.getByText('Ajouter un examen')).toBeVisible();
            await page.getByText('Ajouter un examen').click();
            await page.locator('div').filter({ hasText: /^Veuillez sélectionner un élément$/ }).first().click();
            await page.locator('.ng-dropdown-panel .ng-option').filter({ hasText: 'Analyses' }).first().click();
            await page.locator('div').filter({ hasText: /^Veuillez sélectionner un élément$/ }).nth(1).click();
            await page.locator('.ng-dropdown-panel .ng-option').filter({ hasText: 'Sang - urine' }).first().click();
            await expect(page.getByText('Bulletin d\'Analyses Médicales')).toBeVisible();
            await page.locator('input[type="checkbox"]').first().check();
            await page.locator('input[type="checkbox"]').nth(2).check();
            await page.locator('input[type="checkbox"]').nth(3).check();
            await page.getByText('Sauvegarder l\'examen').click();
            await page.getByRole('button', { name: 'Sans télétransmission' }).click();
        });

        await test.step('TC- : Ajouter un examen de type analyse dans une prestation de type consultation', async () => {
            await page.reload();
            await page.locator('#vertical-menu-btn').click();
            await createPrestation(page, patientName, hospitalName, 'Consultation');
            await expect(page.getByText('Examens demandés')).toBeVisible();
            await page.getByText('Examens demandés').click();
            await expect(page.getByText('Ajouter un examen')).toBeVisible();
            await page.getByText('Ajouter un examen').click();
            await page.locator('div').filter({ hasText: /^Veuillez sélectionner un élément$/ }).first().click();
            await page.locator('.ng-dropdown-panel .ng-option').filter({ hasText: 'Analyses' }).first().click();
            await page.locator('div').filter({ hasText: /^Veuillez sélectionner un élément$/ }).nth(1).click();
            await page.locator('.ng-dropdown-panel .ng-option').filter({ hasText: 'Sang - urine' }).first().click();
            await expect(page.getByText('Bulletin d\'Analyses Médicales')).toBeVisible();
            await page.locator('input[type="checkbox"]').first().check();
            await page.locator('input[type="checkbox"]').nth(2).check();
            await page.locator('input[type="checkbox"]').nth(3).check();
            await page.getByText('Sauvegarder l\'examen').click();
            await page.getByRole('button', { name: 'Sans télétransmission' }).click();
            await page.pause();
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
