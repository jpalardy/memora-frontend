
build:
	./node_modules/.bin/esbuild --bundle lib/app.js --outfile=public/js/memora.js

.PHONY: lint
lint:
	npx eslint lib/

