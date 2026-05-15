async function consultarIA() {
  const cabelo    = document.getElementById('cabelo').value.trim();
  const orcamento = document.getElementById('orcamento').value.trim();
  const btnText   = document.getElementById('btn-text');
  const btnLoad   = document.getElementById('btn-loading');
  const btn       = document.getElementById('btn-consultar');
  const erroEl    = document.getElementById('erro-msg');
  const resultWrap= document.getElementById('resultado-wrapper');
  const resultEl  = document.getElementById('resultado');

  // Limpa estado anterior
  erroEl.classList.add('hidden');
  erroEl.textContent = '';
  resultWrap.style.display = 'none';
  resultEl.textContent = '';

  // Validação
  if (!cabelo) {
    mostrarErro('Por favor, descreva seu tipo de cabelo antes de consultar.');
    return;
  }
  if (!orcamento || Number(orcamento) <= 0) {
    mostrarErro('Por favor, informe um orçamento válido maior que zero.');
    return;
  }

  // Estado de loading
  btn.disabled = true;
  btnText.classList.add('hidden');
  btnLoad.classList.remove('hidden');

  try {
    const response = await fetch('http://localhost:5000/consultar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cabelo, orcamento: Number(orcamento) })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.erro || `Erro ${response.status} do servidor.`);
    }

    const data = await response.json();
    resultEl.textContent = data.recomendacao;
    resultWrap.style.display = 'block';

  } catch (e) {
    if (e.message.includes('Failed to fetch')) {
      mostrarErro('Não foi possível conectar ao servidor Python. Certifique-se de que o app.py está rodando na porta 5000.');
    } else {
      mostrarErro(e.message);
    }
  } finally {
    btn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoad.classList.add('hidden');
  }
}

function mostrarErro(msg) {
  const erroEl = document.getElementById('erro-msg');
  erroEl.textContent = '⚠️ ' + msg;
  erroEl.classList.remove('hidden');
}