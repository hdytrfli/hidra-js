import { POSTS } from '@/libs/constants';
import { dynamic } from '@hidrajs/loader';

export default dynamic(async () => {
	return POSTS.map((post) => {
		return {
			params: {
				slug: post.slug,
				category: post.category,
			},
			props: {
				date: post.date,
				title: post.title,
				content: post.content,
				category: post.category,
			},
		};
	});
});
