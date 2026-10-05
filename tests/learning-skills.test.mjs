import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEARNING_SKILLS,
  LEARNING_LOCALES,
  buildLearningRequest,
  learningSkillContract,
  learningSkillLabel
} from '../src/learning-skills.mjs';
import {buildPlans} from '../src/braincore.mjs';
import {analyzeRequest} from '../src/request-integrity.mjs';

test('learning pack exposes six original skills and six locales',()=>{
  assert.equal(LEARNING_SKILLS.length,6);
  assert.deepEqual(LEARNING_LOCALES.map(x=>x.code),['en','it','es','fr','de','pt']);
  assert.equal(new Set(LEARNING_SKILLS.map(x=>x.id)).size,6);
});

test('generated learning requests are original and avoid source branding',()=>{
  for(const skill of LEARNING_SKILLS){
    const request=buildLearningRequest(skill.id,{
      topic:'airline interview English',
      goal:'answer five interview questions',
      time:'7 days',
      level:'intermediate',
      locale:'en'
    });
    assert.doesNotMatch(request,/Claude|Capitalista|TikTok/i);
    assert.match(request,/WOLF Learning Skill:/);
    assert.equal(analyzeRequest(request).status,'CLEAR');
  }
});

test('all supported languages generate a complete request',()=>{
  for(const locale of LEARNING_LOCALES.map(x=>x.code)){
    const request=buildLearningRequest('teach-back',{
      topic:'safety procedures',
      goal:'explain the procedure clearly',
      time:'30 minutes',
      level:'basic knowledge',
      locale
    });
    assert.ok(request.length>300);
    assert.ok(learningSkillLabel('teach-back',locale).length>3);
    assert.match(request,/WOLF task:/);
  }
});

test('error simulator encodes delayed-answer and transfer behavior',()=>{
  const contract=learningSkillContract('error-simulator','',{locale:'en'});
  assert.ok(contract.constraints.some(x=>/two genuine attempts/i.test(x)));
  assert.ok(contract.constraints.some(x=>/test transfer/i.test(x)));
  assert.ok(contract.verification.some(x=>/observable learner performance/i.test(x)));
});

test('selected learning skill is applied to BrainCore but not required by baseline',()=>{
  const request=buildLearningRequest('gap-detector',{
    topic:'airport dangerous goods',
    goal:'identify weak areas before an interview',
    time:'45 minutes',
    level:'basic',
    locale:'en'
  });
  const plans=buildPlans(request,{learningSkill:'gap-detector',locale:'en'});
  assert.ok(plans.candidate.domainPacks.includes('learning:gap-detector'));
  assert.ok(plans.candidate.constraints.some(x=>/five deceptively simple diagnostic questions/i.test(x)));
  assert.ok(plans.candidate.unknowns.some(x=>/fresh example/i.test(x)));
  assert.ok(!('domainPacks' in plans.baseline));
});

test('no selected learning skill leaves the existing core path unchanged',()=>{
  const plans=buildPlans('Create a plan for a small website with a £50 budget.');
  assert.ok(!plans.candidate.domainPacks.some(x=>x.startsWith('learning:')));
});
