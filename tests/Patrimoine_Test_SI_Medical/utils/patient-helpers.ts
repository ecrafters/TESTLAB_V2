import { Page, expect } from '@playwright/test';
import { envConfig } from '../../../config/env.loader';
import { fakerFR_SN as faker } from '@faker-js/faker';

/**
 * Efface la recherche et récupère le premier patient depuis l'API using the search filters.
 */
export async function getFirstPatientFromAPIWithClearSearch(page: Page) {
    const waitForPatients = page.waitForResponse('**/patients**');
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible();

    await page.getByRole('button', { name: ' Effacer la Recherche' }).click();
    const responsePatients = await waitForPatients;
    expect(responsePatients.status()).toBe(200);
    const firstPatient = (await responsePatients.json()).content[0];
    return firstPatient;
}

/**
 * Ouvre le panneau de recherche
 */
export async function openSearchPanel(page: Page) {
    await page.locator('button').filter({ hasText: 'Rechercher' }).click();
    await expect(page.getByRole('heading', { name: 'Recherche' })).toBeVisible();
}

/**
 * Effectue une recherche par un champ donné et vérifie les résultats
 */
export async function searchAndVerify(
    page: Page,
    fieldName: string,
    value: string,
    exact: boolean = true
) {
    const searchInput = page.getByRole('searchbox', { name: fieldName, exact });
    await expect(searchInput).toBeVisible();
    await searchInput.fill(value);

    const waitForSearchPatients = page.waitForResponse('**/patients**');
    await page.getByRole('button', { name: 'Rechercher' }).click();
    await page.waitForLoadState('networkidle');

    const response = await waitForSearchPatients;
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.content.length).toBeGreaterThan(0);

    return responseBody;
}

/**
 * Effectue une recherche combinée (prénom + nom) et vérifie les résultats
 */
export async function searchByFirstAndLastName(
    page: Page,
    firstName: string,
    lastName: string
) {
    const searchInputFirstName = page.getByRole('searchbox', { name: 'Prénom' });
    await expect(searchInputFirstName).toBeVisible();
    await searchInputFirstName.fill(firstName);

    const searchInputLastName = page.getByRole('searchbox', { name: 'Nom', exact: true });
    await expect(searchInputLastName).toBeVisible();
    await searchInputLastName.fill(lastName);

    const waitForSearchPatients = page.waitForResponse('**/patients**');
    await page.getByRole('button', { name: 'Rechercher' }).click();
    await page.waitForLoadState('networkidle');

    const response = await waitForSearchPatients;
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.content.length).toBeGreaterThan(0);

    return responseBody;
}

/**
 * Connexion à l'application avec les identifiants de l'environnement
 */
export async function login(page: Page, useAdmin: boolean = false) {
    const email = useAdmin ? envConfig.adminUsername : envConfig.username;
    const password = useAdmin ? envConfig.adminPassword : envConfig.password;

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // je veux récupèrer la baseUrl
    console.log(`Base URL utilisée pour le test: ${envConfig.baseUrl}`);
    switch (envConfig.baseUrl) {
        case 'https://msas.preprod.dokploy.eyone.net':
        case 'https://dpp.eyone.net':
        case 'https://web-simedical.dpi.sn':
            await loginMSAS(page, email, password);
            break;
        case 'https://passmousso.app':
            await loginPassMousso(page, email, password);
            break;
        case 'https://simedical.app':
            await loginSIMedical(page, email, password);
            break;
        case 'https://fajma.simedical.app':
            await loginFajma(page, email, password);
            break;
        default:
            throw new Error(`Base URL inconnue: ${envConfig.baseUrl}`);
    }

    // Vérification que les informations du patient sont affichées 
    expect(page.getByRole('heading', { name: 'Accueil' })).toBeVisible();
}

/**
 * Connexion avec des identifiants personnalisés
 */
export async function loginWithCredentials(page: Page, email: string, password: string) {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // je veux récupèrer la baseUrl
    console.log(`Base URL utilisée pour le test: ${envConfig.baseUrl}`);
    switch (envConfig.baseUrl) {
        case 'https://msas.preprod.dokploy.eyone.net':
        case 'https://dpp.eyone.net':
        case 'https://web-simedical.dpi.sn':
            await loginMSAS(page, email, password);
            break;
        case 'https://passmousso.app':
            await loginPassMousso(page, email, password);
            break;
        case 'https://simedical.app':
            await loginSIMedical(page, email, password);
            break;
        case 'https://fajma.simedical.app':
            await loginFajma(page, email, password);
            break;
        default:
            throw new Error(`Base URL inconnue: ${envConfig.baseUrl}`);
    }

    // Vérification que les informations du patient sont affichées 
    expect(page.getByRole('heading', { name: 'Accueil' })).toBeVisible();
}

/**
 * Déconnexion de l'application
 * */
export async function logout(page: Page) {

    const logoutButton = page.locator('#page-header-user-dropdown > .ml-1');
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();
    await page.locator('.ri-shut-down-line').click();
    await page.waitForLoadState('networkidle');
    console.log('🔒 Déconnecté avec succès');
};

/**
 * Navigation vers la page des patients
 */
export async function navigateToPatientsList(page: Page) {
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h4', { hasText: 'Accueil' })).toBeVisible();

    const patientsButton = page.locator('h6', { hasText: 'Les patients' });
    await expect(patientsButton).toBeVisible();
    await patientsButton.click({ force: true });

    await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible();
}

/**
 * Récupère le nom de l'hôpital affiché dans le header
 */
export async function getHospitalName(page: Page) {
    const headerElement = page.locator('.navbar-header > :nth-child(1) > .text-dark');
    // Récupérer le texte
    const hospitalName: string = await headerElement.textContent() ?? '';
    // Équivalent de cy.log()
    console.log(`Hôpital affiché dans le header: ${hospitalName}`);
    return hospitalName;
}

/**
 * Efface la recherche et récupère le premier patient depuis l'API
 */
export async function getFirstPatientFromAPI(page: Page) {
    // Attendre que la page soit complètement chargée
    await page.getByRole('link', { name: 'Créer' }).click();
    await page.waitForLoadState('networkidle');
    // const waitForPatients = page.waitForResponse('**/patients?offset=0&limit=10');
    const patientlink = page.locator('#side-menu').getByText('Les patients');
    const [responsePatients] = await Promise.all([
        page.waitForResponse('**/patients**', { timeout: 15000 }),
        patientlink.click()
    ]);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Les patients' })).toBeVisible();
    // const responsePatients = await waitForPatients;
    expect(responsePatients.status()).toBe(200);
    const firstPatient = (await responsePatients.json()).content[0];
    switch (envConfig.baseUrl) {
        case 'https://msas.preprod.dokploy.eyone.net':
        case 'https://dpp.eyone.net':
        case 'https://web-simedical.dpi.sn':
            await page.locator('a').filter({ hasText: 'DPUP' }).click();
            break;
        case 'https://passmousso.app':
            await page.getByRole('link', { name: 'Pass Santé Mousso' }).click();
            break;
        case 'https://simedical.app':
            await page.getByRole('link', { name: 'SI Médical', exact: true }).click();
            break;
        case 'https://fajma.simedical.app':
            await page.getByRole('link', { name: 'FAJ\'MA' }).click();
            break;
        default:
            throw new Error(`Base URL inconnue: ${envConfig.baseUrl}`);
    }
    return firstPatient;
}
/**
 * Crée un patient avec une prise en charge et un assureur
 */
export async function createPatientWithInsurer(page: Page) {
    // Vérification que les informations du patient sont affichées
    await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible();

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
    await page.locator('input[type="text"]').nth(1).fill(firstNamePatient);
    await page.locator('input[type="text"]').nth(2).fill(lastNamePatient);
    await page.getByPlaceholder('000000000').fill('777536172');
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner un sexe$/ }).first().click();
    const sexeOption = page.locator('.ng-dropdown-panel .ng-option').filter({ hasText: sexePatient }).first();
    await expect(sexeOption).toBeVisible({ timeout: 10000 });
    await sexeOption.click();
    await page.getByRole('textbox', { name: 'JJ/MM/AAAA' }).fill(birthDate.toLocaleDateString('fr-FR'));
    await page.getByRole('textbox').nth(5).fill("Keur Massar");
    await page.locator('.row.mt-4 > div > .form-control').first().fill("Dakar");
    const emailPatient = faker.internet.email().toLowerCase();
    await page.locator('#email').fill(emailPatient);
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner un statut matrimonial$/ }).first().click();
    await page.getByRole('option', { name: 'CELIBATAIRE' }).click();
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner un groupe sanguin$/ }).first().click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.locator('div:nth-child(8) > .col-md-6 > .form-control').fill(faker.number.int({ min: 1755199000000, max: 9999999999999 }).toString());

    // Activer la prise en charge
    await page.getByRole('switch').nth(1).click();
    await expect(page.getByText('Assureur')).toBeVisible();
    // Sélectionner l'assureur "IPM EYONE"
    const assureurInput = page.getByRole('combobox', { name: 'Nom de l\'assureur' });
    await assureurInput.click();
    await assureurInput.pressSequentially('IPM', { delay: 100 });

    const assureurOption = page.locator('.mat-option, span').filter({ hasText: 'IPM EYONE' }).first();
    await expect(assureurOption).toBeVisible();
    await assureurOption.click();
    // la date de début de validité de l'assurance
    const startDate = faker.date.recent();
    await page.locator('input[name="ddv"]').fill(startDate.toLocaleDateString('fr-FR'));
    // la date de fin de validité de l'assurance qui est postérieure à la date de début
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // 1 mois après la date de début
    await page.locator('input[name="dfv"]').fill(endDate.toLocaleDateString('fr-FR'));
    await page.locator('.row.mt-3 > div > .d-flex > .col-md-12 > .form-control').first().fill(`C${faker.number.int({ min: 1000000, max: 9999999 })}`);
    await page.locator('.row.mt-3 > div:nth-child(2) > .d-flex > .col-md-12 > .form-control').first().fill(faker.string.alphanumeric({ length: 10 }).toUpperCase());
    await page.locator('div:nth-child(4) > .col-md-6 > .d-flex > .col-md-12 > .form-control').fill(faker.string.alphanumeric({ length: 8 }).toUpperCase());
    await page.getByRole('spinbutton').first().fill('80');
    await page.getByRole('spinbutton').nth(1).fill('180000');

    // Identité du patient - Informations Complémentaires
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner une profession$/ }).first().click();
    await page.getByRole('option', { name: 'Master' }).click();
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner une profession$/ }).nth(1).click();
    await page.getByRole('option', { name: 'INGÉNIEUR' }).click();
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner une nationalité$/ }).first().click();
    await page.getByRole('option', { name: 'SENEGAL' }).first().click();
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner une ethnie$/ }).first().click();
    await page.getByRole('option', { name: 'PEULH' }).click();
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    // Vérification du bouton de confirmation de la création du patient par une condition
    // const checkLikenessPatient = page.waitForResponse('**/patients/check-likeness-patient');
    // const response = await checkLikenessPatient;
    // expect(response.status()).toBe(200);
    // const responseBody = await response.json();
    // if (responseBody.length > 0) {
    //     await page.getByRole('button', { name: 'OUI' }).click();
    // }
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
}

/**
 * Crée un patient avec une double prise en charge (2 assureurs)
 */
export async function createPatientWithDoubleInsurer(page: Page) {
    await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible();

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
    await page.locator('input[type="text"]').nth(1).fill(firstNamePatient);
    await page.locator('input[type="text"]').nth(2).fill(lastNamePatient);
    await page.getByRole('textbox', { name: '000000000' }).fill(`77${faker.number.int({ min: 1000000, max: 9999999 })}`);
    // Sélectionner le sexe du patient
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner un sexe$/ }).first().click();
    await page.getByRole('option', { name: sexePatient }).click();
    await page.getByRole('textbox', { name: 'JJ/MM/AAAA' }).fill(birthDate.toLocaleDateString('fr-FR'));
    await page.getByRole('textbox').nth(5).fill("Keur Massar");
    await page.locator('.row.mt-4 > div > .form-control').first().fill("Dakar");
    const emailPatient = faker.internet.email().toLowerCase();
    await page.locator('#email').fill(emailPatient);
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner un statut matrimonial$/ }).first().click();
    await page.getByRole('option', { name: 'CELIBATAIRE' }).click();
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner un groupe sanguin$/ }).first().click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.locator('div:nth-child(8) > .col-md-6 > .form-control').fill(faker.number.int({ min: 1755199000000, max: 9999999999999 }).toString());

    // Activer la prise en charge
    await page.getByRole('switch').nth(1).click();
    await expect(page.getByText('Assureur')).toBeVisible();
    // Sélectionner l'assureur "IPM EYONE"
    const assureurInput = page.getByRole('combobox', { name: 'Nom de l\'assureur' });
    await assureurInput.click();
    await assureurInput.pressSequentially('IPM', { delay: 100 });

    const assureurOption = page.locator('.mat-option, span').filter({ hasText: 'IPM EYONE' }).first();
    await expect(assureurOption).toBeVisible();
    await assureurOption.click();
    // la date de début de validité de l'assurance
    const startDate = faker.date.recent();
    await page.locator('input[name="ddv"]').fill(startDate.toLocaleDateString('fr-FR'));
    // la date de fin de validité de l'assurance qui est postérieure à la date de début
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // 1 mois après la date de début
    await page.locator('input[name="dfv"]').fill(endDate.toLocaleDateString('fr-FR'));
    await page.locator('.row.mt-3 > div > .d-flex > .col-md-12 > .form-control').first().fill(`C${faker.number.int({ min: 1000000, max: 9999999 })}`);
    await page.locator('.row.mt-3 > div:nth-child(2) > .d-flex > .col-md-12 > .form-control').first().fill(faker.string.alphanumeric({ length: 10 }).toUpperCase());
    await page.locator('div:nth-child(4) > .col-md-6 > .d-flex > .col-md-12 > .form-control').fill(faker.string.alphanumeric({ length: 8 }).toUpperCase());
    await page.getByRole('spinbutton').first().fill('80');
    await page.getByRole('spinbutton').nth(1).fill('180000');

    // Identité du patient - Informations Complémentaires
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner une profession$/ }).first().click();
    await page.getByRole('option', { name: 'Master' }).click();
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner une profession$/ }).nth(1).click();
    await page.getByRole('option', { name: 'INGENIEUR' }).click();
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner une nationalité$/ }).first().click();
    await page.getByRole('option', { name: 'SENEGAL' }).first().click();
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner une ethnie$/ }).first().click();
    await page.getByRole('option', { name: 'WOLOF' }).click();
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    // Vérification que le patient a été créé et que nous sommes redirigés vers la page de détails du patient
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible();

    await page.locator('.dropdown-toggle.mdi').first().click();
    await page.locator('.dropdown-menu.dropdown-menu-right.show > a').first().click();
    await page.waitForURL('**/patient/**');
    await expect(page.getByRole('tab', { name: 'Prise en charge' })).toBeVisible();
    await page.getByRole('tab', { name: 'Prise en charge' }).click();
    await expect(page.getByRole('button', { name: 'Ajouter une prise en charge' })).toBeVisible();
    await page.getByRole('button', { name: 'Ajouter une prise en charge' }).click();
    await expect(page.getByText('Assureur *')).toBeVisible();
    // Sélectionner l'assureur "IPM EYONE"
    const assureurInput2 = page.getByRole('combobox', { name: 'Nom de l\'assureur' });
    await assureurInput2.click();
    await assureurInput2.pressSequentially('IPM', { delay: 100 });

    const assureurOption2 = page.locator('.mat-option, span').filter({ hasText: 'IPM EYONE' }).first();
    await expect(assureurOption2).toBeVisible();
    await assureurOption2.click();
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
    await expect(page.getByText('100000')).toBeVisible();

    // Navigation vers la liste des patients
    await page.goBack();
    await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible();
}

async function loginMSAS(page: Page, email: string, password: string) {
    // MSAS
    await expect(page).toHaveTitle('Dossier Patient Unique Partagé');
    await page.getByRole('textbox', { name: 'Identifiant' }).fill(email);
    await page.getByRole('textbox', { name: 'Mot de passe' }).fill(password);
    await page.getByRole('button', { name: 'Connexion' }).click();

}
async function loginPassMousso(page: Page, email: string, password: string) {
    // PASSMOUSSO
    await expect(page).toHaveTitle('PASS SANTE MOUSSO');
    await page.locator('app-pass-mousso #email').fill(email);
    await page.locator('app-pass-mousso #password').fill(password);
    await page.getByRole('button', { name: 'Connexion' }).click();
}

async function loginSIMedical(page: Page, email: string, password: string) {
    // SIMEDICAL
    await expect(page).toHaveTitle('SI Médical');
    await page.getByRole('textbox', { name: 'Identifiant Identifiant Nom d' }).fill(email);
    await page.getByRole('textbox', { name: 'Mot de passe Mot de passe Mot' }).fill(password);
    await page.getByRole('button', { name: 'Se connecter' }).click();
}

async function loginFajma(page: Page, email: string, password: string) {
    // FAJ'MA
    await expect(page).toHaveTitle('FAJ\'MA');
    await page.locator('app-fajma #email').fill(email);
    await page.locator('app-fajma #password').fill(password);
    await page.getByRole('button', { name: 'Connexion' }).click();
}

/**
 * Remplit le formulaire du patient et ajoute l'assureur principal.
 * Conçu spécifiquement pour factoriser TC-002 et TC-003.
 */
export async function fillPatientFormAndAddInsurer(page: Page) {
    const sexe = faker.person.sexType();
    const firstNamePatient = faker.person.firstName(sexe);
    const lastNamePatient = faker.person.lastName(sexe);
    const birthDate = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
    const sexePatient = sexe === 'male' ? 'Masculin' : 'Féminin';

    // Remplir le formulaire de création de patient
    await page.getByRole('textbox').first().fill(firstNamePatient);
    await page.getByRole('textbox').nth(1).fill(lastNamePatient);
    await page.getByRole('textbox', { name: '000000000' }).fill(`77${faker.number.int({ min: 1000000, max: 9999999 })}`);

    // Sélectionner le sexe du patient
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner un sexe$/ }).first().click();
    await page.getByRole('option', { name: sexePatient }).click();
    await page.getByRole('textbox', { name: 'JJ/MM/AAAA' }).fill(birthDate.toLocaleDateString('fr-FR'));
    await page.getByRole('textbox').nth(4).fill("Keur Massar");
    await page.getByRole('textbox').nth(5).fill("Dakar");

    const emailPatient = faker.internet.email().toLowerCase();
    await page.locator('#email').fill(emailPatient);
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner un statut matrimonial$/ }).first().click();
    await page.getByRole('option', { name: 'CELIBATAIRE' }).click();
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner un groupe sanguin$/ }).first().click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.locator('div:nth-child(8) > .col-md-6 > .form-control').fill(faker.number.int({ min: 1755199000000, max: 9999999999999 }).toString());

    // Activer la prise en charge
    await page.getByRole('switch').nth(1).click();
    await expect(page.getByText('Assureur')).toBeVisible({ timeout: 15000 });

    // Sélectionner l'assureur "IPM EYONE"
    await page.getByRole('combobox', { name: 'Nom de l\'assureur' }).fill('IPM');
    await page.locator('span').filter({ hasText: 'IPM EYONE' }).first().click();

    // la date de début de validité de l'assurance
    const startDate = faker.date.recent();
    await page.locator('input[name="ddv"]').fill(startDate.toLocaleDateString('fr-FR'));

    // la date de fin de validité de l'assurance qui est postérieure à la date de début
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // 1 mois après la date de début
    await page.locator('input[name="dfv"]').fill(endDate.toLocaleDateString('fr-FR'));

    await page.locator('.row.mt-3 > div > .d-flex > .col-md-12 > .form-control').first().fill(`C${faker.number.int({ min: 1000000, max: 9999999 })}`);
    await page.locator('.row.mt-3 > div:nth-child(2) > .d-flex > .col-md-12 > .form-control').first().fill(faker.string.alphanumeric({ length: 10 }).toUpperCase());
    await page.locator('div:nth-child(4) > .col-md-6 > .d-flex > .col-md-12 > .form-control').fill(faker.string.alphanumeric({ length: 8 }).toUpperCase());
    await page.getByRole('spinbutton').first().fill('80');
    await page.getByRole('spinbutton').nth(1).fill('180000');

    // Identité du patient - Informations Complémentaires
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner une profession$/ }).first().click();
    await page.getByRole('option', { name: 'Master' }).click();
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner une profession$/ }).nth(1).click();
    await page.getByRole('option', { name: 'INGÉNIEUR' }).click();
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner une nationalité$/ }).first().click();
    await page.getByRole('option', { name: 'SENEGAL' }).first().click();
    await page.locator('div').filter({ hasText: /^Veuillez sélectionner une ethnie$/ }).first().click();
    await page.getByRole('option', { name: 'PEULH' }).click();

    // Vérification du bouton de confirmation de la création du patient par une condition
    // Utilisation de Promise.all pour éviter un Timeout (Race Condition sur l'attente réseau)
    const [response] = await Promise.all([
        page.waitForResponse('**/patients/check-likeness-patient'),
        page.getByRole('button', { name: 'Enregistrer' }).click()
    ]);

    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    if (responseBody.length > 0) {
        await page.getByRole('button', { name: 'OUI' }).click();
    }
}
