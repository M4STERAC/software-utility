import { Command } from 'commander';
import create_godot_patch_release from './godot/create-godot-patch-release';

const version = require('../package.json').version;

const program = new Command();

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