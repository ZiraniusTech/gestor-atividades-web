// app.js - Ponto de entrada principal do Frontend

import { loadData } from './data.js';
import { initNavigation } from './navigation.js';

/**
 * Função principal de inicialização da aplicação.
 * É chamada assim que o DOM está pronto.
 */
async function main() {
    // 1. Carrega os dados da aplicação (de data.json) para a memória.
    await loadData();
    
    // 2. Inicializa o sistema de navegação.
    // Isso adiciona os listeners aos botões da sidebar e carrega a view inicial (Dashboard).
    initNavigation();
}

// Inicia a aplicação quando o conteúdo da página estiver carregado.
document.addEventListener('DOMContentLoaded', main);
