import { test, expect, Page } from '@playwright/test';
import { fakerFR_SN as faker } from '@faker-js/faker';
import { login, navigateToPatientsList, createPatientWithInsurer, getFirstPatientFromAPI } from '../utils/patient-helpers';

test('Facturer des prestations avec un patient non assuré', async ({ page }) => {
    let patientName: string;

    await test.step('TC-020 : Facturer une consultation avec un patient non assuré', async () => {
        await login(page);  // Utilise automatiquement les identifiants de l'environnement
        // Naviguer vers la section de paramétrage des actes
        await page.locator('#vertical-menu-btn').click();
        await navigateToPatientsList(page);
        // Essayons avec getByText (méthode la plus flexible)
        const { firstNamePatient, lastNamePatient } = await createPatient(page);
        patientName = `${firstNamePatient} ${lastNamePatient}`;
        console.log(`Patient sélectionné pour les tests de facturation : ${patientName}`);
        await createPrestationConsultation(page, patientName);
    });

    await test.step('TC-021 : Facturer une hospitalisation simple avec un patient non assuré', async () => {
        await page.locator('ol').getByText('Prestations').click();
        await page.waitForLoadState('networkidle');
        await createHospitalization(page, patientName);
    });

    await test.step("TC-022 : Facturer un acte d'analyse avec un patient non assuré", async () => {
        await page.locator('ol').getByText('Prestations').click();
        await page.waitForLoadState('networkidle');
        await createPrestationAnalyse(page, patientName);
    });

    await test.step("TC-023 : Facturer un acte d'imagerie avec un patient non assuré", async () => {
        await page.locator('ol').getByText('Prestations').click();
        await page.waitForLoadState('networkidle');
        await createPrestationImagerie(page, patientName);
    });
    await test.step("TC-024 : Facturer une ambulatoire avec un patient non assuré", async () => {
        await page.locator('ol').getByText('Prestations').click();
        await page.waitForLoadState('networkidle');
        await createPrestationAmbulatoire(page, patientName);
    });

    await test.step('TC-025 : Facturer une pharmacie', async () => {
        await page.locator('ol').getByText('Prestations').click();
        await page.waitForLoadState('networkidle');
        await createPrestationPharmacy(page, patientName);
    });



    // await test.step('TC-031 : Facturer une consultation avec un patient assuré avec une double prise en charge-Montant entièrement pris en charge', async () => {
    //     await page.locator('a').filter({ hasText: 'DPUP' }).click();
    //     await navigateToPatientsList(page);
    //     await createPatientWithDoubleInsurer(page);
    //     // On récupère le premier patient de la liste via l'API pour s'assurer qu'il existe
    //     let patient = await getFirstPatientFromAPI(page);
    //     if (!patient) {
    //         throw new Error('Aucun patient trouvé via l\'API');
    //     }
    //     patientName = `${patient.firstName} ${patient.lastName}`;
    //     console.log(`Patient sélectionné pour les tests de facturation : ${patientName}`);
    //     await page.getByRole('link', { name: ' Prestations', exact: true }).click();
    //     await page.waitForLoadState('networkidle');
    //     // Créer une consultation pour ce patient
    //     // await createPrestationConsultation(page, patientName);
    //     await page.pause();
    // });
});

test('Facturer des prestations avec un patient assuré', async ({ page }) => {
    let patientName: string;

    await test.step('TC-026 : Facturer une consultation avec un patient assuré', async () => {
        await login(page);  // Utilise automatiquement les identifiants de l'environnement
        // Naviguer vers la section de paramétrage des actes
        await page.locator('#vertical-menu-btn').click();
        await navigateToPatientsList(page);
        await createPatientWithInsurer(page);
        // On récupère le premier patient de la liste via l'API pour s'assurer qu'il existe
        let patient = await getFirstPatientFromAPI(page);
        if (!patient) {
            throw new Error('Aucun patient trouvé via l\'API');
        }
        patientName = `${patient.firstName} ${patient.lastName}`;
        // Créer une consultation pour ce patient
        await createPrestationConsultation(page, patientName);
    });

    await test.step('TC-027 : Facturer une hospitalisation simple avec un patient assuré', async () => {
        await page.locator('ol').getByText('Prestations').click();
        await page.waitForLoadState('networkidle');
        await createHospitalization(page, patientName);
    });

    await test.step("TC-028 : Facturer un acte d'analyse avec un patient assuré", async () => {
        await page.locator('ol').getByText('Prestations').click();
        await page.waitForLoadState('networkidle');
        await createPrestationAnalyse(page, patientName);
    });

    await test.step("TC-029 : Facturer un acte d'imagerie avec un patient assuré", async () => {
        await page.locator('ol').getByText('Prestations').click();
        await page.waitForLoadState('networkidle');
        await createPrestationImagerie(page, patientName);

    });

    await test.step("TC-030 : Facturer une ambulatoire avec un patient assuré", async () => {
        await page.locator('ol').getByText('Prestations').click();
        await page.waitForLoadState('networkidle');
        await createPrestationAmbulatoire(page, patientName);
    });
});

test('Encaissement des prestations avec un patient assuré', async ({ page }) => {
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

async function createPrestationAmbulatoire(page: Page, patientName: string) {
    await page.getByText('Créer prestation').click();
    await page.waitForURL('**/patient-identification');
    await expect(page.getByText('Patient Interne')).toBeVisible();
    // Renseigner les informations du patient
    await page.getByPlaceholder('Prénom, Nom, Numéro de télé').fill(patientName);
    await page.locator('button').filter({ hasText: 'Rechercher' }).click();
    await page.locator('tbody tr').filter({ hasText: patientName }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Nouvelle prestation')).toBeVisible();
    // Créer une prestation d'ambulatoire
    await page.locator('button').filter({ hasText: 'Ambulatoire' }).click();
    await page.waitForURL('**/ambulatory/create/**');
    await expect(page.locator('h4').filter({ hasText: 'Nouvel Ambulatoire' })).toBeVisible();
    await page.waitForResponse('**/sapi/rest/v1/organism-entities');

    // Sélectionner une prestation
    await page.getByRole('combobox', { name: 'Veuillez sélectionner un élé' }).click();
    await page.locator('span').filter({ hasText: 'ONDES MÉCANIQUES' }).first().click();
    await page.waitForResponse('**/prestations-items/medical-act-selection');
    await page.waitForLoadState('networkidle');
    await Promise.all([
        page.waitForResponse('**/dokploy-medical-billing/1.0/prestations/rev2', { timeout: 15000 }).catch(() => null), // catch évite de planter si la req n'est pas strictement nécessaire
        page.getByText('Enregistrer').click()
    ]);
    await expect(page.getByRole('heading', { name: 'Facture' })).toBeVisible();
    await expect(page.locator('#regenerate')).toBeVisible();
    await page.locator('#regenerate').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Facture régénérée avec succès')).toBeVisible();
}

async function createPrestationImagerie(page: Page, patientName: string) {
    await page.getByText('Créer prestation').click();
    await page.waitForURL('**/patient-identification');
    await expect(page.getByText('Patient Interne')).toBeVisible();
    // Renseigner les informations du patient
    await page.getByPlaceholder('Prénom, Nom, Numéro de télé').fill(patientName);
    await page.locator('button').filter({ hasText: 'Rechercher' }).click();
    await page.locator('tbody tr').filter({ hasText: patientName }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Nouvelle prestation')).toBeVisible();
    // Créer une prestation d'imagerie
    await page.locator('button').filter({ hasText: 'Imagerie' }).click();
    await page.waitForURL('**/imaging/create/**');
    await expect(page.locator('h4').filter({ hasText: 'NOUVELLE RADIOLOGIE/IMAGERIE' })).toBeVisible();
    // Sélectionner une prestation
    await page.getByRole('combobox', { name: 'Veuillez sélectionner un élé' }).click();
    await page.locator('span').filter({ hasText: 'RADIO THORAX' }).first().click();
    await page.waitForResponse('**/prestations-items/medical-act-selection');
    await page.waitForLoadState('networkidle');
    await Promise.all([
        page.waitForResponse('**/dokploy-medical-billing/1.0/prestations/rev2', { timeout: 15000 }).catch(() => null), // catch évite de planter si la req n'est pas strictement nécessaire
        page.getByText('Enregistrer').click()
    ]);
    await page.waitForResponse('**/dokploy-medical-billing/1.0/prestations/*');
    await expect(page.getByRole('heading', { name: 'Facture' })).toBeVisible();
    await expect(page.locator('#regenerate')).toBeVisible();
    await page.locator('#regenerate').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Facture régénérée avec succès')).toBeVisible();
}

async function createPrestationAnalyse(page: Page, patientName: string) {
    await page.getByText('Créer prestation').click();
    await page.waitForURL('**/patient-identification');
    await expect(page.getByText('Patient Interne')).toBeVisible();
    // Renseigner les informations du patient
    await page.getByRole('searchbox', { name: 'Tapez votre recherche' }).fill(patientName);
    await page.locator('button').filter({ hasText: 'Rechercher' }).click();
    await page.locator('tbody tr').filter({ hasText: patientName }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Nouvelle prestation')).toBeVisible();
    // Créer une prestation d'analyse
    await page.locator('button').filter({ hasText: 'Analyse' }).click();
    await page.waitForURL('**/analysis/create/**');
    await expect(page.locator('h4').filter({ hasText: 'Nouvelle analyse' })).toBeVisible();
    // Sélectionner une prestation
    await page.getByRole('combobox', { name: 'Veuillez sélectionner un élé' }).click();
    await page.locator('span').filter({ hasText: 'ANALYSE' }).first().click();
    await page.waitForResponse('**/prestations-items/medical-act-selection');
    await page.waitForLoadState('networkidle');
    await Promise.all([
        page.waitForResponse('**/dokploy-medical-billing/1.0/prestations/rev2', { timeout: 15000 }).catch(() => null), // catch évite de planter si la req n'est pas strictement nécessaire
        page.getByRole('button', { name: 'Enregistrer' }).click()
    ]);
    await expect(page.getByRole('heading', { name: 'Facture' })).toBeVisible();
    await expect(page.locator('#regenerate')).toBeVisible();
    await page.locator('#regenerate').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Facture régénérée avec succès')).toBeVisible();
}

async function createHospitalization(page: Page, patientName: string) {
    await page.getByText('Créer prestation').click();
    await page.waitForURL('**/patient-identification');
    await expect(page.getByText('Patient Interne')).toBeVisible();
    // Renseigner les informations du patient
    await page.getByPlaceholder('Prénom, Nom, Numéro de télé').fill(patientName);
    await page.locator('button').filter({ hasText: 'Rechercher' }).click();
    await page.locator('tbody tr').filter({ hasText: patientName }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Nouvelle prestation')).toBeVisible();
    // Créer une prestation d'hospitalisation
    await page.locator('button').filter({ hasText: 'Hospitalisation' }).click();
    await page.waitForURL('**/hospitalisation/create/**');
    await expect(page.locator('h4').filter({ hasText: 'Nouvelle hospitalisation' })).toBeVisible();
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await page.waitForLoadState('networkidle');
    // Ajouter une chambre à l'hospitalisation
    await page.getByRole('button', { name: ' Chambres' }).click();
    await page.waitForURL('**/prestation/eps/info/*/rooms');
    await expect(page.getByRole('heading', { name: 'Liste des chambres' })).toBeVisible();
    await page.getByRole('button', { name: ' Ajouter une chambre' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Nouvelle Chambre' })).toBeVisible();
    // la date de début de validité de l'assurance
    const startDate = faker.date.recent();
    await page.getByRole('textbox', { name: 'Date d\'entrée *' }).fill(startDate.toISOString().split('T')[0]);
    // la date de fin de validité de l'assurance qui est postérieure à la date de début
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // 1 jour après la date de début
    await page.getByRole('textbox', { name: 'Date de sortie' }).fill(endDate.toISOString().split('T')[0]);
    // Sélectionner une chambre
    await page.locator('#saisie').getByRole('button').filter({ hasText: /^$/ }).click();
    const waitForRooms = page.waitForResponse('**/room-categories');
    const responseRooms = await waitForRooms;
    const room = (await responseRooms.json()).length > 0 ? (await responseRooms.json())[0] : null;
    if (!room) {
        // await page.locator('.ri-add-circle-fill').first().click();
        await page.pause(); // Pause pour permettre l'inspection manuelle si nécessaire
        // await page.getByRole('textbox', { name: 'Nom de la catégorie *' }).fill(`Catégorie ${faker.random.alphaNumeric(5)}`);
        // await page.getByRole('spinbutton', { name: 'Prix par jour *' }).fill('100');
        // await page.getByRole('button', { name: ' Enregistrer' }).click();
        // await page.waitForLoadState('networkidle');
        // await page.locator('#saisie').getByRole('button').filter({ hasText: /^$/ }).click();
        // await page.waitForResponse('**/room-categories');
    }
    await page.locator('.btn.btn-sm.btn-primary.col-4').first().click();
    await page.waitForResponse('**/room-items/bed-selection');
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Facturation' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Facture' })).toBeVisible();
    await page.locator('#regenerate').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Facture régénérée avec succès')).toBeVisible();
}

async function createPrestationConsultation(page: Page, patientName: string, doublePriseEnCharge: boolean = false) {
    await page.locator('a').filter({ hasText: 'Prestations' }).first().click();
    await page.waitForTimeout(500);
    await page.getByText('Créer prestation').click();
    await page.waitForURL('**/patient-identification');
    await expect(page.getByText('Patient Interne')).toBeVisible();
    // Renseigner les informations du patient
    await page.getByPlaceholder('Prénom, Nom, Numéro de télé').fill(patientName);
    const searchButton = page.locator('button').filter({ hasText: 'Rechercher' });
    await expect(searchButton).toBeVisible();
    await searchButton.click();
    await page.locator('tbody tr').filter({ hasText: patientName }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Nouvelle prestation')).toBeVisible();
    // Créer une prestation de consultation
    await page.locator('button').filter({ hasText: 'Consultation' }).click();
    await page.waitForURL('**/consultation/create/**');
    await expect(page.locator('h4').filter({ hasText: 'Nouvelle consultation' })).toBeVisible();
    // Sélectionner une prestation
    await page.getByLabel('Prestation Médicale *').click();
    await page.locator('span').filter({ hasText: 'CONSULTATION CARDIO' }).first().click();
    await page.waitForResponse('**/consultations/consultation-act-selection');
    await page.waitForLoadState('networkidle');
    // await page.locator('h4', { hasText: 'Total Facture' }).scrollIntoViewIfNeeded();
    await page.getByText('Enregistrer').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Facture', { exact: true })).toBeVisible();
    await page.locator('#regenerate').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Facture régénérée avec succès')).toBeVisible();
}

async function createPrestationPharmacy(page: Page, patientName: string) {
    await page.getByText('Créer prestation').click();
    await page.waitForURL('**/patient-identification');
    await expect(page.getByText('Patient Interne')).toBeVisible();
    // Renseigner les informations du patient
    await page.getByPlaceholder('Prénom, Nom, Numéro de télé').fill(patientName);
    await page.locator('button').filter({ hasText: 'Rechercher' }).click();
    await page.locator('tbody tr').filter({ hasText: patientName }).first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Nouvelle prestation')).toBeVisible();
    // Créer une prestation pharmacie
    await page.locator('button').filter({ hasText: 'Pharmacie' }).click();
    await page.waitForURL('**/pharmacy/create/**');
    await page.waitForResponse('**/organisms/users/*/assigned-organisms');
    await expect(page.locator('h4').filter({ hasText: 'Nouvelle Pharmacie' })).toBeVisible();
    // Sélectionner une prestation
    await expect(page.getByRole('heading', { name: 'Produit à ajouter' })).toBeVisible();
    await page.locator('.col-12 > .ng-select > .ng-select-container').first().click();
    const hospitalOption = page.locator('.ng-dropdown-panel .ng-option').filter({ hasText: 'PHARMACIE' }).first();
    await hospitalOption.click();
    await page.getByRole('combobox', { name: 'Produit' }).pressSequentially('DOLI', { delay: 100 });
    await page.locator('span').filter({ hasText: 'DOLIPRANE' }).first().click();
    await page.waitForLoadState('networkidle');
    await page.locator('#mouvementValue').fill('10');
    await page.getByRole('button', { name: 'Ajouter à la liste' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('tbody tr').filter({ hasText: 'DOLIPRANE' })).toBeVisible();
    await page.getByText('Enregistrer').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Facture' })).toBeVisible();
    await page.locator('#regenerate').click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Facture régénérée avec succès')).toBeVisible();
}

async function createPatient(page: Page) {
    const addPatientButton = page.getByText('Créer un patient');
    await expect(addPatientButton).toBeVisible();
    await addPatientButton.click();
    await page.waitForURL('**/patient/create/**');

    const patientFormTitle = page.locator('h6', { hasText: 'Identité du patient - Informations Principales' });
    await expect(patientFormTitle).toBeVisible();
    await expect(patientFormTitle).toHaveText('Identité du patient - Informations Principales');

    const sexe = faker.person.sexType();
    const firstNamePatient = faker.person.firstName(sexe);
    const lastNamePatient = faker.person.lastName(sexe);
    const birthDate = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
    const sexePatient = sexe === 'male' ? 'Masculin' : 'Féminin';
    // Remplir le formulaire de création de patient
    await page.locator('input[type="text"]').nth(1).fill(firstNamePatient);
    await page.locator('input[type="text"]').nth(2).fill(lastNamePatient);
    await page.getByPlaceholder('000000000').fill('777536172');
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner un sexe$/ }).first().click();
    const sexeOption = page.locator('.ng-dropdown-panel .ng-option').filter({ hasText: sexePatient }).first();
    await expect(sexeOption).toBeVisible({ timeout: 10000 });
    await sexeOption.click();
    await page.getByPlaceholder('JJ/MM/AAAA').fill(birthDate.toLocaleDateString('fr-FR'));
    await page.getByText('Enregistrer').click();
    // Attendre jusqu'à 5 secondes l'apparition du bouton OUI (détection de doublons api : check-likeness-patient)
    const btnOui = page.getByRole('button', { name: 'OUI' });
    try {
        await btnOui.waitFor({ state: 'visible', timeout: 5000 });
        await btnOui.click();
    } catch (e) {
        // Ignorer l'erreur si la modale de doublon n'apparait pas, le test continue normalement
        console.log('Aucun doublon détecté, pas de modale à fermer.');
    }
    // Vérification que le patient a été créé et que nous sommes redirigés vers la page de détails du patient
    await page.waitForURL('**/patient/list');
    await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible();
    return { firstNamePatient, lastNamePatient };
}

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