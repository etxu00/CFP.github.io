module.exports = {
	globDirectory: '.',
	globPatterns: [
		'**/*.{json,png,html,md,js,css}'
	],
	swDest: 'sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};