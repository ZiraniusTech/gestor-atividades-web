// agenda.js - Lógica para a view da Agenda.

import { getAppData, saveData } from './data.js';
import { showToast, showConfirmationModal } from './ui.js';

/**
 * Inicializa os componentes e listeners da Agenda.
 */
export function initAgenda() {
    document.getElementById('salvarCompromissoButton').addEventListener('click', salvarCompromisso);
    document.getElementById('excluirSelecionadosButton').addEventListener('click', excluirCompromissosSelecionados);
    renderCompromissos();
}

async function salvarCompromisso() {
    const { compromissos } = getAppData();
    const assunto = document.getElementById('compromissoAssunto').value;
    const data = document.getElementById('compromissoData').value;
    const hora = document.getElementById('compromissoHora').value;
    const descricao = document.getElementById('compromissoDescricao').value.trim();

    if (!assunto || !data || !hora) {
        showToast("Assunto, data e hora são obrigatórios.", "error");
        return;
    }

    compromissos.push({ id: Date.now().toString(), assunto, data, hora, descricao });
    await saveData();
    
    showToast("Compromisso salvo!", "success");
    renderCompromissos();
    
    document.getElementById('compromissoData').value = '';
    document.getElementById('compromissoHora').value = '';
    document.getElementById('compromissoDescricao').value = '';
}

function renderCompromissos() {
    excluirCompromissosExpirados(false); // Apenas verifica, não salva
    const { compromissos } = getAppData();
    const container = document.getElementById('listaCompromissosContainer');
    container.innerHTML = '';

    const sorted = [...compromissos].sort((a, b) => new Date(`${a.data}T${a.hora}`) - new Date(`${b.data}T${b.hora}`));

    if (sorted.length === 0) {
        container.innerHTML = '<p class="text-gray-500">Nenhum compromisso agendado.</p>';
        document.getElementById('excluirSelecionadosButton').classList.add('hidden');
        return;
    }

    sorted.forEach(comp => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `compromisso-item compromisso-${comp.assunto} bg-white p-3 rounded-md shadow-sm flex justify-between items-center`;
        const isPast = new Date(`${comp.data}T${comp.hora}`) < new Date();
        itemDiv.innerHTML = `
            <div class="${isPast ? 'opacity-60' : ''}">
                <div class="flex items-center mb-1">
                    <input type="checkbox" data-id="${comp.id}" class="mr-2 compromisso-checkbox h-4 w-4">
                    <strong class="text-gray-800 capitalize">${comp.assunto.replace(/_/g, ' ')}</strong>
                </div>
                <p class="text-sm text-gray-600">${new Date(comp.data + 'T00:00:00').toLocaleDateString('pt-BR')} às ${comp.hora}</p>
                ${comp.descricao ? `<p class="text-xs text-gray-500 mt-1">${comp.descricao}</p>` : ''}
            </div>
        `;
        container.appendChild(itemDiv);
    });

    container.querySelectorAll('.compromisso-checkbox').forEach(cb => cb.addEventListener('change', toggleExcluirButton));
    toggleExcluirButton();
}

function toggleExcluirButton() {
    const anyChecked = Array.from(document.querySelectorAll('.compromisso-checkbox')).some(cb => cb.checked);
    document.getElementById('excluirSelecionadosButton').classList.toggle('hidden', !anyChecked);
}

function excluirCompromissosSelecionados() {
    const ids = Array.from(document.querySelectorAll('.compromisso-checkbox:checked')).map(cb => cb.dataset.id);
    if (ids.length === 0) return;

    showConfirmationModal(`Tem certeza que deseja excluir ${ids.length} compromisso(s)?`, async () => {
        let { compromissos } = getAppData();
        getAppData().compromissos = compromissos.filter(c => !ids.includes(c.id));
        await saveData();
        showToast("Compromisso(s) excluído(s).", "success");
        renderCompromissos();
    });
}

function excluirCompromissosExpirados(shouldSave = true) {
    const { compromissos } = getAppData();
    const now = new Date();
    const limit = 36 * 60 * 60 * 1000; // 36 horas
    const originalLength = compromissos.length;

    getAppData().compromissos = compromissos.filter(c => (now - new Date(`${c.data}T${c.hora}`)) < limit);

    if (shouldSave && getAppData().compromissos.length < originalLength) {
        saveData();
    }
}
