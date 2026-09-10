# Portfolio structure

The page is assembled from static HTML partials so each section can be edited independently.

```text
components/   Header, hero, about, experience, projects, contact, and footer markup
styles/       Design tokens, global rules, layout, and section styles
scripts/      Component loader plus navigation and GSAP motion modules
assets/       Portrait and visual assets used by the page
```

`index.html` is only the page shell. It loads the components and CDN libraries: Tailwind CSS for utility support, and GSAP with ScrollTrigger for motion.

When the resume is compiled, `scripts/publish-resume.sh` updates every HTML component that links to a resume PDF. Do not manually change the header or footer resume filename.
