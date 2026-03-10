import { test, expect, Page } from '@playwright/test';
import { fakerFR_SN as faker } from '@faker-js/faker';
import { getFirstPatientFromAPI, getHospitalName, login } from '../../Patrimoine_Test_SI_Medical/utils/patient-helpers';

async function encaisserPrestation(page: Page, prestationName: string) {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Accueil' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('link', { name: ' Règlements à payer' }).click();
    await page.waitForURL('**/gestion-financiere/reglements-a-payer');
    await expect(page.getByRole('heading', { name: 'à payer' })).toBeVisible({ timeout: 15000 });
    await page.locator('tbody tr').filter({ hasText: prestationName }).locator('.dropdown-toggle.mdi').first().click();
    await page.locator('.dropdown-menu.show .dropdown-item', { hasText: 'Encaisser' }).click();
    await expect(page.getByRole('heading', { name: 'Encaissement en espèces' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('dialog', { name: 'Encaissement en espèces' }).getByRole('button', { name: 'Oui' }).click();
    await page.waitForLoadState('networkidle');
}

test('01_TNR-Facturation et Caisse', async ({ page }) => {
    let hospitalName: string;
    let patient: any;

    await test.step('TC-001 : Facturer une consultation avec un patient non assuré', async () => {
        await login(page);  // Utilise automatiquement les identifiants de l'environnement
        await getHospitalName(page).then((name: string) => hospitalName = name);

        // On récupère le premier patient de la liste via l'API pour s'assurer qu'il existe
        patient = await getFirstPatientFromAPI(page);
        if (!patient) {
            throw new Error('Aucun patient trouvé via l\'API');
        }

        await page.getByRole('link', { name: ' Prestations' }).click();
        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/prestation/list');
        await expect(page.getByRole('heading', { name: 'Liste des prestations financi' })).toBeVisible({ timeout: 15000 });

        const createPrestationButton = page.getByRole('button', { name: ' Créer une prestation' });
        await createPrestationButton.click();
        await page.waitForURL('**/patient-identification');
        await expect(page.getByRole('button', { name: 'Patient Interne' })).toBeVisible({ timeout: 15000 });
        // Renseigner les informations du patient
        await page.getByRole('searchbox', { name: 'Tapez votre recherche' }).fill(`${patient.firstName} ${patient.lastName}`);
        await page.getByRole('button', { name: 'Rechercher' }).click();
        await page.locator('tbody tr').filter({ hasText: `${patient.firstName} ${patient.lastName}` }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading', { name: 'Nouvelle prestation' })).toBeVisible({ timeout: 15000 });
        // Créer une prestation de consultation
        await page.getByRole('button', { name: 'Consultation' }).click();
        await page.waitForURL('**/consultation/create/**');
        await expect(page.getByRole('heading', { name: 'Nouvelle consultation' })).toBeVisible({ timeout: 15000 });

        // Sélectionner une prestation
        await page.getByRole('combobox', { name: 'Prestation Médicale *' }).click();
        await page.locator('span').filter({ hasText: 'CONSULTATION CARDIO' }).first().click();
        await page.waitForResponse('**/consultations/consultation-act-selection');
        await page.waitForLoadState('networkidle');
        // await page.getByRole('heading', { name: 'Total Facture' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: ' Enregistrer' }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading', { name: 'Facture' })).toBeVisible({ timeout: 15000 });
        await page.locator('#regenerate').click();
        await page.waitForLoadState('networkidle');

        // Encaisser la facture
        await encaisserPrestation(page, 'Consultation');
    });

    await test.step('TC-002 : Facturer et encaisser une hospitalisation', async () => {
        await page.goto('/prestation/list');
        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/prestation/list');
        await expect(page.getByRole('heading', { name: 'Liste des prestations financi' })).toBeVisible({ timeout: 15000 });

        const createPrestationButton = page.getByRole('button', { name: ' Créer une prestation' });
        await createPrestationButton.click();
        await page.waitForURL('**/patient-identification');
        await expect(page.getByRole('button', { name: 'Patient Interne' })).toBeVisible({ timeout: 15000 });
        // Renseigner les informations du patient
        await page.getByRole('searchbox', { name: 'Tapez votre recherche' }).fill(`${patient.firstName} ${patient.lastName}`);
        await page.getByRole('button', { name: 'Rechercher' }).click();
        await page.locator('tbody tr').filter({ hasText: `${patient.firstName} ${patient.lastName}` }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading', { name: 'Nouvelle prestation' })).toBeVisible({ timeout: 15000 });
        // Créer une prestation d'hospitalisation
        await page.getByRole('button', { name: 'Hospitalisation' }).click();
        await page.waitForURL('**/hospitalisation/create/**');
        await expect(page.getByRole('heading', { name: 'Nouvelle hospitalisation' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('button', { name: 'Enregistrer' }).click();
        await page.waitForLoadState('networkidle');

        // Ajouter une chambre à l'hospitalisation
        await page.getByRole('button', { name: ' Chambres' }).click();
        await page.waitForURL('**/prestation/eps/info/*/rooms');
        await expect(page.getByRole('heading', { name: 'Liste des chambres' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('button', { name: ' Ajouter une chambre' }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading', { name: 'Nouvelle Chambre' })).toBeVisible({ timeout: 15000 });
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
        // await page.pause(); // Pause pour permettre l'inspection manuelle si nécessaire
        await page.locator('.btn.btn-sm.btn-primary.col-4').first().click();
        await page.waitForResponse('**/room-items/bed-selection');
        // await page.getByRole('heading', { name: 'Total Facture' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
        await page.waitForLoadState('networkidle');

        // Ajouter un acte à l'hospitalisation
        await page.getByRole('button', { name: 'Actes Médicaux' }).click();
        await page.waitForURL('**/prestation/eps/info/*/medicals');
        await expect(page.getByRole('heading', { name: 'Liste des actes' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('button', { name: ' Ajouter un acte' }).click();
        await expect(page.getByRole('heading', { name: 'Création de l\'acte médical' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('combobox', { name: 'Acte *' }).click();
        await page.locator('span').filter({ hasText: 'ONDES MÉCANIQUES' }).first().click();
        await page.waitForResponse('**/prestations-items/medical-act-selection');
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un élément$/ }).first().click();
        await page.getByRole('option', { name: 'Dr Ndiaye' }).click();
        await page.getByRole('button', { name: ' Enregistrer' }).click();
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: 'OK' }).click();
        await page.getByRole('button', { name: ' Fermer' }).click();

        // Associer une prestation à l'hospitalisation
        await page.getByRole('button', { name: ' Associer une prestation' }).first().click();
        await page.waitForResponse('**/sapi/rest/v1/doctors');
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un élément$/ }).nth(3).click();
        await page.getByRole('option', { name: hospitalName }).click();
        await page.getByRole('combobox', { name: 'Veuillez sélectionner un élé' }).click();
        await page.locator('span').filter({ hasText: 'HEMOGRAMME' }).first().click();
        await page.waitForResponse('**/prestations-items/medical-act-selection');
        await page.getByRole('button', { name: ' Enregistrer' }).click();
        await page.waitForLoadState('networkidle');

        // Associer une autre prestation à l'hospitalisation
        await expect(page.getByRole('heading', { name: 'Imageries Associées' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('button', { name: ' Associer une prestation' }).nth(1).click();
        await page.waitForResponse('**/sapi/rest/v1/doctors');
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un élément$/ }).nth(3).click();
        await page.getByRole('option', { name: hospitalName }).click();
        await page.getByRole('combobox', { name: 'Veuillez sélectionner un élé' }).click();
        await page.locator('span').filter({ hasText: 'RADIOGRAPHIE THORAX' }).first().click();
        const responseSelectedAct = page.waitForResponse('**/prestations-items/medical-act-selection');
        await responseSelectedAct;
        await page.getByRole('button', { name: 'Enregistrer' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForLoadState('networkidle');

        // Ajouter un médicament à l'hospitalisation
        await expect(page.getByRole('button', { name: 'Traitements' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('button', { name: 'Traitements' }).click();
        await page.waitForURL('**/prestation/eps/info/*/pharmacy');
        await expect(page.getByRole('heading', { name: 'Liste des médicaments' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('button', { name: ' Ajouter un médicament' }).click();
        await expect(page.getByRole('heading', { name: 'Ajouter un médicament' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('combobox', { name: 'Produit *' }).pressSequentially('DOLI', { delay: 100 });
        await page.locator('span').filter({ hasText: 'DOLIPRANE' }).first().click();
        await page.getByRole('spinbutton', { name: 'Quantité' }).fill('3');
        await page.getByRole('spinbutton', { name: 'Prix unitaire appliqué' }).click();
        const response = page.waitForResponse('**/pharmacies/inputs');
        await response;
        await page.getByRole('button', { name: ' Enregistrer' }).click();
        await page.waitForLoadState('networkidle');
        const successDialog = page.getByRole('dialog', { name: 'Succès' });
        await expect(successDialog).toBeVisible({ timeout: 15000 });
        await successDialog.getByRole('button', { name: 'OK' }).click();
        await page.getByRole('button', { name: 'Fermer' }).click();

        // Générer la facture
        await expect(page.getByRole('button', { name: 'Facturation' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('button', { name: 'Facturation' }).click();
        await page.waitForURL('**/prestation/eps/info/*/facturation');
        await expect(page.getByRole('heading', { name: 'Facture' })).toBeVisible({ timeout: 15000 });
        await expect(page.getByText('Générer', { exact: true })).toBeVisible({ timeout: 15000 });
        await page.locator('#regenerate').click();
        await page.waitForLoadState('networkidle');

        // Encaisser la facture
        await encaisserPrestation(page, 'Hospitalisation');

        // Libérer la chambre
        await page.goto('/prestation/hospitalisations_financier_en_cours');
        await page.waitForLoadState('networkidle');
        await page.locator('tbody tr').filter({ hasText: 'Hospitalisation' }).locator('.dropdown-toggle.mdi').first().click();
        await page.locator('.dropdown-menu.show .dropdown-item', { hasText: 'Vue facturation' }).click();
        await page.waitForURL('**/prestation/eps/info/*/facturation');
        const statusElement = page.getByRole('button', { name: 'Effectuée', exact: true });
        await expect(statusElement).toBeVisible({ timeout: 15000 });
        await statusElement.click();
        await page.getByRole('dialog', { name: 'Validation' }).getByRole('button', { name: 'Oui' }).click();
        await page.waitForLoadState('networkidle');
    });

    await test.step('TC-003 : Facturer un acte d\'analyse avec un patient non assuré et encaisser', async () => {
        await page.goto('/prestation/list');
        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/prestation/list');
        await expect(page.getByRole('heading', { name: 'Liste des prestations financi' })).toBeVisible({ timeout: 15000 });

        const createPrestationButton = page.getByRole('button', { name: ' Créer une prestation' });
        await createPrestationButton.click();
        await page.waitForURL('**/patient-identification');
        await expect(page.getByRole('button', { name: 'Patient Interne' })).toBeVisible({ timeout: 15000 });
        // Renseigner les informations du patient
        await page.getByRole('searchbox', { name: 'Tapez votre recherche' }).fill(`${patient.firstName} ${patient.lastName}`);
        await page.getByRole('button', { name: 'Rechercher' }).click();
        await page.locator('tbody tr').filter({ hasText: `${patient.firstName} ${patient.lastName}` }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading', { name: 'Nouvelle prestation' })).toBeVisible({ timeout: 15000 });

        // Créer une prestation d'analyse
        await page.getByRole('button', { name: 'Analyse' }).click();
        await page.waitForLoadState('networkidle');

        await expect(page.getByRole('heading', { name: 'Nouvelle Analyse' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('combobox', { name: 'Veuillez sélectionner un élé' }).click();
        await page.locator('span').filter({ hasText: 'HEMOGRAMME' }).first().click();
        await page.waitForResponse('**/prestations-items/medical-act-selection');
        await page.getByRole('button', { name: 'Enregistrer' }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading', { name: 'Facture' })).toBeVisible({ timeout: 15000 });
        await page.locator('#regenerate').click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Facture régénérée avec succès')).toBeVisible({ timeout: 15000 });

        // Encaisser la facture
        await encaisserPrestation(page, 'Analyse');
    });

    await test.step('TC-004 : Facturer un acte d\'imagerie avec un patient non assuré et encaisser', async () => {
        await page.goto('/prestation/list');
        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/prestation/list');
        await expect(page.getByRole('heading', { name: 'Liste des prestations financi' })).toBeVisible({ timeout: 15000 });

        const createPrestationButton = page.getByRole('button', { name: ' Créer une prestation' });
        await createPrestationButton.click();
        await page.waitForURL('**/patient-identification');
        await expect(page.getByRole('button', { name: 'Patient Interne' })).toBeVisible({ timeout: 15000 });
        // Renseigner les informations du patient
        await page.getByRole('searchbox', { name: 'Tapez votre recherche' }).fill(`${patient.firstName} ${patient.lastName}`);
        await page.getByRole('button', { name: 'Rechercher' }).click();
        await page.locator('tbody tr').filter({ hasText: `${patient.firstName} ${patient.lastName}` }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading', { name: 'Nouvelle prestation' })).toBeVisible({ timeout: 15000 });

        // Créer une prestation d'imagerie
        await page.getByRole('button', { name: 'Imagerie' }).click();
        await page.waitForURL('**/imaging/create/**');
        await expect(page.getByRole('heading', { name: 'NOUVELLE RADIOLOGIE/IMAGERIE' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('combobox', { name: 'Veuillez sélectionner un élé' }).click();
        await page.locator('span').filter({ hasText: 'RADIOGRAPHIE THORAX' }).first().click();
        const responseSelectedActImagerie = page.waitForResponse('**/prestations-items/medical-act-selection');
        await responseSelectedActImagerie;
        await page.getByRole('button', { name: 'Enregistrer' }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading', { name: 'Facture' })).toBeVisible({ timeout: 15000 });
        await page.locator('#regenerate').click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Facture régénérée avec succès')).toBeVisible({ timeout: 15000 });

        // Encaisser la facture
        await encaisserPrestation(page, 'Imagerie');

        // await page.pause(); // Pause pour permettre l'inspection manuelle si nécessaire

    });
});

