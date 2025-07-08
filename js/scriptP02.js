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
    const btnProxima = document.getElementById('btnProximaPagina02');
    const formPagina02 = document.getElementById('formPagina02');

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
        // Adicione outras configurações se necessário (ex: disable, locale)
        onChange: function(selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
                dataSelecionada = dateStr;
                console.log("Data selecionada:", dataSelecionada);
                carregarHorariosDisponiveis(selectedDates[0]);
                selecaoHorarioFieldset.style.display = 'block';
                btnProxima.disabled = true; // Desabilita até selecionar horário
                horarioSelecionado = null; // Reseta horário
            } else {
                selecaoHorarioFieldset.style.display = 'none';
                opcoesHorarioDiv.innerHTML = '';
                btnProxima.disabled = true;
                dataSelecionada = null;
                horarioSelecionado = null;
            }
        }
    });

    function carregarHorariosDisponiveis(data) {
        opcoesHorarioDiv.innerHTML = ''; // Limpa horários anteriores
        // Lógica para determinar horários disponíveis
        // Por agora, vamos simular alguns horários fixos de meia em meia hora
        // Exemplo: das 09:00 às 18:00
        const horarios = [];
        for (let hora = 9; hora <= 17; hora++) {
            horarios.push(`${String(hora).padStart(2, '0')}:00`);
            horarios.push(`${String(hora).padStart(2, '0')}:30`);
        }
        // Adiciona o último horário das 18:00
        horarios.push("18:00");


        horarios.forEach(horario => {
            // Lógica futura: verificar se o horário está realmente disponível
            // consultando um backend ou uma lista de reservas.
            // Por enquanto, todos são considerados disponíveis.

            const horarioId = `horario-${horario.replace(':', '')}`;
            const inputRadioHorario = document.createElement('input');
            inputRadioHorario.type = 'radio';
            inputRadioHorario.id = horarioId;
            inputRadioHorario.name = 'horarioEscolhido';
            inputRadioHorario.value = horario;
            inputRadioHorario.required = true;

            const labelHorario = document.createElement('label');
            labelHorario.htmlFor = horarioId;
            labelHorario.textContent = horario;
            // Estilo para melhor visualização dos radio buttons
            labelHorario.style.marginLeft = "5px";
            labelHorario.style.display = "inline-block";


            const divHorario = document.createElement('div');
            divHorario.appendChild(inputRadioHorario);
            divHorario.appendChild(labelHorario);
            opcoesHorarioDiv.appendChild(divHorario);

            inputRadioHorario.addEventListener('change', function() {
                horarioSelecionado = this.value;
                btnProxima.disabled = false;
            });
        });
    }

    formPagina02.addEventListener('submit', function(event) {
        event.preventDefault();
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
});
