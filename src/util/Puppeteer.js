/**
 * Expose a function to the page if it does not exist
 *
 * NOTE:
 * Rewrite it to 'upsertFunction' after updating Puppeteer to 20.6 or higher
 * using page.removeExposedFunction
 * https://pptr.dev/api/puppeteer.page.removeexposedfunction
 *
 * @param {object} page - Puppeteer Page instance
 * @param {string} name
 * @param {Function} fn
 */
async function exposeFunctionIfAbsent(page, name, fn) {
    const exist = await page.evaluate((name) => {
        return !!window[name];
    }, name);
    if (exist) {
        return;
    }
    try {
        await page.exposeFunction(name, fn);
    } catch (error) {
        // Handle CDP binding conflicts after page navigation
        if (error.message && error.message.includes('already exists')) {
            try {
                // Try to remove and re-expose (requires Puppeteer 20.6+)
                if (typeof page.removeExposedFunction === 'function') {
                    await page.removeExposedFunction(name);
                    await page.exposeFunction(name, fn);
                }
            } catch {
                // Older Puppeteer version or removal failed, function should still work
            }
        } else {
            throw error;
        }
    }
}

module.exports = {exposeFunctionIfAbsent};
