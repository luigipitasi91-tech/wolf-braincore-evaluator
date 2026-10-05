# WOLF Learning Skills Pack — Research Notes

The Learning Skills Pack translates broad evidence-based tutoring mechanisms into provider-neutral WOLF capabilities. It deliberately avoids copying any proprietary product code, branding or prompt text.

## Implemented mechanisms

1. **Fast Track Coach** — focuses on a minimal useful learning objective, one practical task at a time, explicit success criteria and verification with a fresh example.
2. **Real Error Simulator** — uses realistic mistakes, delayed full answers, targeted questions, repeated attempts and transfer to a new scenario.
3. **Core Idea Translator** — starts from one central idea, uses a concrete analogy, maps the analogy back to the real concept, then checks understanding.
4. **Learning Path Architect** — adapts a short path to outcome, deadline and current level; each step has one task, a success criterion and a low-value activity to avoid.
5. **Hidden Gap Detector** — uses adaptive diagnostic questions that require reasoning and expose weak foundations without leading the learner.
6. **Teach-Back Checker** — asks the learner to explain first, then flags undefined jargon, reasoning gaps and misleading simplifications before requesting a repaired explanation.

## Cross-cutting rules

- Do not infer mastery from fluent wording or one correct answer.
- Prefer observable learner performance and transfer to a fresh example.
- Delay complete answers when a scaffolded question can preserve productive effort.
- Keep questions diagnostic rather than leading.
- Use applied retrieval/practice, not only passive reading.
- Adapt difficulty and scaffolding to the learner's current state.
- Treat analogies as scaffolds, not substitutes for accurate technical mapping.
- In multilingual modes, localize tone and examples rather than translating idioms mechanically.

## Multilingual scope

Version 1 supports:
- English
- Italian
- Spanish
- French
- German
- Portuguese

The learning pack keeps a shared semantic skill ID across locales so BrainCore receives the same capability contract regardless of display language.

## Research anchors

The pack was informed by research and reviews on error reflection, self-explanation, adaptive tutoring, teach-back, retrieval practice and multilingual interfaces. Useful anchors include:

- Keith, N. & Frese, M. (2008), *Effectiveness of error management training: a meta-analysis* — PubMed: https://pubmed.ncbi.nlm.nih.gov/18211135/
- Educational Psychology Review (2025), *Conditions for Effective Learning from Erroneous Examples: A Systematic Review*: https://link.springer.com/article/10.1007/s10648-025-10071-x
- Booth, Begolli & McCann, worked examples and error analysis: https://iesmathcenter.org/wp-content/uploads/2016/01/2016BoothBegolliMcCann.pdf
- Utrecht University, *The Diagnosing Behaviour of Intelligent Tutoring Systems*: https://webspace.science.uu.nl/~jeuri101/homepage/Publications/DiagnosingBehaviour.pdf
- ACL Anthology (2026), multilingual tokenizer quality: https://aclanthology.org/2026.acl-srw.18
- SafeTutors (2026), pedagogical safety and avoiding premature/unsafe tutoring behavior: https://arxiv.org/html/2603.17373v1

These sources support the design principles, not a claim that WOLF has scientifically validated mastery scoring. The pack remains an experimental non-judge extension.
