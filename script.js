// =====================================================
// Lili Cabeleireiro — Sistema Completo
// =====================================================

let agendamentos = [];
let calendar;
let itemEditando = null;

// =====================================================
// INICIAR
// =====================================================

document.addEventListener('DOMContentLoaded', function () {

  // ============================================
  // NOTIFICAÇÕES
  // ============================================

  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  // ============================================
  // CALENDÁRIO
  // ============================================

  calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {

    initialView: 'timeGridWeek',

    locale: 'pt-br',

    // TERÇA A SÁBADO
    businessHours: {
      daysOfWeek: [2, 3, 4, 5, 6],
      startTime: '08:00',
      endTime: '19:00'
    },

    // ESCONDER DOMINGO E SEGUNDA
    hiddenDays: [0, 1],

    // HORÁRIOS
    slotMinTime: '08:00:00',
    slotMaxTime: '19:00:00',

    slotDuration: '00:30:00',
    slotLabelInterval: '00:30:00',

    allDaySlot: false,

    expandRows: true,

    nowIndicator: true,

    editable: true,

    selectable: true,

    eventDurationEditable: true,

    eventStartEditable: true,

    eventColor: '#e91e63',

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },

    buttonText: {
      today: 'Hoje',
      week: 'Semana',
      day: 'Dia'
    },

    // ============================================
    // CLICAR EVENTO
    // ============================================

    eventClick: function(info) {

      const confirmar = confirm(
        'Deseja cancelar este agendamento?'
      );

      if(confirmar){
        remover(info.event.id);
      }

    },

    // ============================================
    // ARRASTAR EVENTO
    // ============================================

    eventDrop: function(info){

      const item = agendamentos.find(
        a => a.id === info.event.id
      );

      if(item){

        const novaData = info.event.start;

        item.data = novaData
          .toISOString()
          .split('T')[0];

        item.hora = novaData.toLocaleTimeString(
          'pt-BR',
          {
            hour:'2-digit',
            minute:'2-digit'
          }
        );

        salvarDados();

        atualizarLista();

        toast(
          '✨ Agendamento atualizado'
        );

        notificar(
          'Agendamento atualizado',
          item.nome + ' foi movido'
        );

      }

    },

    // ============================================
    // ALTERAR DURAÇÃO
    // ============================================

    eventResize: function(info){

      toast('⏰ Horário atualizado');

    }

  });

  calendar.render();

  carregarAgendamentos();

  // ============================================
  // FORMULÁRIO
  // ============================================

  document.getElementById('form')
    .addEventListener('submit', function(e){

      e.preventDefault();

      const nome =
        document.getElementById('nome')
        .value
        .trim();

      const data =
        document.getElementById('data')
        .value;

      const hora =
        document.getElementById('hora')
        .value;

      const servico =
        document.getElementById('servico')
        .value;

      if(!nome || !data || !hora || !servico){

        toast('⚠️ Preencha todos os campos');

        return;

      }

      // ============================================
      // VERIFICAR HORÁRIO
      // ============================================

      const ocupado = agendamentos.find(a =>
        a.data === data &&
        a.hora === hora
      );

      if(ocupado){

        toast('❌ Horário já ocupado');

        return;

      }

      const id = Date.now().toString();

      const novo = {
        id,
        nome,
        data,
        hora,
        servico
      };

      agendamentos.push(novo);

      adicionarNoCalendario(novo);

      atualizarLista();

      salvarDados();

      agendarLembrete(novo);

      toast('✅ Agendamento realizado');

      notificar(
        'Novo Agendamento',
        nome + ' - ' + servico
      );

      this.reset();

    });

  // ============================================
  // FECHAR MODAL
  // ============================================

  document.getElementById('modalOverlay')
    .addEventListener('click', function(e){

      if(e.target === this){
        fecharModal();
      }

    });

});

// =====================================================
// ADICIONAR EVENTO
// =====================================================

function adicionarNoCalendario(item){

  const inicio =
    item.data + 'T' + item.hora;

  const fim = new Date(
    new Date(inicio).getTime() + 45 * 60000
  );

  calendar.addEvent({

    id: item.id,

    title:
      item.nome +
      ' — ' +
      item.servico,

    start: inicio,

    end: fim,

    color: '#e91e63'

  });

}

// =====================================================
// ATUALIZAR LISTA
// =====================================================

function atualizarLista(){

  const lista =
    document.getElementById('lista');

  lista.innerHTML = '';

  agendamentos.forEach(item => {

    const li =
      document.createElement('li');

    li.innerHTML = `

      <div class="li-nome">
        ${item.nome}
      </div>

      <div class="li-info">
        ${formatarData(item.data)}
        às
        ${item.hora}
      </div>

      <span class="li-servico">
        ${item.servico}
      </span>

      <div class="li-acoes">

        <button
          class="btn-editar"
          onclick="abrirModal('${item.id}')">

          ✏️ Editar

        </button>

        <button
          class="btn-remover"
          onclick="remover('${item.id}')">

          ❌ Cancelar

        </button>

      </div>

    `;

    lista.appendChild(li);

  });

}

// =====================================================
// REMOVER
// =====================================================

function remover(id){

  agendamentos =
    agendamentos.filter(
      a => a.id !== id
    );

  const evento =
    calendar.getEventById(id);

  if(evento){
    evento.remove();
  }

  atualizarLista();

  salvarDados();

  toast('❌ Agendamento cancelado');

}

// =====================================================
// MODAL
// =====================================================

function abrirModal(id){

  const item =
    agendamentos.find(
      a => a.id === id
    );

  if(!item) return;

  itemEditando = id;

  document.getElementById('modalCliente')
    .textContent =
    item.nome +
    ' • ' +
    item.hora;

  document.getElementById('modalHora')
    .value =
    item.hora;

  document.getElementById('modalServico')
    .value =
    item.servico;

  document.getElementById('modalOverlay')
    .classList.add('aberto');

}

function fecharModal(){

  document.getElementById('modalOverlay')
    .classList.remove('aberto');

  itemEditando = null;

}

// =====================================================
// SALVAR EDIÇÃO
// =====================================================

function salvarEdicao(){

  if(!itemEditando) return;

  const item =
    agendamentos.find(
      a => a.id === itemEditando
    );

  if(!item) return;

  item.hora =
    document.getElementById('modalHora')
    .value;

  item.servico =
    document.getElementById('modalServico')
    .value;

  const evento =
    calendar.getEventById(item.id);

  if(evento){
    evento.remove();
  }

  adicionarNoCalendario(item);

  atualizarLista();

  salvarDados();

  fecharModal();

  toast('✨ Agendamento atualizado');

}

// =====================================================
// BUSCA
// =====================================================

function filtrarLista(){

  const termo =
    document.getElementById('busca')
    .value
    .toLowerCase();

  document.querySelectorAll('#lista li')
    .forEach(li => {

      const nome =
        li.querySelector('.li-nome')
        .textContent
        .toLowerCase();

      li.style.display =
        nome.includes(termo)
          ? ''
          : 'none';

    });

}

// =====================================================
// STORAGE
// =====================================================

function salvarDados(){

  localStorage.setItem(
    'agendamentos_lili',
    JSON.stringify(agendamentos)
  );

}

function carregarAgendamentos(){

  const dados =
    localStorage.getItem(
      'agendamentos_lili'
    );

  if(dados){

    agendamentos =
      JSON.parse(dados);

    agendamentos.forEach(item => {

      adicionarNoCalendario(item);

      agendarLembrete(item);

    });

    atualizarLista();

  }

}

// =====================================================
// NOTIFICAÇÕES
// =====================================================

function ativarNotificacao(){

  Notification.requestPermission()
    .then(p => {

      if(p === 'granted'){

        toast(
          '🔔 Notificações ativadas'
        );

      }

    });

}

function notificar(titulo, mensagem){

  if(Notification.permission === 'granted'){

    new Notification(titulo,{
      body: mensagem
    });

  }

}

// =====================================================
// LEMBRETE AUTOMÁTICO
// =====================================================

function agendarLembrete(item){

  const agora =
    new Date();

  const dataHora =
    new Date(
      item.data + 'T' + item.hora
    );

  const lembrete =
    new Date(
      dataHora.getTime() - 15 * 60000
    );

  const tempo =
    lembrete - agora;

  if(tempo > 0){

    setTimeout(() => {

      notificar(
        '⏰ Lembrete',
        item.nome +
        ' em 15 minutos'
      );

      toast(
        '⏰ Cliente chegando em 15 minutos'
      );

    }, tempo);

  }

}

// =====================================================
// TOAST
// =====================================================

function toast(texto){

  const toast =
    document.createElement('div');

  toast.innerText = texto;

  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.background = '#e91e63';
  toast.style.color = 'white';
  toast.style.padding = '14px 18px';
  toast.style.borderRadius = '12px';
  toast.style.zIndex = '9999';
  toast.style.fontFamily = 'Poppins';
  toast.style.boxShadow =
    '0 4px 12px rgba(0,0,0,0.2)';

  document.body.appendChild(toast);

  setTimeout(() => {

    toast.remove();

  }, 3000);

}

// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(data){

  const nova =
    new Date(data);

  return nova.toLocaleDateString(
    'pt-BR'
  );

}