import { test, expect } from '@playwright/test';

test.describe('Validaciones de Formularios', () => {
  test.describe('PollForm - Crear Encuesta', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/professor');
    });

    test('no debe permitir título vacío', async ({ page }) => {
      await page.fill('input[placeholder="Opción 1"]', 'React');
      await page.fill('input[placeholder="Opción 2"]', 'Vue');
      await page.click('text=Crear Encuesta');
      await expect(page.locator('text=El título y al menos 2 opciones son requeridos')).toBeVisible();
    });

    test('no debe permitir solo 1 opción', async ({ page }) => {
      await page.fill('input[type="text"]', 'Mi Encuesta');
      await page.fill('input[placeholder="Opción 1"]', 'React');
      await page.click('text=Crear Encuesta');
      await expect(page.locator('text=El título y al menos 2 opciones son requeridos')).toBeVisible();
    });

    test('no debe permitir opciones vacías', async ({ page }) => {
      await page.fill('input[type="text"]', 'Mi Encuesta');
      await page.fill('input[placeholder="Opción 1"]', 'React');
      await page.fill('input[placeholder="Opción 2"]', '   ');
      await page.click('text=Crear Encuesta');
      await expect(page.locator('text=El título y al menos 2 opciones son requeridos')).toBeVisible();
    });

    test('debe limitar título a 100 caracteres', async ({ page }) => {
      const titleInput = page.getByPlaceholder('¿Qué framework prefieren?');
      await titleInput.fill('A'.repeat(150));
      const value = await titleInput.inputValue();
      expect(value.length).toBeLessThanOrEqual(100);
    });

    test('debe mostrar contadores de caracteres', async ({ page }) => {
      await page.fill('input[type="text"]', 'Test');
      await expect(page.locator('text=4/100 caracteres')).toBeVisible();
    });
  });

  test.describe('JoinPoll - Unirse a Encuesta', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/student');
    });

    test('no debe permitir código menor a 6 caracteres', async ({ page }) => {
      await page.fill('input[placeholder="ABC123"]', 'ABC12');
      await page.fill('input[placeholder="Escribe tu nombre completo"]', 'Juan');
      await expect(page.locator('button:disabled')).toBeVisible();
    });

    test('no debe permitir nombre vacío', async ({ page }) => {
      await page.fill('input[placeholder="ABC123"]', 'ABC123');
      await expect(page.locator('button:disabled')).toBeVisible();
    });

    test('validación: reject caracteres especiales en código', async ({ page }) => {
      const codeInput = page.locator('input[placeholder="ABC123"]');
      await codeInput.fill('AB@1!#');
      const value = await codeInput.inputValue();
      expect(value).toBe('AB1');
    });

    test('happy path: código y nombre válidos habilitan botón', async ({ page }) => {
      await page.fill('input[placeholder="ABC123"]', 'ABC123');
      await page.fill('input[placeholder="Escribe tu nombre completo"]', 'Juan');
      const button = page.locator('text=Unirme a la Encuesta');
      await expect(button).toBeEnabled();
    });
  });
});

test.describe('Navegación y Rutas', () => {
  test('ruta desconocida debe redirigir correctamente', async ({ page }) => {
    await page.goto('/ruta-inexistente');
    await expect(page).toHaveURL(/ruta-inexistente/);
  });

  test('professor sin sesión es accesible', async ({ page }) => {
    await page.goto('/professor');
    await expect(page).toHaveURL(/professor/);
    await expect(page.locator('text=Panel del Profesor')).toBeVisible();
  });

  test('student sin sesión es accesible', async ({ page }) => {
    await page.goto('/student');
    await expect(page).toHaveURL(/student/);
    await expect(page.locator('text=Vista del Estudiante')).toBeVisible();
  });
});