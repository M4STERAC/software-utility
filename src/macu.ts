#!/usr/bin/env node

import { Command } from 'commander';
import create_godot_patch_release from './godot/create-godot-patch-release';
import create_godot_minor_release from './godot/create-godot-minor-release';
import generateTextArt from './utils/console-art';

const program = new Command();
const version = require('../package.json').version;

console.log(generateTextArt('MACU   CLI'));

program
  .name('macu')
  .version(version)
  .description('CLI to implement workflows for different projects')

program
  .command('create-godot-patch-release')
  .alias('cgpr')
  .description('Creates a Godot and Github release for working directory')
  .action(create_godot_patch_release as any);

program
  .command('create-godot-minor-release')
  .alias('cgmr')
  .description('Creates a Godot and Github release for working directory')
  .action(create_godot_minor_release as any);

program.parse(process.argv);