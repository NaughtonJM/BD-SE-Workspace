(function(){
  "use strict";
  const MARKER = "CONVERSATION_INTELLIGENCE_V18";

  const esc = value => String(value == null ? "" : value)
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#39;");

  async function api(url, options){
    const response = await fetch(url, options);
    const raw = await response.text();
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { body = { raw }; }
    if (!response.ok || body.success === false) throw new Error(body.error || body.raw || ("HTTP " + response.status));
    return body;
  }

  function list(items){
    return `<ul>${(items || []).map(item => `<li>${esc(item)}</li>`).join("")}</ul>`;
  }

  function analysisHtml(analysis){
    if (!analysis || !analysis.marker) return '<p class="muted">Paste conversation notes and select Analyze Conversation.</p>';
    return `
      <div class="ci18-grid">
        <article class="ci18-card"><h3>What I Heard</h3>${(analysis.themes||[]).map(theme=>`<div class="ci18-theme"><strong>${esc(theme.theme)}</strong><p>${esc(theme.capability)}</p>${theme.evidence?.length?`<details><summary>Matched statements</summary>${list(theme.evidence)}</details>`:''}</div>`).join('')}</article>
        <article class="ci18-card"><h3>Capability Areas</h3>${list(analysis.capabilityAreas)}</article>
        <article class="ci18-card"><h3>Technology Areas</h3>${list(analysis.technologyAreas)}</article>
        <article class="ci18-card"><h3>Likely Competitors to Validate</h3>${analysis.likelyCompetitors?.length?list(analysis.likelyCompetitors):'<p class="muted">No competitor inferred. Confirm the incumbent before using a competitive play.</p>'}</article>
        <article class="ci18-card"><h3>Recommended Solution Palette</h3>${analysis.recommendedProducts?.length?list(analysis.recommendedProducts):'<p class="muted">No product recommendation yet.</p>'}</article>
        <article class="ci18-card"><h3>Discovery Questions</h3>${list(analysis.discoveryQuestions)}</article>
      </div>
      <article class="ci18-talk"><h3>Plain-Language Framing</h3><p>${esc(analysis.plainLanguage)}</p><h3>Executive Talk Track</h3><p>${esc(analysis.executiveTalkTrack)}</p></article>
      <div class="ci18-grid ci18-bottom">
        <article class="ci18-card"><h3>Suggested Demo Path</h3><ol>${(analysis.demoPath||[]).map(item=>`<li>${esc(item)}</li>`).join('')}</ol></article>
        <article class="ci18-card"><h3>Next Actions</h3>${list(analysis.nextActions)}</article>
      </div>`;
  }

  function panelHtml(id, saved){
    return `<section class="v18-box ci18" id="conversationIntelligenceV18_${id}" data-marker="${MARKER}">
      <h2>Conversation Intelligence Studio</h2>
      <p class="muted">Turn conversation notes into themes, capability areas, discovery paths, competitive plays to validate, a solution palette, plain-language positioning, and a bounded demo path.</p>
      <div class="ci18-controls">
        <div class="field"><label>Engagement Type</label><select class="ci18-engagement">${["Partner","End Customer","Internal"].map(v=>`<option ${saved.engagement_type===v?'selected':''}>${v}</option>`).join('')}</select></div>
        <div class="field"><label>Updated By</label><input class="ci18-user" value="${esc(saved.updated_by||'Justin Naughton')}"></div>
      </div>
      <div class="field"><label>Conversation Notes or Transcript Excerpt</label><textarea class="ci18-source" rows="10" placeholder="Paste exact statements, meeting notes, discovery answers, or a transcript excerpt.">${esc(saved.source_text||'')}</textarea></div>
      <div class="ci18-actions"><button class="primary ci18-analyze">Analyze Conversation</button><button class="ci18-save">Save Conversation Intelligence</button><span class="ci18-status muted">${saved.updated_at?'Last saved '+esc(saved.updated_at):'Not yet saved'}</span></div>
      <div class="ci18-analysis">${analysisHtml(saved.analysis)}</div>
      <div class="field"><label>Coaching / Validation Notes</label><textarea class="ci18-notes" rows="4">${esc(saved.notes||'')}</textarea></div>
    </section>`;
  }

  function reportContext(report){
    return {
      partner_name: report?.partner_name,
      account_name: report?.account_name,
      input: report?.input,
      partner_research: report?.partner_research,
      client_research: report?.client_research,
      reconciled_research: report?.reconciled_research,
      prepared_call: report?.prepared_call,
      answers: report?.answers
    };
  }

  function bind(id, root, report){
    let currentAnalysis = root.dataset.analysis ? JSON.parse(root.dataset.analysis) : null;
    const status = root.querySelector('.ci18-status');

    async function analyze(){
      status.textContent = 'Analyzing...';
      try{
        const body = {
          sourceText: root.querySelector('.ci18-source').value,
          engagementType: root.querySelector('.ci18-engagement').value,
          reportContext: reportContext(report)
        };
        const result = await api('/api/conversation-intelligence-v18/analyze', {
          method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
        });
        currentAnalysis = result.analysis;
        root.querySelector('.ci18-analysis').innerHTML = analysisHtml(currentAnalysis);
        status.textContent = 'Analysis complete. Review, validate, and save.';
      }catch(error){ status.textContent = 'Analysis failed: ' + error.message; }
    }

    root.querySelector('.ci18-analyze').addEventListener('click', analyze);
    root.querySelector('.ci18-save').addEventListener('click', async ()=>{
      status.textContent = 'Saving...';
      try{
        if (!currentAnalysis || !currentAnalysis.marker) await analyze();
        if (!currentAnalysis || !currentAnalysis.marker) throw new Error('Analyze the conversation before saving.');
        const result = await api('/api/conversation-intelligence-v18/'+encodeURIComponent(id), {
          method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
            sourceText: root.querySelector('.ci18-source').value,
            engagementType: root.querySelector('.ci18-engagement').value,
            analysis: currentAnalysis,
            notes: root.querySelector('.ci18-notes').value,
            updatedBy: root.querySelector('.ci18-user').value || 'Justin Naughton'
          })
        });
        status.textContent = 'Saved at ' + result.updated_at + '.';
      }catch(error){ status.textContent = 'Save failed: ' + error.message; }
    });
  }

  async function install(id){
    const page = document.getElementById('meetingplanView');
    if (!page || document.getElementById('conversationIntelligenceV18_'+id)) return;
    const [saved, report] = await Promise.all([
      api('/api/conversation-intelligence-v18/'+encodeURIComponent(id)),
      api('/api/call-report-v4/'+encodeURIComponent(id))
    ]);
    const holder = document.createElement('div');
    holder.innerHTML = panelHtml(id, saved);
    const section = holder.firstElementChild;
    section.dataset.analysis = saved.analysis?.marker ? JSON.stringify(saved.analysis) : '';
    const v17 = page.querySelector('#visionCapabilityV17_'+id+',.vision-capability-v17,.vc17');
    const v15 = page.querySelector('#solutionDiscoveryV15_'+id+',.sd15');
    const stage = page.querySelector('#stageV12_'+id+',.stage-v12');
    const anchor = v17 || v15 || stage || page.querySelector('.v18-hero');
    if (anchor) anchor.insertAdjacentElement('afterend', section); else page.prepend(section);
    bind(id, section, report);
  }

  const style = document.createElement('style');
  style.textContent = `
    .ci18{display:block;width:100%}.ci18-controls{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ci18-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:14px}.ci18-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ci18-card,.ci18-talk{border:1px solid #654184;border-radius:10px;padding:14px;background:#180825}.ci18-card h3,.ci18-talk h3{margin-top:0}.ci18-theme{border-left:4px solid #fcaf1a;padding:8px 10px;margin:8px 0;background:#210d34}.ci18-theme p{margin:5px 0}.ci18-talk{margin:12px 0;border-top:5px solid #fcaf1a}.ci18-bottom{margin-top:12px}.ci18-analysis ul,.ci18-analysis ol{padding-left:24px}.ci18-analysis li{margin:6px 0}@media(max-width:850px){.ci18-controls,.ci18-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const original = window.openMeetingPlan;
  if (typeof original !== 'function') {
    console.error(MARKER+' could not wrap openMeetingPlan');
    return;
  }
  window.openMeetingPlan = async function(id){
    const result = await original.apply(this, arguments);
    try { await install(id); } catch(error) { console.error(MARKER, error); }
    return result;
  };

  window.__conversationIntelligenceV18 = { marker:MARKER, install };
  console.info(MARKER+' loaded');
})();
