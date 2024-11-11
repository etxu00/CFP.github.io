module.exports = {
	globDirectory: '.',
	globPatterns: [
		'**/*.{json,Identifier,png,xml,ico,svg,webmanifest,html,md,js,css}'
	],
	swDest: 'sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};