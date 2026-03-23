import { test, expect, Page } from '@playwright/test';
import { login, loginWithCredentials, logout } from '../utils/patient-helpers';
import { fakerFR_SN as faker } from '@faker-js/faker';


test('TNR-Rdv', async ({ page }) => {
    await test.step('TC-001 : Ajouter un motif à un seul professionnel de la santé', async () => {
        await login(page);  // Utilise automatiquement les identifiants de l'environnement
        await page.locator('#vertical-menu-btn').click();
        const appointmentsLink = page.getByRole('link', { name: ' Rendez-vous 󰅀' });
        await appointmentsLink.scrollIntoViewIfNeeded();
        await appointmentsLink.click();
        await page.waitForTimeout(500);
        await page.click('a[href*="/appointment/reasons"]');
        await expect(page.getByRole('heading', { name: 'Motifs de Rendez-vous' })).toBeVisible();
        await createMotif(page);
    });

    await test.step('TC-002 : Ajouter un motif valable à plusieurs professionnels de la santé', async () => {
        await createMotif(page, 2);
    });

    await test.step('TC-003 : Configurer des créneaux de disponibilité pour un médecin', async () => {
        await logout(page);
        await loginWithCredentials(page, 'drsy@eyone.net', 'passe');
        await navigateToAppointments(page);
        await page.click('button:has-text("Configurer les créneaux de")');
        await expect(page.getByRole('heading', { name: 'Gérer les créneaux de' })).toBeVisible();
        console.log(faker.date.recent().getDay()); // Affiche un jour de la semaine aléatoire (1-7)
        // Ajouter une disponibilité pour le 1er médecin
        await page.getByLabel('Jour de la semaine').selectOption(`${faker.date.recent().getDay()}`); // Lundi
        await page.getByRole('textbox').first().fill('08:00');
        await page.getByRole('textbox').nth(1).fill('17:00');
        await page.getByRole('spinbutton').first().fill('8'); // Durée du créneau en heure
        await page.getByRole('spinbutton').nth(1).fill('2'); // Nombre de créneaux disponibles
        await page.getByRole('button', { name: 'Ajouter' }).click();
        // await page.getByRole('button', { name: 'Fermer' }).click();
        await page.getByText('×').click();
        await page.waitForLoadState('networkidle');
        await page.getByText('15 h').first().scrollIntoViewIfNeeded();
    });

    await test.step('TC-004 : Rechercher un rdv avec le prénom et le nom du patient', async () => {
        await page.getByRole('button', { name: 'Rechercher un rendez-vous' }).click();
        await expect(page.getByRole('heading', { name: 'Recherche de rendez-vous' })).toBeVisible();
        await page.getByRole('combobox', { name: 'Patient' }).pressSequentially('Mame marame', { delay: 100 });
        await page.locator('span').filter({ hasText: 'MAME MARAME VICTORINE' }).first().click();
        await expect(page.getByText('Confirmé').first()).toBeVisible();
        await page.getByText('×').click();
    });

    await test.step('TC-005 : Rechercher un rendez avec le numéro du patient', async () => {
        await page.getByRole('button', { name: 'Rechercher un rendez-vous' }).click();
        await expect(page.getByRole('heading', { name: 'Recherche de rendez-vous' })).toBeVisible();
        await page.getByRole('combobox', { name: 'Patient' }).pressSequentially('776874880', { delay: 100 });
        await page.locator('span').filter({ hasText: 'MAME MARAME VICTORINE' }).first().click();
        await expect(page.getByText('Confirmé').first()).toBeVisible();
        await page.getByText('×').click();
    });

    await test.step('TC-006 : Télécharger la liste des rdv du jour', async () => {
        await page.getByRole('button', { name: 'Télécharger la liste des' }).click();
        await expect(page.getByRole('heading', { name: 'Choisir la période à télé' })).toBeVisible();
        await page.getByRole('button', { name: 'Aujourd\'hui' }).click();
        await expect(page.getByRole('heading', { name: 'Téléchargement des rendez-' })).toBeVisible();
        await page.getByRole('button', { name: 'Télécharger' }).click();
        await page.waitForLoadState('networkidle');
        await page.getByText('×').click();
    });

    await test.step('TC-007 : Télécharger la liste des rdv de la semaine', async () => {
        await page.getByRole('button', { name: 'Télécharger la liste des' }).click();
        await expect(page.getByRole('heading', { name: 'Choisir la période à télé' })).toBeVisible();
        await page.getByRole('button', { name: 'La semaine courante' }).click();
        await expect(page.getByRole('heading', { name: 'Téléchargement des rendez-' })).toBeVisible();
        await page.getByRole('button', { name: 'Télécharger' }).click();
        await page.waitForLoadState('networkidle');
        await page.getByText('×').click();
    });

    await test.step('TC-008 : Télécharger la liste des rdv d\'une plage personnalisée', async () => {
        await page.getByRole('button', { name: 'Télécharger la liste des' }).click();
        await expect(page.getByRole('heading', { name: 'Choisir la période à télé' })).toBeVisible();
        await page.getByRole('button', { name: 'Dates spécifiques' }).click();
        await page.getByPlaceholder(' Heure de début').fill(faker.date.recent().toISOString().slice(0, 10));
        await page.getByPlaceholder(' Heure de fin                ').fill(faker.date.soon({ days: 7 }).toISOString().slice(0, 10));
        await page.getByRole('button', { name: 'Télécharger' }).click();
        await page.waitForLoadState('networkidle');
        await page.getByText('×').click();
        await page.pause(); // Attendre que les champs de date soient visibles
    });

});

async function navigateToAppointments(page: Page) {
    await page.getByRole('link', { name: ' Rendez-vous' }).click();
    await expect(page.getByRole('heading', { name: 'Agendas des médecins pour les rendez-vous' })).toBeVisible();
}

async function createAppointment(page: Page) {
    await page.click('button:has-text("Ajouter un rendez-vous")');
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.fill('input[name="patientName"]', 'Jean Dupont');
    await page.fill('input[name="date"]', '2024-07-01T10:00');
    await page.fill('input[name="reason"]', 'Consultation de suivi');
    await page.click('button:has-text("Enregistrer")');
}


async function createMotif(page: Page, doctorNumber: number = 1) {
    await page.click('button:has-text("Ajouter un motif")');
    await expect(page.getByRole('dialog')).toBeVisible();
    if (doctorNumber != 1) {
        await page.locator('.ng-select-container').click();
        await page.locator('.ng-dropdown-panel .ng-option').filter({ hasText: 'abdou ndiaye' }).click();
    }
    await page.locator('.ng-select-container').click();
    await page.locator('.ng-dropdown-panel .ng-option').filter({ hasText: 'Dr Ndiaye' }).click();
    const motifLabel = `Consultation de suivi ${faker.number.int({ min: 1, max: 999 })}`;
    await page.getByRole('textbox', { name: 'Label' }).fill(motifLabel);
    await page.getByRole('button', { name: 'Ajouter un motif' }).click();
    await expect(page.getByText(motifLabel)).toBeVisible();
}


async function verifyAppointmentCreated(page: Page) {
    await expect(page.getByText('Jean Dupont')).toBeVisible();
    await expect(page.getByText('2024-07-01 10:00')).toBeVisible();
    await expect(page.getByText('Consultation de suivi')).toBeVisible();
}

async function modifyAppointment(page: Page) {
    await page.click(`tr:has-text("Jean Dupont") button:has-text("Modifier")`);
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.fill('input[name="reason"]', 'Consultation de suivi - mise à jour');
    await page.click('button:has-text("Enregistrer")');
}

async function verifyAppointmentModified(page: Page) {
    await expect(page.getByText('Consultation de suivi - mise à jour')).toBeVisible();
}

async function deleteAppointment(page: Page) {
    await page.click(`tr:has-text("Jean Dupont") button:has-text("Supprimer")`);
    await page.click('button:has-text("Confirmer")');
}