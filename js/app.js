// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// État global de l'application
const state = {
    dossiers: JSON.parse(localStorage.getItem('dossiers')) || [],
    nextId: parseInt(localStorage.getItem('nextId')) || 1,
    currentSection: 'section-ajouter'
};

// Initialisation de l'application
function initApp() {
    initNavigation();
    initForms();
    initEvents();
    refreshAllViews();
}

// Initialisation de la navigation
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.closest('button').id.replace('btn-', 'section-');
            switchSection(targetId);
        });
    });
}

// Changement de section
function switchSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
        state.currentSection = sectionId;
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-blue-600');
            if (btn.id === `btn-${sectionId.replace('section-', '')}`) {
                btn.classList.add('active', 'bg-blue-600');
            }
        });
        
        refreshCurrentView();
    }
}

// Initialisation des formulaires
function initForms() {
    const formAjout = document.getElementById('form-ajout');
    if (formAjout) {
        formAjout.addEventListener('submit', handleFormSubmit);
    }
    
    const etatSelect = document.getElementById('etat-dossier');
    if (etatSelect) {
        etatSelect.addEventListener('change', toggleConditionalFields);
    }
    
    const autresDetailCheck = document.getElementById('autres-detail-check');
    if (autresDetailCheck) {
        autresDetailCheck.addEventListener('change', toggleAutresDetail);
    }
}

// Initialisation des événements
function initEvents() {
    const btnSearch = document.getElementById('btn-search');
    if (btnSearch) {
        btnSearch.addEventListener('click', toggleSearchPanel);
    }
    
    const searchInputs = document.querySelectorAll('#search-nom, #search-date-debut, #search-date-fin');
    searchInputs.forEach(input => {
        input.addEventListener('input', handleSearch);
    });
    
    const printButtons = document.querySelectorAll('.btn-print');
    printButtons.forEach(btn => {
        btn.addEventListener('click', handlePrint);
    });
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(e);
            
            tabButtons.forEach(b => {
                b.classList.remove('bg-blue-600', 'text-white');
                b.classList.add('text-gray-700');
            });
            btn.classList.add('bg-blue-600', 'text-white');
            btn.classList.remove('text-gray-700');
        });
    });
    
    const btnMail = document.getElementById('btn-mail');
    if (btnMail) {
        btnMail.addEventListener('click', handleMailClick);
    }
}

// Gestion du formulaire
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: document.getElementById('dossier-id').value || state.nextId,
        nom: formatNomDossier(document.getElementById('nom-dossier').value),
        dateArrivee: document.getElementById('date-arrivee').value,
        etat: document.getElementById('etat-dossier').value,
        dateFin: document.getElementById('date-fin').value || null,
        nbEcritures: document.getElementById('nb-ecritures').value || null,
        piecesSaisies: Array.from(document.querySelectorAll('input[name="pieces-saisies"]:checked')).map(cb => cb.value),
        piecesManquantes: Array.from(document.querySelectorAll('input[name="pieces-manquantes"]:checked')).map(cb => cb.value),
        autresDetail: document.getElementById('autres-detail').value || null,
        remarque: document.getElementById('remarque').value || null
    };
    
    if (!validateForm(formData)) return;
    
    if (formData.id === state.nextId) {
        state.dossiers.push(formData);
        state.nextId++;
    } else {
        const index = state.dossiers.findIndex(d => d.id === parseInt(formData.id));
        if (index !== -1) {
            state.dossiers[index] = formData;
        }
    }
    
    saveState();
    refreshAllViews();
    resetForm();
}

// Validation du formulaire
function validateForm(data) {
    if (!data.nom || !data.dateArrivee || !data.etat) {
        alert('Veuillez remplir tous les champs obligatoires');
        return false;
    }
    
    if (data.etat === 'Terminé' && (!data.dateFin || !data.nbEcritures)) {
        alert('Pour un dossier terminé, la date de fin et le nombre d\'écritures sont obligatoires');
        return false;
    }
    
    return true;
}

// Formatage du nom de dossier
function formatNomDossier(nom) {
    return nom
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Toggle des champs conditionnels
function toggleConditionalFields() {
    const etat = document.getElementById('etat-dossier').value;
    const dateFinGroup = document.getElementById('date-fin-group');
    const nbEcrituresGroup = document.getElementById('nb-ecritures-group');
    
    if (etat === 'Terminé') {
        dateFinGroup.classList.remove('hidden');
        nbEcrituresGroup.classList.remove('hidden');
        document.getElementById('date-fin').required = true;
        document.getElementById('nb-ecritures').required = true;
    } else {
        dateFinGroup.classList.add('hidden');
        nbEcrituresGroup.classList.add('hidden');
        document.getElementById('date-fin').required = false;
        document.getElementById('nb-ecritures').required = false;
    }
}

// Toggle du champ "autres à détailler"
function toggleAutresDetail() {
    const autresDetailGroup = document.getElementById('autres-detail-group');
    const autresDetailCheck = document.getElementById('autres-detail-check');
    
    if (autresDetailCheck.checked) {
        autresDetailGroup.classList.remove('hidden');
    } else {
        autresDetailGroup.classList.add('hidden');
        document.getElementById('autres-detail').value = '';
    }
}

// Gestion de la recherche
function handleSearch() {
    const searchNom = document.getElementById('search-nom').value.toLowerCase();
    const dateDebut = document.getElementById('search-date-debut').value;
    const dateFin = document.getElementById('search-date-fin').value;
    
    const filteredDossiers = state.dossiers.filter(dossier => {
        const matchNom = !searchNom || dossier.nom.toLowerCase().includes(searchNom);
        const matchDate = (!dateDebut || dossier.dateArrivee >= dateDebut) &&
                         (!dateFin || dossier.dateArrivee <= dateFin);
        return matchNom && matchDate;
    });
    
    refreshDossiersList(filteredDossiers);
}

// Toggle du panneau de recherche
function toggleSearchPanel() {
    const searchPanel = document.getElementById('search-panel');
    searchPanel.classList.toggle('hidden');
}

// Gestion de l'impression
function handlePrint() {
    window.print();
}

// Changement d'onglet dans la section États
function switchTab(e) {
    const targetId = e.target.closest('button').id.replace('btn-', 'tab-');
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.closest('button').classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('active');
    });
    
    const targetContent = document.getElementById(targetId);
    if (targetContent) {
        targetContent.classList.remove('hidden');
        targetContent.classList.add('active');
    }
    
    refreshEtatsView();
}

// Gestion du mail
function handleMailClick() {
    if (state.dossiers.length === 0) {
        alert('Aucun dossier à envoyer');
        return;
    }
    
    const mailBody = formatMailBody(state.dossiers);
    const mailtoLink = `mailto:?subject=La Gestiona - État des dossiers&body=${encodeURIComponent(mailBody)}`;
    window.location.href = mailtoLink;
}

// Formatage du corps du mail
function formatMailBody(dossiers) {
    return dossiers.map(d => `
Dossier: ${d.nom}
Date d'arrivée: ${formatDate(d.dateArrivee)}
État: ${d.etat}
${d.etat === 'Terminé' ? `Date de fin: ${formatDate(d.dateFin)}
Nombre d'écritures: ${d.nbEcritures}` : ''}
${d.piecesSaisies.length > 0 ? `Pièces saisies: ${d.piecesSaisies.join(', ')}` : ''}
${d.piecesManquantes.length > 0 ? `Pièces manquantes: ${d.piecesManquantes.join(', ')}` : ''}
${d.remarque ? `Remarque: ${d.remarque}` : ''}
-------------------
`).join('\n');
}

// Rafraîchissement des vues
function refreshAllViews() {
    refreshDossiersList(state.dossiers);
    refreshModifierList();
    refreshSupprimerList();
    refreshEtatsView();
}

function refreshCurrentView() {
    switch (state.currentSection) {
        case 'section-dossiers':
            refreshDossiersList(state.dossiers);
            break;
        case 'section-modifier':
            refreshModifierList();
            break;
        case 'section-supprimer':
            refreshSupprimerList();
            break;
        case 'section-etats':
            refreshEtatsView();
            break;
    }
}

// Rafraîchissement de la liste des dossiers
function refreshDossiersList(dossiers) {
    const container = document.getElementById('dossiers-list');
    if (!container) return;
    
    container.innerHTML = dossiers.map(dossier => `
        <div class="dossier-card bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4">
            <h3 class="font-medium">${dossier.nom}</h3>
            <p class="text-sm text-gray-600">Arrivée: ${formatDate(dossier.dateArrivee)}</p>
            <p class="text-sm ${getEtatColor(dossier.etat)}">${dossier.etat}</p>
            ${dossier.etat === 'Terminé' ? `
                <p class="text-sm text-gray-600">Fin: ${formatDate(dossier.dateFin)}</p>
                <p class="text-sm text-gray-600">Écritures: ${dossier.nbEcritures}</p>
            ` : ''}
            <div class="mt-2 flex justify-end space-x-2">
                <button onclick="handleModifier(${dossier.id})" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="handleSupprimer(${dossier.id})" class="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Rafraîchissement de la liste de modification
function refreshModifierList() {
    const container = document.getElementById('modifier-list');
    if (!container) return;
    
    container.innerHTML = state.dossiers.map(dossier => `
        <div class="dossier-card bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4">
            <h3 class="font-medium">${dossier.nom}</h3>
            <p class="text-sm text-gray-600">Arrivée: ${formatDate(dossier.dateArrivee)}</p>
            <button onclick="handleModifier(${dossier.id})" class="mt-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-2">
                <i class="fas fa-edit"></i> <span>Modifier</span>
            </button>
        </div>
    `).join('');
}

// Rafraîchissement de la liste de suppression
function refreshSupprimerList() {
    const container = document.getElementById('supprimer-list');
    if (!container) return;
    
    container.innerHTML = state.dossiers.map(dossier => `
        <div class="dossier-card bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-4">
            <h3 class="font-medium">${dossier.nom}</h3>
            <p class="text-sm text-gray-600">Arrivée: ${formatDate(dossier.dateArrivee)}</p>
            <button onclick="handleSupprimer(${dossier.id})" class="mt-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2">
                <i class="fas fa-trash"></i> <span>Supprimer</span>
            </button>
        </div>
    `).join('');
}

// Rafraîchissement des états
function refreshEtatsView() {
    refreshDossiersTraites();
    refreshPiecesManquantes();
    refreshEcrituresTotal();
}

// Rafraîchissement des dossiers traités
function refreshDossiersTraites() {
    const container = document.getElementById('traites-body');
    if (!container) return;
    
    const dossierstraites = state.dossiers.filter(d => d.etat === 'Terminé');
    container.innerHTML = dossierstraites.map(dossier => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">${formatDate(dossier.dateArrivee)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${dossier.nom}</td>
            <td class="px-6 py-4 whitespace-nowrap">${dossier.nbEcritures}</td>
        </tr>
    `).join('');
}

// Rafraîchissement des pièces manquantes
function refreshPiecesManquantes() {
    const container = document.getElementById('manquants-body');
    if (!container) return;
    
    const dossiersManquants = state.dossiers.filter(d => d.piecesManquantes.length > 0);
    container.innerHTML = dossiersManquants.map(dossier => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">${formatDate(dossier.dateArrivee)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${dossier.nom}</td>
            <td class="px-6 py-4 whitespace-nowrap">${formatPiecesManquantes(dossier.piecesManquantes, dossier.autresDetail)}</td>
        </tr>
    `).join('');
}

// Rafraîchissement du total des écritures
function refreshEcrituresTotal() {
    const container = document.getElementById('ecritures-body');
    const totalContainer = document.getElementById('total-general');
    if (!container || !totalContainer) return;
    
    const dossiersTermines = state.dossiers.filter(d => d.etat === 'Terminé');
    const groupedDossiers = groupBy(dossiersTermines, 'nom');
    
    let totalGeneral = 0;
    container.innerHTML = Object.entries(groupedDossiers).map(([nom, dossiers]) => {
        const total = dossiers.reduce((sum, d) => sum + parseInt(d.nbEcritures || 0), 0);
        totalGeneral += total;
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">${nom}</td>
                <td class="px-6 py-4 whitespace-nowrap">${total}</td>
            </tr>
        `;
    }).join('');
    
    totalContainer.textContent = totalGeneral;
}

// Fonctions utilitaires
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
}

function formatPiecesManquantes(pieces, autres) {
    let formatted = pieces.filter(p => p !== 'autres').join(', ');
    if (autres) {
        formatted += formatted ? `, ${autres}` : autres;
    }
    return formatted;
}

function getEtatColor(etat) {
    switch (etat) {
        case 'En cours':
            return 'text-blue-600';
        case 'En attente':
            return 'text-yellow-600';
        case 'Terminé':
            return 'text-green-600';
        default:
            return 'text-gray-600';
    }
}

function groupBy(array, key) {
    return array.reduce((result, item) => {
        (result[item[key]] = result[item[key]] || []).push(item);
        return result;
    }, {});
}

// Sauvegarde de l'état
function saveState() {
    localStorage.setItem('dossiers', JSON.stringify(state.dossiers));
    localStorage.setItem('nextId', state.nextId.toString());
}

// Réinitialisation du formulaire
function resetForm() {
    document.getElementById('form-ajout').reset();
    document.getElementById('dossier-id').value = '';
    toggleConditionalFields();
    toggleAutresDetail();
}

// Handlers globaux
window.handleModifier = function(id) {
    const dossier = state.dossiers.find(d => d.id === id);
    if (!dossier) return;
    
    document.getElementById('dossier-id').value = dossier.id;
    document.getElementById('nom-dossier').value = dossier.nom;
    document.getElementById('date-arrivee').value = dossier.dateArrivee;
    document.getElementById('etat-dossier').value = dossier.etat;
    document.getElementById('date-fin').value = dossier.dateFin || '';
    document.getElementById('nb-ecritures').value = dossier.nbEcritures || '';
    document.getElementById('remarque').value = dossier.remarque || '';
    
    document.querySelectorAll('input[name="pieces-saisies"]').forEach(cb => {
        cb.checked = dossier.piecesSaisies.includes(cb.value);
    });
    
    document.querySelectorAll('input[name="pieces-manquantes"]').forEach(cb => {
        cb.checked = dossier.piecesManquantes.includes(cb.value);
    });
    
    if (dossier.autresDetail) {
        document.getElementById('autres-detail-check').checked = true;
        document.getElementById('autres-detail').value = dossier.autresDetail;
    }
    
    toggleConditionalFields();
    toggleAutresDetail();
    
    switchSection('section-ajouter');
};

window.handleSupprimer = function(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) {
        state.dossiers = state.dossiers.filter(d => d.id !== id);
        saveState();
        refreshAllViews();
    }
};
