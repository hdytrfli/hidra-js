/**
 * Function to espace the code blocks in markdown
 */
export const escape = (str: string): string => {
	return str.replace(/\{\{/g, '&#123;&#123;').replace(/\}\}/g, '&#125;&#125;');
};
