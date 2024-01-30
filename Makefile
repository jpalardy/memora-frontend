
build:
	npm exec -- esbuild --bundle lib/app.js --outfile=public/js/memora.js

.PHONY: lint
lint:
	npx eslint lib/

