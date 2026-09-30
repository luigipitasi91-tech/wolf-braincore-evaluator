const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
const has=(text,re)=>re.test(clean(text));

const FINANCE_RE=/\b(stock|stocks|share|shares|equity|equities|ticker|portfolio|dcf|wacc|dividend|dividends|earnings|quarterly|valuation|p\/e|eps|revenue|margin|rsi|macd|bollinger|fibonacci|support|resistance|insider|institutional|options|short squeeze|fed|inflation|gdp|macro|market cap|azioni|titolo|titoli|portafoglio|dividendi|trimestrali|valutazione|rischio|grafico|concorrenti|inflazione|pil)\b/i;
const BROWSER_RE=/\b(browser|website|web site|webpage|portal|login|log in|form|checkout|scrape|scraping|crawl|click|browser agent|playwright|puppeteer|selenium|session|cookie|credentials|otp|2fa|tab|dom|sito|pagina web|portale|accedi|login|modulo)\b/i;

export const FINANCE_EVIDENCE_FAMILIES=[
  'equity-screening',
  'intrinsic-valuation',
  'portfolio-risk',
  'earnings-analysis',
  'portfolio-construction',
  'technical-analysis',
  'dividend-analysis',
  'competitive-analysis',
  'pattern-research',
  'macro-scenario-analysis'
];

export const BROWSER_RUNTIME_REQUIREMENTS=[
  'session-isolation',
  'credential-boundary',
  'domain-boundary',
  'read-vs-act',
  'observability-replay',
  'post-action-verification',
  'retry-recovery',
  'human-handoff',
  'cost-time-budget',
  'persistence-mode'
];

function financeContract(request){
  const constraints=[
    'Use dated, verifiable sources for market, fundamental, macro, and company data; do not invent missing values.',
    'Separate observed facts, external consensus/estimates, and model assumptions; label uncertainty explicitly.',
    'Historical performance, correlations, chart patterns, and backtests do not prove a future edge or guarantee returns.'
  ];
  const unknowns=[];
  const verification=[
    'Check every quoted market/fundamental value against a source and date before treating it as evidence.',
    'For pattern or backtest claims, report sample size, method, out-of-sample limitations, and conditions that would invalidate the signal.',
    'Keep scenario outputs conditional; distinguish historical measurements from forward-looking hypotheses.'
  ];

  if(/\b(dcf|valuation|wacc|valore|valutazione)\b/i.test(request)){
    unknowns.push('Which company/ticker, valuation date, forecast horizon, discount-rate assumptions, and terminal-value method should be used?');
  }
  if(/\b(portfolio|portafoglio|allocation|allocazione)\b/i.test(request)){
    unknowns.push('What are the holdings/weights or capital, horizon, risk tolerance, country, and relevant tax regime?');
    constraints.push('Do not present an allocation as personally suitable until risk, horizon, jurisdiction, and constraints are known.');
  }
  if(/\b(earnings|quarterly|trimestrali)\b/i.test(request)){
    unknowns.push('Which company/ticker and earnings date are in scope, and which consensus source should be used?');
  }
  if(/\b(dividend|dividendi)\b/i.test(request)){
    constraints.push('Treat dividends as variable and potentially reducible or suspendable; do not imply guaranteed income.');
  }
  if(/\b(rsi|macd|bollinger|fibonacci|chart|grafico|technical|tecnica)\b/i.test(request)){
    constraints.push('Treat technical signals as conditional indicators, not certainties; include invalidation levels and data period.');
  }
  if(/\b(pattern|stagional|seasonal|short squeeze|insider|institutional|options)\b/i.test(request)){
    constraints.push('Do not infer a durable edge from a historical correlation alone; test robustness and alternative explanations.');
  }
  if(/\b(fed|inflation|gdp|macro|pil|inflazione|tassi|interest rate)\b/i.test(request)){
    constraints.push('Separate current macro facts, market consensus, and scenario assumptions; do not invent forecasts.');
  }
  return {domain:'finance',constraints,unknowns,verification};
}

function browserContract(request){
  const constraints=[
    'Keep credentials, OTPs, and secrets outside model-visible text; inject them only at the execution boundary.',
    'Restrict web actions to explicit target domains and authority; consequential writes require a clear approval boundary.',
    'Prefer read-only fetch/search/extraction before a full interactive browser when the task does not require browser state.',
    'Define whether the run is stateless or uses a persistent authenticated profile; never assume persistence silently.',
    'Track browser/runtime cost and time budget so retries cannot grow without a bound.'
  ];
  const unknowns=[
    'Which domains are allowed, and is the task read-only or permitted to create external side effects?',
    'Is an authenticated persistent profile required, and what human handoff is required for identity, consent, payment, or blocked access?'
  ];
  const verification=[
    'Verify the final page/DOM or returned structured state after each consequential action; click success alone is not completion.',
    'Keep an auditable action trace with timestamps and enough evidence to replay or diagnose the run.',
    'Define retry limits, recovery/rollback behavior, and a human handoff when the browser cannot safely complete the task.'
  ];
  return {domain:'browser-agent',constraints,unknowns,verification};
}

export function analyzeDomainPacks(request){
  const packs=[];
  if(has(request,FINANCE_RE))packs.push(financeContract(request));
  if(has(request,BROWSER_RE))packs.push(browserContract(request));
  return {
    domains:packs.map(x=>x.domain),
    constraints:[...new Set(packs.flatMap(x=>x.constraints))],
    unknowns:[...new Set(packs.flatMap(x=>x.unknowns))],
    verification:[...new Set(packs.flatMap(x=>x.verification))]
  };
}

export const DOMAIN_PACKS_VERSION='wolf-domain-packs/1.0';
