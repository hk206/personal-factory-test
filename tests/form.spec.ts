import { test, expect } from './evidence';

test('AC1 空欄で送信すると名前の入力を求める', async ({ page, checkpoint }) => {
  const nameInput = page.getByRole('textbox', { name: '名前', exact: true });
  const submit = page.getByRole('button', { name: '送信', exact: true });
  const error = page.getByText('名前を入力してください', { exact: true });
  const completion = page.getByText('受付完了', { exact: true });

  await checkpoint('初期画面', async () => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'フォーム試験', exact: true })).toBeVisible();
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue('');
    await expect(submit).toBeVisible();
    await expect(error).toBeHidden();
    await expect(completion).toBeHidden();
  });

  await checkpoint('エラー', async () => {
    await submit.click();
    await expect(error).toBeVisible();
    await expect(completion).toBeHidden();
  });
});

test('AC2 名前を入力して再送信すると受付が完了する', async ({ page, checkpoint }) => {
  await checkpoint('完了', async () => {
    await page.goto('/');
    const nameInput = page.getByRole('textbox', { name: '名前', exact: true });
    const submit = page.getByRole('button', { name: '送信', exact: true });
    const error = page.getByText('名前を入力してください', { exact: true });
    const completion = page.getByText('受付完了', { exact: true });

    await submit.click();
    await expect(error).toBeVisible();
    await expect(completion).toBeHidden();

    await nameInput.fill('テスト太郎');
    await submit.click();
    await expect(completion).toBeVisible();
    await expect(error).toBeHidden();
  });
});
