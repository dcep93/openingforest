#!/bin/bash

set -euo pipefail

# npx create-react-app frontend --template typescript
# yarn add @babel/plugin-proposal-private-property-in-object --dev

cd frontend

npm install
yarn build
rm -rf node_modules
