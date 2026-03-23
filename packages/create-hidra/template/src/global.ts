import { root } from '@hidrajs/loader';

export default root(async () => ({
	site: 'My Hidra App',
	year: new Date().getFullYear(),
}));
