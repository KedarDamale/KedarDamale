import { copyFile, cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';

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

        const resumeNames = (await readdir(new URL('output/', repo), { withFileTypes: true }))
          .filter((entry) => entry.isFile() && /^resume-\d{8}\.pdf$/.test(entry.name))
          .map((entry) => entry.name)
          .sort();

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

        await writeFile(new URL('resumes.json', resumeDir), `${JSON.stringify(resumeNames)}\n`);
        const latestResume = resumeNames.at(-1);
        if (latestResume) {
          await copyFile(new URL(latestResume, resumeDir), new URL('resume.pdf', resumeDir));
        }
      },
    },
  };
}
