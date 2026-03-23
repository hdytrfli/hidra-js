import { POSTS } from '@/libs/constants';
import { loader } from '@hidrajs/loader';

export default loader(async () => {
	return {
		posts: POSTS,
	};
});
