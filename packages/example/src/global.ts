import { root } from '@hidrajs/loader';
import { SITE_NAME } from '@/libs/constants';

export default root(async () => {
	return {
		site: SITE_NAME,
		year: new Date().getFullYear(),
		others: { environtment: import.meta.env },
	};
});
