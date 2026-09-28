'use strict';

const PRODUCTS = [
  'Black Duck SCA', 'BDBA', 'Coverity', 'Polaris', 'Seeker', 'Defensics',
  'Software Risk Manager', 'Code Sight', 'Polaris Assist', 'Signal',
  'ContextAI', 'Continuous Dynamic'
];

const DISCOVERY_PATHS = [
  { id: 1, objective: 'Secure open source and software supply chain', workload: 'Open source, dependencies, containers, or SBOMs', qualifier: 'Do you have source or build access?', primary: ['Black Duck SCA', 'Polaris'], adjacent: ['BDBA'], alternative: [], validation: 'Do you need SaaS, on-premises, or hybrid delivery?' },
  { id: 2, objective: 'Assess supplier software without source', workload: 'Third-party binaries, firmware, or supplier software', qualifier: 'Is source or build access unavailable?', primary: ['BDBA'], adjacent: ['Black Duck SCA', 'Polaris'], alternative: [], validation: 'Do you need to validate a supplier SBOM, firmware image, or binary package?' },
  { id: 3, objective: 'Secure proprietary code', workload: 'Proprietary source code', qualifier: 'Is deep release-grade analysis required?', primary: ['Coverity'], adjacent: ['Black Duck SCA', 'Code Sight', 'Signal'], alternative: ['Polaris SAST'], validation: 'Which languages, build systems, and deployment model are in scope?' },
  { id: 4, objective: 'Improve developer feedback', workload: 'Developer changes, pull requests, and AI-assisted coding', qualifier: 'Must feedback arrive before commit or merge?', primary: ['Code Sight', 'Signal'], adjacent: ['Polaris', 'ContextAI'], alternative: [], validation: 'Where should developers receive, understand, and act on results?' },
  { id: 5, objective: 'Test running applications from the outside', workload: 'Running web applications or APIs', qualifier: 'Is an external attacker perspective required?', primary: ['Continuous Dynamic'], adjacent: ['Seeker'], alternative: ['Polaris DAST'], validation: 'How frequently must testing run, and are authenticated APIs in scope?' },
  { id: 6, objective: 'Validate runtime data flow', workload: 'Instrumented applications in testing', qualifier: 'Is internal runtime context required?', primary: ['Seeker'], adjacent: ['Continuous Dynamic', 'Polaris'], alternative: [], validation: 'Can the application be instrumented in QA or staging?' },
  { id: 7, objective: 'Test protocols and robustness', workload: 'Protocols, devices, APIs, or embedded interfaces', qualifier: 'Are malformed and unexpected inputs the concern?', primary: ['Defensics'], adjacent: ['BDBA', 'Coverity'], alternative: [], validation: 'Which interfaces and protocols are mission critical?' },
  { id: 8, objective: 'Improve enterprise AppSec governance', workload: 'Findings distributed across multiple testing tools', qualifier: 'Is portfolio-level prioritization required?', primary: ['Software Risk Manager'], adjacent: ['Black Duck SCA', 'Coverity', 'Seeker', 'Defensics', 'Continuous Dynamic'], alternative: ['Polaris reporting'], validation: 'Which tools must remain, and what determines business priority?' },
  { id: 9, objective: 'Secure AI-assisted development', workload: 'Coding assistants and software-development agents', qualifier: 'Are assistants or agents generating or modifying code?', primary: ['Signal', 'ContextAI'], adjacent: ['Polaris Assist', 'Code Sight'], alternative: [], validation: 'Which assistants, languages, repositories, and pre-commit controls are in scope?' },
  { id: 10, objective: 'Reduce analyst triage effort', workload: 'High-volume SAST or AppSec review', qualifier: 'Is manual finding review the bottleneck?', primary: ['Polaris Assist'], adjacent: ['Polaris', 'Software Risk Manager'], alternative: [], validation: 'Which findings consume the most review time and delay releases?' },
  { id: 11, objective: 'Meet restricted-environment requirements', workload: 'Disconnected, classified, or customer-controlled environment', qualifier: 'Can code or findings leave the environment?', primary: ['Black Duck SCA', 'BDBA', 'Coverity', 'Seeker', 'Defensics', 'Software Risk Manager'], adjacent: [], alternative: [], validation: 'Is the network air-gapped, and who operates the platform?' },
  { id: 12, objective: 'Support a mixed deployment portfolio', workload: 'Cloud-capable and restricted workloads', qualifier: 'Can selected workloads use SaaS?', primary: ['Polaris', 'Signal'], adjacent: ['Software Risk Manager'], alternative: [], validation: 'Is common policy and reporting required across deployment boundaries?' }
];

const KNOWN_HEADINGS = [
  'Background', 'Core Context', 'Current State', 'Recommended Technical Answers',
  'Constraints', 'Tunneling and Secure Connection Discussion',
  'Shared Services and Enclave', 'Presentation Guidance', 'People and Support',
  'Logistics and Next Steps', 'Action Items', 'Risks', 'Decisions',
  'Bottom-Line Message'
];

function decodeEntities(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function cleanContext(value) {
  return decodeEntities(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function headingFor(line) {
  const raw = String(line || '').replace(/[:\-]+$/, '').trim();
  const key = raw.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const aliases = {
    'context': 'Core Context', 'core context': 'Core Context',
    'current state': 'Current State',
    'recommended technical answers': 'Recommended Technical Answers',
    'technical answers': 'Recommended Technical Answers',
    'constraints': 'Constraints',
    'tunneling secure connection discussion': 'Tunneling and Secure Connection Discussion',
    'tunneling and secure connection discussion': 'Tunneling and Secure Connection Discussion',
    'shared services enclave': 'Shared Services and Enclave',
    'shared services and enclave': 'Shared Services and Enclave',
    'presentation guidance': 'Presentation Guidance',
    'people support': 'People and Support', 'people and support': 'People and Support',
    'logistics next steps': 'Logistics and Next Steps',
    'logistics and next steps': 'Logistics and Next Steps',
    'action items': 'Action Items', 'actions': 'Action Items',
    'risks': 'Risks', 'decisions': 'Decisions',
    'bottom line': 'Bottom-Line Message', 'bottom line message': 'Bottom-Line Message'
  };
  return aliases[key] || KNOWN_HEADINGS.find(h => h.toLowerCase() === raw.toLowerCase()) || null;
}

function parseContext(value) {
  const text = cleanContext(value);
  if (!text) return [];
  const sections = [];
  let current = { heading: 'Core Context', lines: [] };
  const flush = () => {
    const content = current.lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    if (content) sections.push({ heading: current.heading, content });
  };
  for (const sourceLine of text.split('\n')) {
    const line = sourceLine.trim();
    if (!line) { current.lines.push(''); continue; }
    const heading = headingFor(line);
    if (heading) { flush(); current = { heading, lines: [] }; continue; }
    if (/^(from|sent|to|cc|subject):\s/i.test(line)) continue;
    if (/^get outlook for/i.test(line)) continue;
    current.lines.push(line.replace(/^[â€¢â–ªâ—¦]\s*/, '- '));
  }
  flush();
  return sections.length ? sections : [{ heading: 'Core Context', content: text }];
}

function formatContext(sections) {
  return (sections || [])
    .filter(section => section && String(section.content || '').trim())
    .map(section => `${section.heading || 'Context'}\n${String(section.content).trim()}`)
    .join('\n\n');
}

module.exports = function installV20(app, db) {
  if (!app || app.__v20ProperInstalled) return;
  app.__v20ProperInstalled = true;

  if (db && typeof db.exec === 'function') {
    db.exec(`CREATE TABLE IF NOT EXISTS v20_context_sections (
      call_prep_id INTEGER NOT NULL,
      section_order INTEGER NOT NULL,
      heading TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_date TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(call_prep_id, section_order)
    )`);
  }

  app.get('/api/v20/health', (req, res) => res.json({
    status: 'running', version: 20.2, mode: 'option-a-proper',
    products: PRODUCTS.length, paths: DISCOVERY_PATHS.length
  }));

  app.get('/api/v20/discovery-catalog', (req, res) => res.json({
    products: PRODUCTS,
    paths: DISCOVERY_PATHS,
    sequence: ['Objective', 'Workload and Access', 'Qualifier', 'Primary Recommendation', 'Adjacent Products', 'Alternatives', 'Validation']
  }));

  app.post('/api/v20/context/parse', (req, res) => {
    const sections = parseContext(req.body && (req.body.context || req.body.text));
    res.json({ sections, formatted: formatContext(sections) });
  });

  app.get('/api/v20/context/:id', (req, res) => {
    if (!db || typeof db.prepare !== 'function') return res.json({ sections: [] });
    const rows = db.prepare('SELECT section_order, heading, content, updated_date FROM v20_context_sections WHERE call_prep_id=? ORDER BY section_order').all(Number(req.params.id));
    res.json({ sections: rows });
  });

  app.put('/api/v20/context/:id', (req, res) => {
    if (!db || typeof db.prepare !== 'function') return res.status(503).json({ error: 'Database handle unavailable' });
    const id = Number(req.params.id);
    const sections = Array.isArray(req.body && req.body.sections) ? req.body.sections : [];
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM v20_context_sections WHERE call_prep_id=?').run(id);
      const insert = db.prepare('INSERT INTO v20_context_sections(call_prep_id,section_order,heading,content,updated_date) VALUES(?,?,?,?,CURRENT_TIMESTAMP)');
      sections.forEach((section, index) => {
        if (section && String(section.content || '').trim()) {
          insert.run(id, index, String(section.heading || 'Context'), String(section.content).trim());
        }
      });
    });
    transaction();
    res.json({ success: true, saved: sections.filter(s => s && String(s.content || '').trim()).length });
  });
};
