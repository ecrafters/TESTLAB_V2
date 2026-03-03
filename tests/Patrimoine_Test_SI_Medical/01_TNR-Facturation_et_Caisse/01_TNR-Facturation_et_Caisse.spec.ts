import { test, expect } from '@playwright/test';
import { fakerFR_SN as faker } from '@faker-js/faker';
import { getHospitalName, login } from '../utils/patient-helpers';
import { envConfig } from '../../../config/env.loader';

test('01_TNR-Facturation et Caisse', async ({ page }) => {
    let hospitalName: string;

    await test.step("Connexion", async () => {
        await login(page);  // Utilise automatiquement les identifiants de l'environnement
    });

    await test.step('Récupérer le nom de l\'hôpital', async () => {
        await getHospitalName(page).then((name: string) => hospitalName = name);
    });

    await test.step('TC-001 : Créer un acte de type ambulatoire', async () => {
        // Naviguer vers la section de paramétrage des actes
        await page.locator('#vertical-menu-btn').click();
        const parametresLink = page.getByRole('link', { name: 'Paramètrages' });
        await parametresLink.scrollIntoViewIfNeeded();
        await parametresLink.click();
        // Attendre 0,5 seconde pour s'assurer que le menu est bien chargé
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: 'Prestations médicales 󰅀' }).click();
        await page.getByRole('link', { name: 'Configurer un acte', exact: true }).click();

        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/settings/prest/set-act**');
        await expect(page).toHaveURL(`${envConfig.baseUrl}/settings/prest/set-act`);

        // Vérification que les informations du patient sont affichées 
        await expect(page.getByRole('heading', { name: 'Création d\'un acte' })).toBeVisible({ timeout: 15000 });

        await page.getByRole('textbox').nth(1).fill(`Acte ambulatoire ${faker.number.int({ min: 1, max: 9999 })}`);
        await page.getByRole('spinbutton').fill('12000');
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un service$/ }).first().click();
        await page.getByRole('option', { name: hospitalName }).click();
        // await page.getByRole('button', { name: 'Initialiser l\'acte' }).click();

        // // Attendre que la page soit complètement chargée
        // await page.waitForLoadState('networkidle');
        // // Vérification que les informations du patient sont affichées 
        // await expect(page.getByRole('heading', { name: 'Lignes des prestations mé' })).toBeVisible({ timeout: 15000 });
    });

    await test.step.skip('TC-002 : Créer un acte de type consultation', async () => {
        // Naviguer vers la section de paramétrage des actes consultation
        await page.getByRole('link', { name: 'Configurer une consultation' }).click();

        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/settings/prest/set-consultation**');
        await expect(page).toHaveURL(`${envConfig.baseUrl}/settings/prest/set-consultation`);

        // Vérification que les informations du patient sont affichées 
        await expect(page.getByRole('heading', { name: 'Création d\'une consultation' })).toBeVisible({ timeout: 15000 });

        await page.getByRole('textbox').nth(1).fill(`Consultation ${faker.number.int({ min: 1, max: 9999 })}`);
        await page.getByRole('spinbutton').fill('8000');
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner une spécialisation$/ }).first().click();
        await page.getByRole('option', { name: 'DERMATOLOGIE' }).click();
        await page.getByRole('spinbutton').fill('12000');
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un service$/ }).first().click();
        await page.getByRole('option', { name: hospitalName }).click();
        await page.getByRole('button', { name: 'Initialiser l\'acte' }).click();

        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.getByRole('heading', { name: 'Lignes des prestations mé' })).toBeVisible({ timeout: 15000 });
    });

    await test.step.skip('TC-003 : Créer un acte de type Radiologie', async () => {
        // Naviguer vers la section de paramétrage des actes imagerie
        await page.getByRole('link', { name: 'Configurer un acte d\'imagerie' }).click();
        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/settings/prest/set-imagerie**');
        await expect(page).toHaveURL(`${envConfig.baseUrl}/settings/prest/set-imagerie`);

        // Vérification que les informations du patient sont affichées 
        await expect(page.getByRole('heading', { name: 'Création d\'un acte d\'imagerie' })).toBeVisible({ timeout: 15000 });

        await page.getByRole('textbox').nth(1).fill(`Radio thorax ${faker.number.int({ min: 1, max: 9999 })}`);
        await page.getByRole('spinbutton').fill('12000');
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un service$/ }).first().click();
        await page.getByRole('option', { name: hospitalName }).click();
        await page.getByRole('button', { name: 'Initialiser l\'acte' }).click();

        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.getByRole('heading', { name: 'Lignes des prestations mé' })).toBeVisible({ timeout: 15000 });

    });

    await test.step.skip('TC-004 : Créer un acte de type analyse', async () => {
        // Naviguer vers la section de paramétrage des actes analyse
        await page.getByRole('link', { name: 'Configurer un acte d\'analyse' }).click();
        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/settings/prest/set-analyse**');
        await expect(page).toHaveURL(`${envConfig.baseUrl}/settings/prest/set-analyse`);

        // Vérification que les informations du patient sont affichées 
        await expect(page.getByRole('heading', { name: 'Création d\'un acte d\'analyse' })).toBeVisible({ timeout: 15000 });

        await page.getByRole('textbox').nth(1).fill(`Analyse d'urine ${faker.number.int({ min: 1, max: 9999 })}`);
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner une catégorie$/ }).first().click();
        await page.getByRole('option', { name: 'BIOLOGIE', exact: true }).click();
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un paramètre$/ }).first().click();
        await page.getByRole('option', { name: 'l\'acte est un paramètre à évaluer' }).click();
        await page.getByRole('spinbutton').fill('12000');
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un service$/ }).first().click();
        await page.getByRole('option', { name: hospitalName }).click();
        await page.getByRole('textbox').nth(3).fill('Urine');
        await page.getByRole('button', { name: 'Initialiser l\'acte' }).click();

        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.getByRole('heading', { name: 'Lignes des prestations mé' })).toBeVisible({ timeout: 15000 });
    });

    await test.step.skip('TC-005 : Créer un employeur', async () => {
        // Naviguer vers la section de paramétrage des employeurs
        const contactLink = page.getByRole('link', { name: ' Contacts & Interloc. 󰅀' });
        await contactLink.scrollIntoViewIfNeeded();
        await contactLink.click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: 'Employeurs 󰅀' }).click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: 'Créer' }).click();
        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/employeurs/creer**');
        await expect(page.getByRole('heading', { name: 'Création d\'un employeur' })).toBeVisible({ timeout: 15000 });

        await page.locator('form').getByRole('textbox').fill(`EYONE MEDICAL ${faker.number.int({ min: 1, max: 999 })}`);
        await page.getByRole('button', { name: 'Créer le fournisseur' }).click();

        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.getByRole('button', { name: 'Créer le fournisseur' })).toBeVisible({ timeout: 15000 });
    });

    await test.step.skip('TC-006 : Ajouter un organisme de remboursement', async () => {
        // Naviguer vers la section de paramétrage des employeurs
        const contactLink = page.getByRole('link', { name: ' Contacts & Interloc. 󰅀' });
        await contactLink.scrollIntoViewIfNeeded();
        await contactLink.click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: 'Org. de remboursement 󰅀' }).click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: 'Créer' }).click();
        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/organismes/creer');
        await expect(page.getByRole('heading', { name: 'Création d\'un org. de' })).toBeVisible({ timeout: 15000 });

        await page.locator('form').getByRole('textbox').fill(`EYONE ASSURANCE ${faker.number.int({ min: 1, max: 999 })}`);
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un sexe$/ }).first().click();
        await page.getByRole('option', { name: 'IPM', exact: true }).click();
        await page.getByRole('button', { name: 'Créer l\'organisme' }).click();

        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.getByRole('heading', { name: 'Organismes de remboursement' })).toBeVisible({ timeout: 15000 });
    });

    await test.step.skip('TC-007 : Ajouter un tarif de consultation à une convention de prix', async () => {
        // Naviguer vers la section de paramétrage des employeurs
        const contactLink = page.getByRole('link', { name: ' Contacts & Interloc. 󰅀' });
        await contactLink.scrollIntoViewIfNeeded();
        await contactLink.click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: 'Org. de remboursement 󰅀' }).click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: 'Conventions de prix 󰅀' }).click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: 'Rechercher' }).nth(1).click();
        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/conventions/rechercher');
        await expect(page.getByRole('heading', { name: 'Conventions de tarif' })).toBeVisible({ timeout: 15000 });
        // Je veux récupérer la première ligne de la table qui contient "IPM" et cliquer sur le bouton "Visualiser" de cette ligne
        await page.locator('tbody tr').filter({ hasText: 'IPM' }).getByRole('button', { name: 'Visualiser' }).first().click();
        await page.waitForURL('**/conventions/details/*');

        await page.getByRole('tab', { name: 'Tarifs de la convention' }).click();
        await page.getByRole('button', { name: 'Ajouter un tarif' }).click();

        const tarifName = `Consultation ${faker.number.int({ min: 1, max: 999 })}`;
        await page.getByRole('tabpanel', { name: 'Tarifs de la convention' }).getByRole('textbox').fill(tarifName);
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un tarif appliqué$/ }).first().click();
        await page.getByRole('option', { name: 'Acte Médical' }).click();
        await page.getByRole('combobox', { name: 'Sélectionnez une prestation' }).fill('Consultation');
        await page.locator('span').filter({ hasText: 'CONSULTATION CARDIO' }).first().click();
        await page.getByRole('spinbutton').fill('8000');
        await page.getByRole('button', { name: 'Sauvegarder' }).click();
        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.locator('tbody tr').filter({ hasText: tarifName })).toBeVisible({ timeout: 15000 });
        await page.pause();
    });

    await test.step('TC-007 : Ajouter un tarif de consultation à une convention de prix', async () => {
        // Naviguer vers la section de paramétrage des employeurs
        const contactLink = page.getByRole('link', { name: ' Contacts & Interloc. 󰅀' });
        await contactLink.scrollIntoViewIfNeeded();
        await contactLink.click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: 'Org. de remboursement 󰅀' }).click();
        await page.waitForTimeout(500);
        
        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.locator('tbody tr').filter({ hasText: 'tarifName' })).toBeVisible({ timeout: 15000 });
        await page.pause();
    });
});