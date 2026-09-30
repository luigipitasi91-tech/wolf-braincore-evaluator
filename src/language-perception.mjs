const clean=v=>String(v||'').replace(/\s+/g,' ').trim();

const WORDS={
  it:['il','lo','la','i','gli','le','un','una','di','del','della','che','per','con','senza','trovami','cerca','mercato','azioni','azionario','voglio','come','quale','rischio','orizzonte','portafoglio'],
  en:['the','a','an','of','to','and','for','with','without','find','search','market','stock','stocks','want','how','which','risk','portfolio'],
  es:['el','la','los','las','un','una','de','del','que','para','con','sin','busca','buscar','mercado','acciones','quiero','como','cuál','riesgo','cartera'],
  fr:['le','la','les','un','une','de','du','des','que','pour','avec','sans','trouve','chercher','marché','actions','veux','comment','quel','risque','portefeuille'],
  de:['der','die','das','ein','eine','von','für','mit','ohne','finde','suche','markt','aktien','möchte','wie','welcher','risiko','portfolio'],
  pt:['o','a','os','as','um','uma','de','do','da','que','para','com','sem','encontre','buscar','mercado','ações','quero','como','qual','risco','carteira']
};

const CATALOG={
  en:{
    code:'en',name:'English',
    baseline:'Baseline',candidate:'BrainCore candidate',
    assumptionsBaseline:'The request is sufficiently specified to start implementation.',
    doneBaseline:'Produce a working result that appears to satisfy the request.',
    stepsBaseline:['Interpret the request.','Build the requested result.','Return the result.'],
    verifyBaseline:'Check that the output was produced.',
    preserve:'Preserve every explicit constraint stated by the user.',
    assumptionLiteral:'The literal request is the source of intent; missing details are not permission to invent consequential choices.',
    askAutonomy:'Which external accounts/actions are already authorized for autonomous use?',
    askRevenue:'Which revenue channel will provide independent evidence of a real payout or verified sale?',
    askBudget:'What financial ceiling or risk budget applies?',
    askSideEffects:'Which side effects may execute automatically, and which require a human approval gate?',
    askClarify:'What concrete artifact or outcome is actually wanted, and what observable result would make it useful?',
    askObservable:'What single observable outcome would prove the request is complete?',
    conflictPrefix:'Request conflict to resolve: ',
    done:[
      'The requested core outcome works end to end.',
      'All explicit constraints from the request are retained in the plan.',
      'Unknown consequential details remain UNKNOWN or require human input rather than being fabricated.',
      'Completion is backed by observable evidence rather than by a completion claim alone.'
    ],
    revenueDone:'Any claimed earnings are backed by a verified sale/payout event; projections and simulations remain labelled as such.',
    steps:[
      'Extract intent, explicit constraints, and consequential actions.',
      'Separate known facts, assumptions, and unresolved unknowns.',
      'Define the smallest end-to-end outcome that proves the core request.',
      'Plan only actions inside the current authority and budget boundary.',
      'Execute the smallest safe slice and collect evidence.',
      'Verify the observed outcome against the definition of done before declaring success.'
    ],
    verification:[
      'Compare observed output with every definition-of-done item.',
      'Fail closed on missing evidence for consequential actions.',
      'Record a final state: VERIFIED_SUCCESS, PROVISIONAL/UNKNOWN, or FAILED.'
    ],
    revenueVerify:'Reconcile claimed revenue with an independently recorded sale/payout event.',
    ui:{
      new:'← New',benchmark:'Benchmark',planning:'Planning comparison',sameIntent:'Same intent. Same rubric.',
      baselineControl:'Baseline is the control. BrainCore is the candidate.',goal:'Goal',constraints:'Constraints',assumptions:'Assumptions',
      unknowns:'Unknowns',definition:'Definition of done',plan:'Plan',verification:'Verification',none:'None captured.',
      wolfScore:'WOLF score',rubric:'WOLF evidence rubric',identical:'0–100 · identical rules',finality:'Finality',promotion:'Promotion decision',
      promotionNote:'Score, delta, and critical-gap gates.',integrity:'Request integrity',specificity:'specificity',
      clears:'Candidate clears the gate',hold:'Improvement exists, evidence is not enough',reject:'Candidate does not clear the gate',
      live:'Live research',evidence:'Research evidence',results:'results',unavailable:'unavailable',
      liveUnavailable:'Live research is unavailable right now. WOLF does not fabricate results; only the request audit is shown below.',
      broadResearch:'The request is broad. WOLF will not choose automatically without the missing criteria; here is a live research starter.',
      liveOk:'Live results retrieved by Na0mi V12. They are provisional evidence; open the sources before treating a conclusion as verified.',
      noResults:'No live results found.',empty:'Write a request first.',marketLens:'Market Lens',readOnly:'READ ONLY',sources:'Live sources',audit:'WOLF audit',openAudit:'Open technical audit',sourceFidelity:'Source titles and excerpts remain in their original language.',metrics:{ambiguityResolution:'Ambiguity resolved',assumptionExposure:'Assumptions exposed',constraintRetention:'Constraints retained',definitionOfDone:'Definition of done',verificationReadiness:'Verification readiness'},statuses:{CLEAR:'CLEAR',NEEDS_CLARIFICATION:'NEEDS CLARIFICATION',CONFLICTING:'CONFLICTING',ADVERSARIAL:'ADVERSARIAL'}
    }
  },
  it:{
    code:'it',name:'Italiano',
    baseline:'Riferimento',candidate:'Candidato BrainCore',
    assumptionsBaseline:'La richiesta è sufficientemente specifica per iniziare.',
    doneBaseline:'Produrre un risultato funzionante che sembri soddisfare la richiesta.',
    stepsBaseline:['Interpreta la richiesta.','Costruisci il risultato richiesto.','Restituisci il risultato.'],
    verifyBaseline:'Controlla che il risultato sia stato prodotto.',
    preserve:'Mantieni ogni vincolo esplicito indicato dall’utente.',
    assumptionLiteral:'La richiesta letterale è la fonte dell’intento; i dettagli mancanti non autorizzano a inventare scelte rilevanti.',
    askAutonomy:'Quali account o azioni esterne sono già autorizzati per l’uso autonomo?',
    askRevenue:'Quale canale di ricavo può fornire una prova indipendente di un pagamento reale o di una vendita verificata?',
    askBudget:'Quale limite finanziario o budget di rischio si applica?',
    askSideEffects:'Quali effetti esterni possono essere eseguiti automaticamente e quali richiedono l’approvazione umana?',
    askClarify:'Quale risultato concreto vuoi ottenere e quale esito osservabile lo renderebbe utile?',
    askObservable:'Quale singolo esito osservabile dimostrerebbe che la richiesta è completata?',
    conflictPrefix:'Conflitto nella richiesta da risolvere: ',
    done:[
      'Il risultato principale richiesto funziona dall’inizio alla fine.',
      'Tutti i vincoli espliciti della richiesta sono mantenuti nel piano.',
      'I dettagli rilevanti non conosciuti restano SCONOSCIUTI o richiedono input umano invece di essere inventati.',
      'Il completamento è sostenuto da evidenza osservabile, non solo da una dichiarazione di successo.'
    ],
    revenueDone:'Ogni guadagno dichiarato è sostenuto da una vendita o un pagamento verificato; proiezioni e simulazioni restano etichettate come tali.',
    steps:[
      'Estrai intento, vincoli espliciti e azioni rilevanti.',
      'Separa fatti conosciuti, assunzioni e aspetti ancora da chiarire.',
      'Definisci il risultato minimo end-to-end che dimostra la richiesta principale.',
      'Pianifica solo azioni entro i limiti attuali di autorità e budget.',
      'Esegui il più piccolo passo sicuro e raccogli evidenze.',
      'Verifica il risultato osservato rispetto alla definizione di completamento prima di dichiarare successo.'
    ],
    verification:[
      'Confronta il risultato osservato con ogni criterio di completamento.',
      'Blocca il flusso se manca evidenza per azioni rilevanti.',
      'Registra uno stato finale: SUCCESSO_VERIFICATO, PROVVISORIO/SCONOSCIUTO oppure FALLITO.'
    ],
    revenueVerify:'Riconcilia ogni ricavo dichiarato con una vendita o un pagamento registrato indipendentemente.',
    ui:{
      new:'← Nuova',benchmark:'Benchmark',planning:'Confronto di pianificazione',sameIntent:'Stesso intento. Stessa metrica.',
      baselineControl:'Il riferimento è il controllo. BrainCore è il candidato.',goal:'Obiettivo',constraints:'Vincoli',assumptions:'Assunzioni',
      unknowns:'Da chiarire',definition:'Definizione di completamento',plan:'Piano',verification:'Verifica',none:'Nessun elemento rilevato.',
      wolfScore:'Punteggio WOLF',rubric:'Metrica di evidenza WOLF',identical:'0–100 · regole identiche',finality:'Finalità',promotion:'Decisione di promozione',
      promotionNote:'Punteggio, delta e blocchi critici.',integrity:'Integrità della richiesta',specificity:'specificità',
      clears:'Il candidato supera il gate',hold:'C’è un miglioramento, ma l’evidenza non è sufficiente',reject:'Il candidato non supera il gate',
      live:'Ricerca live',evidence:'Evidenza trovata',results:'risultati',unavailable:'non disponibile',
      liveUnavailable:'La ricerca live non è disponibile in questo momento. WOLF non inventa risultati: sotto trovi solo l’audit della richiesta.',
      broadResearch:'La richiesta è ampia. WOLF non sceglie automaticamente senza i criteri mancanti; intanto mostra una ricerca live iniziale.',
      liveOk:'Risultati live recuperati da Na0mi V12. Sono evidenza provvisoria: apri le fonti prima di trattare una conclusione come verificata.',
      noResults:'Nessun risultato live trovato.',empty:'Scrivi prima una richiesta.',marketLens:'Market Lens',readOnly:'SOLA LETTURA',sources:'Fonti live',audit:'Audit WOLF',openAudit:'Apri audit tecnico',sourceFidelity:'Titoli ed estratti delle fonti restano nella lingua originale.',metrics:{ambiguityResolution:'Ambiguità risolta',assumptionExposure:'Assunzioni esplicitate',constraintRetention:'Vincoli mantenuti',definitionOfDone:'Definizione di completamento',verificationReadiness:'Prontezza alla verifica'},statuses:{CLEAR:'CHIARA',NEEDS_CLARIFICATION:'RICHIEDE CHIARIMENTO',CONFLICTING:'CONTRADDITTORIA',ADVERSARIAL:'AVVERSARIALE'}
    }
  }
};

const SUPPORTED=new Set(Object.keys(CATALOG));

function tokenize(text){return clean(text).toLowerCase().normalize('NFKC').match(/[\p{L}À-ÿ]+/gu)||[]}

function latinScore(tokens,list){
  const set=new Set(list);
  return tokens.reduce((n,w)=>n+(set.has(w)?1:0),0);
}

export function detectLanguage(raw,{browserLanguages=[]}={}){
  const text=clean(raw);
  if(!text)return {detected:'en',responseLocale:'en',confidence:0,source:'fallback',catalogSupported:true};

  if(/[\u3040-\u30ff]/u.test(text))return {detected:'ja',responseLocale:'en',confidence:.99,source:'script',catalogSupported:false};
  if(/[\uac00-\ud7af]/u.test(text))return {detected:'ko',responseLocale:'en',confidence:.99,source:'script',catalogSupported:false};
  if(/[\u4e00-\u9fff]/u.test(text))return {detected:'zh',responseLocale:'en',confidence:.98,source:'script',catalogSupported:false};
  if(/[\u0400-\u04ff]/u.test(text))return {detected:'ru',responseLocale:'en',confidence:.98,source:'script',catalogSupported:false};

  const tokens=tokenize(text);
  const scores=Object.fromEntries(Object.entries(WORDS).map(([lang,list])=>[lang,latinScore(tokens,list)]));
  const ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const [best,bestScore]=ranked[0];
  const second=ranked[1]?.[1]||0;

  if(bestScore>0){
    const confidence=Math.min(.98,.55+(bestScore-second)*.12+Math.min(bestScore,4)*.06);
    return {detected:best,responseLocale:SUPPORTED.has(best)?best:'en',confidence,source:'text',catalogSupported:SUPPORTED.has(best),scores};
  }

  const browser=browserLanguages.map(x=>String(x).toLowerCase().split('-')[0]).find(x=>SUPPORTED.has(x));
  if(browser)return {detected:browser,responseLocale:browser,confidence:.35,source:'browser',catalogSupported:true,scores};

  return {detected:'en',responseLocale:'en',confidence:.25,source:'fallback',catalogSupported:true,scores};
}

export function catalogFor(locale='en'){return CATALOG[SUPPORTED.has(locale)?locale:'en']}

export function localizePlan(plan,locale='en'){
  const c=catalogFor(locale);
  if(locale!=='it')return {...plan};
  const map=new Map([
    ['Baseline',c.baseline],
    ['BrainCore candidate',c.candidate],
    ['The request is sufficiently specified to start implementation.',c.assumptionsBaseline],
    ['Produce a working result that appears to satisfy the request.',c.doneBaseline],
    ['Interpret the request.',c.stepsBaseline[0]],
    ['Build the requested result.',c.stepsBaseline[1]],
    ['Return the result.',c.stepsBaseline[2]],
    ['Check that the output was produced.',c.verifyBaseline],
    ['Preserve every explicit constraint stated by the user.',c.preserve],
    ['The literal request is the source of intent; missing details are not permission to invent consequential choices.',c.assumptionLiteral],
    ['Which external accounts/actions are already authorized for autonomous use?',c.askAutonomy],
    ['Which revenue channel will provide independent evidence of a real payout or verified sale?',c.askRevenue],
    ['What financial ceiling or risk budget applies?',c.askBudget],
    ['Which side effects may execute automatically, and which require a human approval gate?',c.askSideEffects],
    ['What concrete artifact or outcome is actually wanted, and what observable result would make it useful?',c.askClarify],
    ['What single observable outcome would prove the request is complete?',c.askObservable],
    ['The requested core outcome works end to end.',c.done[0]],
    ['All explicit constraints from the request are retained in the plan.',c.done[1]],
    ['Unknown consequential details remain UNKNOWN or require human input rather than being fabricated.',c.done[2]],
    ['Completion is backed by observable evidence rather than by a completion claim alone.',c.done[3]],
    ['Any claimed earnings are backed by a verified sale/payout event; projections and simulations remain labelled as such.',c.revenueDone],
    ['Extract intent, explicit constraints, and consequential actions.',c.steps[0]],
    ['Separate known facts, assumptions, and unresolved unknowns.',c.steps[1]],
    ['Define the smallest end-to-end outcome that proves the core request.',c.steps[2]],
    ['Plan only actions inside the current authority and budget boundary.',c.steps[3]],
    ['Execute the smallest safe slice and collect evidence.',c.steps[4]],
    ['Verify the observed outcome against the definition of done before declaring success.',c.steps[5]],
    ['Compare observed output with every definition-of-done item.',c.verification[0]],
    ['Fail closed on missing evidence for consequential actions.',c.verification[1]],
    ['Record a final state: VERIFIED_SUCCESS, PROVISIONAL/UNKNOWN, or FAILED.',c.verification[2]],
    ['Reconcile claimed revenue with an independently recorded sale/payout event.',c.revenueVerify],
    ['Use dated, verifiable sources for market, fundamental, macro, and company data; do not invent missing values.','Usa fonti verificabili e datate per dati di mercato, fondamentali, macro e aziendali; non inventare valori mancanti.'],
    ['Separate observed facts, external consensus/estimates, and model assumptions; label uncertainty explicitly.','Separa fatti osservati, consenso o stime esterne e assunzioni del modello; indica esplicitamente l’incertezza.'],
    ['Historical performance, correlations, chart patterns, and backtests do not prove a future edge or guarantee returns.','Performance storiche, correlazioni, pattern grafici e backtest non dimostrano un vantaggio futuro né garantiscono rendimenti.'],
    ['Check every quoted market/fundamental value against a source and date before treating it as evidence.','Verifica ogni dato di mercato o fondamentale rispetto a una fonte e a una data prima di trattarlo come evidenza.'],
    ['For pattern or backtest claims, report sample size, method, out-of-sample limitations, and conditions that would invalidate the signal.','Per pattern o backtest indica dimensione del campione, metodo, limiti fuori campione e condizioni che invaliderebbero il segnale.'],
    ['Keep scenario outputs conditional; distinguish historical measurements from forward-looking hypotheses.','Mantieni gli scenari condizionali e distingui misure storiche da ipotesi previsionali.'],
    ['Which company/ticker, valuation date, forecast horizon, discount-rate assumptions, and terminal-value method should be used?','Quale società o ticker, data di valutazione, orizzonte previsionale, ipotesi sul tasso di sconto e metodo per il valore terminale devono essere usati?'],
    ['What are the holdings/weights or capital, horizon, risk tolerance, country, and relevant tax regime?','Quali sono posizioni o pesi, capitale, orizzonte, tolleranza al rischio, Paese e regime fiscale rilevante?'],
    ['Do not present an allocation as personally suitable until risk, horizon, jurisdiction, and constraints are known.','Non presentare un’allocazione come personalmente adatta finché rischio, orizzonte, giurisdizione e vincoli non sono noti.'],
    ['Which company/ticker and earnings date are in scope, and which consensus source should be used?','Quale società o ticker e quale data dei risultati sono in esame, e quale fonte di consenso deve essere usata?'],
    ['Treat dividends as variable and potentially reducible or suspendable; do not imply guaranteed income.','Tratta i dividendi come variabili e potenzialmente riducibili o sospendibili; non implicare redditi garantiti.'],
    ['Treat technical signals as conditional indicators, not certainties; include invalidation levels and data period.','Tratta i segnali tecnici come indicatori condizionali, non certezze; includi livelli di invalidazione e periodo dei dati.'],
    ['Do not infer a durable edge from a historical correlation alone; test robustness and alternative explanations.','Non dedurre un vantaggio durevole da una sola correlazione storica; verifica robustezza e spiegazioni alternative.'],
    ['Separate current macro facts, market consensus, and scenario assumptions; do not invent forecasts.','Separa fatti macro correnti, consenso di mercato e assunzioni di scenario; non inventare previsioni.'],
    ['Keep credentials, OTPs, and secrets outside model-visible text; inject them only at the execution boundary.','Mantieni credenziali, OTP e segreti fuori dal testo visibile al modello; inseriscili solo al confine di esecuzione.'],
    ['Restrict web actions to explicit target domains and authority; consequential writes require a clear approval boundary.','Limita le azioni web a domini e autorizzazioni espliciti; le scritture rilevanti richiedono un chiaro confine di approvazione.'],
    ['Prefer read-only fetch/search/extraction before a full interactive browser when the task does not require browser state.','Preferisci ricerca o estrazione in sola lettura prima di un browser interattivo completo quando il task non richiede stato del browser.'],
    ['Define whether the run is stateless or uses a persistent authenticated profile; never assume persistence silently.','Definisci se l’esecuzione è senza stato o usa un profilo autenticato persistente; non presumere mai la persistenza senza dichiararla.'],
    ['Track browser/runtime cost and time budget so retries cannot grow without a bound.','Traccia costo del browser/runtime e budget di tempo, così i tentativi non possono crescere senza limite.'],
    ['Which domains are allowed, and is the task read-only or permitted to create external side effects?','Quali domini sono consentiti e il task è in sola lettura oppure può produrre effetti esterni?'],
    ['Is an authenticated persistent profile required, and what human handoff is required for identity, consent, payment, or blocked access?','Serve un profilo autenticato persistente e quale passaggio umano è richiesto per identità, consenso, pagamento o accesso bloccato?'],
    ['Verify the final page/DOM or returned structured state after each consequential action; click success alone is not completion.','Verifica la pagina o lo stato strutturato finale dopo ogni azione rilevante; un click riuscito da solo non significa completamento.'],
    ['Keep an auditable action trace with timestamps and enough evidence to replay or diagnose the run.','Mantieni una traccia auditabile delle azioni con timestamp ed evidenza sufficiente per riprodurre o diagnosticare l’esecuzione.'],
    ['Define retry limits, recovery/rollback behavior, and a human handoff when the browser cannot safely complete the task.','Definisci limiti di tentativo, recovery o rollback e un passaggio umano quando il browser non può completare il task in sicurezza.']
  ]);
  const arr=x=>(Array.isArray(x)?x:[]).map(s=>{
    if(map.has(s))return map.get(s);
    if(String(s).startsWith('Request conflict to resolve: '))return c.conflictPrefix+String(s).slice(29);
    return s;
  });
  return {...plan,label:map.get(plan.label)||plan.label,constraints:arr(plan.constraints),assumptions:arr(plan.assumptions),unknowns:arr(plan.unknowns),definitionOfDone:arr(plan.definitionOfDone),steps:arr(plan.steps),verification:arr(plan.verification)};
}

export function localizeFinality(finality,locale='en'){
  if(locale!=='it')return finality;
  return finality==='PROMOTE'?'PROMUOVI':finality==='HOLD'?'ATTENDI':finality==='REJECT'?'RESPINGI':finality;
}

export function localizeMetricLabel(key,locale='en'){
  return catalogFor(locale).ui.metrics?.[key]||key;
}

export function localizeIntegrityStatus(status,locale='en'){
  return catalogFor(locale).ui.statuses?.[status]||status;
}

export function perception(raw,options={}){
  const language=detectLanguage(raw,options);
  return {...language,catalog:catalogFor(language.responseLocale)};
}

export const LANGUAGE_PERCEPTION_VERSION='wolf-language-perception/1.0';
