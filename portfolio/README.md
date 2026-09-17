# Portfolio structure

The page is assembled from static HTML partials so each section can be edited independently.

```text
components/   Header, hero, about, experience, projects, contact, and footer markup
styles/       Design tokens, global rules, layout, and section styles
scripts/      Component loader plus navigation and GSAP motion modules
assets/       Portrait and visual assets used by the page
```

`index.html` is only the page shell. It loads the components and CDN libraries: Tailwind CSS for utility support, and GSAP with ScrollTrigger for motion.

Resume PDFs are generated and published manually as `resume-YYYYMMDD.pdf`. After publishing, manually update the resume filename in both `components/site-header.html` and `components/site-footer.html` before committing. GitHub Actions only deploys the portfolio and does not modify resume files or links.
