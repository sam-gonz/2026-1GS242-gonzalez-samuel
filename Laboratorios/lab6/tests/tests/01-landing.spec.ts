import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('debe mostrar la página principal correctamente', async ({ page }) => {
    await expect(page).toHaveTitle(/PollClass/i);
    await expect(page.locator('h1')).toContainText('PollClass');
    await expect(page.locator('text=Encuestas en vivo para el aula')).toBeVisible();
  });

  test('debe mostrar ambos botones de navegación', async ({ page }) => {
    const soyProfesor = page.locator('text=Soy Profesor');
    const soyEstudiante = page.locator('text=Soy Estudiante');
    
    await expect(soyProfesor).toBeVisible();
    await expect(soyEstudiante).toBeVisible();
  });

  test('debe navegar a la página del profesor', async ({ page }) => {
    await page.click('text=Soy Profesor');
    await expect(page).toHaveURL(/professor/);
    await expect(page.locator('text=Panel del Profesor')).toBeVisible();
  });

  test('debe navegar a la página del estudiante', async ({ page }) => {
    await page.click('text=Soy Estudiante');
    await expect(page).toHaveURL(/student/);
    await expect(page.locator('text=Vista del Estudiante')).toBeVisible();
  });

  test('debe tener enlace para volver desde profesor', async ({ page }) => {
    await page.click('text=Soy Profesor');
    await page.click('text=Volver');
    await expect(page).toHaveURL('/');
  });

  test('debe tener enlace para volver desde estudiante', async ({ page }) => {
    await page.click('text=Soy Estudiante');
    await page.click('text=Volver');
    await expect(page).toHaveURL('/');
  });
});