// Funções JavaScript para interatividade da Página 1

// Funções genéricas de localStorage (podem ser movidas para um script global mais tarde)
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function clearAllReservationData() {
    localStorage.removeItem('reservaCategoria');
    localStorage.removeItem('reservaTempo');
    localStorage.removeItem('reservaData');
    localStorage.removeItem('reservaHorario');
    localStorage.removeItem('reservaPilotoPrincipal');
    localStorage.removeItem('reservaPilotosAdicionais');
    localStorage.removeItem('reservaPagamento');
    console.log("Dados de reserva limpos do localStorage.");
}


document.addEventListener('DOMContentLoaded', function() {
    // Limpa dados de reservas anteriores ao carregar a primeira página
    clearAllReservationData();

    const formPagina01 = document.getElementById('formPagina01');
    const radiosCategoria = document.querySelectorAll('input[name="categoria"]');
    const selecaoTempoFieldset = document.getElementById('selecaoTempo');
    const opcoesTempoDiv = document.getElementById('opcoesTempo');
    const btnProxima = document.getElementById('btnProximaPagina01');

    let categoriaSelecionada = null;
    let tempoSelecionado = null;

    radiosCategoria.forEach(radio => {
        radio.addEventListener('change', function() {
            categoriaSelecionada = this.value;
            const temposDisponiveis = this.dataset.tempos.split(',');

            opcoesTempoDiv.innerHTML = ''; // Limpa opções anteriores
            selecaoTempoFieldset.style.display = 'block';
            btnProxima.disabled = true; // Desabilita o botão até que um tempo seja selecionado
            tempoSelecionado = null; // Reseta o tempo selecionado

            temposDisponiveis.forEach(tempo => {
                const tempoId = `tempo-${tempo.replace('min', '')}`;
                const inputRadioTempo = document.createElement('input');
                inputRadioTempo.type = 'radio';
                inputRadioTempo.id = tempoId;
                inputRadioTempo.name = 'tempoPista';
                inputRadioTempo.value = tempo;
                inputRadioTempo.required = true;

                const labelTempo = document.createElement('label');
                labelTempo.htmlFor = tempoId;
                labelTempo.textContent = tempo;

                const divTempo = document.createElement('div');
                divTempo.appendChild(inputRadioTempo);
                divTempo.appendChild(labelTempo);
                opcoesTempoDiv.appendChild(divTempo);

                inputRadioTempo.addEventListener('change', function() {
                    tempoSelecionado = this.value;
                    btnProxima.disabled = false; // Habilita o botão de próximo
                });
            });
        });
    });

    formPagina01.addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o envio padrão do formulário

        if (categoriaSelecionada && tempoSelecionado) {
            saveData('reservaCategoria', categoriaSelecionada);
            saveData('reservaTempo', tempoSelecionado);
            console.log('Categoria Salva:', categoriaSelecionada);
            console.log('Tempo Salvo:', tempoSelecionado);
            window.location.href = 'pages/pagina02.html';
        } else {
            // Isso não deve acontecer se a lógica de habilitação do botão estiver correta
            alert('Por favor, selecione uma categoria e um tempo de pista.');
        }
    });
});
