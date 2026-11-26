import { test, expect } from '@playwright/test';

test('AC1 @regression フォーム見出しは1個', async ({ page }) => {
  await page.goto('/');
  await test.step('回帰判定', async () => {
    await expect(page.getByRole('heading', {name: 'フォーム試験'})).toHaveCount(1);
  });
});
