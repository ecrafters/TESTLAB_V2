import { test, expect } from '@playwright/test';
import { fakerFR_SN as faker } from '@faker-js/faker';
import { getHospitalName, login, navigateToPatientsList } from '../utils/patient-helpers';
import { envConfig } from '../../../config/env.loader';

test('01_TNR-Facturation et Caisse', async ({ page }) => {
    let hospitalName: string;
    let productName: string;

    await test.step('TC-001 : Créer un acte de type ambulatoire', async () => {
        await login(page);  // Utilise automatiquement les identifiants de l'environnement
        await getHospitalName(page).then((name: string) => hospitalName = name);
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
        await page.getByRole('button', { name: 'Initialiser l\'acte' }).click();

        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.getByRole('heading', { name: 'Lignes des prestations mé' })).toBeVisible({ timeout: 15000 });
    });

    await test.step('TC-002 : Créer un acte de type consultation', async () => {
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

    await test.step('TC-003 : Créer un acte de type Radiologie', async () => {
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
        // await expect(page.getByRole('heading', { name: 'Lignes des prestations mé' })).toBeVisible({ timeout: 15000 });

    });

    await test.step('TC-004 : Créer un acte de type analyse', async () => {
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

    await test.step('TC-005 : Créer un employeur', async () => {
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

    await test.step('TC-006 : Ajouter un organisme de remboursement', async () => {
        // Naviguer vers la section de paramétrage des employeurs
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

    await test.step('TC-007 : Ajouter un tarif de consultation à une convention de prix', async () => {
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
        // await expect(page.locator('tbody tr').filter({ hasText: tarifName })).toBeVisible({ timeout: 15000 });
    });

    await test.step('TC-008 : Ajouter un tarif de type radiologie à une convention de prix', async () => {
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

        const tarifName = `Radio ${faker.number.int({ min: 1, max: 999 })}`;
        await page.getByRole('tabpanel', { name: 'Tarifs de la convention' }).getByRole('textbox').fill(tarifName);
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un tarif appliqué$/ }).first().click();
        await page.getByRole('option', { name: 'Acte Médical' }).click();
        await page.getByRole('combobox', { name: 'Sélectionnez une prestation' }).fill('RADIO');
        await page.locator('span').filter({ hasText: 'RADIO THORAX' }).first().click();
        await page.getByRole('spinbutton').fill('30000');
        await page.getByRole('button', { name: 'Sauvegarder' }).click();

        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.locator('tbody tr').filter({ hasText: tarifName })).toBeVisible({ timeout: 15000 });
    });

    await test.step('TC-009 : Ajouter un tarif de type analyse à une convention de prix', async () => {
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

        const tarifName = `Analyse ${faker.number.int({ min: 1, max: 999 })}`;
        await page.getByRole('tabpanel', { name: 'Tarifs de la convention' }).getByRole('textbox').fill(tarifName);
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un tarif appliqué$/ }).first().click();
        await page.getByRole('option', { name: 'Acte Médical' }).click();
        await page.getByRole('combobox', { name: 'Sélectionnez une prestation' }).fill('ANALYSE');
        await page.locator('span').filter({ hasText: 'ANALYSE Urine' }).first().click();
        await page.getByRole('spinbutton').fill('40000');
        await page.getByRole('button', { name: 'Sauvegarder' }).click();

        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.locator('tbody tr').filter({ hasText: tarifName })).toBeVisible({ timeout: 15000 });
    });

    await test.step('TC-010 : Ajouter un tarif de type ambulatoire à une convention de prix', async () => {
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

        const tarifName = `Ambulatoire ${faker.number.int({ min: 1, max: 999 })}`;
        await page.getByRole('tabpanel', { name: 'Tarifs de la convention' }).getByRole('textbox').fill(tarifName);
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un tarif appliqué$/ }).first().click();
        await page.getByRole('option', { name: 'Acte Médical' }).click();
        await page.getByRole('combobox', { name: 'Sélectionnez une prestation' }).fill('Ambulatoire');
        await page.locator('span').filter({ hasText: 'ACT AMBULATOIRE' }).first().click();
        await page.getByRole('spinbutton').fill('15000');
        await page.getByRole('button', { name: 'Sauvegarder' }).click();

        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.locator('tbody tr').filter({ hasText: tarifName })).toBeVisible({ timeout: 15000 });
    });

    await test.step('TC-011 : Ajouter une convention de prix', async () => {
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

        const tarifName = `Ambulatoire ${faker.number.int({ min: 1, max: 999 })}`;
        await page.getByRole('tabpanel', { name: 'Tarifs de la convention' }).getByRole('textbox').fill(tarifName);
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un tarif appliqué$/ }).first().click();
        await page.getByRole('option', { name: 'Acte Médical' }).click();
        await page.getByRole('combobox', { name: 'Sélectionnez une prestation' }).fill('Ambulatoire');
        await page.locator('span').filter({ hasText: 'ACT AMBULATOIRE' }).first().click();
        await page.getByRole('spinbutton').fill('15000');
        await page.getByRole('button', { name: 'Sauvegarder' }).click();

        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.getByRole('heading', { name: 'Détails' })).toBeVisible({ timeout: 15000 });
        // await expect(page.locator('tbody tr').filter({ hasText: tarifName })).toBeVisible({ timeout: 15000 });
    });

    await test.step('TC-012 : Créer un produit de pharmacie', async () => {
        // Naviguer vers la section de paramétrage des produits
        const productLink = await page.getByRole('link', { name: ' Produits 󰅀' });
        await productLink.scrollIntoViewIfNeeded();
        await productLink.click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: 'Créer' }).click();
        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/products/create');
        await expect(page.getByRole('heading', { name: 'Création d\'un produit' })).toBeVisible({ timeout: 15000 });
        productName = `Produit ${faker.number.int({ min: 1, max: 999 })}`;
        await page.getByRole('textbox').nth(1).fill(productName);
        await page.locator('.ng-select-container').first().click();
        await page.getByRole('option', { name: 'PHARMACEUTIQUE', exact: true }).click();
        await page.getByRole('combobox').nth(1).click();
        await page.getByRole('option', { name: 'Boîte' }).click();
        await page.locator('.w-100 > .ng-select-container').click();
        await page.getByRole('option', { name: 'C1' }).click();
        await page.getByRole('textbox').nth(2).fill('5000');
        await page.getByRole('combobox').nth(3).click();
        await page.getByRole('option', { name: 'Vente', exact: true }).click();
        await page.locator('.w-100 > .ng-select-container').click();
        await page.getByRole('option', { name: 'C1', exact: true }).click();
        await page.getByRole('spinbutton').nth(1).fill('500');
        await page.locator('.col-12 > .ng-select > .ng-select-container').first().click();
        await page.getByRole('option', { name: 'g/l', exact: true }).click();
        await page.getByRole('spinbutton').nth(2).fill('700');
        await page.locator("(//input[@role='combobox'])[8]").click();
        await page.getByRole('option', { name: 'g/l', exact: true }).click();
        await page.getByRole('button', { name: 'Sauvegarder' }).click();
        await page.waitForResponse('**/dokploy-medical-product/1.0/products');
        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.getByRole('heading', { name: 'Produits' })).toBeVisible({ timeout: 15000 });
    });

    await test.step('TC-013 : Créer un emplacement de stocks', async () => {
        await page.getByRole('link', { name: 'Emplacements de stock 󰅀' }).click();
        await page.waitForTimeout(500);
        await page.getByRole('link', { name: 'Créer' }).nth(1).click();
        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/stocks-placement/create');
        await expect(page.getByRole('heading', { name: 'Création emplacement de stock' })).toBeVisible({ timeout: 5000 });
        await page.getByRole('combobox', { name: 'Nom du produit' }).fill(productName);
        await page.locator('span').filter({ hasText: productName }).first().click();
        await page.waitForLoadState('networkidle');
        await page.locator('.ng-select-container').click();
        await page.getByRole('option', { name: 'PHARMACIE' }).first().click();
        await page.getByRole('button', { name: 'Créer' }).click();
        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.getByRole('heading', { name: 'Liste des emplacements de' })).toBeVisible({ timeout: 15000 });
    });

    await test.step('TC-014 : Ajouter un emplacement de stocks au produit', async () => {
        // Naviguer vers la section de paramétrage des produits
        await page.getByRole('link', { name: 'Rechercher' }).first().click();
        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/products/list');
        await expect(page.getByRole('heading', { name: 'Produits' })).toBeVisible({ timeout: 15000 });
        // Je veux récupérer la première ligne de la table qui contient "Paracétamol 100mg" et cliquer sur le bouton "Visualiser" de cette ligne
        await page.locator('tbody tr').filter({ hasText: productName }).locator('.dropdown-toggle.mdi').first().click();
        await page.locator('.dropdown-menu.show .dropdown-item', { hasText: 'Visualiser' }).click();
        await page.waitForURL('**/editorview/edit/*');
        await page.waitForLoadState('networkidle');

        await page.getByRole('tab', { name: 'Gestion de stock' }).click();
        await page.getByRole('button', { name: 'Ajouter un emplacement de' }).click();
        await page.getByRole('button', { name: 'Ajouter un emplacement de' }).click();
        await page.locator('.ng-select-container').click();
        await page.getByRole('option', { name: 'PHARMACIE' }).first().click();
        await page.getByRole('button', { name: 'Sauvegarder' }).click();
        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.locator('tbody tr').filter({ hasText: 'PHARMACIE' })).toBeVisible({ timeout: 15000 });
    });

    await test.step('TC-015 : Créer une quote-part de répartition sur les produits', async () => {
        // Naviguer vers la section de paramétrage des produits
        await page.locator('a').filter({ hasText: 'Produits' }).first().click();
        await page.waitForTimeout(500);
        await page.locator('a[href*="/products/list"]').getByText('Rechercher').click();
        // Attendre que la page soit complètement chargée
        await page.waitForURL('**/products/list');
        // await expect(page.getByRole('heading', { name: 'Produits' })).toBeVisible({ timeout: 15000 });
        // Je veux récupérer la première ligne de la table qui contient "Paracétamol 100mg" et cliquer sur le bouton "Visualiser" de cette ligne
        await page.locator('tbody tr').filter({ hasText: productName }).locator('.dropdown-toggle.mdi').first().click();
        await page.locator('.dropdown-menu.show .dropdown-item', { hasText: 'Visualiser' }).click();
        await page.waitForURL('**/editorview/edit/*');
        await page.waitForLoadState('networkidle');

        await page.locator('a span').getByText('Quote Part Fournisseur').click();
        await page.waitForLoadState('networkidle');
        await page.getByText('Ajouter une quote part').click();
        const quotePartName = `Quote part ${faker.number.int({ min: 1, max: 999 })}`;
        await page.getByRole('textbox', { name: 'Nom Quote part' }).fill(quotePartName);
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un élément$/ }).first().click();
        await page.getByRole('option', { name: 'PHARMACIE NATIONALE', exact: true }).click();
        await page.locator('#searchForm').getByText('Par pourcentage').click();
        await page.getByRole('spinbutton', { name: 'Valeur' }).fill('80');
        await page.getByRole('button', { name: 'Ajouter' }).click();
        // Attendre que la page soit complètement chargée
        await page.waitForLoadState('networkidle');
        // Vérification que les informations du patient sont affichées 
        await expect(page.locator('tbody tr').filter({ hasText: quotePartName })).toBeVisible({ timeout: 15000 });
        // await page.pause();
    });

    await test.step('TC-016 : Créer une catégorie de chambre', async () => {
        await page.locator('a').filter({ hasText: 'Logistique' }).click();
        await page.waitForTimeout(500);
        await page.getByText('Chambres', { exact: true }).click();
        await page.waitForTimeout(500);
        await page.getByText('Catégories', { exact: true }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Catégorie', { exact: true })).toBeVisible({ timeout: 15000 });
        
        await expect(page.getByText('Ajouter une catégorie')).toBeVisible({ timeout: 15000 });
        await page.getByText('Ajouter une catégorie', { exact: true }).click();
        await page.getByRole('textbox', { name: 'Nom' }).fill(`Catégorie ${Date.now()}`);
        await page.getByPlaceholder(' Prix   ').fill('75000');
        await page.getByRole('button', { name: 'Sauvegarder' }).click();
        await page.waitForLoadState('networkidle');
        await page.getByRole('dialog', { name: 'Succès' }).getByRole('button', { name: 'OK' }).click();
    });

    await test.step('TC-017 : Créer une chambre simple avec un lit', async () => {
        await page.locator('a[href*="/logistic/rooms/add-room"]').getByText('Créer').click()
        await page.waitForLoadState('networkidle');
        // await page.waitForResponse('**/dokploy-admin/1.0/sapi/rest/v1/organism-entities');
        await expect(page.getByText('Créer une chambre')).toBeVisible({ timeout: 15000 });

        await page.locator('input[type="text"]').nth(1).fill(`Chambre ${faker.number.int({ min: 1, max: 999 })}`);
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un catégorie$/ }).first().click();
        await page.locator('span').filter({ hasText: 'Catégorie' }).first().click();
        // Utiliser une correspondance partielle au lieu du nom exact
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un service$/ }).first().click();
        const hospitalOption = page.locator('.ng-dropdown-panel .ng-option').filter({ hasText: hospitalName }).first();
        await expect(hospitalOption).toBeVisible({ timeout: 10000 });
        await hospitalOption.click();
        await page.getByText('Sauvegarder').click();
        await page.waitForResponse('**rooms/with-beds?createBedsAutomatically=true')
        await page.waitForLoadState('networkidle');
    });
    
    await test.step('TC-018 : Créer une chambre double avec deux lits', async () => {
        await page.locator('a').filter({ hasText: 'Logistique' }).click();
        await page.waitForTimeout(500);
        await page.getByText('Chambres', { exact: true }).click();
        await page.waitForTimeout(500);
        await page.locator('a[href*="/logistic/rooms/add-room"]').getByText('Créer').click()
        await page.waitForLoadState('networkidle');
        // await page.waitForResponse('**/dokploy-admin/1.0/sapi/rest/v1/organism-entities');
        await expect(page.getByText('Créer une chambre')).toBeVisible({ timeout: 15000 });

        await page.locator('input[type="text"]').nth(1).fill(`Chambre ${faker.number.int({ min: 1, max: 999 })}`);
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un catégorie$/ }).first().click();
        await page.locator('span').filter({ hasText: 'Catégorie' }).first().click();
        // Utiliser une correspondance partielle au lieu du nom exact
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un service$/ }).first().click();
        const hospitalOption = page.locator('.ng-dropdown-panel .ng-option').filter({ hasText: hospitalName }).first();
        await expect(hospitalOption).toBeVisible({ timeout: 10000 });
        await hospitalOption.click();
        await page.locator('input[type="number"]').first().fill('2');
        await page.getByText('Sauvegarder').click();
        await page.waitForResponse('**rooms/with-beds?createBedsAutomatically=true')
        await page.waitForLoadState('networkidle');
    });

    await test.step('TC-019 : Créer une chambre avec trois lits', async () => {
        await page.locator('a').filter({ hasText: 'Logistique' }).click();
        await page.waitForTimeout(500);
        await page.getByText('Chambres', { exact: true }).click();
        await page.waitForTimeout(500);
        await page.locator('a[href*="/logistic/rooms/add-room"]').getByText('Créer').click()
        await page.waitForLoadState('networkidle');
        // await page.waitForResponse('**/dokploy-admin/1.0/sapi/rest/v1/organism-entities');
        await expect(page.getByText('Créer une chambre')).toBeVisible({ timeout: 15000 });

        await page.locator('input[type="text"]').nth(1).fill(`Chambre ${faker.number.int({ min: 1, max: 999 })}`);
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un catégorie$/ }).first().click();
        await page.locator('span').filter({ hasText: 'Catégorie' }).first().click();
        // Utiliser une correspondance partielle au lieu du nom exact
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un service$/ }).first().click();
        const hospitalOption = page.locator('.ng-dropdown-panel .ng-option').filter({ hasText: hospitalName }).first();
        await expect(hospitalOption).toBeVisible({ timeout: 10000 });
        await hospitalOption.click();
        await page.locator('input[type="number"]').first().fill('3');
        await page.getByText('Sauvegarder').click();
        await page.waitForResponse('**rooms/with-beds?createBedsAutomatically=true')
        await page.waitForLoadState('networkidle');
    });

    await test.step('TC-020 : Facturer une consultation avec un patient non assuré', async () => {
        await page.locator('a').filter({ hasText: 'DPUP' }).click();
        await navigateToPatientsList(page);
        // Essayons avec getByText (méthode la plus flexible)
        const addPatientButton = page.getByText('Créer un patient');
        await expect(addPatientButton).toBeVisible();
        await addPatientButton.click();
        await page.waitForURL('**/patient/create/**');
        await expect(page).toHaveURL('https://msas.preprod.dokploy.eyone.net/patient/create/eps');

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
        // Vérification que le patient a été créé et que nous sommes redirigés vers la page de détails du patient
        await page.waitForURL('**/patient/list');
        await expect(page.locator('h4', { hasText: 'Les patients' })).toBeVisible({ timeout: 15000 });
        // Créer une consultation pour ce patient
        await page.locator('a').filter({ hasText: 'Prestations' }).first().click();
        await page.waitForTimeout(500);
        await page.getByText('Créer prestation').click();
        await page.waitForURL('**/patient-identification');
        await expect(page.getByText('Patient Interne')).toBeVisible({ timeout: 15000 });
        // Renseigner les informations du patient
        await page.getByPlaceholder('Prénom, Nom, Numéro de télé').fill(`${firstNamePatient} ${lastNamePatient}`);
        await page.locator('button').filter({ hasText: 'Rechercher' }).click();
        await page.locator('tbody tr').filter({ hasText: `${firstNamePatient} ${lastNamePatient}` }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Nouvelle prestation')).toBeVisible({ timeout: 15000 });
        // Créer une prestation de consultation
        await page.locator('button').filter({ hasText: 'Consultation' }).click();
        await page.waitForURL('**/consultation/create/**');
        await expect(page.locator('h4').filter({ hasText: 'Nouvelle consultation' })).toBeVisible({ timeout: 15000 });
        // Sélectionner une prestation
        await page.getByLabel('Prestation Médicale *').click();
        await page.locator('span').filter({ hasText: 'CONSULTATION CARDIO' }).first().click();
        await page.waitForResponse('**/consultations/consultation-act-selection');
        await page.waitForLoadState('networkidle');
        // await page.getByRole('heading', { name: 'Total Facture' }).scrollIntoViewIfNeeded();
        await page.getByText('Enregistrer').click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Facture', { exact: true })).toBeVisible({ timeout: 15000 });
        await page.locator('#regenerate').click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Facture régénérée avec succès')).toBeVisible({ timeout: 15000 });
    });
});