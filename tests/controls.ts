import { expect, type Page, type Locator } from "@playwright/test";

export async function ready(page: Page): Promise<void> {
  await expect(page.locator("#canvas-container")).toHaveAttribute(
    "data-ready",
    "true",
  );
}
export async function select(
  page: Page,
  label: string,
  option: string,
): Promise<void> {
  await page.getByRole("button", { name: new RegExp(`^${label}`) }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
export async function edit(
  page: Page,
  label: string,
  value: string,
  scope: Page | Locator = page,
): Promise<void> {
  const canvas = page.locator("#canvas-container");
  const revision = await canvas.getAttribute("data-revision");
  await scope.getByRole("slider", { name: label, exact: true }).press("Enter");
  const input = scope.getByLabel(`${label} value`, { exact: true });
  await input.fill(value);
  await input.press("Enter");
  await expect(canvas).not.toHaveAttribute("data-revision", revision!);
  await ready(page);
}
