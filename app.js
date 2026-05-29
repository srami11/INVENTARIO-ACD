const STORAGE_KEY = 'inventario_zarey_v2';
const OLD_STORAGE_KEY = 'inventario_zarey_v1';
const BRANCH_KEY = 'inventario_zarey_branch_names_v1';
const SEDES = ['SEDE_1', 'SEDE_2', 'SEDE_3'];
const DEFAULT_BRANCH_NAMES = { SEDE_1: 'SEDE 1', SEDE_2: 'SEDE 2', SEDE_3: 'SEDE 3' };

let inventory = loadData();
let branchNames = loadBranchNames();

function normalizeText(v){ return String(v ?? '').trim(); }
function normalizeForCompare(v){ return normalizeText(v).toUpperCase().replace(/\s+/g, '_'); }
function keyOf(item){ return [item.referencia,item.descripcion,item.talla,item.color].map(x=>normalizeText(x).toUpperCase()).join('|'); }

function loadData(){
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(Array.isArray(current)) return current;
    const old = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY));
    if(Array.isArray(old)) return old;
    return [];
  } catch { return []; }
}
function saveData(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory)); }
function loadBranchNames(){
  try { return {...DEFAULT_BRANCH_NAMES, ...(JSON.parse(localStorage.getItem(BRANCH_KEY)) || {})}; }
  catch { return {...DEFAULT_BRANCH_NAMES}; }
}
function saveBranchNames(){ localStorage.setItem(BRANCH_KEY, JSON.stringify(branchNames)); }
function sedeLabel(sede){ return branchNames[sede] || sede.replace('_',' '); }

function sedeFromInput(value){
  const raw = normalizeText(value);
  const normalized = normalizeForCompare(raw);
  if(SEDES.includes(normalized)) return normalized;
  const found = SEDES.find(s => normalizeForCompare(branchNames[s]) === normalized);
  return found || '';
}

function escapeHtml(v){
  return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function applyMovement(row){
  const item = {
    referencia: normalizeText(row.Referencia ?? row.referencia),
    descripcion: normalizeText(row.Descripcion ?? row.Descripción ?? row.descripcion),
    talla: normalizeText(row.Talla ?? row.talla),
    color: normalizeText(row.Color ?? row.color),
    cantidad: Number(row.Cantidad ?? row.cantidad ?? 0),
    sede: sedeFromInput(row.Sede ?? row.sede || 'SEDE_1'),
    movimiento: normalizeText(row.Movimiento ?? row.movimiento || 'SET').toUpperCase()
  };
  if(!item.referencia || !item.descripcion || !item.talla || !item.color || !SEDES.includes(item.sede)) return false;
  if(Number.isNaN(item.cantidad)) item.cantidad = 0;
  const idx = inventory.findIndex(x => keyOf(x) === keyOf(item) && x.sede === item.sede);
  if(idx === -1){
    inventory.push({...item, cantidad: item.movimiento === 'SALIDA' ? 0 : Math.max(0, item.cantidad)});
  } else {
    if(item.movimiento === 'ENTRADA') inventory[idx].cantidad += item.cantidad;
    else if(item.movimiento === 'SALIDA') inventory[idx].cantidad = Math.max(0, inventory[idx].cantidad - item.cantidad);
    else inventory[idx].cantidad = Math.max(0, item.cantidad);
    inventory[idx].descripcion = item.descripcion;
  }
  return true;
}

function getConsolidated(){
  const map = new Map();
  for(const item of inventory){
    const k = keyOf(item);
    if(!map.has(k)) map.set(k, {referencia:item.referencia, descripcion:item.descripcion, talla:item.talla, color:item.color, SEDE_1:0, SEDE_2:0, SEDE_3:0, total:0});
    const rec = map.get(k);
    rec[item.sede] += Number(item.cantidad || 0);
    rec.total += Number(item.cantidad || 0);
  }
  return Array.from(map.values()).sort((a,b)=>a.referencia.localeCompare(b.referencia, 'es', {numeric:true}));
}

function filteredRows(){
  const view = document.getElementById('viewSelect').value;
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  let rows = view === 'MADRE' ? getConsolidated() : inventory.filter(x => x.sede === view).sort((a,b)=>a.referencia.localeCompare(b.referencia, 'es', {numeric:true}));
  if(q) rows = rows.filter(r => Object.values(r).join(' ').toLowerCase().includes(q));
  return rows;
}

function renderSelectors(){
  const currentView = document.getElementById('viewSelect').value || 'MADRE';
  document.getElementById('viewSelect').innerHTML = `<option value="MADRE">INVENTARIO MADRE - Consolidado</option>` + SEDES.map(s=>`<option value="${s}">${escapeHtml(sedeLabel(s))}</option>`).join('');
  document.getElementById('viewSelect').value = currentView;
  document.getElementById('sedeSelect').innerHTML = SEDES.map(s=>`<option value="${s}">${escapeHtml(sedeLabel(s))}</option>`).join('');
  for(const sede of SEDES){
    const input = document.querySelector(`#branchForm [name="${sede}"]`);
    if(input) input.value = sedeLabel(sede);
  }
}

function render(){
  renderSelectors();
  const view = document.getElementById('viewSelect').value;
  const rows = filteredRows();
  document.getElementById('tableTitle').textContent = view === 'MADRE' ? 'INVENTARIO MADRE - Consolidado de sedes' : sedeLabel(view);
  document.getElementById('rowCount').textContent = `${rows.length} registros`;
  const headers = view === 'MADRE' ? ['Referencia','Descripcion','Talla','Color',sedeLabel('SEDE_1'),sedeLabel('SEDE_2'),sedeLabel('SEDE_3'),'Total'] : ['Referencia','Descripcion','Talla','Color','Cantidad','Sede'];
  document.getElementById('tableHead').innerHTML = '<tr>'+headers.map(h=>`<th>${escapeHtml(h)}</th>`).join('')+'</tr>';
  document.getElementById('tableBody').innerHTML = rows.map(r => view === 'MADRE'
    ? `<tr><td>${escapeHtml(r.referencia)}</td><td>${escapeHtml(r.descripcion)}</td><td>${escapeHtml(r.talla)}</td><td>${escapeHtml(r.color)}</td><td>${r.SEDE_1}</td><td>${r.SEDE_2}</td><td>${r.SEDE_3}</td><td><strong>${r.total}</strong></td></tr>`
    : `<tr><td>${escapeHtml(r.referencia)}</td><td>${escapeHtml(r.descripcion)}</td><td>${escapeHtml(r.talla)}</td><td>${escapeHtml(r.color)}</td><td><strong>${r.cantidad}</strong></td><td>${escapeHtml(sedeLabel(r.sede))}</td></tr>`
  ).join('');
  renderSummary();
}

function renderSummary(){
  const totals = {SEDE_1:0, SEDE_2:0, SEDE_3:0};
  for(const item of inventory) totals[item.sede] += Number(item.cantidad || 0);
  const total = totals.SEDE_1 + totals.SEDE_2 + totals.SEDE_3;
  document.getElementById('summaryCards').innerHTML = [
    ['Total madre', total], [sedeLabel('SEDE_1'), totals.SEDE_1], [sedeLabel('SEDE_2'), totals.SEDE_2], [sedeLabel('SEDE_3'), totals.SEDE_3]
  ].map(([t,v])=>`<div class="card"><h3>${escapeHtml(t)}</h3><strong>${v}</strong></div>`).join('');
}

document.getElementById('branchForm').addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  for(const sede of SEDES){ branchNames[sede] = normalizeText(data[sede]) || DEFAULT_BRANCH_NAMES[sede]; }
  saveBranchNames();
  render();
  alert('Nombres de sedes guardados.');
});

document.getElementById('itemForm').addEventListener('submit', e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  applyMovement({Referencia:data.referencia, Descripcion:data.descripcion, Talla:data.talla, Color:data.color, Cantidad:data.cantidad, Sede:data.sede, Movimiento:data.tipoMovimiento});
  saveData(); e.target.reset(); render();
});

document.getElementById('btnImport').addEventListener('click', async () => {
  const file = document.getElementById('fileInput').files[0];
  if(!file) return alert('Selecciona un archivo Excel o CSV.');
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, {defval:''});
  let ok = 0;
  rows.forEach(row => { if(applyMovement(row)) ok++; });
  saveData(); render(); alert(`Importación completada: ${ok} filas válidas procesadas de ${rows.length}.`);
});

document.getElementById('btnExport').addEventListener('click', () => {
  const wb = XLSX.utils.book_new();
  const madre = getConsolidated().map(r => ({Referencia:r.referencia, Descripcion:r.descripcion, Talla:r.talla, Color:r.color, [sedeLabel('SEDE_1')]:r.SEDE_1, [sedeLabel('SEDE_2')]:r.SEDE_2, [sedeLabel('SEDE_3')]:r.SEDE_3, Total:r.total}));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(madre), 'INVENTARIO MADRE');
  for(const sede of SEDES){
    const rows = inventory.filter(x=>x.sede===sede).map(x=>({Referencia:x.referencia, Descripcion:x.descripcion, Talla:x.talla, Color:x.color, Cantidad:x.cantidad, Sede:sedeLabel(x.sede)}));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sedeLabel(sede).slice(0,31));
  }
  XLSX.writeFile(wb, 'Inventario_Zarey.xlsx');
});

document.getElementById('btnTemplate').addEventListener('click', () => {
  const rows = [
    {Referencia:'155', Descripcion:'Faja ejemplo', Talla:'M', Color:'BEIGE', Cantidad:10, Sede:sedeLabel('SEDE_1'), Movimiento:'SET'},
    {Referencia:'155', Descripcion:'Faja ejemplo', Talla:'M', Color:'BEIGE', Cantidad:5, Sede:sedeLabel('SEDE_2'), Movimiento:'ENTRADA'},
    {Referencia:'155', Descripcion:'Faja ejemplo', Talla:'M', Color:'BEIGE', Cantidad:2, Sede:sedeLabel('SEDE_3'), Movimiento:'SALIDA'}
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Plantilla');
  XLSX.writeFile(wb, 'Plantilla_Importacion_Inventario.xlsx');
});

document.getElementById('btnReset').addEventListener('click', () => {
  if(confirm('¿Seguro que deseas borrar todo el inventario guardado en este navegador?')){
    inventory = []; saveData(); render();
  }
});

document.getElementById('viewSelect').addEventListener('change', render);
document.getElementById('searchInput').addEventListener('input', render);
render();
