import { buildBrainCorePlan } from './braincore.mjs';

export const FINANCE_DOMAIN_CASES=[
  {id:'equity-screening',title:'Equity screening',request:'Screen public stocks for a cautious investor with a £20,000 portfolio, five-year horizon, and UK tax context. Use current valuation and quality data.'},
  {id:'dcf-valuation',title:'DCF valuation',request:'Build a DCF valuation framework for a named listed company, including WACC, terminal value, and sensitivity analysis without inventing missing inputs.'},
  {id:'portfolio-risk',title:'Portfolio risk',request:'Evaluate a portfolio for concentration, correlation, FX, interest-rate sensitivity, liquidity and recession stress.'},
  {id:'earnings-analysis',title:'Earnings analysis',request:'Prepare an evidence-based pre-earnings analysis using recent quarters, consensus estimates, guidance, options-implied movement and scenarios.'},
  {id:'portfolio-construction',title:'Portfolio construction',request:'Construct a diversified long-term portfolio model with explicit assumptions, costs, drawdown scenarios, rebalancing rules and a benchmark.'},
  {id:'technical-analysis',title:'Technical analysis',request:'Analyze a stock chart using trend, support and resistance, moving averages, RSI, MACD, Bollinger Bands, volume and invalidation levels.'},
  {id:'dividend-analysis',title:'Dividend analysis',request:'Assess dividend sustainability, growth history, payout ratio, cut risk, diversification, reinvestment and relevant tax questions.'},
  {id:'competitive-analysis',title:'Competitive analysis',request:'Compare a listed company with its main competitors using market share, revenue, margins, moat, management capital allocation, R&D and key risks.'},
  {id:'pattern-research',title:'Pattern research',request:'Research possible seasonality, day-of-week effects, insider activity, institutional changes, short interest, options activity and earnings patterns with statistical robustness.'},
  {id:'macro-scenarios',title:'Macro scenarios',request:'Assess how rates, inflation, GDP, currency, employment, central-bank policy, geopolitics and supply chains could affect a diversified portfolio under multiple scenarios.'}
];

export const BROWSER_AGENT_CASES=[
  {id:'read-only-monitor',title:'Read-only monitoring',request:'Monitor public competitor pricing pages daily and return structured changes without modifying any site.'},
  {id:'authenticated-extract',title:'Authenticated extraction',request:'Log into an approved supplier portal and extract the latest account statements without exposing credentials to the model.'},
  {id:'consequential-form',title:'Consequential form',request:'Use a browser agent to fill and submit an approved web form only after the user confirms the final values.'},
  {id:'persistent-profile',title:'Persistent profile',request:'Reuse an authenticated browser profile for a recurring workflow, with explicit domain restrictions and an audit trail.'},
  {id:'recovery-handoff',title:'Recovery and handoff',request:'Run a multi-step browser workflow with bounded retries and hand off to a human if identity, consent, payment, or blocked access requires intervention.'},
  {id:'cost-aware-research',title:'Cost-aware web research',request:'Research ten public sources using fetch/search when possible and a full browser only when interactive state is required, within a fixed runtime budget.'}
];

const CHECKS={
  'dated-sources': text=>/dated|source|date|verifiable/i.test(text),
  'no-invention': text=>/do not invent|missing values|missing inputs/i.test(text),
  'facts-vs-assumptions': text=>/facts|observed|consensus|assumptions/i.test(text),
  'uncertainty': text=>/uncertainty|conditional|hypotheses|not prove|not guarantee/i.test(text),
  'statistical-robustness': text=>/sample size|out-of-sample|robustness|alternative explanations/i.test(text),
  'portfolio-context': text=>/risk tolerance|horizon|country|tax regime|holdings|weights|capital/i.test(text),
  'credential-boundary': text=>/credentials|otp|secrets.*outside|execution boundary/i.test(text),
  'domain-authority': text=>/target domains|domain|authority|approval boundary/i.test(text),
  'read-vs-act': text=>/read-only|fetch|search|full interactive browser/i.test(text),
  'observability': text=>/audit|trace|timestamps|replay|diagnose/i.test(text),
  'post-action-verification': text=>/final page|dom|structured state|click success/i.test(text),
  'recovery-handoff': text=>/retry|recovery|rollback|human handoff/i.test(text),
  'cost-budget': text=>/cost|time budget|retries cannot grow/i.test(text),
  'persistence-mode': text=>/stateless|persistent authenticated profile|persistence/i.test(text)
};

function planText(plan){
  return [
    plan.goal,
    ...(plan.constraints||[]),
    ...(plan.assumptions||[]),
    ...(plan.unknowns||[]),
    ...(plan.definitionOfDone||[]),
    ...(plan.steps||[]),
    ...(plan.verification||[])
  ].join(' ');
}

function runCases(cases, required){
  return cases.map(testCase=>{
    const plan=buildBrainCorePlan(testCase.request);
    const text=planText(plan);
    const checks=Object.fromEntries(required.map(name=>[name,Boolean(CHECKS[name]?.(text))]));
    return {
      ...testCase,
      domains:plan.domainPacks||[],
      checks,
      pass:Object.values(checks).every(Boolean)
    };
  });
}

export function runFinanceDomainBenchmark(){
  return runCases(FINANCE_DOMAIN_CASES,[
    'dated-sources','no-invention','facts-vs-assumptions','uncertainty'
  ]);
}

export function runBrowserAgentBenchmark(){
  return runCases(BROWSER_AGENT_CASES,[
    'credential-boundary','domain-authority','read-vs-act','observability',
    'post-action-verification','recovery-handoff','cost-budget','persistence-mode'
  ]);
}

export const DOMAIN_BENCHMARK_VERSION='wolf-domain-benchmarks/1.0';
