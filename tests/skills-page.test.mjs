import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('skills page exposes the six-mode multilingual composer',async()=>{
  const html=await readFile(new URL('../skills.html',import.meta.url),'utf8');
  const app=await readFile(new URL('../src/skills-app.js',import.meta.url),'utf8');
  assert.match(html,/WOLF LEARNING SKILLS PACK/);
  assert.match(html,/id="skillsLanguage"/);
  assert.match(html,/id="skillComposer"/);
  assert.match(app,/LEARNING_SKILLS/);
  assert.match(app,/LEARNING_LOCALES/);
  assert.match(app,/buildLearningRequest/);
  assert.match(html,/Open in WOLF/);
});

test('judge demo can hide the optional learning-skills entry',async()=>{
  const [html,app]=await Promise.all([
    readFile(new URL('../index.html',import.meta.url),'utf8'),
    readFile(new URL('../src/app.js',import.meta.url),'utf8')
  ]);
  assert.match(html,/id="learningSkillsLink"/);
  assert.match(app,/isJudgeDemo/);
  assert.match(app,/learningSkillsLink/);
  // Hiding a link is not enough: demo mode must also ignore URL skill injection.
  assert.match(app,/let activeLearningSkill=isJudgeDemo\?'':\(getLearningSkill\(pageParams\.get\('skill'\)\)/);
});

test('learning page remains provider-neutral',async()=>{
  const files=await Promise.all([
    readFile(new URL('../skills.html',import.meta.url),'utf8'),
    readFile(new URL('../src/skills-app.js',import.meta.url),'utf8'),
    readFile(new URL('../src/learning-skills.mjs',import.meta.url),'utf8')
  ]);
  const joined=files.join('\n');
  assert.doesNotMatch(joined,/Claude|Anthropic|OpenAI|Gemini|TikTok|Capitalista/i);
  assert.doesNotMatch(joined,/api[_-]?key|x-subscription-token/i);
});
