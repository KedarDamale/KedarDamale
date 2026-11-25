import { copyFile, readdir, writeFile } from 'node:fs/promises';

export function resumeDownloads() {
  return {
    name: 'resume-downloads',
    hooks: {
      'astro:config:setup': async ({ command, config }) => {
        if (command !== 'dev' && command !== 'build') return;

        const directory = new URL('output/', config.publicDir);
        const names = (await readdir(directory, { withFileTypes: true }))
          .filter((entry) => entry.isFile() && /^resume-\d{8}\.pdf$/.test(entry.name))
          .map((entry) => entry.name)
          .sort();
        const latest = names.at(-1);

        if (!latest) {
          throw new Error('Add a dated résumé PDF to public/output/ with make resume.');
        }

        await Promise.all([
          copyFile(new URL(latest, directory), new URL('resume.pdf', directory)),
          writeFile(new URL('resumes.json', directory), `${JSON.stringify(names)}\n`),
        ]);
      },
    },
  };
}
