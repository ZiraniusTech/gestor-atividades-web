// lgpd.js - Lógica para a view de consulta à LGPD

import { getAppData } from './data.js';

let currentSectionData = null; 

export function initLgpd() {
    const selectMain = document.getElementById('lgpd-select-main');
    const selectLevel2 = document.getElementById('lgpd-select-level2');
    const selectLevel3 = document.getElementById('lgpd-select-level3');
    const printButton = document.getElementById('printLgpdButton');
    
    if (selectMain && selectLevel2 && selectLevel3) {
        populateMainSelect();
        selectMain.addEventListener('change', handleMainSelection);
        selectLevel2.addEventListener('change', handleLevel2Selection);
        selectLevel3.addEventListener('change', handleLevel3Selection);
        printButton.addEventListener('click', handleLgpdPrint);
    }
}

async function loadStandaloneContent(filePath) {
    const contentDisplay = document.getElementById('lgpd-content-display');
    const printButton = document.getElementById('printLgpdButton');
    try {
        contentDisplay.innerHTML = '<p class="text-gray-500">A carregar conteúdo...</p>';
        const htmlContent = await window.electronAPI.getNllcContent(filePath); // Reutiliza o IPC handler
        contentDisplay.innerHTML = htmlContent;
        printButton.classList.remove('hidden');
    } catch (error) {
        console.error(`Erro ao carregar conteúdo de ${filePath}:`, error);
        contentDisplay.innerHTML = '<p class="text-red-500">Falha ao carregar o conteúdo solicitado.</p>';
        printButton.classList.add('hidden');
    }
}

function populateMainSelect() {
    const { lgpd } = getAppData();
    const selectMain = document.getElementById('lgpd-select-main');
    selectMain.innerHTML = '<option value="">-- Selecione a área --</option>';
    
    if (lgpd.sobre) selectMain.add(new Option(lgpd.sobre.title, 'sobre'));
    if (lgpd.perguntas) selectMain.add(new Option(lgpd.perguntas.title, 'perguntas'));
}

function handleMainSelection(event) {
    const selectedValue = event.target.value;
    const { lgpd } = getAppData();
    resetUI(true, true, true);
    
    if (selectedValue === 'sobre' || selectedValue === 'perguntas') {
        currentSectionData = lgpd[selectedValue]?.content;
        if (currentSectionData && currentSectionData.length > 0) {
            populateLevel2Select(currentSectionData);
            document.getElementById('lgpd-level2-container').classList.remove('hidden');
        }
    }
}

function populateLevel2Select(data) {
    const selectLevel2 = document.getElementById('lgpd-select-level2');
    selectLevel2.innerHTML = '<option value="">-- Selecione o Título/Tema --</option>';
    if (data) {
        data.forEach((item, index) => {
            selectLevel2.add(new Option(item.title, index.toString()));
        });
    }
}

function handleLevel2Selection(event) {
    const selectedTitleIndex = event.target.value;
    resetUI(false, true, true); 

    if (selectedTitleIndex !== "" && currentSectionData) {
        const selectedTitleData = currentSectionData[selectedTitleIndex];
        const subItems = selectedTitleData.chapters || selectedTitleData.questions;
        
        if (subItems && subItems.length > 0) {
            populateLevel3Select(subItems);
            document.getElementById('lgpd-level3-container').classList.remove('hidden');
        }
    }
}

function populateLevel3Select(data) {
    const selectLevel3 = document.getElementById('lgpd-select-level3');
    const label = document.querySelector('label[for="lgpd-select-level3"]');
    
    label.textContent = data[0]?.filePath ? 'Selecione o Capítulo:' : 'Selecione a Pergunta:';
    selectLevel3.innerHTML = `<option value="">-- Selecione uma opção --</option>`;

    if (data) {
        data.forEach((item, index) => {
            selectLevel3.add(new Option(item.title, index.toString()));
        });
    }
}

async function handleLevel3Selection(event) {
    const selectedItemIndex = event.target.value;
    const selectedTitleIndex = document.getElementById('lgpd-select-level2').value;
    const contentDisplay = document.getElementById('lgpd-content-display');
    const printButton = document.getElementById('printLgpdButton');
    
    resetUI(false, false, true); 

    if (selectedItemIndex !== "" && currentSectionData && selectedTitleIndex !== "") {
        const selectedTitleData = currentSectionData[selectedTitleIndex];
        const subItems = selectedTitleData.chapters || selectedTitleData.questions;
        const selectedItem = subItems[selectedItemIndex];
        
        if (selectedItem) {
            if (selectedItem.filePath) {
                await loadStandaloneContent(selectedItem.filePath);
            } else if (selectedItem.answer) {
                contentDisplay.innerHTML = `<p>${selectedItem.answer}</p>`;
                printButton.classList.add('hidden'); // Esconde o botão para P&R
            }
        }
    }
}

function resetUI(level2, level3, content) {
    if (level2) document.getElementById('lgpd-level2-container').classList.add('hidden');
    if (level3) document.getElementById('lgpd-level3-container').classList.add('hidden');
    if (content) {
        document.getElementById('lgpd-content-display').innerHTML = '<p class="text-gray-500">Selecione uma opção nos menus para exibir o conteúdo aqui.</p>';
        document.getElementById('printLgpdButton').classList.add('hidden');
    }
}

function handleLgpdPrint() {
    const contentToPrint = document.getElementById('lgpd-content-display').innerHTML;
    const printSection = document.getElementById('print-section');
    
    const mainTitle = document.getElementById('lgpd-select-main').selectedOptions[0].text;
    const level2Title = document.getElementById('lgpd-select-level2').selectedOptions[0].text;
    
    printSection.innerHTML = `
        <div class="print-container">
            <h1 class="print-title">${mainTitle}</h1>
            <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">${level2Title}</h2>
            <hr>
            <div class="prose max-w-none mt-4">${contentToPrint}</div>
            <p class="print-footer" style="margin-top: 2rem;">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
    `;
    window.electronAPI.print(printSection.innerHTML);
}