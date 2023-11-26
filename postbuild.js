/* eslint-disable @typescript-eslint/no-var-requires */
const { readFileSync, writeFileSync, copyFileSync } = require('fs');
const { merge } = require('lodash');

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const packageDist = JSON.parse(readFileSync('./package-dist.json', 'utf-8'));
const packageFinal = merge(packageJson, packageDist);

delete packageFinal.scripts;
delete packageFinal.devDependencies;

writeFileSync('./build/package.json', JSON.stringify(packageFinal, null, '\t') + '\n', 'utf-8');

copyFileSync('./readme.md', './build/readme.md');
copyFileSync('./LICENSE', './build/LICENSE');
copyFileSync('./.npmignore', './build/.npmignore');
