import { execFileSync } from 'node:child_process';
import { copyFile, cp, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const repo = new URL('../../', import.meta.url);

export function portfolioPublicAssets() {
  return {
    name: 'portfolio-public-assets',
    hooks: {
      'astro:config:setup': async ({ command, config }) => {
        if (command !== 'dev' && command !== 'build') return;

        const publicDir = config.publicDir;
        const resumeDir = new URL('output/', publicDir);
        await rm(publicDir, { recursive: true, force: true });
        await mkdir(resumeDir, { recursive: true });

        const resumeNames = (await readdir(new URL('output/', repo)))
          .filter((name) => /^resume-\d{8}\.pdf$/.test(name));

        await Promise.all([
          ...['assets', 'styles', 'scripts/modules'].map((directory) => cp(
            new URL(`portfolio/${directory}/`, repo),
            new URL(`${directory}/`, publicDir),
            { recursive: true },
          )),
          ...resumeNames.map((name) => copyFile(
            new URL(`output/${name}`, repo),
            new URL(name, resumeDir),
          )),
        ]);

        execFileSync('python3', [
          fileURLToPath(new URL('scripts/list-resumes.py', repo)),
          fileURLToPath(resumeDir),
        ]);
      },
    },
  };
}
