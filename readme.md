# glsl-bundler

[![test](https://github.com/plutotcool/glsl-bundler/actions/workflows/test.yml/badge.svg)](https://github.com/plutotcool/glsl-bundler/actions/workflows/test.yml)
[![build](https://github.com/plutotcool/glsl-bundler/actions/workflows/build.yml/badge.svg)](https://github.com/plutotcool/glsl-bundler/actions/workflows/build.yml)
[![release](https://github.com/plutotcool/glsl-bundler/actions/workflows/release.yml/badge.svg)](https://github.com/plutotcool/glsl-bundler/actions/workflows/release.yml)

Functional regex-based glsl bundler, loader and minifier. Runs both on node and the browser.

This monorepo contains the main glsl-bundler package as well as integrations for various bundling tools.

[Live demo](https://glsl-bundler.vercel.app)

## Packages

- [@plutotcool/glsl-bundler](packages/glsl-bundler): Main glsl-bundler package
- [@plutotcool/rollup-plugin-glsl](packages/rollup-plugin-glsl): Rollup plugin for glsl-bundler
- @plutotcool/glsl-loader: Webpack loader for glsl-bundler (*coming soon*)
