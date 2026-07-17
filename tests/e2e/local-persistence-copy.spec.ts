import { test, expect } from "@playwright/test";

test("should explain that progress is stored in the current browser", async ({
	page,
}) => {
	const localizedCopy = [
		["/en/", "Your progress is stored locally in this browser"],
		["/es/", "Tu progreso se guarda localmente en este navegador"],
	] as const;

	for (const [route, copy] of localizedCopy) {
		await page.goto(route);
		await expect(page.getByText(copy, { exact: true })).toBeVisible();
	}
});
