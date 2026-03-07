#!/usr/bin/env node
/**
 * Collects Playwright test result videos into a flat demo-videos/ directory
 * with human-readable names.
 *
 * Usage: node scripts/collect-videos.mjs
 */
import { readdirSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

const RESULTS_DIR = join(import.meta.dirname, '..', 'test-results');
const OUTPUT_DIR = join(import.meta.dirname, '..', 'demo-videos');

if (!existsSync(RESULTS_DIR)) {
  console.error('No test-results directory found. Run tests first.');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

let count = 0;
for (const dir of readdirSync(RESULTS_DIR, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;

  const videoDir = join(RESULTS_DIR, dir.name);
  for (const file of readdirSync(videoDir)) {
    if (!file.endsWith('.webm')) continue;

    // Generate readable name from directory name
    const name = dir.name
      .replace(/-chromium$/, '')
      .replace(/^(\d{2})-/, '$1_')
      .replace(/-+/g, '-')
      .substring(0, 80);

    const dest = join(OUTPUT_DIR, `${name}.webm`);
    copyFileSync(join(videoDir, file), dest);
    console.log(`  ${basename(dest)}`);
    count++;
  }
}

console.log(`\nCollected ${count} video(s) into demo-videos/`);
if (count > 0) {
  console.log('\nTo convert to MP4 (requires ffmpeg):');
  console.log('  for f in demo-videos/*.webm; do ffmpeg -i "$f" -c:v libx264 "${f%.webm}.mp4"; done');
  console.log('\nTo merge all into one video:');
  console.log('  ffmpeg -f concat -safe 0 \\');
  console.log('    -i <(for f in demo-videos/*.webm; do echo "file \'$f\'"; done) \\');
  console.log('    -c copy demo-videos/full-demo.webm');
}
