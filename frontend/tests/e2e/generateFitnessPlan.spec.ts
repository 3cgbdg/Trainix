import { test, expect,  } from '@playwright/test';

test('Login if not and add food to cart and go to order page', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(5000);
    // logging in
    if (page.url().includes("/auth/login")) {
        await page.fill("#email", "email@gmail.com");
        await page.fill("#password", "12345678Bb");
        await page.locator('#log-in-btn').click();
        await page.waitForURL("**/dashboard");
    }
    // routing to the ai-analysis page
    await page.getByLabel("create-plan-btn").click();
    await page.waitForURL("**/ai-analysis");
    // adding file to analyze
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/images/test-body-image.jpg');
    // clicking btn to start analyzing
    const generateBtn = page.getByLabel("btn");
    await generateBtn.click();
    // checking if processing
    expect(generateBtn).toHaveText("Processing");
    await expect(page.getByText(/Photo Analysis Comparison/i)).toBeVisible({ timeout: 80000 }); //waiting max-80 secs to get all plan and analysis visible




});
