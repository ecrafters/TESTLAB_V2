import { test, expect } from '@playwright/test';
import { fakerFR_SN as faker } from '@faker-js/faker';
import {
    login,
    navigateToPatientsList,
    getFirstPatientFromAPIWithClearSearch,
    openSearchPanel,
    searchAndVerify,
    fillPatientFormAndAddInsurer
} from '../utils/patient-helpers';

// test.setTimeout(300000); // Augmenter le timeout global à 5 minutes
test('TNR-Patient', async ({ page }) => {

    await test.step('TC-001 : Créer un patient sans assurance', async () => {
        await login(page);  // Utilise automatiquement les identifiants de l'environnement
        await navigateToPatientsList(page);

        // Essayons avec getByText (méthode la plus flexible)
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
        await page.getByRole('textbox').first().fill(firstNamePatient);
        await page.getByRole('textbox').nth(1).fill(lastNamePatient);
        await page.getByRole('textbox', { name: '000000000' }).fill('777536172');
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un sexe$/ }).first().click();
        await page.getByRole('option', { name: sexePatient }).click();
        await page.getByRole('textbox', { name: 'JJ/MM/AAAA' }).fill(birthDate.toLocaleDateString('fr-FR'));
        await page.getByRole('button', { name: 'Enregistrer' }).click();
        // Vérification que le patient a été créé et que nous sommes redirigés vers la page de détails du patient
        await page.waitForURL('**/patient/list');
        await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible({ timeout: 15000 });
    });

    await test.step('TC-002 : Créer un patient avec prise en charge simple', async () => {
        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées
        await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible({ timeout: 15000 });

        // Essayons avec getByText (méthode la plus flexible)
        const addPatientButton = page.getByText('Créer un patient');
        await expect(addPatientButton).toBeVisible();
        await addPatientButton.click();
        await page.waitForURL('**/patient/create/**');
        const patientFormTitle = page.locator('h6', { hasText: 'Identité du patient - Informations Principales' });
        await expect(patientFormTitle).toBeVisible();
        await expect(patientFormTitle).toHaveText('Identité du patient - Informations Principales');

        await fillPatientFormAndAddInsurer(page);
        // Vérification que le patient a été créé et que nous sommes redirigés vers la page de détails du patient
        await page.waitForURL('**/patient/list');
        await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible({ timeout: 15000 });
    });

    await test.step('TC-003 : Créer un patient avec une double prise en charge', async () => {
        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        await page.waitForURL('**/patient/**');

        // Vérification que les informations du patient sont affichées
        await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible({ timeout: 15000 });

        // Essayons avec getByText (méthode la plus flexible)
        const addPatientButton = page.getByText('Créer un patient');
        await expect(addPatientButton).toBeVisible();
        await addPatientButton.click();
        await page.waitForURL('**/patient/create/**');
        const patientFormTitle = page.locator('h6', { hasText: 'Identité du patient - Informations Principales' });
        await expect(patientFormTitle).toBeVisible();
        await expect(patientFormTitle).toHaveText('Identité du patient - Informations Principales');

        await fillPatientFormAndAddInsurer(page);
        // Vérification que le patient a été créé et que nous sommes redirigés vers la page de détails du patient
        await page.waitForURL('**/patient/list');
        await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible({ timeout: 15000 });

        await page.locator('.dropdown-toggle.mdi').first().click();
        await page.locator('.dropdown-menu.dropdown-menu-right.show > a').first().click();
        await page.waitForURL('**/patient/**');
        await expect(page.getByRole('tab', { name: 'Prise en charge' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('tab', { name: 'Prise en charge' }).click();
        await expect(page.getByRole('button', { name: 'Ajouter une prise en charge' })).toBeVisible({ timeout: 15000 });
        await page.getByRole('button', { name: 'Ajouter une prise en charge' }).click();
        await expect(page.getByText('Assureur *')).toBeVisible({ timeout: 15000 });
        // Sélectionner l'assureur "IPM EYONE"
        await page.getByRole('combobox', { name: 'Nom de l\'assureur' }).fill('IPM');
        await page.locator('span').filter({ hasText: 'IPM EYONE' }).first().click();
        // la date de début de validité de l'assurance
        const startDateInsurer = faker.date.recent();
        await page.getByRole('dialog').locator('input[name="dd"]').fill(startDateInsurer.toLocaleDateString('fr-FR'));
        // la date de fin de validité de l'assurance qui est postérieure à la date de début
        const endDateInsurer = new Date(startDateInsurer);
        endDateInsurer.setMonth(endDateInsurer.getMonth() + 1); // 1 mois après la date de début
        await page.getByRole('dialog').locator('input[name="df"]').fill(endDateInsurer.toLocaleDateString('fr-FR'));
        await page.getByRole('dialog').locator('#numero_assure').fill(`C${faker.number.int({ min: 1000000, max: 9999999 })}`);
        await page.getByRole('dialog').locator('#numero_carte').fill(faker.string.alphanumeric({ length: 10 }).toUpperCase());
        await page.getByRole('searchbox', { name: 'Matricule' }).fill(faker.string.alphanumeric({ length: 8 }).toUpperCase());
        await page.getByRole('dialog').locator('#pourcentage').fill('90');
        await page.getByRole('dialog').locator('#plafond').fill('100000');
        await page.getByRole('button', { name: 'Enregistrer' }).click();
        await expect(page.getByText('100000')).toBeVisible({ timeout: 15000 });

        // Navigation vers la liste des patients
        await page.goBack();
        await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible({ timeout: 15000 });
    });

    await test.step('TC-004 : Rechercher un patient avec son prénom', async () => {
        await page.reload();
        const waitForPatients = page.waitForResponse('**/patients**');
        // Attendre que la page soit complètement chargée
        // await page.waitForLoadState('networkidle');
        await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible({ timeout: 15000 });
        const responsePatients = await waitForPatients;
        expect(responsePatients.status()).toBe(200);
        const firstPatient = (await responsePatients.json()).content[0];
        const firstName = firstPatient.firstName;
        await openSearchPanel(page);
        // Saisir le prénom du patient dans la barre de recherche
        await searchAndVerify(page, 'Prénom', firstName);
    });

    await test.step('TC-005 : Rechercher un patient avec son nom', async () => {

        const firstPatient = await getFirstPatientFromAPIWithClearSearch(page);
        const lastName = firstPatient.lastName;
        await openSearchPanel(page);
        // Saisir le nom du patient dans la barre de recherche
        await searchAndVerify(page, 'Nom', lastName, true);
    });

    await test.step('TC-006 : Rechercher un patient avec son prénom et son nom', async () => {
        const firstPatient = await getFirstPatientFromAPIWithClearSearch(page);
        const firstName = firstPatient.firstName;
        const lastName = firstPatient.lastName;
        await openSearchPanel(page);
        // Saisir le prénom du patient dans la barre de recherche
        const searchInputFirstName = page.getByRole('searchbox', { name: 'Prénom' });
        await expect(searchInputFirstName).toBeVisible();
        await searchInputFirstName.fill(firstName);
        // Saisir le nom du patient dans la barre de recherche
        const searchInput = page.getByRole('searchbox', { name: 'Nom', exact: true });
        await expect(searchInput).toBeVisible();
        await searchInput.fill(lastName); // Remplacez 'John' par le prénom du patient que vous souhaitez rechercher
        const waitForSearchPatients = page.waitForResponse('**/patients**');

        await page.getByRole('button', { name: 'Rechercher' }).click();
        await page.waitForLoadState('networkidle');
        const response = await waitForSearchPatients;
        // Vérifier que la réponse est réussie
        expect(response.status()).toBe(200);
        // Vérification que la taille de la liste des patients est de 1
        const responseBody = await response.json();
        expect(responseBody.content.length).toBeGreaterThan(0);
    });

    await test.step('TC-007 : Rechercher un patient avec son numéro de téléphone', async () => {
        // Attendre que la page soit complètement chargée
        const firstPatient = await getFirstPatientFromAPIWithClearSearch(page);
        const mobileNumber = firstPatient.mobileNumber;
        await openSearchPanel(page);
        // Saisir le numéro de téléphone du patient dans la barre de recherche
        await searchAndVerify(page, 'Téléphone', mobileNumber);
    });

    await test.step('TC-008 : Rechercher son patient avec la référence dans la structure', async () => {
        // Attendre que la page soit complètement chargée
        const firstPatient = await getFirstPatientFromAPIWithClearSearch(page);

        const referencePatient = firstPatient.eyoneInternalId;
        await openSearchPanel(page);
        // Saisir la référence du patient dans la barre de recherche
        await searchAndVerify(page, 'Référence', referencePatient, true);
    });
});

