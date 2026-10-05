const clean=v=>String(v||'').replace(/\s+/g,' ').trim();

export const LEARNING_SKILLS=[
  {
    id:'fast-track',
    icon:'⚡',
    titles:{en:'Fast Track Coach',it:'Coach Accelerato',es:'Coach Acelerado',fr:'Coach Accéléré',de:'Schnelllern-Coach',pt:'Coach Acelerado'},
    summaries:{
      en:'Find the smallest useful path to practical competence.',
      it:'Trova il percorso minimo utile verso una competenza pratica.',
      es:'Encuentra la ruta mínima útil hacia una competencia práctica.',
      fr:'Trouve le chemin minimal utile vers une compétence pratique.',
      de:'Finde den kürzesten sinnvollen Weg zu praktischer Kompetenz.',
      pt:'Encontre o caminho mínimo útil até uma competência prática.'
    }
  },
  {
    id:'error-simulator',
    icon:'🧪',
    titles:{en:'Real Error Simulator',it:'Simulatore di Errori Reali',es:'Simulador de Errores Reales',fr:'Simulateur d’Erreurs Réelles',de:'Realistische Fehlersimulation',pt:'Simulador de Erros Reais'},
    summaries:{
      en:'Learn by confronting realistic mistakes before seeing the answer.',
      it:'Impara affrontando errori realistici prima di vedere la risposta.',
      es:'Aprende enfrentando errores realistas antes de ver la respuesta.',
      fr:'Apprends en affrontant des erreurs réalistes avant de voir la réponse.',
      de:'Lerne durch realistische Fehler, bevor du die Lösung siehst.',
      pt:'Aprenda enfrentando erros realistas antes de ver a resposta.'
    }
  },
  {
    id:'core-idea',
    icon:'🧭',
    titles:{en:'Core Idea Translator',it:'Traduttore dell’Idea Centrale',es:'Traductor de la Idea Central',fr:'Traducteur de l’Idée Centrale',de:'Kernideen-Übersetzer',pt:'Tradutor da Ideia Central'},
    summaries:{
      en:'Reduce complexity to one central idea, then test understanding.',
      it:'Riduci la complessità a un’idea centrale e poi verifica la comprensione.',
      es:'Reduce la complejidad a una idea central y luego verifica la comprensión.',
      fr:'Réduis la complexité à une idée centrale puis vérifie la compréhension.',
      de:'Reduziere Komplexität auf eine Kernidee und prüfe dann das Verständnis.',
      pt:'Reduza a complexidade a uma ideia central e depois verifique a compreensão.'
    }
  },
  {
    id:'learning-architect',
    icon:'🗺️',
    titles:{en:'Learning Path Architect',it:'Architetto del Percorso',es:'Arquitecto del Aprendizaje',fr:'Architecte du Parcours',de:'Lernpfad-Architekt',pt:'Arquiteto do Percurso'},
    summaries:{
      en:'Build a short path around a concrete goal, deadline and current level.',
      it:'Costruisci un percorso breve attorno a obiettivo, scadenza e livello attuale.',
      es:'Crea una ruta breve alrededor de objetivo, plazo y nivel actual.',
      fr:'Construis un parcours court autour d’un objectif, d’une échéance et du niveau actuel.',
      de:'Baue einen kurzen Lernpfad um Ziel, Frist und aktuelles Niveau.',
      pt:'Crie um percurso curto em torno de objetivo, prazo e nível atual.'
    }
  },
  {
    id:'gap-detector',
    icon:'🔎',
    titles:{en:'Hidden Gap Detector',it:'Rivelatore di Lacune',es:'Detector de Lagunas',fr:'Détecteur de Lacunes',de:'Lücken-Detektor',pt:'Detector de Lacunas'},
    summaries:{
      en:'Probe what looks mastered and expose weak foundations.',
      it:'Metti alla prova ciò che sembra acquisito e scopri le basi fragili.',
      es:'Pon a prueba lo que parece dominado y descubre bases débiles.',
      fr:'Teste ce qui semble acquis et révèle les bases fragiles.',
      de:'Prüfe scheinbar Beherrschtes und decke schwache Grundlagen auf.',
      pt:'Teste o que parece dominado e revele fundamentos frágeis.'
    }
  },
  {
    id:'teach-back',
    icon:'🗣️',
    titles:{en:'Teach-Back Checker',it:'Verifica Feynman',es:'Verificador de Explicación',fr:'Vérificateur d’Explication',de:'Teach-Back-Prüfer',pt:'Verificador de Explicação'},
    summaries:{
      en:'Explain it simply; WOLF flags jargon, gaps and false simplifications.',
      it:'Spiegalo in modo semplice; WOLF segnala gergo, salti e semplificazioni errate.',
      es:'Explícalo de forma simple; WOLF señala jerga, saltos y simplificaciones erróneas.',
      fr:'Explique-le simplement ; WOLF signale jargon, sauts et simplifications fausses.',
      de:'Erkläre es einfach; WOLF markiert Jargon, Lücken und falsche Vereinfachungen.',
      pt:'Explique de forma simples; WOLF sinaliza jargão, lacunas e simplificações erradas.'
    }
  }
];

export const LEARNING_LOCALES=[
  {code:'en',label:'English'},
  {code:'it',label:'Italiano'},
  {code:'es',label:'Español'},
  {code:'fr',label:'Français'},
  {code:'de',label:'Deutsch'},
  {code:'pt',label:'Português'}
];

const COPY={
  en:{
    topic:'Topic or skill',goal:'Concrete outcome',time:'Time / deadline',level:'What I already know',
    rules:{
      'fast-track':[
        'Prioritize the smallest set of concepts and actions that unlock practical use.',
        'Do not give a generic syllabus or theory that has no immediate use.',
        'Give one practical task at a time and wait for my response before continuing.',
        'For each step, state a clear success criterion and what I can ignore for now.',
        'Do not claim mastery from one success; verify with a fresh example.'
      ],
      'error-simulator':[
        'Put me in a realistic situation where a common mistake is plausible.',
        'Wait for my attempt before giving feedback.',
        'If I am wrong, do not reveal the full answer immediately; ask a targeted question that exposes the broken reasoning.',
        'Allow at least two genuine attempts before revealing a complete solution.',
        'After I succeed, change the scenario and test transfer.'
      ],
      'core-idea':[
        'Identify the single idea that makes the rest easier to understand.',
        'Explain that idea first with plain language and one concrete analogy.',
        'Map the analogy back to the real concept so it does not become misleading.',
        'Ask three understanding questions one at a time and wait for each answer.',
        'Do not move on while a core misconception remains.'
      ],
      'learning-architect':[
        'Build the path around my concrete outcome, deadline and current level.',
        'Use short steps with one primary task per session.',
        'For every step, state the success criterion and one low-value activity to avoid.',
        'Include retrieval or applied practice, not only reading.',
        'If progress evidence does not support the goal, revise the path instead of adding more content.'
      ],
      'gap-detector':[
        'Ask five deceptively simple diagnostic questions, one at a time.',
        'Require reasoning, not yes/no answers.',
        'After each answer, identify what evidence supports or weakens the claim of mastery.',
        'Do not give leading clues that reveal the answer too early.',
        'End with the smallest set of foundations that need repair.'
      ],
      'teach-back':[
        'Let me explain the topic in simple language before you teach it.',
        'Flag undefined technical terms, skipped reasoning steps and simplifications that make the explanation false.',
        'Use short clarification questions instead of replacing my explanation with yours.',
        'Ask me to repair the explanation after each important gap.',
        'End with a concise diagnosis of what is solid, what is uncertain and what needs another teach-back.'
      ]
    }
  },
  it:{
    topic:'Argomento o abilità',goal:'Risultato concreto',time:'Tempo / scadenza',level:'Cosa so già',
    rules:{
      'fast-track':[
        'Dai priorità al minimo insieme di concetti e azioni che rende possibile un uso pratico.',
        'Evita programmi generici e teoria senza utilità immediata.',
        'Assegna un solo compito pratico alla volta e aspetta la mia risposta prima di continuare.',
        'Per ogni passo indica un criterio chiaro di riuscita e cosa posso ignorare per ora.',
        'Non dichiarare padronanza dopo un solo successo; verifica con un esempio nuovo.'
      ],
      'error-simulator':[
        'Mettimi in una situazione realistica in cui un errore comune sia plausibile.',
        'Aspetta il mio tentativo prima di dare feedback.',
        'Se sbaglio, non rivelare subito la soluzione completa; fai una domanda mirata che faccia emergere dove si rompe il ragionamento.',
        'Lasciami almeno due tentativi reali prima di mostrare una soluzione completa.',
        'Dopo un successo cambia scenario e verifica il trasferimento.'
      ],
      'core-idea':[
        'Individua l’unica idea che rende più facile capire tutto il resto.',
        'Spiega prima quell’idea con linguaggio semplice e una sola analogia concreta.',
        'Ricollega l’analogia al concetto reale per evitare semplificazioni fuorvianti.',
        'Fammi tre domande di comprensione, una alla volta, aspettando ogni risposta.',
        'Non proseguire finché rimane un errore concettuale centrale.'
      ],
      'learning-architect':[
        'Costruisci il percorso attorno al mio risultato concreto, alla scadenza e al livello attuale.',
        'Usa passi brevi con un solo compito principale per sessione.',
        'Per ogni passo indica un criterio di successo e un’attività a basso valore da evitare.',
        'Inserisci recupero attivo o pratica applicata, non solo lettura.',
        'Se le prove di progresso non portano all’obiettivo, modifica il percorso invece di aggiungere contenuti.'
      ],
      'gap-detector':[
        'Fammi cinque domande diagnostiche apparentemente semplici, una alla volta.',
        'Richiedi il ragionamento, non risposte sì/no.',
        'Dopo ogni risposta indica quali elementi sostengono o indeboliscono l’idea che io abbia davvero capito.',
        'Non usare suggerimenti che rivelano troppo presto la risposta.',
        'Concludi con il minimo insieme di fondamenta da rinforzare.'
      ],
      'teach-back':[
        'Lasciami spiegare l’argomento con parole semplici prima che tu lo insegni.',
        'Segnala termini tecnici non definiti, salti logici e semplificazioni che rendono la spiegazione falsa.',
        'Usa domande brevi di chiarimento invece di sostituire la mia spiegazione con la tua.',
        'Chiedimi di correggere la spiegazione dopo ogni lacuna importante.',
        'Concludi con una diagnosi breve di ciò che è solido, incerto e da rispiegare.'
      ]
    }
  },
  es:{
    topic:'Tema o habilidad',goal:'Resultado concreto',time:'Tiempo / plazo',level:'Lo que ya sé',
    rules:{
      'fast-track':['Prioriza el mínimo conjunto de conceptos y acciones que permita un uso práctico.','Evita planes genéricos y teoría sin utilidad inmediata.','Da una sola tarea práctica cada vez y espera mi respuesta antes de continuar.','Para cada paso indica un criterio claro de éxito y qué puedo ignorar por ahora.','No declares dominio tras un solo acierto; verifica con un ejemplo nuevo.'],
      'error-simulator':['Ponme en una situación realista donde un error común sea plausible.','Espera mi intento antes de dar feedback.','Si fallo, no reveles enseguida la solución completa; haz una pregunta dirigida que exponga dónde se rompe el razonamiento.','Permite al menos dos intentos reales antes de mostrar una solución completa.','Tras un acierto cambia el escenario y comprueba la transferencia.'],
      'core-idea':['Identifica la única idea que hace más fácil entender lo demás.','Explica primero esa idea con lenguaje sencillo y una analogía concreta.','Vuelve a conectar la analogía con el concepto real para evitar una simplificación engañosa.','Haz tres preguntas de comprensión, una cada vez, y espera cada respuesta.','No avances mientras quede una confusión central.'],
      'learning-architect':['Construye el recorrido alrededor de mi resultado concreto, plazo y nivel actual.','Usa pasos cortos con una tarea principal por sesión.','Para cada paso indica un criterio de éxito y una actividad de poco valor que conviene evitar.','Incluye recuperación activa o práctica aplicada, no solo lectura.','Si la evidencia de progreso no acerca al objetivo, revisa el recorrido en lugar de añadir contenido.'],
      'gap-detector':['Haz cinco preguntas diagnósticas aparentemente simples, una cada vez.','Exige razonamiento, no respuestas sí/no.','Tras cada respuesta indica qué evidencia apoya o debilita la idea de dominio.','No des pistas que revelen demasiado pronto la respuesta.','Termina con el mínimo conjunto de fundamentos que deben reforzarse.'],
      'teach-back':['Déjame explicar el tema con palabras sencillas antes de enseñarlo.','Señala términos técnicos sin definir, saltos de razonamiento y simplificaciones falsas.','Usa preguntas breves de aclaración en vez de reemplazar mi explicación.','Pídeme reparar la explicación después de cada laguna importante.','Termina con un diagnóstico breve de lo sólido, lo incierto y lo que necesita otra explicación.']
    }
  },
  fr:{
    topic:'Sujet ou compétence',goal:'Résultat concret',time:'Temps / échéance',level:'Ce que je sais déjà',
    rules:{
      'fast-track':['Priorise le plus petit ensemble de concepts et d’actions qui permet un usage pratique.','Évite les programmes génériques et la théorie sans utilité immédiate.','Donne une seule tâche pratique à la fois et attends ma réponse avant de continuer.','Pour chaque étape, indique un critère de réussite clair et ce que je peux ignorer pour l’instant.','Ne déclare pas la maîtrise après une seule réussite ; vérifie avec un nouvel exemple.'],
      'error-simulator':['Place-moi dans une situation réaliste où une erreur courante est plausible.','Attends ma tentative avant de donner du feedback.','Si je me trompe, ne révèle pas immédiatement toute la solution ; pose une question ciblée qui montre où le raisonnement casse.','Laisse-moi au moins deux vraies tentatives avant de montrer une solution complète.','Après une réussite, change le scénario et teste le transfert.'],
      'core-idea':['Identifie l’idée unique qui rend le reste plus facile à comprendre.','Explique d’abord cette idée en langage simple avec une analogie concrète.','Relie ensuite l’analogie au vrai concept pour éviter une simplification trompeuse.','Pose trois questions de compréhension, une à la fois, et attends chaque réponse.','N’avance pas tant qu’une confusion centrale subsiste.'],
      'learning-architect':['Construis le parcours autour de mon résultat concret, de l’échéance et de mon niveau actuel.','Utilise des étapes courtes avec une tâche principale par session.','Pour chaque étape, indique un critère de réussite et une activité à faible valeur à éviter.','Inclue du rappel actif ou de la pratique appliquée, pas seulement de la lecture.','Si les preuves de progrès ne mènent pas à l’objectif, révise le parcours au lieu d’ajouter du contenu.'],
      'gap-detector':['Pose cinq questions diagnostiques apparemment simples, une à la fois.','Exige un raisonnement, pas des réponses oui/non.','Après chaque réponse, indique quelles preuves renforcent ou affaiblissent l’idée de maîtrise.','N’utilise pas d’indices qui donnent la réponse trop tôt.','Termine par le minimum de bases à renforcer.'],
      'teach-back':['Laisse-moi expliquer le sujet avec des mots simples avant de l’enseigner.','Signale les termes techniques non définis, les sauts de raisonnement et les simplifications fausses.','Utilise de courtes questions de clarification au lieu de remplacer mon explication.','Demande-moi de réparer l’explication après chaque lacune importante.','Termine par un diagnostic bref de ce qui est solide, incertain et à réexpliquer.']
    }
  },
  de:{
    topic:'Thema oder Fähigkeit',goal:'Konkretes Ergebnis',time:'Zeit / Frist',level:'Was ich schon weiß',
    rules:{
      'fast-track':['Priorisiere die kleinste Menge an Konzepten und Handlungen, die praktische Anwendung ermöglicht.','Vermeide allgemeine Lehrpläne und Theorie ohne unmittelbaren Nutzen.','Gib jeweils nur eine praktische Aufgabe und warte auf meine Antwort.','Nenne für jeden Schritt ein klares Erfolgskriterium und was ich vorerst ignorieren kann.','Behaupte Beherrschung nicht nach einem einzigen Erfolg; prüfe mit einem neuen Beispiel.'],
      'error-simulator':['Versetze mich in eine realistische Situation, in der ein typischer Fehler plausibel ist.','Warte auf meinen Versuch, bevor du Feedback gibst.','Wenn ich falsch liege, zeige nicht sofort die komplette Lösung; stelle eine gezielte Frage, die den Denkfehler sichtbar macht.','Lass mindestens zwei echte Versuche zu, bevor du eine vollständige Lösung zeigst.','Wechsle nach einem Erfolg das Szenario und prüfe den Transfer.'],
      'core-idea':['Bestimme die eine Kernidee, die den Rest leichter verständlich macht.','Erkläre diese Idee zuerst in einfacher Sprache mit einer konkreten Analogie.','Ordne die Analogie anschließend dem echten Konzept zu, damit sie nicht irreführt.','Stelle drei Verständnisfragen nacheinander und warte jeweils auf die Antwort.','Gehe nicht weiter, solange ein zentrales Missverständnis besteht.'],
      'learning-architect':['Baue den Lernpfad um mein konkretes Ergebnis, die Frist und mein aktuelles Niveau.','Nutze kurze Schritte mit einer Hauptaufgabe pro Sitzung.','Nenne für jeden Schritt ein Erfolgskriterium und eine wenig wertvolle Aktivität, die ich vermeiden soll.','Nutze aktiven Abruf oder angewandte Praxis, nicht nur Lesen.','Wenn Fortschrittsbelege nicht zum Ziel führen, ändere den Pfad statt mehr Inhalt hinzuzufügen.'],
      'gap-detector':['Stelle fünf scheinbar einfache Diagnosefragen nacheinander.','Verlange Begründungen statt Ja/Nein-Antworten.','Zeige nach jeder Antwort, welche Hinweise echte Beherrschung stützen oder schwächen.','Gib keine Hinweise, die die Antwort zu früh verraten.','Beende mit der kleinsten Menge an Grundlagen, die repariert werden müssen.'],
      'teach-back':['Lass mich das Thema zuerst in einfachen Worten erklären.','Markiere undefinierte Fachbegriffe, ausgelassene Denkschritte und falsche Vereinfachungen.','Nutze kurze Rückfragen, statt meine Erklärung durch deine zu ersetzen.','Lass mich die Erklärung nach jeder wichtigen Lücke verbessern.','Beende mit einer kurzen Diagnose: solide, unsicher, erneut erklären.']
    }
  },
  pt:{
    topic:'Tema ou habilidade',goal:'Resultado concreto',time:'Tempo / prazo',level:'O que eu já sei',
    rules:{
      'fast-track':['Priorize o menor conjunto de conceitos e ações que permita uso prático.','Evite programas genéricos e teoria sem utilidade imediata.','Dê uma tarefa prática por vez e espere minha resposta antes de continuar.','Para cada passo, indique um critério claro de sucesso e o que posso ignorar por enquanto.','Não declare domínio após um único acerto; verifique com um novo exemplo.'],
      'error-simulator':['Coloque-me em uma situação realista em que um erro comum seja plausível.','Espere minha tentativa antes de dar feedback.','Se eu errar, não revele imediatamente a solução completa; faça uma pergunta direcionada que exponha onde o raciocínio falha.','Permita pelo menos duas tentativas reais antes de mostrar uma solução completa.','Depois de um acerto, mude o cenário e teste a transferência.'],
      'core-idea':['Identifique a única ideia que torna o restante mais fácil de entender.','Explique primeiro essa ideia em linguagem simples com uma analogia concreta.','Relacione a analogia de volta ao conceito real para evitar simplificação enganosa.','Faça três perguntas de compreensão, uma de cada vez, esperando cada resposta.','Não avance enquanto existir uma confusão central.'],
      'learning-architect':['Construa o percurso em torno do meu resultado concreto, prazo e nível atual.','Use passos curtos com uma tarefa principal por sessão.','Para cada passo, indique um critério de sucesso e uma atividade de baixo valor a evitar.','Inclua recuperação ativa ou prática aplicada, não apenas leitura.','Se as evidências de progresso não levarem ao objetivo, revise o percurso em vez de adicionar conteúdo.'],
      'gap-detector':['Faça cinco perguntas diagnósticas aparentemente simples, uma de cada vez.','Exija raciocínio, não respostas sim/não.','Após cada resposta, indique quais evidências fortalecem ou enfraquecem a ideia de domínio.','Não dê pistas que revelem a resposta cedo demais.','Termine com o menor conjunto de fundamentos que precisam ser reforçados.'],
      'teach-back':['Deixe-me explicar o tema em palavras simples antes de ensiná-lo.','Sinalize termos técnicos não definidos, saltos de raciocínio e simplificações falsas.','Use perguntas curtas de esclarecimento em vez de substituir minha explicação.','Peça para eu corrigir a explicação após cada lacuna importante.','Termine com um diagnóstico curto do que está sólido, incerto e precisa ser explicado novamente.']
    }
  }
};

export function normalizeLearningLocale(locale='en'){
  const code=String(locale||'en').toLowerCase().split('-')[0];
  return COPY[code]?code:'en';
}

export function getLearningSkill(id){
  return LEARNING_SKILLS.find(skill=>skill.id===id)||null;
}

export function learningSkillLabel(id,locale='en'){
  const skill=getLearningSkill(id);
  const lang=normalizeLearningLocale(locale);
  return skill?.titles?.[lang]||skill?.titles?.en||id;
}

export function buildLearningRequest(id,{topic='',goal='',time='',level='',locale='en'}={}){
  const skill=getLearningSkill(id);
  if(!skill)throw new Error('LEARNING_SKILL_NOT_FOUND');
  const lang=normalizeLearningLocale(locale);
  const c=COPY[lang];
  const fields=[
    [c.topic,clean(topic)||'—'],
    [c.goal,clean(goal)||'—'],
    [c.time,clean(time)||'—'],
    [c.level,clean(level)||'—']
  ];
  return [
    `WOLF Learning Skill: ${learningSkillLabel(id,lang)}`,
    ...fields.map(([k,v])=>`${k}: ${v}`),
    '',
    ...c.rules[id].map(rule=>`- ${rule}`)
  ].join('\n');
}

export function learningSkillContract(id,request,{locale='en'}={}){
  const skill=getLearningSkill(id);
  if(!skill)return {domains:[],constraints:[],unknowns:[],definitionOfDone:[],verification:[]};
  const lang=normalizeLearningLocale(locale);
  const rules=COPY[lang].rules[id];
  const verify={
    en:'Verify progress with observable learner performance, not fluent wording alone.',
    it:'Verifica il progresso con una prestazione osservabile dell’utente, non solo con una risposta fluida.',
    es:'Verifica el progreso con desempeño observable del alumno, no solo con una respuesta fluida.',
    fr:'Vérifie le progrès par une performance observable de l’apprenant, pas seulement par un discours fluide.',
    de:'Prüfe Fortschritt anhand beobachtbarer Leistung, nicht nur anhand flüssiger Formulierungen.',
    pt:'Verifique o progresso por desempenho observável do aluno, não apenas por uma resposta fluida.'
  }[lang];
  const unknown={
    en:'What evidence would demonstrate that the learner can transfer this skill to a fresh example?',
    it:'Quale prova dimostrerebbe che l’utente sa trasferire questa abilità a un esempio nuovo?',
    es:'¿Qué evidencia demostraría que el alumno puede transferir esta habilidad a un ejemplo nuevo?',
    fr:'Quelle preuve montrerait que l’apprenant peut transférer cette compétence à un nouvel exemple ?',
    de:'Welche Evidenz würde zeigen, dass der Lernende die Fähigkeit auf ein neues Beispiel übertragen kann?',
    pt:'Que evidência mostraria que o aluno consegue transferir esta habilidade para um novo exemplo?'
  }[lang];
  return {
    domains:[`learning:${id}`],
    constraints:[...rules],
    unknowns:[unknown],
    definitionOfDone:[verify],
    verification:[verify]
  };
}

export const LEARNING_SKILLS_VERSION='wolf-learning-skills/1.0';
