import { test, expect } from './evidence';

test('試験ページを表示できる', async ({ page, checkpoint }) => {
  await checkpoint('初期画面', async () => {
    const response = await page.goto('/');
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { name: 'フォーム試験' })).toBeVisible();
  });
});
