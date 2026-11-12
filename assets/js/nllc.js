// nllc.js - Lógica para a view de consulta à NLLC 14133

import { getAppData } from './data.js';

let currentSectionData = null; // Armazena os dados da seção ('sobre' ou 'perguntas')

/**
 * Inicializa os componentes e listeners da view NLLC.
 */
export function initNllc() {
    const selectMain = document.getElementById('nllc-select-main');
    const selectLevel2 = document.getElementById('nllc-select-level2');
    const selectLevel3 = document.getElementById('nllc-select-level3');
    const printButton = document.getElementById('printNllcButton');
    
    if (selectMain && selectLevel2 && selectLevel3) {
        populateMainSelect();
        selectMain.addEventListener('change', handleMainSelection);
        selectLevel2.addEventListener('change', handleLevel2Selection);
        selectLevel3.addEventListener('change', handleLevel3Selection);
        printButton.addEventListener('click', handleNllcPrint);
    } else {
        console.error("Não foi possível encontrar os elementos 'select' da view NLLC.");
    }
}

/**
 * NOVO: Carrega um conteúdo standalone (como as Referências)
 * @param {string} filePath - O caminho do ficheiro a carregar.
 */
async function loadStandaloneContent(filePath) {
    const contentDisplay = document.getElementById('nllc-content-display');
    const printButton = document.getElementById('printNllcButton');
    
    try {
        contentDisplay.innerHTML = '<p class="text-gray-500">A carregar conteúdo...</p>';
        const htmlContent = await window.electronAPI.getNllcContent(filePath);
        contentDisplay.innerHTML = htmlContent;
        printButton.classList.remove('hidden'); // Mostra o botão de imprimir
    } catch (error) {
        console.error(`Erro ao carregar conteúdo de ${filePath}:`, error);
        contentDisplay.innerHTML = '<p class="text-red-500">Falha ao carregar o conteúdo solicitado.</p>';
        printButton.classList.add('hidden');
    }
}


function populateMainSelect() {
    const { nllc } = getAppData();
    const selectMain = document.getElementById('nllc-select-main');
    selectMain.innerHTML = '<option value="">-- Selecione a área --</option>';
    
    if (nllc.sobre && nllc.sobre.title) {
        selectMain.add(new Option(nllc.sobre.title, 'sobre'));
    }
    if (nllc.perguntas && nllc.perguntas.title) {
        selectMain.add(new Option(nllc.perguntas.title, 'perguntas'));
    }
    // NOVO: Adiciona a opção de Referências ao menu
    selectMain.add(new Option('Referências Bibliográficas', 'referencias'));
}

function handleMainSelection(event) {
    const selectedValue = event.target.value;
    const { nllc } = getAppData();
    
    resetUI(true, true, true); // Reseta toda a UI primeiro

    // LÓGICA ATUALIZADA para lidar com as 3 opções
    if (selectedValue === 'sobre' || selectedValue === 'perguntas') {
        currentSectionData = nllc[selectedValue]?.content;
        if (currentSectionData && currentSectionData.length > 0) {
            populateLevel2Select(currentSectionData);
            document.getElementById('nllc-level2-container').classList.remove('hidden');
        }
    } else if (selectedValue === 'referencias') {
        loadStandaloneContent('nllc/referencias.html');
    }
}

function populateLevel2Select(data) {
    const selectLevel2 = document.getElementById('nllc-select-level2');
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
            document.getElementById('nllc-level3-container').classList.remove('hidden');
        } else {
            document.getElementById('nllc-content-display').innerHTML = `<p class="text-gray-500">Este item não possui conteúdo detalhado disponível.</p>`;
        }
    }
}

function populateLevel3Select(data) {
    const selectLevel3 = document.getElementById('nllc-select-level3');
    const label = document.querySelector('label[for="nllc-select-level3"]');
    
    const isChapter = data[0]?.filePath;
    label.textContent = isChapter ? 'Selecione o Capítulo:' : 'Selecione a Pergunta:';
    selectLevel3.innerHTML = `<option value="">-- Selecione uma opção --</option>`;

    if (data) {
        data.forEach((item, index) => {
            selectLevel3.add(new Option(item.title, index.toString()));
        });
    }
}

async function handleLevel3Selection(event) {
    const selectedItemIndex = event.target.value;
    const selectedTitleIndex = document.getElementById('nllc-select-level2').value;
    const contentDisplay = document.getElementById('nllc-content-display');
    const printButton = document.getElementById('printNllcButton');
    
    resetUI(false, false, true); 

    if (selectedItemIndex !== "" && currentSectionData && selectedTitleIndex !== "") {
        const selectedTitleData = currentSectionData[selectedTitleIndex];
        const subItems = selectedTitleData.chapters || selectedTitleData.questions;
        const selectedItem = subItems[selectedItemIndex];
        
        if (selectedItem) {
            if (selectedItem.filePath) {
                try {
                    contentDisplay.innerHTML = '<p class="text-gray-500">A carregar conteúdo...</p>';
                    const htmlContent = await window.electronAPI.getNllcContent(selectedItem.filePath);
                    contentDisplay.innerHTML = htmlContent;
                    printButton.classList.remove('hidden');
                } catch (error) {
                    console.error('Erro ao carregar conteúdo NLLC:', error);
                    contentDisplay.innerHTML = '<p class="text-red-500">Falha ao carregar o conteúdo solicitado.</p>';
                }
            } else if (selectedItem.answer) {
                contentDisplay.innerHTML = `<p>${selectedItem.answer}</p>`;
            } else {
                 contentDisplay.innerHTML = '<p class="text-gray-500">Nenhum conteúdo detalhado para este item.</p>';
            }
        }
    }
}

function resetUI(level2, level3, content) {
    if (level2) {
        document.getElementById('nllc-level2-container').classList.add('hidden');
        document.getElementById('nllc-select-level2').innerHTML = '';
    }
    if (level3) {
        document.getElementById('nllc-level3-container').classList.add('hidden');
        document.getElementById('nllc-select-level3').innerHTML = '';
    }
    if (content) {
        document.getElementById('nllc-content-display').innerHTML = '<p class="text-gray-500">Selecione uma opção nos menus para exibir o conteúdo aqui.</p>';
        document.getElementById('printNllcButton').classList.add('hidden'); 
    }
}

function handleNllcPrint() {
    const contentToPrint = document.getElementById('nllc-content-display').innerHTML;
    const printSection = document.getElementById('print-section');
    
    const mainSelect = document.getElementById('nllc-select-main');
    const mainTitle = mainSelect.selectedOptions[0].text;
    
    let subTitle = '';
    if (mainSelect.value !== 'referencias') {
        subTitle = `<h2 style="font-size: 1.2rem; margin-bottom: 1rem;">${document.getElementById('nllc-select-level2').selectedOptions[0].text}</h2><hr>`;
    }
    
    printSection.innerHTML = `
        <div class="print-container">
            <h1 class="print-title">${mainTitle}</h1>
            ${subTitle}
            <div class="prose max-w-none mt-4">${contentToPrint}</div>
            <p class="print-footer" style="margin-top: 2rem;">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
    `;

    window.electronAPI.print(printSection.innerHTML);
}