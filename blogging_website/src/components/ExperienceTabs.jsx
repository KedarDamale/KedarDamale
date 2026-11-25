import { useRef, useState, useSyncExternalStore } from 'react';

const jobs = [
  {
    id: 'globalspace',
    name: 'Globalspace',
    title: 'ML & GenAI Engineer',
    company: 'Globalspace Technologies',
    range: 'January 2026 — Present',
    points: [
      'Build AI, ML, and analytical systems across pharmaceutical intelligence, financial workflows, and enterprise decision support.',
      <>Develop PatGPT, an agentic assistant for forecasting, simulation, and historical analysis across <span className="inline-link">3M+ pharmaceutical sales and tender records</span>, with evidence-grounded answers and human review.</>,
      'Design a unified hierarchy and configurable scoring engine for budget and incentive calculations across thousands of employees.',
      'Engineer reliable analysis workflows with streamed responses, safe retries, and controlled data releases.',
    ],
  },
  {
    id: 'propelligence',
    name: 'Propelligence',
    title: 'Freelance Automation Developer',
    company: 'Propelligence Advisors',
    range: 'May 2025 — January 2026',
    points: [
      'Built an automated reconciliation pipeline for matching purchase-register invoices against GSTR-2B tax records.',
      <>Processed <span className="inline-link">10,000+ invoices</span> using Polars, RapidFuzz, normalization, and fuzzy entity matching.</>,
      'Reduced a five-to-six-day manual reconciliation workflow to 12 seconds of automated processing, a reduction of more than 99.9%.',
      'The module became part of Granska, an audit workflow adopted by two CA firms and approximately 20 auditors.',
    ],
  },
];

const horizontalQuery = '(max-width: 600px)';

function subscribeToOrientation(callback) {
  const query = window.matchMedia(horizontalQuery);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function isHorizontal() {
  return window.matchMedia(horizontalQuery).matches;
}

export default function ExperienceTabs() {
  const [selected, setSelected] = useState(0);
  const horizontal = useSyncExternalStore(subscribeToOrientation, isHorizontal, () => false);
  const tabs = useRef([]);

  function moveTab(event, current) {
    const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    const previousKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
    let next;

    if (event.key === nextKey) next = (current + 1) % jobs.length;
    else if (event.key === previousKey) next = (current + jobs.length - 1) % jobs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = jobs.length - 1;
    else return;

    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="jobs-inner">
      <div className="job-tabs" role="tablist" aria-label="Employers" aria-orientation={horizontal ? 'horizontal' : 'vertical'}>
        {jobs.map((job, index) => (
          <button
            key={job.id}
            ref={(tab) => { tabs.current[index] = tab; }}
            type="button"
            className="job-tab"
            role="tab"
            id={`tab-${job.id}`}
            aria-controls={`panel-${job.id}`}
            aria-selected={selected === index}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => moveTab(event, index)}
          >
            {job.name}
          </button>
        ))}
      </div>
      <div className="job-panels">
        {jobs.map((job, index) => (
          <div
            key={job.id}
            className="job-panel"
            role="tabpanel"
            id={`panel-${job.id}`}
            aria-labelledby={`tab-${job.id}`}
            tabIndex={0}
            hidden={selected !== index}
          >
            <h3>{job.title} <span className="company">@ {job.company}</span></h3>
            <p className="job-range">{job.range}</p>
            <ul className="job-points">
              {job.points.map((point, pointIndex) => <li key={pointIndex}>{point}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
