import { getRequestConfig } from 'next-intl/server';
import { locales } from '../config';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Validate that the incoming `locale` parameter is valid
    // @ts-ignore
    if (!locale || !locales.includes(locale)) {
        locale = 'vi'; // Default to vietnamese
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
