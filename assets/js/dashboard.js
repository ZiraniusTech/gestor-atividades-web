// dashboard.js - Lógica para a view do Dashboard.

import { getAppData } from './data.js';
import { navigateTo } from './navigation.js';

let clockIntervalId = null;
let nllcQaIntervalId = null; // ID do intervalo para as Perguntas da NLLC
let lgpdQaIntervalId = null;  // NOVO: ID do intervalo para as Perguntas da LGPD

// --- Lógica para Dica Rápida da NLLC ---
function getAllNllcQuestions() {
    const { nllc } = getAppData();
    if (!nllc || !nllc.perguntas || !nllc.perguntas.content) return [];
    return nllc.perguntas.content.flatMap(tema => tema.questions);
}

function displayRandomNllcQuestion() {
    const questionTextElement = document.getElementById('randomNllcQuestionText');
    const answerTextElement = document.getElementById('randomNllcAnswerText');
    if (!questionTextElement || !answerTextElement) return;

    const allQuestions = getAllNllcQuestions();
    if (allQuestions.length === 0) {
        questionTextElement.textContent = 'Nenhuma pergunta da NLLC encontrada.';
        return;
    }

    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    const randomQA = allQuestions[randomIndex];
    questionTextElement.textContent = randomQA.title;
    answerTextElement.textContent = randomQA.answer;
}

// --- NOVO: Lógica para Dica Rápida da LGPD ---
function getAllLgpdQuestions() {
    const { lgpd } = getAppData();
    if (!lgpd || !lgpd.perguntas || !lgpd.perguntas.content) return [];
    return lgpd.perguntas.content.flatMap(tema => tema.questions);
}

function displayRandomLgpdQuestion() {
    const questionTextElement = document.getElementById('randomLgpdQuestionText');
    const answerTextElement = document.getElementById('randomLgpdAnswerText');
    if (!questionTextElement || !answerTextElement) return;

    const allQuestions = getAllLgpdQuestions();
    if (allQuestions.length === 0) {
        questionTextElement.textContent = 'Nenhuma pergunta da LGPD encontrada.';
        answerTextElement.textContent = 'Adicione perguntas no ficheiro main.js para esta funcionalidade aparecer.';
        return;
    }

    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    const randomQA = allQuestions[randomIndex];
    questionTextElement.textContent = randomQA.title;
    answerTextElement.textContent = randomQA.answer;
}


/**
 * Inicializa os componentes e listeners do Dashboard.
 */
export function initDashboard() {
    document.querySelectorAll('#dashboardView .sidebar-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.view);
        });
    });
    
    // Limpa intervalos anteriores para evitar múltiplos timers
    if (clockIntervalId) clearInterval(clockIntervalId);
    if (nllcQaIntervalId) clearInterval(nllcQaIntervalId);
    if (lgpdQaIntervalId) clearInterval(lgpdQaIntervalId);

    // Inicia e gere o relógio
    updateDateTime();
    clockIntervalId = setInterval(updateDateTime, 1000);
    
    // Inicia e gere a lista de próximos compromissos
    renderProximosCompromissos();

    // Inicia e gere os tiles de Dicas Rápidas
    const CINCO_MINUTOS = 5 * 60 * 1000;
    
    // Dica da NLLC
    displayRandomNllcQuestion();
    nllcQaIntervalId = setInterval(displayRandomNllcQuestion, CINCO_MINUTOS);
    
    // Dica da LGPD
    displayRandomLgpdQuestion();
    lgpdQaIntervalId = setInterval(displayRandomLgpdQuestion, CINCO_MINUTOS);
}

/**
 * Atualiza a data e a hora no ecrã.
 */
function updateDateTime() {
    const timeDisplay = document.getElementById('timeDisplay');
    const dateDisplay = document.getElementById('dateDisplay');
    if (!timeDisplay || !dateDisplay) return;

    const agora = new Date();
    timeDisplay.textContent = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    dateDisplay.textContent = agora.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Renderiza a lista de próximos compromissos no card do Dashboard.
 */
function renderProximosCompromissos() {
    const listContainer = document.getElementById('proximosCompromissosList');
    if (!listContainer) return;

    const { compromissos } = getAppData();
    const agora = new Date();
    const limiteProximos = 72 * 60 * 60 * 1000; // 72 horas

    const proximos = compromissos.filter(comp => {
        const dataHoraCompromisso = new Date(`${comp.data}T${comp.hora || '00:00'}`);
        const diff = dataHoraCompromisso.getTime() - agora.getTime();
        return diff > 0 && diff <= limiteProximos;
    }).sort((a, b) => new Date(`${a.data}T${a.hora || '00:00'}`) - new Date(`${b.data}T${b.hora || '00:00'}`));

    listContainer.innerHTML = '';
    if (proximos.length === 0) {
        listContainer.innerHTML = '<p class="text-gray-500">Nenhum compromisso para as próximas 72h.</p>';
    } else {
        proximos.slice(0, 3).forEach(comp => {
            const item = document.createElement('div');
            item.className = `compromisso-item compromisso-${comp.assunto} p-2 rounded`;
            item.innerHTML = `
                <strong class="capitalize">${comp.assunto.replace(/_/g, ' ')}</strong> - 
                ${new Date(comp.data + 'T00:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})} às ${comp.hora}
                ${comp.descricao ? `<p class="text-xs text-gray-400 truncate">${comp.descricao}</p>` : ''}
            `;
            listContainer.appendChild(item);
        });
    }
}