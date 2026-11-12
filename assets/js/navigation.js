// navigation.js - Módulo para gerir a navegação e renderização das views.

import { initDashboard } from './dashboard.js';
import { initCalculator } from './calculator.js';
import { initAgenda } from './agenda.js';
import { initSettings } from './settings.js';
import { initNllc } from './nllc.js';
import { initLgpd } from './lgpd.js'; // Importa a nova função

const mainContentArea = document.getElementById('main-content-area');
const sidebarItems = document.querySelectorAll('.sidebar-item');

async function navigateTo(viewId) {
    if (!viewId) return;

    try {
        const html = await window.electronAPI.getViewHtml(viewId);
        mainContentArea.innerHTML = html;

        sidebarItems.forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewId);
        });

        switch (viewId) {
            case 'dashboard':
                initDashboard();
                break;
            case 'calculator':
                initCalculator();
                break;
            case 'agenda':
                initAgenda();
                break;
            case 'nllc':
                initNllc();
                break;
            case 'lgpd': // Adiciona o case para a LGPD
                initLgpd();
                break;
            case 'ajuda':
                break;
            case 'settings':
                initSettings();
                break;
        }
    } catch (error) {
        console.error(`Erro ao navegar para a view ${viewId}:`, error);
        mainContentArea.innerHTML = `<div class="p-6 text-red-500">Ocorreu um erro ao carregar esta secção.</div>`;
    }
}

function initNavigation() {
    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = item.dataset.view;
            navigateTo(viewId);
        });
    });

    navigateTo('dashboard');
}

export { initNavigation, navigateTo };