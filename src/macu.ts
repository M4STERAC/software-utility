#!/usr/bin/env node

import { Command } from 'commander';
import create_godot_patch_release from './godot/create-godot-patch-release';
import generateTextArt from './utils/console-art';

const program = new Command();
const version = require('../package.json').version;

// console.log(generateTextArt('MACU'));

program
  .name('macu')
  .version(version)
  .description('CLI to implement workflows for different projects')

program
  .command('create-godot-patch-release')
  .alias('cgpr')
  .description('Creates a Godot release for working directory')
  .option('-r --repository <name>', 'What is the repository in which you intend to create a tag?')
  .option('-b --branch <name>', 'What is the ref/branch in which you intend to push the created tag?')
  .action(create_godot_patch_release);

program.parse(process.argv);