#! /usr/bin/env node

import { Command } from 'commander';
import create_godot_patch_release from './godot/create-godot-patch-release';
import generateTextArt from './utils/console-art';

const program = new Command();
const version = require('../package.json').version;

console.log(generateTextArt('MACU'));

program
  .name('macu')
  .version(version)
  .description('CLI to implement workflows for different projects')

program
  .command('create-godot-patch-release')
  .alias('cgpr')
  .description('Creates a Godot release for working directory')
  .action(create_godot_patch_release);

program.parse(process.argv);