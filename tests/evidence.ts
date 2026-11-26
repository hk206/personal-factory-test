import { test as base, expect } from '@playwright/test';

type Capture = (label: string, action: () => Promise<void>) => Promise<void>;

export const test = base.extend<{ checkpoint: Capture }>({
  checkpoint: async ({ page }, use, info) => {
    let index = 0;
    await use(async (label, action) => {
      await base.step(label, async () => {
        try {
          await action();
        } finally {
          await info.attach(String(++index).padStart(2, '0') + '-' + label, {
            body: await page.screenshot({ fullPage: true, timeout: 10000 }),
            contentType: 'image/png',
          });
        }
      });
    });
  },
});
export { expect };
