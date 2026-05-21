// State Management
let leads = JSON.parse(localStorage.getItem('crm_leads')) || [];

// DOM Elements
const sidebarItems = document.querySelectorAll('.sidebar nav ul li');
const views = document.querySelectorAll('.view');
const viewTitle = document.getElementById('view-title');
const leadForm = document.getElementById('lead-form');
const leadsBody = document.getElementById('leads-body');
const recentLeadsBody = document.getElementById('recent-leads-body');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const closeModal = document.getElementById('close-modal-btn'); // Targeted specifically by ID

// Stats Elements
const totalLeadsEl = document.getElementById('total-leads');
const contactedLeadsEl = document.getElementById('contacted-leads');
const convertedLeadsEl = document.getElementById('converted-leads');

// Filters
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    renderLeads();
    updateStats();
});

// Navigation Logic
sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
        const viewId = item.getAttribute('data-view');
        
        // Update UI
        sidebarItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        views.forEach(view => {
            view.classList.add('hidden');
            if (view.id === `${viewId}-view`) {
                view.classList.remove('hidden');
            }
        });

        viewTitle.textContent = item.textContent.trim();
    });
});

// Add Lead Logic
leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newLead = {
        id: Date.now(),
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        source: document.getElementById('source').value,
        notes: document.getElementById('notes').value,
        status: 'New',
        date: new Date().toLocaleDateString()
    };

    leads.push(newLead);
    saveLeads();
    leadForm.reset();
    
    // Switch to Leads view
    document.querySelector('[data-view="leads"]').click();
    renderLeads();
    renderDashboard();
    updateStats();
});

// Render Leads Table
function renderLeads(filteredLeads = leads) {
    if (!leadsBody) return;
    leadsBody.innerHTML = '';
    filteredLeads.forEach(lead => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${lead.name}</td>
            <td>${lead.email}</td>
            <td>${lead.source}</td>
            <td><span class="badge badge-${lead.status.toLowerCase()}">${lead.status}</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="openEditModal(${lead.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-delete" onclick="deleteLead(${lead.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        leadsBody.appendChild(tr);
    });
}

// Render Dashboard
function renderDashboard() {
    if (!recentLeadsBody) return;
    recentLeadsBody.innerHTML = '';
    const recentLeads = [...leads].reverse().slice(0, 5);
    
    recentLeads.forEach(lead => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${lead.name}</td>
            <td>${lead.email}</td>
            <td><span class="badge badge-${lead.status.toLowerCase()}">${lead.status}</span></td>
            <td>${lead.date}</td>
        `;
        recentLeadsBody.appendChild(tr);
    });
}

// Update Stats
function updateStats() {
    if (totalLeadsEl) totalLeadsEl.textContent = leads.length;
    if (contactedLeadsEl) contactedLeadsEl.textContent = leads.filter(l => l.status === 'Contacted').length;
    if (convertedLeadsEl) convertedLeadsEl.textContent = leads.filter(l => l.status === 'Converted').length;
}

// Delete Lead
function deleteLead(id) {
    if (confirm('Are you sure you want to delete this lead?')) {
        leads = leads.filter(l => l.id !== id);
        saveLeads();
        renderLeads();
        renderDashboard();
        updateStats();
    }
}

// Edit Lead Logic
function openEditModal(id) {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    document.getElementById('edit-id').value = lead.id;
    document.getElementById('edit-status').value = lead.status;
    document.getElementById('edit-notes').value = lead.notes || '';
    editModal.classList.remove('hidden');
}

if (closeModal) {
    closeModal.onclick = () => editModal.classList.add('hidden');
}

window.onclick = (e) => { 
    if (e.target == editModal) editModal.classList.add('hidden'); 
};

editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-id').value);
    const status = document.getElementById('edit-status').value;
    const notes = document.getElementById('edit-notes').value;

    const index = leads.findIndex(l => l.id === id);
    if (index !== -1) {
        leads[index].status = status;
        leads[index].notes = notes;
        saveLeads();
    }
    
    editModal.classList.add('hidden');
    renderLeads();
    renderDashboard();
    updateStats();
});

function handleFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;

    const filtered = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm) || 
                              lead.email.toLowerCase().includes(searchTerm);
        const matchesStatus = statusValue === 'all' || lead.status === statusValue;
        return matchesSearch && matchesStatus;
    });

    renderLeads(filtered);
}

if (searchInput) searchInput.addEventListener('input', handleFilters);
if (statusFilter) statusFilter.addEventListener('change', handleFilters);

function saveLeads() {
    localStorage.setItem('crm_leads', JSON.stringify(leads));
}