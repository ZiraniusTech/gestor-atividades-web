// settings.js - Lógica para a view de Configurações.

import { getAppData, saveData } from './data.js';
import { showToast, showConfirmationModal } from './ui.js';
import { navigateTo } from './navigation.js';

/**
 * Inicializa os componentes e listeners das Configurações.
 */
export function initSettings() {
    renderEditableTable();
    document.getElementById('horasMeiaDiariaSelect').value = getAppData().settings.horasMinimasMeiaDiaria;
    
    document.getElementById('saveSettingsButton').addEventListener('click', saveSettingsAction);
    document.getElementById('cancelSettingsButton').addEventListener('click', () => navigateTo('dashboard'));
    document.getElementById('restoreDefaultTableButton').addEventListener('click', restoreDefaultTableAction);
}

/**
 * Renderiza a tabela de diárias editável com os estilos corretos.
 */
function renderEditableTable() {
    const { dadosDiarias } = getAppData();
    const tableHead = document.querySelector('#editableDiariasTableInSettings thead tr');
    const tableBody = document.querySelector('#editableDiariasTableInSettings tbody');
    if (!tableHead || !tableBody) return;

    // Limpa a tabela antes de recriar
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    // Cria o cabeçalho da tabela dinamicamente
    const cargosHeader = Object.keys(dadosDiarias[Object.keys(dadosDiarias)[0]] || {});
    
    const thDestino = document.createElement('th');
    thDestino.textContent = 'Destino / Cargo';
    tableHead.appendChild(thDestino);

    cargosHeader.forEach(cargo => {
        const th = document.createElement('th');
        th.textContent = cargo;
        tableHead.appendChild(th);
    });

    // Cria as linhas da tabela
    Object.keys(dadosDiarias).forEach(destino => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = destino;
        cargosHeader.forEach(cargo => {
            const cell = row.insertCell();
            const input = document.createElement('input');
            input.type = 'number';
            input.step = '0.01';
            input.min = '0';
            // Usa a classe .input-field definida no CSS
            input.className = 'input-field !w-32 text-right'; 
            input.value = (dadosDiarias[destino]?.[cargo] || 0).toFixed(2);
            input.dataset.destino = destino;
            input.dataset.cargo = cargo;
            cell.appendChild(input);
        });
    });
}

async function saveSettingsAction() {
    const { settings, dadosDiarias } = getAppData();
    settings.horasMinimasMeiaDiaria = parseInt(document.getElementById('horasMeiaDiariaSelect').value);

    const inputs = document.querySelectorAll('#editableDiariasTableInSettings tbody input');
    let isValid = true;
    inputs.forEach(input => {
        const value = parseFloat(input.value);
        if (isNaN(value) || value < 0) {
            isValid = false;
        } else {
            dadosDiarias[input.dataset.destino][input.dataset.cargo] = value;
        }
    });

    if (!isValid) {
        showToast('Valores inválidos na tabela. Use apenas números positivos.', 'error');
        return;
    }

    await saveData();
    showToast('Configurações salvas com sucesso!', 'success');
}

function restoreDefaultTableAction() {
    showConfirmationModal('Deseja restaurar os valores padrão da tabela? As alterações não salvas serão perdidas.', async () => {
        // Para restaurar, precisamos recarregar os dados do main.js, que tem a função getDefaultData()
        // A melhor abordagem seria ter um IPC para isso, mas por simplicidade, vamos recarregar os dados
        // e re-renderizar a view.
        await window.electronAPI.loadData(); // Esta chamada precisa ser ajustada no futuro para pegar apenas os padrões
        
        // NOTA: A lógica atual de loadData não restaura o padrão se um ficheiro já existe.
        // Uma solução temporária seria ter os dados padrão no frontend também.
        const defaultDadosDiarias = {
            "Capitais de Estados": { "Prefeito e Vice Prefeito": 1100.03, "Secretários Municipais": 850.04, "Demais Servidores Públicos": 750.03 },
            "Demais Cidades": { "Prefeito e Vice Prefeito": 850.04, "Secretários Municipais": 750.03, "Demais Servidores Públicos": 650.02 },
            "Distrito Federal - Brasilia": { "Prefeito e Vice Prefeito": 1500.01, "Secretários Municipais": 1300.00, "Demais Servidores Públicos": 1000.03 }
        };
        getAppData().dadosDiarias = JSON.parse(JSON.stringify(defaultDadosDiarias));

        showToast('Tabela restaurada para os valores padrão.', 'success');
        renderEditableTable();
    });
}
