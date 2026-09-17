# Live Job Hunt Prompt

Search the live web for currently open, legitimate jobs that suit the candidate profile below. Return the results directly in this chat; do not merely describe how to search.

## Search criteria

- Experience: entry-level to **less than 2 years of experience**. Include internships, graduate roles, and 0-2 YOE positions. Exclude roles requiring 2+ years as a hard minimum.
- Locations: **Pune**, **Mumbai**, Navi Mumbai, Thane, or **remote from anywhere in India**. Clearly label the work location and remote/hybrid/on-site policy.
- Target roles: Data Scientist, Junior Data Scientist, Data Analyst (ML/data-focused), Machine Learning Engineer, ML Engineer, AI Engineer, Generative AI Engineer, Applied AI Engineer, Python Developer, Backend Python Developer, AI/ML Intern, or closely related entry-level roles.
- Employer quality: include a company only when its **AmbitionBox rating is above 3.0/5** *or* its **Glassdoor rating is above 3.0/5**. Prefer employers that clear the threshold on both sites. State the rating, source, and the date checked. If neither rating can be verified, exclude the company.
- Freshness: prioritize roles posted or refreshed in the last 30 days. Exclude clearly expired listings and flag any listing whose status cannot be confirmed.

## Candidate profile

Kedar Damale is a Machine Learning / AI engineer with professional experience in GenAI, automation, Python, and full-stack delivery.

Skills:

- Python, SQL, C, Pandas, NumPy, scikit-learn, Matplotlib, Seaborn, Jupyter
- Machine learning: supervised and unsupervised learning, regression, classification, clustering, model evaluation, cross-validation, hyperparameter tuning
- Generative AI, agentic AI workflows, RAG, human-in-the-loop validation, agent-state management
- FastAPI, React, PostgreSQL, REST/backend development, data analysis
- Computer vision, YOLOv8, Roboflow, IoT, geospatial analytics, DBSCAN

Experience:

- **Software Developer - GenAI, Globalspace Technologies Ltd.** (Feb 2026-present): contributed to PatGPT, a structured pharmaceutical sales-analysis platform; helped transition from RAG to an agentic AI approach; built agent-state management with human validation; developed rule-based incentive-distribution and target-allocation systems.
- **Automation Developer, Propelligence Advisors Pvt. Ltd.** (May 2025-Feb 2026): developed a Python-based PR vs. GSTR-2B reconciliation pipeline for 10,000+ invoice records; used fuzzy matching and automated a 5-6 day manual process.

Projects:

- **Cattle Monitoring using DBSCAN and ESP32**: led a team building distributed ESP32 GPS/RSSI monitoring, FastAPI backend, React dashboard, per-cattle milk-yield aggregation, and DBSCAN grazing-zone clustering.
- **Chessablanka - Chess Position Analyzer**: led end-to-end development; trained a custom YOLOv8 model on 700+ images expanded to 1,700 annotated samples; achieved 98.57% detection accuracy on 500+ test images.

Links:

- Portfolio: <https://kedardamale.github.io/KedarDamale/>
- GitHub: <https://github.com/KedarDamale>
- LinkedIn: <https://www.linkedin.com/in/kedar-damale-57252a324/>
- Kaggle: <https://www.kaggle.com/kedarpdamale>

## Required output

1. Search official company career pages first, then LinkedIn, Wellfound, Naukri, Indeed, and other reputable job boards. Use live web sources and open each listing before reporting it.
2. Return a ranked table with: company, role, location/work mode, experience requirement, posting date, why the role matches this candidate, AmbitionBox rating, Glassdoor rating, direct application URL, and source URL.
3. Provide only roles that meet every stated filter. Do not invent ratings, posting dates, openings, or application links.
4. After the table, list the top five roles to apply to first, with a two-sentence tailored application angle for each.
5. If fewer than 10 verified roles are available, say so plainly and explain which filter limited the results. Do not fill the list with weak matches.
