import { test, expect } from '@playwright/test';

test.describe('Vista del Estudiante', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/student');
  });

  test('debe mostrar el formulario para unirse', async ({ page }) => {
    await expect(page.locator('text=Unirse a una Encuesta')).toBeVisible();
    await expect(page.locator('text=Código de la Encuesta')).toBeVisible();
    await expect(page.locator('text=Tu Nombre')).toBeVisible();
  });

  test('validación: código requerido - verificación en UI', async ({ page }) => {
    await page.fill('input[placeholder="Escribe tu nombre completo"]', 'Juan');
    await page.press('input[placeholder="ABC123"]', 'Tab');
    const button = page.locator('button:has-text("Unirme a la Encuesta")');
    await expect(button).toBeDisabled();
  });

  test('validación: nombre requerido - verificación en UI', async ({ page }) => {
    await page.fill('input[placeholder="ABC123"]', 'ABC123');
    await page.press('input[placeholder="ABC123"]', 'Tab');
    const button = page.locator('button:has-text("Unirme a la Encuesta")');
    await expect(button).toBeDisabled();
  });

  test('validación: código con menos de 6 chars no habilita botón', async ({ page }) => {
    await page.fill('input[placeholder="ABC123"]', 'ABC12');
    await page.fill('input[placeholder="Escribe tu nombre completo"]', 'Juan');
    const button = page.locator('button:has-text("Unirme a la Encuesta")');
    await expect(button).toBeDisabled();
  });

  test('validación: código solo permite caracteres válidos', async ({ page }) => {
    const codeInput = page.locator('input[placeholder="ABC123"]');
    await codeInput.fill('ABC!@#');
    const value = await codeInput.inputValue();
    expect(value).toBe('ABC');
  });

  test('caso negativo: código inválido muestra error', async ({ page }) => {
    await page.fill('input[placeholder="ABC123"]', 'XXXXXX');
    await page.fill('input[placeholder="Escribe tu nombre completo"]', 'Juan');
    await page.click('text=Unirme a la Encuesta');
    await expect(page.locator('text=Código inválido o encuesta no encontrada')).toBeVisible();
  });

  test('happy path: puede escribir nombre correctamente', async ({ page }) => {
    await page.fill('input[placeholder="Escribe tu nombre completo"]', 'María García');
    const nameInput = page.locator('input[placeholder="Escribe tu nombre completo"]');
    await expect(nameInput).toHaveValue('María García');
  });

  test('debe convertir código a mayúsculas', async ({ page }) => {
    await page.fill('input[placeholder="ABC123"]', 'abc123');
    const codeInput = page.locator('input[placeholder="ABC123"]');
    await expect(codeInput).toHaveValue('ABC123');
  });

  test('contador de caracteres del código', async ({ page }) => {
    await page.fill('input[placeholder="ABC123"]', 'ABC');
    await expect(page.locator('text=3/6 caracteres')).toBeVisible();
  });
});