import { test, expect } from './evidence';

test('AC1 初期表示でフォームの前にレベル1の見出しを表示する', async ({ page, checkpoint }) => {
  await checkpoint('初期表示でフォームの前に名前の登録見出しを確認', async () => {
    await page.goto('/');

    const app = page.locator('#app');
    const heading = app.getByRole('heading', { name: '名前の登録', exact: true, level: 1 });
    const form = app.locator('form');

    await expect(heading).toBeVisible();
    await expect(form).toBeVisible();

    const headingPrecedesForm = await heading.evaluate((element) => {
      const form = element.closest('#app')?.querySelector('form');
      return !!form && !!(element.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(headingPrecedesForm).toBe(true);
  });
});
