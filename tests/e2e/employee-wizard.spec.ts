import { test, expect } from '@playwright/test';

test.describe('EPI Manager - Parcours Employé', () => {
  test('devrait permettre de soumettre une demande d\'EPI complète', async ({ page }) => {
    // 1. Accéder à l'accueil
    await page.goto('/');

    // 2. Étape 1 : Remplir l'identité
    await page.locator('input[placeholder="Nom"]').fill('Martin');
    await page.locator('input[placeholder="Prénom"]').fill('Jean');
    await page.locator('select').first().selectOption('MAG'); // Service Magasinier
    await page.click('button:has-text("Continuer")');

    // 3. Étape 2 : Sélectionner une catégorie d'EPI
    // Sélectionner le premier bouton de catégorie disponible dans la liste
    const epiButton = page.locator('button:has-text("sécurité")').first();
    if (await epiButton.isVisible()) {
      await epiButton.click();
    } else {
      // Fallback sur le premier bouton de catégorie si non disponible
      await page.locator('button:has-text("Gants"), button:has-text("Veste"), button:has-text("Chaussures"), button.justify-start').first().click();
    }
    await page.click('button:has-text("Continuer")');

    // 4. Étape 3 : Choisir la taille
    // Cliquer sur le premier bouton de la grille des tailles (grid-cols-3) qui n'est pas désactivé
    const sizeButton = page.locator('.grid-cols-3 button:not([disabled])').first();
    await sizeButton.click();
    await page.click('button:has-text("Continuer")');

    // 5. Étape 4 : Sélectionner le motif et valider
    await page.locator('select').selectOption('Usure');
    
    // Cliquer sur le bouton de confirmation de la demande
    await page.click('button:has-text("Confirmer la demande")');

    // 6. Vérifier le succès de la soumission
    // L'écran final doit afficher soit le succès en ligne, soit le succès hors-ligne
    const successTitle = page.locator('h3:has-text("Demande Envoyée"), h3:has-text("Demande Enregistrée Hors-ligne"), h2:has-text("Demande Enregistrée Hors-ligne")').first();
    await expect(successTitle).toBeVisible({ timeout: 15000 });
  });
});
