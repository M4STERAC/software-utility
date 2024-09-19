#!/usr/bin/env node

import { Command } from 'commander';
import create_godot_release from './godot/create-godot-release';
import generateTextArt from './utils/console-art';

const program = new Command();
const version = require('../package.json').version;

console.log(generateTextArt('MACU   CLI'));

program
  .name('macu')
  .version(version)
  .description('CLI to implement workflows for different projects')

program
  .command('create-godot-release')
  .alias('cgr')
  .description('Creates a Godot and Github release for working directory')
  .option('--patch', 'Creates a patch release')
  .option('--minor', 'Creates a minor release')
  .option('--major', 'Creates a major release')
  .action(create_godot_release as any);

program.parse(process.argv);