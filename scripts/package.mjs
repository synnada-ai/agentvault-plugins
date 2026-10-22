import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { build, clients, root } from './build.mjs';

build({ check: true });
const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const destination = path.join(root, 'dist');
fs.mkdirSync(destination, { recursive: true });

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${command} failed: ${result.error?.message || result.stderr}`);
  return result.stdout;
}

const sums = [];
for (const client of clients) {
  const directory = path.join(root, 'plugins', client);
  const members = fs.readdirSync(directory, { recursive: true, withFileTypes: true });
  if (members.some(entry => entry.isSymbolicLink())) throw new Error(`${client}: archives must not contain symlinks`);
  const names = members.filter(entry => entry.isFile())
    .map(entry => path.relative(directory, path.join(entry.parentPath, entry.name))).sort();
  const filename = `agentvault-${client}-${version}.zip`;
  const archive = path.join(destination, filename);
  // zip otherwise updates an existing archive and can retain obsolete members.
  fs.rmSync(archive, { force: true });
  run('zip', ['-q', '-X', archive, ...names], directory);
  const inventory = run('unzip', ['-Z1', archive], root).trim().split('\n').sort();
  if (JSON.stringify(inventory) !== JSON.stringify(names)) throw new Error(`${filename}: unexpected ZIP inventory`);
  for (const name of names) {
    const result = spawnSync('unzip', ['-p', archive, name]);
    if (result.status !== 0 || !result.stdout.equals(fs.readFileSync(path.join(directory, name)))) {
      throw new Error(`${filename}: archived ${name} differs from the checked source`);
    }
  }
  sums.push(`${crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex')}  ${filename}`);
  console.log(`${filename}: inspected ${names.length} files`);
}
fs.writeFileSync(path.join(destination, 'SHA256SUMS'), sums.join('\n') + '\n');
