export interface ToastAction {
  text: string;
  onClick: () => void;
}

let toastTimeout: number | undefined;

export function showToast(message: string, action?: ToastAction) {
  let toast = document.querySelector('.toast') as HTMLElement;
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = '';

  const textSpan = document.createElement('span');
  textSpan.className = 'toast-message';
  textSpan.textContent = message;
  toast.appendChild(textSpan);

  if (action) {
    const actionBtn = document.createElement('button');
    actionBtn.className = 'toast-action-btn';
    actionBtn.textContent = action.text;
    actionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      action.onClick();
      toast.classList.remove('show');
    });
    toast.appendChild(actionBtn);
  }

  toast.classList.add('show');

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = window.setTimeout(() => {
    toast.classList.remove('show');
  }, action ? 4500 : 2500);
}
