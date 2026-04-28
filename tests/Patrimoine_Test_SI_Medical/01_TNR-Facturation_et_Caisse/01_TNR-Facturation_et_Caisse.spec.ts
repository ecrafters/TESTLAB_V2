import { test, expect, Page } from '@playwright/test';
import { fakerFR_SN as faker } from '@faker-js/faker';
import { envConfig } from '../../../config/env.loader';
import { login, getHospitalName, createPatientWithInsurer, getFirstPatientFromAPI, navigateToPatientsList } from '../utils/patient-helpers';

test.describe('01_TNR-Facturation et Caisse', () => {

    // test.beforeEach(async ({ page }) => {
    //     // Go to the starting url before each test.
    //     await page.goto('/');
    // });

    test('Création et configuration des données', async ({ page }) => {
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
            await page.getByRole('link', { name: 'Configurer un acte', exact: true }).click({ force: true });

            // Attendre que la page soit complètement chargée
            // await page.waitForURL('**/settings/prest/set-act**');

            // Vérification que les informations du patient sont affichées 
            await expect(page.getByRole('heading', { name: 'Création d\'un acte' })).toBeVisible();

            await page.getByRole('textbox').nth(1).fill(`Acte ambulatoire ${faker.number.int({ min: 1, max: 9999 })}`);
            await page.getByRole('spinbutton').fill('12000');
            await page.locator('div').filter({ hasText: /^Veuillez sélectionner un service$/ }).first().click();
            await page.getByRole('option', { name: hospitalName }).click();
            await page.getByRole('button', { name: 'Initialiser l\'acte' }).click();

            // Attendre que la page soit complètement chargée
            await page.waitForLoadState('networkidle');
            // Vérification que les informations du patient sont affichées 
            await expect.soft(page.getByRole('heading', { name: 'Lignes des prestations mé' })).toBeVisible();
        });

        await test.step('TC-002 : Créer un acte de type consultation', async () => {
            // Naviguer vers la section de paramétrage des actes consultation
            await page.getByRole('link', { name: 'Configurer une consultation' }).click();

            // Attendre que la page soit complètement chargée
            await page.waitForURL('**/settings/prest/set-consultation**');
            await expect(page).toHaveURL(`${envConfig.baseUrl}/settings/prest/set-consultation`);

            // Vérification que les informations du patient sont affichées 
            await expect(page.getByRole('heading', { name: 'Création d\'une consultation' })).toBeVisible();

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
            await expect.soft(page.getByRole('heading', { name: 'Lignes des prestations mé' })).toBeVisible();
        });

        await test.step('TC-003 : Créer un acte de type Radiologie', async () => {
            // Naviguer vers la section de paramétrage des actes imagerie
            await page.getByRole('link', { name: 'Configurer un acte d\'imagerie' }).click();
            // Attendre que la page soit complètement chargée
            await page.waitForURL('**/settings/prest/set-imagerie**');
            await expect(page).toHaveURL(`${envConfig.baseUrl}/settings/prest/set-imagerie`);

            // Vérification que les informations du patient sont affichées 
            await expect(page.getByRole('heading', { name: 'Création d\'un acte d\'imagerie' })).toBeVisible();

            await page.getByRole('textbox').nth(1).fill(`Radio thorax ${faker.number.int({ min: 1, max: 9999 })}`);
            await page.getByRole('spinbutton').fill('12000');
            await page.locator('div').filter({ hasText: /^Veuillez sélectionner un service$/ }).first().click();
            await page.getByRole('option', { name: hospitalName }).click();
            await page.getByRole('button', { name: 'Initialiser l\'acte' }).click();

            // Attendre que la page soit complètement chargée
            await page.waitForLoadState('networkidle');
            // Vérification que les informations du patient sont affichées 
            await expect.soft(page.getByRole('heading', { name: 'Lignes des prestations mé' })).toBeVisible();

        });

        await test.step('TC-004 : Créer un acte de type analyse', async () => {
            // Naviguer vers la section de paramétrage des actes analyse
            await page.getByRole('link', { name: 'Configurer un acte d\'analyse' }).click();
            // Attendre que la page soit complètement chargée
            await page.waitForURL('**/settings/prest/set-analyse**');
            await expect(page).toHaveURL(`${envConfig.baseUrl}/settings/prest/set-analyse`);

            // Vérification que les informations du patient sont affichées 
            await expect(page.getByRole('heading', { name: 'Création d\'un acte d\'analyse' })).toBeVisible();

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
            await expect.soft(page.getByRole('heading', { name: 'Lignes des prestations mé' })).toBeVisible();
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
            await expect(page.getByRole('heading', { name: 'Création d\'un employeur' })).toBeVisible();

            await page.locator('form').getByRole('textbox').fill(`EYONE MEDICAL ${faker.number.int({ min: 1, max: 999 })}`);
            await page.getByRole('button', { name: 'Créer le fournisseur' }).click();

            // Attendre que la page soit complètement chargée
            await page.waitForLoadState('networkidle');
            // Vérification que les informations du patient sont affichées 
            await expect.soft(page.getByRole('button', { name: 'Créer le fournisseur' })).toBeVisible();
        });

        await test.step('TC-006 : Ajouter un organisme de remboursement', async () => {
            // Naviguer vers la section de paramétrage des employeurs
            await page.getByRole('link', { name: 'Org. de remboursement 󰅀' }).click();
            await page.waitForTimeout(500);
            await page.getByRole('link', { name: 'Créer' }).click();
            // Attendre que la page soit complètement chargée
            await page.waitForURL('**/organismes/creer');
            await expect(page.getByRole('heading', { name: 'Création d\'un org. de' })).toBeVisible();

            await page.locator('form').getByRole('textbox').fill(`EYONE ASSURANCE ${faker.number.int({ min: 1, max: 999 })}`);
            await page.locator('div').filter({ hasText: /^Veuillez sélectionner un sexe$/ }).first().click();
            await page.getByRole('option', { name: 'IPM', exact: true }).click();
            await page.getByRole('button', { name: 'Créer l\'organisme' }).click();

            // Attendre que la page soit complètement chargée
            await page.waitForLoadState('networkidle');
            // Vérification que les informations du patient sont affichées 
            await expect.soft(page.getByRole('heading', { name: 'Organismes de remboursement' })).toBeVisible();
        });

        await test.step('TC-007 : Ajouter un tarif de consultation à une convention de prix', async () => {
            await page.getByRole('link', { name: 'Conventions de prix 󰅀' }).click();
            await page.waitForTimeout(500);
            await page.getByRole('link', { name: 'Rechercher' }).nth(1).click();
            // Attendre que la page soit complètement chargée
            await page.waitForURL('**/conventions/rechercher');
            await expect(page.getByRole('heading', { name: 'Conventions de tarif' })).toBeVisible();
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
            await expect.soft(page.locator('tbody tr').filter({ hasText: tarifName }).first()).toBeVisible();
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
            await expect(page.getByRole('heading', { name: 'Conventions de tarif' })).toBeVisible();
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
            await expect.soft(page.locator('tbody tr').filter({ hasText: tarifName }).first()).toBeVisible();
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
            await expect(page.getByRole('heading', { name: 'Conventions de tarif' })).toBeVisible();
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
            await page.locator('span').filter({ hasText: 'ANALYSE' }).first().click();
            await page.getByRole('spinbutton').fill('40000');
            await page.getByRole('button', { name: 'Sauvegarder' }).click();

            // Attendre que la page soit complètement chargée
            await page.waitForLoadState('networkidle');
            // Vérification que les informations du patient sont affichées 
            await expect.soft(page.locator('tbody tr').filter({ hasText: tarifName }).first()).toBeVisible();
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
            await expect(page.getByRole('heading', { name: 'Conventions de tarif' })).toBeVisible();
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
            await page.locator('span').filter({ hasText: 'ACTE AMBULATOIRE' }).first().click();
            await page.getByRole('spinbutton').fill('15000');
            await page.getByRole('button', { name: 'Sauvegarder' }).click();

            // Attendre que la page soit complètement chargée
            await page.waitForLoadState('networkidle');
            // Vérification que les informations du patient sont affichées 
            await expect.soft(page.locator('tbody tr').filter({ hasText: tarifName }).first()).toBeVisible();
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
            await expect(page.getByRole('heading', { name: 'Conventions de tarif' })).toBeVisible();
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
            await page.locator('span').filter({ hasText: 'ACTE AMBULATOIRE' }).first().click();
            await page.getByRole('spinbutton').fill('15000');
            await page.getByRole('button', { name: 'Sauvegarder' }).click();

            // Attendre que la page soit complètement chargée
            await page.waitForLoadState('networkidle');
            // Vérification que les informations du patient sont affichées 
            await expect.soft(page.getByRole('heading', { name: 'Détails' })).toBeVisible();
            await expect.soft(page.locator('tbody tr').filter({ hasText: tarifName })).toBeVisible();
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
            await expect(page.getByRole('heading', { name: 'Création d\'un produit' })).toBeVisible();
            productName = `Produit ${faker.number.int({ min: 1, max: 999 })}`;
            await page.getByRole('textbox').nth(1).fill(productName);
            await page.locator('.ng-select-container').first().click();
            await page.getByRole('option', { name: 'PHARMACEUTIQUE', exact: true }).click();
            await page.getByRole('combobox').nth(1).click();
            await page.getByRole('option', { name: 'Boîte' }).click();
            await page.locator('.w-100 > .ng-select-container').click();
            await page.getByRole('option', { name: 'CAT1' }).click();
            await page.getByRole('textbox').nth(2).fill('5000');
            await page.getByRole('combobox').nth(3).click();
            await page.getByRole('option', { name: 'Vente', exact: true }).click();
            await page.locator('.w-100 > .ng-select-container').click();
            await page.getByRole('option', { name: 'CAT1', exact: true }).click();
            await page.getByRole('spinbutton').nth(1).fill('500');
            await page.locator('.col-12 > .ng-select > .ng-select-container').first().click();
            await page.getByRole('option', { name: 'g/l' }).first().click();
            await page.getByRole('spinbutton').nth(2).fill('700');
            await page.locator("(//input[@role='combobox'])[8]").click();
            await page.getByRole('option', { name: 'g/l' }).first().click();
            await page.getByRole('button', { name: 'Sauvegarder' }).click();
            // await page.waitForResponse('**/dokploy-medical-product/1.0/products');
            // Attendre que la page soit complètement chargée
            // await page.waitForLoadState('networkidle');
            // Vérification que les informations du patient sont affichées 
            await expect.soft(page.getByRole('heading', { name: 'Produits' })).toBeVisible();
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
            await page.getByRole('option', { name: 'PEDIATRIE' }).first().click();
            await page.getByRole('button', { name: 'Créer' }).click();
            // Attendre que la page soit complètement chargée
            await page.waitForLoadState('networkidle');
            // Vérification que les informations du patient sont affichées 
            await expect.soft(page.getByRole('button', { name: 'Créer un emplacement de stock' })).toBeVisible({ timeout: 60000 });
        });

        await test.step('TC-014 : Ajouter un emplacement de stocks au produit', async () => {
            // Naviguer vers la section de paramétrage des produits
            await page.getByRole('link', { name: 'Rechercher' }).first().click();
            // Attendre que la page soit complètement chargée
            await page.waitForURL('**/products/list');
            await expect(page.getByRole('heading', { name: 'Produits' })).toBeVisible();
            // Je veux récupérer la première ligne de la table qui contient "Paracétamol 100mg" et cliquer sur le bouton "Visualiser" de cette ligne
            await page.locator('tbody tr').filter({ hasText: productName }).locator('.dropdown-toggle.mdi').first().click();
            await page.locator('.dropdown-menu.show .dropdown-item', { hasText: 'Visualiser' }).click();
            await page.waitForURL('**/editorview/edit/*');

            await page.getByRole('tab', { name: 'Gestion de stock' }).click();
            // Attendre jusqu'à 5 secondes l'apparition du bouton OUI (détection de doublons api : check-likeness-patient)
            const alertDialog = page.getByRole('dialog', { name: 'Aucun emplacement de stock trouvé' });
            try {
                await alertDialog.waitFor({ state: 'visible', timeout: 3000 });
            } catch (e) {
                // Ignorer l'erreur si la modale de doublon n'apparait pas, le test continue normalement
                console.log('Aucun doublon détecté, pas de modale à fermer.');
            }
            await page.getByRole('button', { name: 'Ajouter un emplacement de' }).click();
            await page.locator('.ng-select-container').click();
            await page.getByRole('option', { name: 'ORL' }).first().click();
            await page.getByRole('button', { name: 'Sauvegarder' }).click();
            // Attendre que la page soit complètement chargée
            await page.waitForLoadState('networkidle');
            // Vérification que les informations du patient sont affichées 
            await expect.soft(page.locator('tbody tr').filter({ hasText: 'ORL' }).first()).toBeVisible();
        });

        await test.step('TC-015 : Créer une quote-part de répartition sur les produits', async () => {
            await page.reload();
            await page.locator('#vertical-menu-btn').click();
            await page.getByRole('link', { name: ' Produits 󰅀' }).click();
            // Naviguer vers la section de paramétrage des produits
            // await page.locator('a').filter({ hasText: 'Produits' }).first().click();
            await page.waitForTimeout(500);
            await page.locator('a[href*="/products/list"]').getByText('Rechercher').click();
            // Attendre que la page soit complètement chargée
            await page.waitForURL('**/products/list');
            // await expect(page.getByRole('heading', { name: 'Produits' })).toBeVisible();
            await page.waitForTimeout(2000);
            // Je veux récupérer la première ligne de la table qui contient "Paracétamol 100mg" et cliquer sur le bouton "Visualiser" de cette ligne
            await page.locator('tbody tr').filter({ hasText: productName }).locator('.dropdown-toggle.mdi').first().click();
            await page.locator('.dropdown-menu.show .dropdown-item', { hasText: 'Visualiser' }).click();
            await page.waitForURL('**/editorview/edit/*');

            await page.locator('a span').getByText('Quote Part Fournisseur').click();
            await page.waitForLoadState('networkidle');
            await page.getByText('Ajouter une quote part').click();
            const quotePartName = `Quote part ${faker.number.int({ min: 1, max: 999 })}`;
            await page.getByRole('textbox', { name: 'Nom Quote part' }).fill(quotePartName);
            await page.locator('div').filter({ hasText: /^Veuillez sélectionner un élément$/ }).first().click();
            await page.getByRole('option', { name: 'PHARMACIE NATIONALE' }).click();
            await page.locator('#searchForm').getByText('Par pourcentage').click();
            await page.getByRole('spinbutton', { name: 'Valeur' }).fill('80');
            await page.getByRole('button', { name: 'Ajouter' }).click();
            // Attendre que la page soit complètement chargée
            await page.waitForLoadState('networkidle');
            // Vérification que les informations du patient sont affichées 
        });

        await test.step('TC-016 : Créer une catégorie de chambre', async () => {
            const logistiqueLink = page.locator('a').filter({ hasText: 'Logistique' });
            await logistiqueLink.scrollIntoViewIfNeeded();
            await logistiqueLink.click();
            await page.waitForTimeout(500);
            await page.getByText('Chambres', { exact: true }).click();
            await page.waitForTimeout(500);
            await page.getByText('Catégories', { exact: true }).click();
            await page.waitForLoadState('networkidle');
            await expect(page.getByText('Catégorie', { exact: true })).toBeVisible();

            await expect(page.getByText('Ajouter une catégorie')).toBeVisible();
            await page.getByText('Ajouter une catégorie').click();
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
            await expect(page.getByText('Créer une chambre')).toBeVisible();

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
        });

        await test.step('TC-018 : Créer une chambre double avec deux lits', async () => {
            await page.locator('a').filter({ hasText: 'Logistique' }).click();
            await page.waitForTimeout(500);
            await page.getByText('Chambres', { exact: true }).click();
            await page.waitForTimeout(500);
            await page.locator('a[href*="/logistic/rooms/add-room"]').getByText('Créer').click()
            await page.waitForLoadState('networkidle');
            // await page.waitForResponse('**/dokploy-admin/1.0/sapi/rest/v1/organism-entities');
            await expect(page.getByText('Créer une chambre')).toBeVisible();

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
        });

        await test.step('TC-019 : Créer une chambre avec trois lits', async () => {
            await page.locator('a').filter({ hasText: 'Logistique' }).click();
            await page.waitForTimeout(500);
            await page.getByText('Chambres', { exact: true }).click();
            await page.waitForTimeout(500);
            await page.locator('a[href*="/logistic/rooms/add-room"]').getByText('Créer').click()
            await page.waitForLoadState('networkidle');
            // await page.waitForResponse('**/dokploy-admin/1.0/sapi/rest/v1/organism-entities');
            await expect(page.getByText('Créer une chambre')).toBeVisible();

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
        });

    });

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
            await page.locator('#vertical-menu-btn').click();
            await page.getByRole('link', { name: ' Règlements à payer' }).click();
            const responseReglements = page.waitForURL('**/gestion-financiere/reglements-a-payer');
            await responseReglements;
            await encaisserPrestation(page, 'Hospitalisation');
        });

        await test.step('TC-049 : Encaisser une consultation avec un patient assuré', async () => {
            await page.getByText('Rafraîchir').click();
            await page.waitForLoadState('networkidle');
            await encaisserPrestation(page, 'Consultation');
        });

        await test.step('TC-050 : Encaisser une analyse avec un patient assuré', async () => {
            const refreshButton = page.getByText('Rafraîchir');
            await expect(refreshButton).toBeVisible();
            await refreshButton.click();
            await encaisserPrestation(page, 'Analyse');
        });

        await test.step('TC-055 : Encaisser une ambulatoire avec un patient assuré', async () => {
            const refreshButton = page.getByText('Rafraîchir');
            await expect(refreshButton).toBeVisible();
            await refreshButton.click();
            await page.waitForLoadState('networkidle');
            await encaisserPrestation(page, 'Ambulatoire');
        });

        await test.step('TC-061 : Encaisser une hospitalisation contenant de la pharmacie avec un patient assuré', async () => {
            const refreshButton = page.getByText('Rafraîchir');
            await expect(refreshButton).toBeVisible();
            await refreshButton.click();
            await page.waitForLoadState('networkidle');
            await encaisserPrestation(page, 'Pharmacie');
        });

        await test.step('TC-064 : Générer le récapitulatif caisse de la journée', async () => {
            await page.waitForTimeout(2000); // Pause pour permettre l'inspection manuelle de la page des règlements à payer avant de générer le récapitulatif de caisse
            const recapButton = page.getByText('Recap. de la caisse');
            await expect(recapButton).toBeVisible();
            await recapButton.click();
            await page.waitForLoadState('networkidle');
            await expect(page.getByRole('heading', { name: 'Résumés de caisse' })).toBeVisible();
            const generateButton = page.getByRole('button', { name: 'Générer le récapitulatif de' });
            await expect(generateButton).toBeVisible();
            await generateButton.click();
            await page.waitForLoadState('networkidle');
            await page.getByRole('button', { name: 'Fermer' }).click();
        });

        await test.step('TC-065 : Générer un relevé de facture', async () => {
            const invoiceLink = page.getByText('Relevés de factures');
            await invoiceLink.scrollIntoViewIfNeeded();
            await invoiceLink.click();
            // Attendre 0,5 seconde pour s'assurer que le menu est bien chargé
            await page.waitForTimeout(500);
            await page.locator('.sub-menu.ng-star-inserted.mm-collapse.mm-show > li > .side-nav-link-ref').first().click();
            await page.waitForTimeout(2000); // Attendre 2 secondes pour s'assurer que le tableau est bien chargé
            await expect(page.getByText('Nouveau relevé')).toBeVisible();
            // je veux récupérer le contenu de la première ligne du tableau des factures
            const IPM = await page.locator('tbody tr').first().locator('td').nth(3).textContent() as string;
            // Cliquer sur les 3 premières lignes du tableau qui contient l'IPM récupéré
            await page.locator('tbody tr').filter({ hasText: IPM }).first().locator('input[type="checkbox"]').check();
            await page.locator('tbody tr').filter({ hasText: IPM }).nth(1).locator('input[type="checkbox"]').check();
            // await page.locator('tbody tr').filter({ hasText: IPM }).nth(2).locator('input[type="checkbox"]').check();
            await page.getByText('Créer le relevé de factures').click();
            await page.waitForLoadState('networkidle'); // Attendre la réponse pour s'assurer que le tableau est bien chargé
            await expect.soft(page.locator('h4').getByText('Nouveau relevé')).toBeVisible();
            await page.waitForTimeout(2000); // Attendre 2 secondes pour s'assurer que le tableau est bien chargé
            await expect.soft(page.locator('tbody tr').filter({ hasText: 'Terminé' }).first()).toBeVisible();
            await page.locator('tbody tr').filter({ hasText: 'Terminé' }).first().locator('td').last().locator('button').click();
            await page.waitForLoadState('networkidle');
            await expect.soft(page.getByText('Visualisation d\'un relevé de')).toBeVisible();
            await expect.soft(page.getByText('Générer PDF')).toBeVisible();
            await page.getByText('Générer PDF').click();
            await expect.soft(page.getByText('Générer Excel')).toBeVisible();
            await page.getByText('Générer Excel').click();
            await page.waitForLoadState('networkidle');
            await expect.soft(page.locator('.btn.btn-light').first()).toBeVisible();
            await page.pause(); // Pause pour permettre l'inspection manuelle du récapitulatif de caisse généré
        });

        await test.step('Facturer une consultation avec des actes médicaux et des produits de pharmacie avec un patient assuré', async () => {
            await page.goto('/');
            await page.locator('#vertical-menu-btn').click();
            await navigateToPatientsList(page);
            // On récupère le premier patient de la liste via l'API pour s'assurer qu'il existe
            let patient = await getFirstPatientFromAPI(page);
            if (!patient) {
                throw new Error('Aucun patient trouvé via l\'API');
            }
            patientName = `${patient.firstName} ${patient.lastName}`;
            // Créer une consultation pour ce patient
            await createPrestationConsultation(page, patientName, true, true);
            await page.getByRole('link', { name: ' Gestion financière 󰅀' }).click();
            await page.getByRole('link', { name: 'Règlements à payer' }).click()
            await encaisserPrestation(page, 'Consultation');
            await page.pause();
        });
    });
});


async function createPrestationAmbulatoire(page: Page, patientName: string) {
    await page.getByText('Créer prestation').click();
    if (envConfig.baseUrl === 'https://dpp.eyone.net' || envConfig.baseUrl === 'https://simedical.dpi.sn') {
        await createPrestationStep(page, patientName, 'Nouvel Ambulatoire');
    } else {
        await page.waitForURL('**/patient-identification');
        await expect(page.getByText('Patient Interne')).toBeVisible();
        // Renseigner les informations du patient
        await page.getByPlaceholder('Prénom, Nom, Numéro de télé').fill(patientName);
        await page.locator('button').filter({ hasText: 'Rechercher' }).click();
        await page.locator('tbody tr').filter({ hasText: patientName }).first().click();
        await expect(page.getByText('Nouvelle prestation')).toBeVisible();
        // Créer une prestation d'ambulatoire
        await page.locator('button').filter({ hasText: 'Ambulatoire' }).click();

    }
    await page.waitForURL('**/ambulatory/create/**');
    await page.waitForResponse('**/sapi/rest/v1/organism-entities');
    await expect(page.locator('h4').filter({ hasText: 'Nouvel Ambulatoire' })).toBeVisible();

    // Sélectionner une prestation
    await page.getByRole('combobox', { name: 'Veuillez sélectionner un élé' }).click();
    await page.locator('span').filter({ hasText: 'ACTE AMBULATOIRE' }).first().click();
    await page.waitForResponse('**/prestations-items/medical-act-selection');
    await Promise.all([
        page.waitForResponse('**/dokploy-medical-billing/1.0/prestations/rev2', { timeout: 15000 }).catch(() => null), // catch évite de planter si la req n'est pas strictement nécessaire
        page.getByText('Enregistrer').click()
    ]);
    await expect(page.getByRole('heading', { name: 'Facture' })).toBeVisible();
    await expect.soft(page.locator('#regenerate')).toBeVisible();
    await page.locator('#regenerate').click();
    await page.waitForLoadState('networkidle');
    await expect.soft(page.getByText('Facture régénérée avec succès')).toBeVisible();
}

async function createPrestationStep(page: Page, patientName: string, prestationType: string) {
    await page.waitForURL('**/prestation/new/PRT');
    await expect(page.getByText('Patient', { exact: true })).toBeVisible();
    await page.getByRole('combobox', { name: 'Patient' }).pressSequentially(patientName, { delay: 100 });
    await page.locator('span').filter({ hasText: patientName }).first().click();
    await page.waitForLoadState('networkidle');
    // Créer une prestation
    await page.getByRole('combobox').nth(2).selectOption({ label: prestationType });
}

async function createPrestationImagerie(page: Page, patientName: string) {
    await page.getByText('Créer prestation').click();
    if (envConfig.baseUrl === 'https://dpp.eyone.net' || envConfig.baseUrl === 'https://simedical.dpi.sn') {
        await createPrestationStep(page, patientName, 'Nouvelle Imagerie');
    } else {
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
    }
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
    // await page.waitForResponse('**/dokploy-medical-billing/1.0/prestations/*');
    await expect.soft(page.getByRole('heading', { name: 'Facture' })).toBeVisible();
    await expect.soft(page.locator('#regenerate')).toBeVisible();
    await page.locator('#regenerate').click();
    await page.waitForLoadState('networkidle');
    await expect.soft(page.getByText('Facture régénérée avec succès')).toBeVisible();
}

async function createPrestationAnalyse(page: Page, patientName: string) {
    await page.getByText('Créer prestation').click();
    if (envConfig.baseUrl === 'https://dpp.eyone.net' || envConfig.baseUrl === 'https://simedical.dpi.sn') {
        await createPrestationStep(page, patientName, 'Nouvelle Analyse');
    } else {
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
    }
    await page.waitForURL('**/analysis/create/**');
    await expect(page.locator('h4').filter({ hasText: 'Nouvelle analyse' })).toBeVisible();
    // Sélectionner une prestation
    await page.getByRole('combobox', { name: 'Veuillez sélectionner un élé' }).click();
    await page.locator('span').filter({ hasText: 'ANALYSE D\'URINE' }).first().click();
    await page.waitForResponse('**/prestations-items/medical-act-selection');
    await page.waitForLoadState('networkidle');
    await Promise.all([
        page.waitForResponse('**/dokploy-medical-billing/1.0/prestations/rev2', { timeout: 15000 }).catch(() => null), // catch évite de planter si la req n'est pas strictement nécessaire
        page.getByRole('button', { name: 'Enregistrer' }).click()
    ]);
    await expect.soft(page.getByRole('heading', { name: 'Facture' })).toBeVisible();
    await expect.soft(page.locator('#regenerate')).toBeVisible();
    await page.locator('#regenerate').click();
    await page.waitForLoadState('networkidle');
    await expect.soft(page.getByText('Facture régénérée avec succès')).toBeVisible();
}

async function createHospitalization(page: Page, patientName: string) {
    await page.getByText('Créer prestation').click();
    if (envConfig.baseUrl === 'https://dpp.eyone.net' || envConfig.baseUrl === 'https://simedical.dpi.sn') {
        await createPrestationStep(page, patientName, 'Nouvelle hospitalisation');
    } else {
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
    }
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
    await expect.soft(page.getByRole('heading', { name: 'Facture' })).toBeVisible();
    await page.locator('#regenerate').click();
    await page.waitForLoadState('networkidle');
    await expect.soft(page.getByText('Facture régénérée avec succès')).toBeVisible();
}

async function createPrestationConsultation(page: Page, patientName: string, medicalActe: boolean = false, traitement: boolean = false) {
    await page.locator('a').filter({ hasText: 'Prestations' }).first().click();
    await page.waitForTimeout(500);
    await page.getByText('Créer prestation').click();
    // await page.pause();
    if (envConfig.baseUrl === 'https://dpp.eyone.net' || envConfig.baseUrl === 'https://simedical.dpi.sn') {
        await createPrestationStep(page, patientName, 'Nouvelle consultation');
    } else {
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
    }
    await page.waitForURL('**/consultation/create/**');
    await expect(page.locator('h4').filter({ hasText: 'Nouvelle consultation' })).toBeVisible();
    // Sélectionner une prestation
    await page.getByLabel('Prestation Médicale *').click();
    await page.locator('span').filter({ hasText: 'CONSULTATION CARDIO' }).first().click();
    await page.waitForResponse('**/consultations/consultation-act-selection');
    await page.waitForLoadState('networkidle');
    // await page.locator('h4', { hasText: 'Total Facture' }).scrollIntoViewIfNeeded();
    await page.getByText('Enregistrer').click();
    if (medicalActe) {
        await page.getByRole('button', { name: 'Actes Médicaux' }).click();
        const addActButton = page.getByRole('button', { name: ' Ajouter un acte' });
        await expect(addActButton).toBeVisible();
        await addActButton.click();
        await expect(page.getByRole('heading', { name: 'Création de l\'acte médical' })).toBeVisible();
        await page.getByRole('combobox', { name: 'Acte *' }).click();
        await page.locator('span').filter({ hasText: 'ACTE AMBULATOIRE' }).first().click();
        await page.waitForResponse('**/prestations-items/medical-act-selection');
        await page.locator('div').filter({ hasText: /^Veuillez sélectionner un élément$/ }).first().click();
        await page.getByRole('option', { name: 'Dr Ndiaye' }).click();
        await page.getByRole('button', { name: ' Enregistrer' }).click();
        await page.waitForLoadState('networkidle');
        await page.getByRole('button', { name: 'OK' }).click();
        await page.getByRole('button', { name: ' Fermer' }).click();
    }

    if (traitement) {
        await page.getByRole('button', { name: 'Traitements' }).click();
        const addMedecine = page.getByRole('button', { name: ' Ajouter un médicament' });
        await expect(addMedecine).toBeVisible();
        await addMedecine.click();
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
        await expect.soft(page.getByText('Dues à la mise à jour, une gé')).toBeVisible();
        await page.locator('#regenerate').click();
        await page.getByRole('button', { name: 'Facturation' }).click();
    }
    await expect.soft(page.getByText('Facture', { exact: true })).toBeVisible();
    await page.locator('#regenerate').click();
    await page.waitForLoadState('networkidle');
    await expect.soft(page.getByText('Facture régénérée avec succès')).toBeVisible();
}

async function createPrestationPharmacy(page: Page, patientName: string) {
    await page.getByText('Créer prestation').click();
    if (envConfig.baseUrl === 'https://dpp.eyone.net' || envConfig.baseUrl === 'https://simedical.dpi.sn') {
        await createPrestationStep(page, patientName, 'Nouvelle Pharmacie');
    } else {
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
    }
    await page.waitForURL('**/pharmacy/create/**');
    await page.waitForResponse('**/organisms/users/*/assigned-organisms');
    await expect(page.locator('h4').filter({ hasText: 'Nouvelle Pharmacie' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Produit à ajouter' })).toBeVisible();
    const Armoire = page.getByText('Armoire(s) assignée(s):');
    try {
        await Armoire.waitFor({ state: 'visible', timeout: 3000 });
        // Sélectionner une prestation
        await page.locator('.col-12 > .ng-select > .ng-select-container').first().click();
        const hospitalOption = page.locator('.ng-dropdown-panel .ng-option').filter({ hasText: 'PEDIATRIE' }).first();
        await hospitalOption.click();

    } catch (e) {
        console.log('Aucun armoire détecté.');
    }
    await page.getByRole('combobox', { name: 'Produit' }).pressSequentially('DOLI', { delay: 100 });
    await page.locator('span').filter({ hasText: 'DOLIPRANE' }).first().click();
    await page.waitForLoadState('networkidle');
    await page.locator('#mouvementValue').fill('10');
    await page.getByRole('button', { name: 'Ajouter à la liste' }).click();
    await page.waitForLoadState('networkidle');
    await expect.soft(page.locator('tbody tr').filter({ hasText: 'DOLIPRANE' })).toBeVisible();
    await page.getByText('Enregistrer').click();
    await expect.soft(page.getByRole('heading', { name: 'Facture' })).toBeVisible();
    await page.locator('#regenerate').click();
    await page.waitForLoadState('networkidle');
    await expect.soft(page.getByText('Facture régénérée avec succès')).toBeVisible();
}

async function createPatient(page: Page) {
    const addPatientButton = page.getByText('Créer un patient');
    await expect(addPatientButton).toBeVisible();
    await addPatientButton.click();
    await page.waitForURL('**/patient/create/**');

    const patientFormTitle = page.locator('h6', { hasText: 'Identité du patient - Informations Principales' });
    await expect(patientFormTitle).toBeVisible();
    await expect(patientFormTitle).toHaveText('Identité du patient - Informations Principales');
    // Fonction pour nettoyer les accents (é -> e, î -> i, etc.)
    const cleanString = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
    const sexe = faker.person.sexType();
    const firstNamePatient = cleanString(faker.person.firstName(sexe));
    const lastNamePatient = cleanString(faker.person.lastName(sexe));
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
        await btnOui.waitFor({ state: 'visible', timeout: 3000 });
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
    // await expect(page.getByRole('heading', { name: 'à payer' })).toBeVisible();
    await page.waitForTimeout(2000); // Attendre 2 secondes pour s'assurer que le tableau est bien chargé
    const rowsText = await page.locator('tbody tr').allTextContents();
    // console.log('Contenu du tableau :', rowsText);
    await page.locator('tbody tr').filter({ hasText: prestationName })
        .locator('[class*="mdi-dots"]').first().click({ force: true });
    await page.locator('.dropdown-menu.show .dropdown-item', { hasText: 'Encaisser' }).click();
    const encaisserType = page.getByRole('heading', { name: 'Options d\'encaissement' });
    try {
        await encaisserType.waitFor({ state: 'visible', timeout: 3000 });
        await page.getByRole('button', { name: ' Encaisser' }).click();
    } catch (e) {
        console.log('Menu d\'encaissement classique détecté.');
    }
    await expect(page.getByRole('heading', { name: 'Encaissement en espèces' })).toBeVisible({ timeout: 15000 });
    await page.getByRole('dialog', { name: 'Encaissement en espèces' }).getByRole('button', { name: 'Oui' }).click();
    await page.waitForLoadState('networkidle');
}
