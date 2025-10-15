
const API_BASE = 'https://valorant-api.com/v1';
const AGENTS_ENDPOINT = `${API_BASE}/agents`;


let agentsData = [];


async function getAgents() {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Cargando agentes...';

  try {
    const res = await fetch(AGENTS_ENDPOINT);
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    const data = await res.json();

    agentsData = data.data.filter(a => a.displayName && !a.isPlayableCharacter ? false : true);

    agentsData = agentsData.filter(a => a.isPlayableCharacter !== false);
    renderAgents(agentsData);
    statusEl.textContent = `Mostrando ${agentsData.length} agentes.`;
  } catch (err) {
    console.error('Error fetching agents:', err);
    statusEl.innerHTML = `<span class="text-danger">No se pudo obtener la API directamente desde el navegador. Si ves este error puede ser por CORS. Prueba usar Live Server en VS Code o un proxy CORS (ej. https://cors-anywhere.herokuapp.com/) para desarrollo local.</span>`;
  }
}

/**
 
 * @param {Array} list
 */
function renderAgents(list) {
  const container = document.getElementById('agentsContainer');
  container.innerHTML = '';
  if (!list.length) {
    container.innerHTML = '<p class="text-muted">No se encontraron agentes.</p>';
    return;
  }

  list.forEach(agent => {
    const roleName = agent.role ? agent.role.displayName : 'Sin rol';
    const image = agent.displayIcon || agent.fullPortrait || '';
    const shortDesc = agent.description || agent.developerName || '';

    const col = document.createElement('div');
    col.className = 'col';

    col.innerHTML = `
      <article class="card h-100 agent-card" aria-label="${agent.displayName}">
        ${image ? `<img src="${image}" alt="${agent.displayName} image" />` : ''}
        <div class="card-body d-flex flex-column">
          <h3 class="card-title h6 mb-1">${agent.displayName}</h3>
          <p class="mb-1 small text-muted role-badge">${roleName}</p>
          <p class="card-text small text-truncate" title="${shortDesc}">${shortDesc}</p>
          <div class="mt-auto">
            <a href="#" class="btn btn-sm btn-primary view-more" data-uuid="${agent.uuid}">Ver más</a>
          </div>
        </div>
      </article>
    `;
    container.appendChild(col);
  });


  document.querySelectorAll('.view-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const uuid = btn.dataset.uuid;
      const agent = agentsData.find(a => a.uuid === uuid);
      if (agent) {
        const info = `
Nombre: ${agent.displayName}
Rol: ${agent.role ? agent.role.displayName : 'Sin rol'}
Descripción: ${agent.description || '—'}
`;
        alert(info);
      }
    });
  });
}


function filterAgents() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const role = document.getElementById('roleSelect').value;
  let filtered = agentsData;

  if (role && role !== 'all') {
    filtered = filtered.filter(a => a.role && a.role.displayName === role);
  }
  if (query) {
    filtered = filtered.filter(a => a.displayName.toLowerCase().includes(query));
  }
  renderAgents(filtered);
  const statusEl = document.getElementById('status');
  statusEl.textContent = `Resultados: ${filtered.length}`;
}


function init() {
  document.getElementById('searchInput').addEventListener('input', debounce(filterAgents, 250));
  document.getElementById('roleSelect').addEventListener('change', filterAgents);
  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('roleSelect').value = 'all';
    renderAgents(agentsData);
    document.getElementById('status').textContent = `Mostrando ${agentsData.length} agentes.`;
  });


  getAgents();
}


function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}


document.addEventListener('DOMContentLoaded', init);
