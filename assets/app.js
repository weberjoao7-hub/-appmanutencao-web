(() => {
  'use strict';

  const menuButton = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-links');
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    menu.addEventListener('click', event => {
      if (event.target.closest('a')) {
        menu.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Abrir menu');
      }
    });
  }

  document.querySelectorAll('[data-demo-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const enabled = button.classList.toggle('is-on');
      button.setAttribute('aria-pressed', String(enabled));
      const status = button.querySelector('[data-demo-status]');
      if (status) status.textContent = enabled ? 'Ligado' : 'Desligado';
    });
  });

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const form = document.getElementById('lead-form');
  if (!form) return;
  // GitHub Pages é hospedagem estática; não possui a API nem o D1.
  // O cadastro somente poderá ser habilitado após revisão da política,
  // identificação do controlador e implantação do backend com persistência.
  const productionSignupEnabled = false;
  if (!productionSignupEnabled) {
    form.querySelectorAll('input, select, button').forEach(field => {
      field.disabled = true;
      field.setAttribute('aria-disabled', 'true');
    });
    const notice = document.getElementById('integracao-aviso');
    if (notice) notice.textContent = 'A lista de interesse ainda não está aberta. Estamos preparando a captação segura de contatos. Nenhum dado é enviado ou armazenado.';
    return;
  }

  const feedback = document.getElementById('form-feedback');
  const button = form.querySelector('button[type="submit"]');
  const label = button.querySelector('.submit-label');
  const setFeedback = (message, type) => {
    feedback.textContent = message;
    feedback.className = 'form-feedback' + (type ? ' ' + type : '');
  };

  const digitsOnly = value => (value || '').replace(/\D/g, '');
  const whatsapp = document.getElementById('whatsapp');
  whatsapp.addEventListener('input', () => {
    const digits = digitsOnly(whatsapp.value).slice(0, 13);
    // Aceita DDI 55 opcional; exibe máscara apenas para telefones brasileiros sem DDI.
    if (digits.length > 11) return;
    if (digits.length <= 2) { whatsapp.value = digits ? '(' + digits : ''; return; }
    if (digits.length <= 6) { whatsapp.value = '(' + digits.slice(0,2) + ') ' + digits.slice(2); return; }
    if (digits.length <= 10) { whatsapp.value = '(' + digits.slice(0,2) + ') ' + digits.slice(2,6) + '-' + digits.slice(6); return; }
    whatsapp.value = '(' + digits.slice(0,2) + ') ' + digits.slice(2,7) + '-' + digits.slice(7);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    setFeedback('', '');
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const phone = digitsOnly(whatsapp.value);
    const aquario = document.getElementById('aquario').value;
    const consentimento = document.getElementById('consentimento').checked;
    const site = document.getElementById('site').value;
    if (nome.length < 2 || nome.length > 80) return setFeedback('Informe seu nome (pelo menos 2 caracteres).', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return setFeedback('Confira o endereço de e-mail.', 'error');
    if (phone.length < 10 || phone.length > 13) return setFeedback('Informe um WhatsApp válido com DDD.', 'error');
    if (!consentimento) return setFeedback('É necessário autorizar o contato para entrar na lista.', 'error');
    button.disabled = true;
    label.textContent = 'Enviando inscrição…';
    try {
      const response = await fetch('/api/inscricao', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify({ nome, email, whatsapp: phone, aquario, consentimento, site })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || 'Não foi possível concluir a inscrição. Tente novamente.');
      }
      form.reset();
      setFeedback('Cadastro recebido! Você entrou na lista para receber novidades do AquaPilot Control.', 'success');
      feedback.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    } catch (error) {
      const localDemo = location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      setFeedback(localDemo ? 'A página está em modo de visualização. Para receber inscrições, publique no Cloudflare Pages e conecte o banco de dados conforme o README.' : (error.message || 'Não foi possível enviar. Tente novamente.'), 'error');
    } finally {
      button.disabled = false;
      label.textContent = 'Entrar na lista de interesse';
    }
  });
})();