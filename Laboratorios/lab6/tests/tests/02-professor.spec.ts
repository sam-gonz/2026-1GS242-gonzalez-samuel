import { test, expect } from '@playwright/test';

test.describe('Panel del Profesor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/professor');
  });

  test('debe mostrar el formulario de creación de encuestas', async ({ page }) => {
    await expect(page.locator('text=Crear Nueva Encuesta')).toBeVisible();
    await expect(page.locator('text=Título de la Encuesta')).toBeVisible();
    await expect(page.locator('text=Opciones')).toBeVisible();
    await expect(page.locator('text=Crear Encuesta')).toBeVisible();
  });

  test('debe tener 2 opciones por defecto', async ({ page }) => {
    const options = page.locator('input[placeholder^="Opción"]');
    await expect(options).toHaveCount(2);
  });

  test('puede agregar más opciones (hasta 10)', async ({ page }) => {
    await page.click('text=Agregar opción');
    const options = page.locator('input[placeholder^="Opción"]');
    await expect(options).toHaveCount(3);

    await page.click('text=Agregar opción');
    await page.click('text=Agregar opción');
    await page.click('text=Agregar opción');
    await page.click('text=Agregar opción');
    await page.click('text=Agregar opción');
    await page.click('text=Agregar opción');
    await page.click('text=Agregar opción');
    const optionsFinal = page.locator('input[placeholder^="Opción"]');
    await expect(optionsFinal).toHaveCount(10);
  });

  test('no debe permitir menos de 2 opciones', async ({ page }) => {
    const removeButtons = page.locator('button[title="Eliminar opción"]');
    await expect(removeButtons).toHaveCount(0);
  });

  test('validación: título requerido', async ({ page }) => {
    await page.click('text=Crear Encuesta');
    await expect(page.locator('text=El título y al menos 2 opciones son requeridos')).toBeVisible();
  });

  test('validación: al menos 2 opciones con contenido', async ({ page }) => {
    await page.fill('input[type="text"]', 'Mi Encuesta');
    await page.click('text=Crear Encuesta');
    await expect(page.locator('text=El título y al menos 2 opciones son requeridos')).toBeVisible();
  });

  test('happy path: crear encuesta exitosamente', async ({ page }) => {
    const uniqueTitle = `Test Poll ${Date.now()}`;
    await page.fill('input[type="text"]', uniqueTitle);
    await page.fill('input[placeholder="Opción 1"]', 'React');
    await page.fill('input[placeholder="Opción 2"]', 'Vue');
    await page.click('text=Crear Encuesta');

    await expect(page.locator('text=¡Encuesta creada exitosamente!')).toBeVisible();
    await expect(page.getByRole('heading', { name: uniqueTitle })).toBeVisible();
  });

  test('debe mostrar filtros de encuestas', async ({ page }) => {
    await expect(page.locator('text=Todas')).toBeVisible();
    await expect(page.locator('text=Activas')).toBeVisible();
    await expect(page.locator('text=Cerradas')).toBeVisible();
  });

  test('debe mostrar lista de encuestas o mensaje vacío', async ({ page }) => {
    const hasPolls = await page.locator('[class*="PollCard"]').count() > 0 || await page.locator('[class*="space-y"]').count() > 0;
    const hasEmptyMessage = await page.getByText('No hay encuestas').count() > 0 || await page.locator('text=No hay encuestas').count() > 0;
    expect(hasPolls || hasEmptyMessage).toBe(true);
  });
});