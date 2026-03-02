import { Page, expect } from '@playwright/test';
import { envConfig } from '../../../config/env.loader';

/**
 * Efface la recherche et récupère le premier patient depuis l'API
 */
export async function getFirstPatientFromAPI(page: Page) {
    const waitForPatients = page.waitForResponse('**/patients**');
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible({ timeout: 15000 });

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
    await expect(page.getByRole('heading', { name: 'Recherche' })).toBeVisible({ timeout: 15000 });
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

    await expect(page).toHaveTitle('Dossier Patient Unique Partagé');
    await page.getByRole('textbox', { name: 'Identifiant' }).fill(email);
    await page.getByRole('textbox', { name: 'Mot de passe' }).fill(password);
    await page.getByRole('button', { name: 'Connexion' }).click();
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');
    // Vérification que les informations du patient sont affichées 
    await expect(page.locator('h4', { hasText: 'Accueil' })).toBeVisible({ timeout: 15000 });
}

/**
 * Connexion avec des identifiants personnalisés
 */
export async function loginWithCredentials(page: Page, email: string, password: string) {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle('Dossier Patient Unique Partagé');
    await page.getByRole('textbox', { name: 'Identifiant' }).fill(email);
    await page.getByRole('textbox', { name: 'Mot de passe' }).fill(password);
    await page.getByRole('button', { name: 'Connexion' }).click();
    await page.waitForLoadState('networkidle');
}

/**
 * Navigation vers la page des patients
 */
export async function navigateToPatientsList(page: Page) {
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h4', { hasText: 'Accueil' })).toBeVisible({ timeout: 15000 });

    const patientsButton = page.locator('h6', { hasText: 'Les patients' });
    await expect(patientsButton).toBeVisible();
    await patientsButton.click({ force: true });

    await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible({ timeout: 15000 });
}

/**
 * Récupère le nom de l'hôpital affiché dans le header
 */
export async function getHospitalName(page: Page) {
    const headerElement = page.locator('.navbar-header > :nth-child(1) > .text-dark');
    // Récupérer le texte
    const hospitalName: string = await headerElement.textContent() ?? '';
    // Équivalent de cy.log()
    console.log(`Utilisateur affiché dans le header: ${hospitalName}`);
    return hospitalName;
}