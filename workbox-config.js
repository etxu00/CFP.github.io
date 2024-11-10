module.exports = {
	globDirectory: '.',
	globPatterns: [
		'**/*.{json,Identifier,png,ico,svg,webmanifest,html,md,js,css}'
	],
	swDest: 'sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};