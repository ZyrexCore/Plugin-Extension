(() => {
'use strict';
const KEY='printlog-v2';
const OLD_KEY='printlog-v1';
const defaults={
 machines:['Offset','Banner','Konica 4080','Kyocera'],
 workTypes:['Booklet','Xerox','Bill Book / Receipt','Stamp','Master'],
 materials:['300 GSM','170 GSM','130 GSM']
};
const $=id=>document.getElementById(id);
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>d?new Date(d+'T12:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}):'—';
const cloneDefaults=()=>JSON.parse(JSON.stringify(defaults));
function load(){
  try{
    const saved=JSON.parse(localStorage.getItem(KEY));
    if(saved&&Array.isArray(saved.jobs))return {...saved,catalogs:{...cloneDefaults(),...(saved.catalogs||{})}};
  }catch(e){}
  const fresh={jobs:[],catalogs:cloneDefaults()};
  try{
    const old=JSON.parse(localStorage.getItem(OLD_KEY));
    if(old){
      (old.tasks||[]).forEach(t=>fresh.jobs.push({id:t.id||uid(),title:t.title||'Untitled job',customer:'',notes:t.note||'',takenDate:t.created||today(),activeDate:t.date||today(),status:t.done?'finished':'not_started',completedDate:t.done?(t.completed||today()):null,carried:!!t.carried,production:t.done?{machine:'Not recorded',workType:'Not recorded',materials:[],notes:'Imported from previous Printlog'}:null}));
      (old.materials||[]).forEach(m=>{const label=m.paper||'';if(label&&!fresh.catalogs.materials.includes(label))fresh.catalogs.materials.push(label)});
    }
  }catch(e){}
  return fresh;
}
let db=load(),activeJobId=null,jobFilter='all',editingJobId=null,confirmAction=null;
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2200)}
function carryForward(){
  const d=today();let changed=false;
  db.jobs.forEach(j=>{if(j.status!=='finished'&&j.activeDate<d){j.activeDate=d;j.carried=true;changed=true}});
  if(changed)localStorage.setItem(KEY,JSON.stringify(db));
}
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-'+name));
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  $('pageTitle').textContent=({dashboard:'Overview',jobs:'All jobs',completed:'Finished work',history:'History',setup:'Setup & lists'})[name]||'Printlog';
  if(name==='jobs')renderJobs();if(name==='completed')renderCompleted();if(name==='history')renderHistory();
}
function statusLabel(s){return s==='in_progress'?'In progress':s==='finished'?'Finished':'Not started'}
function statusBadge(s){return '<span class="status-badge '+s+'">'+statusLabel(s)+'</span>'}
function empty(message){return '<div class="empty-state">'+message+'</div>'}
function jobCard(j,compact=false){
  const meta='<div class="job-meta"><span>Taken '+fmt(j.takenDate)+'</span>'+(j.dueDate?'<span>Due '+fmt(j.dueDate)+'</span>':'')+(j.carried?'<span>↪ Carried forward</span>':'')+(j.customer?'<span>Contact: '+esc(j.customer)+'</span>':'')+'</div>';
  const note=j.notes?'<div class="job-note">'+esc(j.notes)+'</div>':'';
  let actions='';
  actions='<button class="small-button" data-action="edit" data-id="'+esc(j.id)+'">Edit</button>';
  if(j.status==='not_started')actions+='<button class="small-button primary" data-action="start" data-id="'+esc(j.id)+'">Start work</button>';
  if(j.status==='in_progress')actions='<button class="small-button" data-action="wait" data-id="'+esc(j.id)+'">Move to not started</button>';
  if(j.status!=='finished')actions+='<button class="small-button finish" data-action="finish" data-id="'+esc(j.id)+'">✓ Finish</button><button class="small-button danger" data-action="delete" data-id="'+esc(j.id)+'" aria-label="Delete job">×</button>';
  return '<article class="job-card"><div class="job-card-main"><div class="job-title">'+esc(j.title)+'</div>'+meta+note+'</div><div class="job-actions">'+statusBadge(j.status)+actions+'</div></article>';
}
function finishedRow(j){
  const p=j.production||{};
  return '<div class="finished-row"><div class="finished-check">✓</div><div><b>'+esc(j.title)+'</b><small>'+fmt(j.completedDate)+' · '+esc(p.machine||'Machine not recorded')+' · '+esc(p.workType||'Work type not recorded')+'</small></div><button class="small-button" data-action="details" data-id="'+esc(j.id)+'">Details</button></div>';
}
function renderDashboard(){
  const d=today(),taken=db.jobs.filter(j=>j.takenDate===d),waiting=db.jobs.filter(j=>j.status==='not_started'),progress=db.jobs.filter(j=>j.status==='in_progress'),finished=db.jobs.filter(j=>j.status==='finished'&&j.completedDate===d);
  $('todayDate').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  $('metricTaken').textContent=taken.length;$('metricWaiting').textContent=waiting.length;$('metricProgress').textContent=progress.length;$('metricFinished').textContent=finished.length;
  $('navOpenCount').textContent=waiting.length+progress.length;$('waitingPill').textContent=waiting.length;$('progressPill').textContent=progress.length;
  $('dashboardWaiting').innerHTML=waiting.slice(0,5).map(j=>jobCard(j,true)).join('')||empty('Nothing waiting to start. New jobs will appear here.');
  $('dashboardProgress').innerHTML=progress.slice(0,5).map(j=>jobCard(j,true)).join('')||empty('No jobs are currently in progress.');
  $('dashboardFinished').innerHTML=finished.length?finished.slice(0,5).map(finishedRow).join(''):empty('No jobs finished today yet. Completed jobs will stay in Finished work.');
}
function renderJobs(){
  const q=($('jobSearch').value||'').toLowerCase();
  let jobs=db.jobs.filter(j=>j.status!=='finished');
  if(jobFilter!=='all')jobs=jobs.filter(j=>j.status===jobFilter);
  jobs=jobs.filter(j=>[j.title,j.customer,j.notes].join(' ').toLowerCase().includes(q)).sort((a,b)=>b.activeDate.localeCompare(a.activeDate)||b.takenDate.localeCompare(a.takenDate));
  $('allJobsList').innerHTML=jobs.map(j=>jobCard(j)).join('')||empty('No jobs match this view. Add a new job when work comes in.');
}
function productionText(j){
  const p=j.production||{};
  return [p.machine,p.workType,...(p.materials||[]),p.notes].filter(Boolean).join(' ').toLowerCase();
}
function renderCompleted(){
  const q=($('completedSearch').value||'').toLowerCase();
  const jobs=db.jobs.filter(j=>j.status==='finished').sort((a,b)=>(b.completedDate||'').localeCompare(a.completedDate||''));
  const filtered=jobs.filter(j=>[j.title,j.customer,j.notes,productionText(j)].join(' ').toLowerCase().includes(q));
  $('completedSummary').textContent=jobs.length+' FINISHED JOB'+(jobs.length===1?'':'S');
  $('completedList').innerHTML=filtered.map(j=>{
    const p=j.production||{};
    const details='<div class="job-note">Machine: '+esc(p.machine||'—')+' · Work: '+esc(p.workType||'—')+' · Materials: '+esc((p.materials||[]).join(', ')||'—')+(p.cost!==undefined&&p.cost!==null&&p.cost!==''?' · Cost: ₹'+esc(p.cost):'')+(p.notes?' · '+esc(p.notes):'')+'</div>';
    return '<article class="job-card"><div class="job-card-main"><div class="job-title">'+esc(j.title)+'</div><div class="job-meta"><span>Taken '+fmt(j.takenDate)+'</span><span>Finished '+fmt(j.completedDate)+'</span>'+(j.customer?'<span>'+esc(j.customer)+'</span>':'')+'</div>'+details+'</div><div class="job-actions">'+statusBadge('finished')+'<button class="small-button" data-action="details" data-id="'+esc(j.id)+'">Details</button></div></article>';
  }).join('')||empty('No finished jobs found.');
}
function renderHistory(){
  const q=($('historySearch').value||'').toLowerCase();
  const dates=[...new Set(db.jobs.flatMap(j=>[j.takenDate,j.activeDate,j.completedDate].filter(Boolean)))].sort((a,b)=>b.localeCompare(a));
  const blocks=dates.map(date=>{
    const taken=db.jobs.filter(j=>j.takenDate===date),carried=db.jobs.filter(j=>j.carried&&j.activeDate===date&&j.status!=='finished'&&j.takenDate!==date),done=db.jobs.filter(j=>j.completedDate===date);
    const all=[...taken,...carried.filter(j=>!taken.some(t=>t.id===j.id)),...done.filter(j=>!taken.some(t=>t.id===j.id))];
    const filtered=all.filter(j=>[j.title,j.customer,j.notes,productionText(j)].join(' ').toLowerCase().includes(q));
    if(!filtered.length)return '';
    return '<article class="history-day"><div class="history-day-head"><b>'+fmt(date)+'</b><small>'+taken.length+' TAKEN · '+carried.length+' CARRIED · '+done.length+' FINISHED</small></div><div class="history-items">'+filtered.map(j=>'<div class="history-item"><span class="status-dot '+(j.status==='finished'?'finished':j.status==='in_progress'?'progress':'waiting')+'"></span><b>'+esc(j.title)+'</b><small>'+(j.completedDate===date?'Finished':j.takenDate===date?'Taken':'Carried forward')+'</small></div>').join('')+'</div></article>';
  }).filter(Boolean).join('');
  $('historyList').innerHTML=blocks||empty('No history found for that search.');
}
function renderCatalog(key){
  const target=$(key+'List');
  target.innerHTML=db.catalogs[key].map((item,index)=>'<div class="catalog-item"><span>'+esc(item)+'</span><button type="button" data-remove-catalog="'+key+'" data-index="'+index+'" aria-label="Remove '+esc(item)+'">×</button></div>').join('')||empty('No options added yet.');
}
function renderSetup(){['machines','workTypes','materials'].forEach(renderCatalog)}
function render(){renderDashboard();renderJobs();renderCompleted();renderHistory();renderSetup()}
function openModal(id){$(id).classList.add('open');$(id).setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeModal(id){$(id).classList.remove('open');$(id).setAttribute('aria-hidden','true');document.body.style.overflow=''}
function askConfirm(title,message,callback,buttonLabel='Confirm'){
  $('confirmTitle').textContent=title;$('confirmMessage').textContent=message;
  $('confirmActionBtn').textContent=buttonLabel;confirmAction=callback;openModal('confirmModal');
}
function openJobModal(job=null){
  editingJobId=job?.id||null;$('jobForm').reset();
  $('jobModalTitle').textContent=job?'Edit job':'Add a job';
  $('jobModal').querySelector('.kicker').textContent=job?'UPDATE JOB DETAILS':'NEW JOB ENTRY';
  $('jobTitle').value=job?.title||'';$('jobCustomer').value=job?.customer||'';
  $('jobDueDate').value=job?.dueDate||'';$('jobNotes').value=job?.notes||'';
  $('jobDate').value=job?.takenDate||today();$('jobStatus').value=job?.status==='in_progress'?'in_progress':'not_started';
  $('jobDate').disabled=!!job;
  openModal('jobModal');setTimeout(()=>$('jobTitle').focus(),30)
}
function fillSelect(id,items){$(id).innerHTML=items.map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join('')}
function openFinishModal(id){
  const job=db.jobs.find(j=>j.id===id);if(!job)return;
  activeJobId=id;$('finishJobName').textContent=job.title;
  fillSelect('finishMachine',db.catalogs.machines);fillSelect('finishWorkType',db.catalogs.workTypes);
  $('finishMaterials').innerHTML=db.catalogs.materials.map((m,i)=>'<label class="check-option"><input type="checkbox" value="'+esc(m)+'" id="material-'+i+'"><span>'+esc(m)+'</span></label>').join('')||'<span class="optional">Add materials in Setup & lists first.</span>';
  $('finishNotes').value='';$('finishCost').value=job.production?.cost??'';openModal('finishModal');
}
function showJobDetails(id){
  const j=db.jobs.find(x=>x.id===id);if(!j)return;
  const p=j.production||{};
  toast('Machine: '+(p.machine||'—')+' · '+(p.workType||'—')+' · '+((p.materials||[]).join(', ')||'No materials')+(p.cost!==undefined&&p.cost!==''?' · ₹'+p.cost:''));
}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.goto)));
$('quickAddBtn').addEventListener('click',openJobModal);$('jobsAddBtn').addEventListener('click',openJobModal);
document.querySelectorAll('[data-close-modal]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.closeModal)));
$('confirmActionBtn').addEventListener('click',()=>{const run=confirmAction;confirmAction=null;closeModal('confirmModal');if(run)run()});
document.querySelectorAll('.modal-backdrop').forEach(b=>b.addEventListener('click',e=>{if(e.target===b)closeModal(b.id)}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal-backdrop.open').forEach(m=>closeModal(m.id))});
$('jobForm').addEventListener('submit',e=>{
  e.preventDefault();const title=$('jobTitle').value.trim();if(!title)return;
  const date=$('jobDate').value||today();
  if(editingJobId){
    const job=db.jobs.find(j=>j.id===editingJobId);if(!job)return;
    job.title=title;job.customer=$('jobCustomer').value.trim();job.dueDate=$('jobDueDate').value||null;job.notes=$('jobNotes').value.trim();
    if(job.status!=='finished')job.status=$('jobStatus').value;
    save();closeModal('jobModal');toast('Job details updated');
  }else{
    db.jobs.push({id:uid(),title,customer:$('jobCustomer').value.trim(),dueDate:$('jobDueDate').value||null,notes:$('jobNotes').value.trim(),takenDate:date,activeDate:date,status:$('jobStatus').value,completedDate:null,carried:false,production:null});
    save();closeModal('jobModal');showView('jobs');toast('Job added to the register');
  }
  editingJobId=null;$('jobDate').disabled=false;
});
$('finishForm').addEventListener('submit',e=>{
  e.preventDefault();const job=db.jobs.find(j=>j.id===activeJobId);if(!job)return;
  const machine=$('finishMachine').value,workType=$('finishWorkType').value;
  if(!machine||!workType){toast('Add a machine and work type in Setup first');return}
  const materials=[...document.querySelectorAll('#finishMaterials input:checked')].map(x=>x.value);
  job.status='finished';job.completedDate=today();job.carried=false;
  const rawCost=$('finishCost').value.trim();job.production={machine,workType,materials,notes:$('finishNotes').value.trim(),cost:rawCost===''?null:Number(rawCost)};
  save();closeModal('finishModal');toast('Job marked as finished');
});
document.addEventListener('click',e=>{
  const action=e.target.closest('[data-action]');
  if(action){
    const j=db.jobs.find(x=>x.id===action.dataset.id);if(!j)return;
    switch(action.dataset.action){
      case 'start':j.status='in_progress';save();toast('Job moved to In progress');break;
      case 'wait':j.status='not_started';save();toast('Job moved to Not started');break;
      case 'finish':openFinishModal(j.id);break;
      case 'edit':openJobModal(j);break;
      case 'delete':askConfirm('Delete job?','This job will be permanently removed from your register.',()=>{db.jobs=db.jobs.filter(x=>x.id!==j.id);save();toast('Job deleted')},'Delete job')break;
      case 'details':showJobDetails(j.id);break;
    }
  }
  const remove=e.target.closest('[data-remove-catalog]');
  if(remove){
    const key=remove.dataset.removeCatalog,index=Number(remove.dataset.index);
    const item=db.catalogs[key]?.[index];if(!item)return;
    if(confirm('Remove "'+item+'" from your options? Existing finished job records will stay unchanged.')){db.catalogs[key].splice(index,1);save();toast('Option removed')}
  }
});
document.querySelectorAll('.catalog-form').forEach(form=>form.addEventListener('submit',e=>{
  e.preventDefault();const key=form.dataset.catalog,input=form.elements.item,value=input.value.trim();
  if(!value)return;
  if(db.catalogs[key].some(x=>x.toLowerCase()===value.toLowerCase())){toast('That option already exists');return}
  db.catalogs[key].push(value);save();input.value='';toast('New option added');
}));
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
  jobFilter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderJobs();
}));
$('jobSearch').addEventListener('input',renderJobs);$('completedSearch').addEventListener('input',renderCompleted);$('historySearch').addEventListener('input',renderHistory);
$('exportBtn').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify({app:'Printlog',version:2,exportedAt:new Date().toISOString(),...db},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='printlog-backup-'+today()+'.json';a.click();URL.revokeObjectURL(url);toast('Backup downloaded');
});
carryForward();render();
})();