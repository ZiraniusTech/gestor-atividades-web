// calculator.js - Lógica para a view da Calculadora de Diárias.

import { getAppData } from './data.js';
import { showToast } from './ui.js';

/**
 * Inicializa os componentes e listeners da Calculadora.
 */
export function initCalculator() {
    populateCalculatorDropdowns();
    document.getElementById('calculateButton').addEventListener('click', calculateAndDisplayDiarias);
    document.getElementById('newCalculationButton').addEventListener('click', resetCalculatorForm);
    document.getElementById('printButton').addEventListener('click', handlePrint);
}

function populateCalculatorDropdowns() {
    const { dadosDiarias } = getAppData();
    const selectDestino = document.getElementById('selectDestino');
    const selectCargo = document.getElementById('selectCargo');
    if (!selectDestino || !selectCargo) return;

    selectDestino.innerHTML = '';
    selectCargo.innerHTML = '';
    
    const destinos = Object.keys(dadosDiarias);
    destinos.forEach(destino => {
        selectDestino.add(new Option(destino, destino));
    });

    if (destinos.length > 0) {
        const cargos = Object.keys(dadosDiarias[destinos[0]]);
        cargos.forEach(cargo => {
            selectCargo.add(new Option(cargo, cargo));
        });
    }
}

function calculateAndDisplayDiarias() {
    const { dadosDiarias, settings } = getAppData();
    const depDateStr = document.getElementById('departureDate').value;
    const depTimeStr = document.getElementById('departureTime').value;
    const retDateStr = document.getElementById('returnDate').value;
    const retTimeStr = document.getElementById('returnTime').value;
    const destino = document.getElementById('selectDestino').value;
    const cargo = document.getElementById('selectCargo').value;

    if (!depDateStr || !depTimeStr || !retDateStr || !retTimeStr || !destino || !cargo) {
        showToast('Por favor, preencha todos os campos.', 'error');
        return;
    }

    const valorDiariaCompleta = dadosDiarias[destino]?.[cargo];
    if (typeof valorDiariaCompleta === 'undefined') {
        showToast('Valor não encontrado para o Destino/Cargo.', 'error');
        return;
    }
    
    const departureDate = new Date(`${depDateStr}T${depTimeStr}`);
    const returnDate = new Date(`${retDateStr}T${retTimeStr}`);

    if (isNaN(departureDate.getTime()) || isNaN(returnDate.getTime()) || returnDate <= departureDate) {
        showToast('Datas ou horas inválidas.', 'error');
        return;
    }

    const durationHours = (returnDate - departureDate) / 3600000;
    const minHours = settings.horasMinimasMeiaDiaria;
    let fullDays = 0, halfDays = 0;
    
    if (durationHours >= minHours) {
        fullDays = Math.floor(durationHours / 24);
        const remainingHours = durationHours % 24;
        if (remainingHours >= minHours) halfDays = 1;
    }
    
    const totalAllowance = (fullDays * valorDiariaCompleta) + (halfDays * (valorDiariaCompleta / 2));

    document.getElementById('departureInfo').textContent = departureDate.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    document.getElementById('returnInfo').textContent = returnDate.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    document.getElementById('totalDuration').textContent = durationHours.toFixed(2);
    document.getElementById('fullDays').textContent = fullDays;
    document.getElementById('halfDays').textContent = halfDays;
    document.getElementById('totalAllowance').textContent = totalAllowance.toFixed(2);

    document.getElementById('results').classList.remove('hidden');
}

function resetCalculatorForm() {
    document.getElementById('departureDate').value = '';
    document.getElementById('departureTime').value = '';
    document.getElementById('returnDate').value = '';
    document.getElementById('returnTime').value = '';
    document.getElementById('results').classList.add('hidden');
}

function handlePrint() {
    if (document.getElementById('results').classList.contains('hidden')) {
        showToast("Calcule as diárias para poder imprimir.", "error");
        return;
    }
    
    const printSection = document.getElementById('print-section');
    const departure = document.getElementById('departureInfo').textContent;
    const returnValue = document.getElementById('returnInfo').textContent;
    const totalAllowance = document.getElementById('totalAllowance').textContent;
    
    printSection.innerHTML = `
        <div class="print-container">
            <h1 class="print-title">Relatório de Cálculo de Diárias</h1>
            <table class="print-table">
                <tbody>
                    <tr><td>Partida:</td><td>${departure}</td></tr>
                    <tr><td>Retorno:</td><td>${returnValue}</td></tr>
                    <tr><td><strong>Valor Total:</strong></td><td><strong>R$ ${totalAllowance}</strong></td></tr>
                </tbody>
            </table>
            <p class="print-footer">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
    `;
    
    // A chamada envia o conteúdo da secção de impressão
    window.electronAPI.print(printSection.innerHTML);
}