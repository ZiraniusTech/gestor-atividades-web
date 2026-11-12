// data.js - Módulo para gestão de estado e comunicação de dados.

// 'appData' guardará todos os dados da aplicação em memória (configurações, compromissos, etc.).
let appData = {};

/**
 * Carrega os dados iniciais do processo principal (main.js) e armazena-os na variável local 'appData'.
 * Esta função é chamada uma vez no início da aplicação.
 */
async function loadData() {
    try {
        appData = await window.electronAPI.loadData();
        console.log('Dados carregados com sucesso:', appData);
    } catch (error) {
        console.error('Falha ao carregar os dados:', error);
        // Em caso de falha, podemos definir um estado padrão para evitar que a app quebre.
        appData = { settings: {}, dadosDiarias: {}, compromissos: [] };
    }
}

/**
 * Envia o estado atual da 'appData' para o processo principal para ser guardado no ficheiro data.json.
 * Deve ser chamada sempre que houver uma alteração nos dados que precise ser persistida.
 */
async function saveData() {
    try {
        await window.electronAPI.saveData(appData);
        console.log('Dados guardados com sucesso.');
    } catch (error) {
        console.error('Falha ao guardar os dados:', error);
    }
}

/**
 * Fornece acesso seguro ao objeto de dados da aplicação.
 * @returns {object} O objeto completo com os dados da aplicação.
 */
function getAppData() {
    return appData;
}

// Exporta as funções para que outros módulos possam usá-las.
export { loadData, saveData, getAppData };
