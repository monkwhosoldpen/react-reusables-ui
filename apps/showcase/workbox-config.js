module.exports = {
	globDirectory: 'app/',
	globPatterns: [
		'**/*.tsx'
	],
	swDest: 'assets/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};