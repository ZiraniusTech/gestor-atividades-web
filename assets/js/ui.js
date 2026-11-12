// ui.js - Módulo para funções de interface do utilizador (modais, toasts, etc.).

/**
 * Exibe uma notificação "toast" no canto do ecrã.
 * @param {string} message - A mensagem a ser exibida.
 * @param {'success' | 'error'} type - O tipo de notificação, que define a cor.
 */
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    
    toast.className = `toast ${bgColor} text-white font-bold py-2 px-4 rounded-lg shadow-lg`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Exibe um modal de confirmação para ações destrutivas.
 * @param {string} message - A pergunta a ser exibida no modal.
 * @param {function} onConfirm - A função a ser executada se o utilizador confirmar.
 */
function showConfirmationModal(message, onConfirm) {
    const modal = document.getElementById('confirmationModal');
    const modalMessage = document.getElementById('modalMessage');
    const confirmButton = document.getElementById('modalConfirmButton');
    const cancelButton = document.getElementById('modalCancelButton');

    if (!modal || !modalMessage || !confirmButton || !cancelButton) return;

    modalMessage.textContent = message;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const confirmHandler = () => {
        onConfirm();
        hideModal();
    };

    const cancelHandler = () => {
        hideModal();
    };

    const hideModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        // Remove os listeners para evitar chamadas múltiplas
        confirmButton.removeEventListener('click', confirmHandler);
        cancelButton.removeEventListener('click', cancelHandler);
    };

    confirmButton.addEventListener('click', confirmHandler, { once: true });
    cancelButton.addEventListener('click', cancelHandler, { once: true });
}

export { showToast, showConfirmationModal };
