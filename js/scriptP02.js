// Funções JavaScript para interatividade da Página 2

// Funções genéricas de localStorage (duplicadas de scriptP01.js, idealmente estariam em um global.js)
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

document.addEventListener('DOMContentLoaded', function() {
    const calendarioInput = document.getElementById('calendario');
    const selecaoHorarioFieldset = document.getElementById('selecaoHorario');
    const opcoesHorarioDiv = document.getElementById('opcoesHorario');
    const calendarioInput = document.getElementById('calendario');
    const selecaoHorarioDiv = document.getElementById('selecaoHorario'); // Mudou de fieldset para div
    const opcoesHorarioDiv = document.getElementById('opcoesHorario');
    const btnProxima = document.getElementById('btnProximaPagina02');
    const btnAnterior = document.getElementById('btnAnteriorPagina02');
    // const formPagina02 = document.getElementById('formPagina02'); // Não há mais form

    let dataSelecionada = null;
    let horarioSelecionado = null;

    // Recupera dados da página anterior para verificar se o fluxo está correto
    const categoria = loadData('reservaCategoria');
    const tempo = loadData('reservaTempo');

    if (!categoria || !tempo) {
        alert("Por favor, selecione primeiro a categoria e o tempo na página anterior.");
        window.location.href = '../index.html';
        return;
    }
    console.log("Categoria recuperada:", categoria);
    console.log("Tempo recuperado:", tempo);

    // Configuração do Flatpickr
    flatpickr(calendarioInput, {
        minDate: "today",
        dateFormat: "d/m/Y", // Formato brasileiro
        inline: false, // Para manter o estilo de input, pode ser true para mostrar direto na página
        disableMobile: "true", // Para usar o calendário web em mobile
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
                dataSelecionada = dateStr;
                console.log("Data selecionada:", dataSelecionada);
                carregarHorariosDisponiveis(selectedDates[0]);
                selecaoHorarioDiv.style.display = 'block';
                selecaoHorarioDiv.style.opacity = '0';
                setTimeout(() => { selecaoHorarioDiv.style.opacity = '1'; }, 50);

                btnProxima.disabled = true;
                horarioSelecionado = null;
            } else {
                selecaoHorarioDiv.style.display = 'none';
                opcoesHorarioDiv.innerHTML = '';
                btnProxima.disabled = true;
                dataSelecionada = null;
                horarioSelecionado = null;
            }
        }
    });

    function carregarHorariosDisponiveis(data) {
        opcoesHorarioDiv.innerHTML = ''; // Limpa horários anteriores
        const horarios = [];
        for (let hora = 9; hora <= 18; hora++) { // Ajustado para incluir 18:00 e 18:30
            horarios.push(`${String(hora).padStart(2, '0')}:00`);
            if (hora < 18) { // Adiciona :30 até 17:30, para o último slot ser 18:00
                 horarios.push(`${String(hora).padStart(2, '0')}:30`);
            }
        }
        // horarios.push("18:00"); // Removido pois o loop já pode cuidar disso

        horarios.forEach(horario => {
            const horarioBtn = document.createElement('button');
            horarioBtn.type = 'button';
            horarioBtn.classList.add('horario-btn');
            horarioBtn.textContent = horario;
            horarioBtn.dataset.horario = horario;

            // Simulação de alguns horários indisponíveis (ex: se for hoje e horário já passou)
            // Ou poderia vir de uma lista de horários bloqueados
            const agora = new Date();
            const [h, m] = horario.split(':');
            const dataHorario = new Date(data);
            dataHorario.setHours(parseInt(h), parseInt(m), 0, 0);

            if (dataHorario < agora && data.toDateString() === agora.toDateString()) {
                horarioBtn.disabled = true;
            }
            // Simular aleatoriamente alguns horários ocupados para teste
            // if (Math.random() < 0.2 && !horarioBtn.disabled) {
            //     horarioBtn.disabled = true;
            // }

            opcoesHorarioDiv.appendChild(horarioBtn);

            horarioBtn.addEventListener('click', function() {
                if (this.disabled) return;
                opcoesHorarioDiv.querySelectorAll('.horario-btn').forEach(btn => btn.classList.remove('selected'));
                this.classList.add('selected');
                horarioSelecionado = this.dataset.horario;
                btnProxima.disabled = false;
            });
        });
    }

    btnAnterior.addEventListener('click', function() {
        window.location.href = '../index.html';
    });

    btnProxima.addEventListener('click', function() {
        if (dataSelecionada && horarioSelecionado) {
            saveData('reservaData', dataSelecionada);
            saveData('reservaHorario', horarioSelecionado);
            console.log('Data Salva:', dataSelecionada);
            console.log('Horário Salvo:', horarioSelecionado);
            window.location.href = 'pagina03.html';
        } else {
            alert('Por favor, selecione uma data e um horário.');
        }
    });
    // O form foi removido, então o listener de submit não é mais necessário
});
