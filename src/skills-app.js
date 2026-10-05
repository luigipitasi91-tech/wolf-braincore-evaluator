import {
  LEARNING_SKILLS,
  LEARNING_LOCALES,
  normalizeLearningLocale,
  getLearningSkill,
  learningSkillLabel,
  learningFieldLabels,
  buildLearningRequest
} from './learning-skills.mjs';

const $=s=>document.querySelector(s);
const grid=$('#skillGrid');
const language=$('#skillsLanguage');
const composer=$('#skillComposer');
const form=$('#skillForm');
let activeSkill='fast-track';

function browserLocale(){
  return normalizeLearningLocale(navigator.language||'en');
}

function renderLanguages(){
  language.innerHTML=LEARNING_LOCALES.map(x=>`<option value="${x.code}">${x.label}</option>`).join('');
  language.value=browserLocale();
}

function esc(value=''){
  return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function renderSkills(){
  const locale=normalizeLearningLocale(language.value);
  grid.innerHTML=LEARNING_SKILLS.map(skill=>`
    <article class="skill-card" data-skill="${skill.id}">
      <div class="skill-icon" aria-hidden="true">${skill.icon}</div>
      <div>
        <h2>${esc(skill.titles[locale]||skill.titles.en)}</h2>
        <p>${esc(skill.summaries[locale]||skill.summaries.en)}</p>
      </div>
      <button type="button" data-use-skill="${skill.id}">Use skill →</button>
    </article>
  `).join('');
  document.querySelectorAll('[data-use-skill]').forEach(button=>{
    button.addEventListener('click',()=>openComposer(button.dataset.useSkill));
  });
}

function refreshComposerCopy(){
  const locale=normalizeLearningLocale(language.value);
  const skill=getLearningSkill(activeSkill);
  const labels=learningFieldLabels(locale);
  $('#composerTitle').textContent=learningSkillLabel(activeSkill,locale);
  $('#composerSummary').textContent=skill?.summaries?.[locale]||skill?.summaries?.en||'';
  $('#topicLabel').textContent=labels.topic;
  $('#goalLabel').textContent=labels.goal;
  $('#timeLabel').textContent=labels.time;
  $('#levelLabel').textContent=labels.level;
}

function openComposer(id){
  activeSkill=id;
  refreshComposerCopy();
  composer.hidden=false;
  $('#skillOutput').hidden=true;
  composer.scrollIntoView({behavior:'smooth',block:'start'});
  $('#skillTopic').focus();
}

function build(){
  const locale=normalizeLearningLocale(language.value);
  const request=buildLearningRequest(activeSkill,{
    topic:$('#skillTopic').value,
    goal:$('#skillGoal').value,
    time:$('#skillTime').value,
    level:$('#skillLevel').value,
    locale
  });
  $('#skillPrompt').textContent=request;
  const url=new URL('./',location.href);
  url.searchParams.set('request',request);
  url.searchParams.set('skill',activeSkill);
  url.searchParams.set('lang',locale);
  $('#openInWolf').href=url.href;
  $('#skillOutput').hidden=false;
  $('#skillOutput').scrollIntoView({behavior:'smooth',block:'nearest'});
}

renderLanguages();
renderSkills();

language.addEventListener('change',()=>{
  renderSkills();
  refreshComposerCopy();
  if(!$('#skillOutput').hidden)build();
});

form.addEventListener('submit',event=>{
  event.preventDefault();
  build();
});

$('#closeComposer').addEventListener('click',()=>{
  composer.hidden=true;
});

$('#copySkill').addEventListener('click',async()=>{
  const value=$('#skillPrompt').textContent;
  if(!value)return;
  try{
    await navigator.clipboard.writeText(value);
    $('#copySkill').textContent='Copied ✓';
    setTimeout(()=>{$('#copySkill').textContent='Copy';},1400);
  }catch{
    $('#copySkill').textContent='Select text';
  }
});
