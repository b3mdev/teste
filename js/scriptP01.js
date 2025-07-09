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

    const categoriaButtons = document.querySelectorAll('.categoria-btn');
    const selecaoTempoDiv = document.getElementById('selecaoTempo'); // Agora é uma div, não fieldset
    const opcoesTempoDiv = document.getElementById('opcoesTempo');
    const btnProxima = document.getElementById('btnProximaPagina01');

    let categoriaSelecionada = null;
    let nomeCategoriaSelecionadaParaExibicao = null;
    let tempoSelecionado = null;

    categoriaButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove a classe 'selected' de outros botões de categoria
            categoriaButtons.forEach(btn => btn.classList.remove('selected'));
            // Adiciona 'selected' ao botão clicado
            this.classList.add('selected');

            categoriaSelecionada = this.dataset.categoria; // Valor real para salvar
            nomeCategoriaSelecionadaParaExibicao = this.querySelector('span').textContent; // Nome para exibição

            const temposDisponiveis = this.dataset.tempos.split(',');

            opcoesTempoDiv.innerHTML = ''; // Limpa opções anteriores
            selecaoTempoDiv.style.display = 'block';
            selecaoTempoDiv.style.opacity = '0'; // Para animação fade-in
            setTimeout(() => { selecaoTempoDiv.style.opacity = '1'; }, 50);


            btnProxima.disabled = true;
            tempoSelecionado = null;

            temposDisponiveis.forEach(tempo => {
                const tempoBtn = document.createElement('button');
                tempoBtn.type = 'button'; // Evita submit de formulário se estivesse dentro de um
                tempoBtn.classList.add('tempo-btn');
                tempoBtn.textContent = tempo;
                tempoBtn.dataset.tempo = tempo;

                opcoesTempoDiv.appendChild(tempoBtn);

                tempoBtn.addEventListener('click', function() {
                    // Remove a classe 'selected' de outros botões de tempo
                    opcoesTempoDiv.querySelectorAll('.tempo-btn').forEach(btn => btn.classList.remove('selected'));
                    // Adiciona 'selected' ao botão clicado
                    this.classList.add('selected');

                    tempoSelecionado = this.dataset.tempo;
                    btnProxima.disabled = false;
                });
            });
        });
    });

    btnProxima.addEventListener('click', function() {
        if (categoriaSelecionada && tempoSelecionado) {
            saveData('reservaCategoria', categoriaSelecionada); // Salva o valor completo da categoria
            saveData('reservaNomeCategoria', nomeCategoriaSelecionadaParaExibicao); // Salva nome curto para exibição, se necessário
            saveData('reservaTempo', tempoSelecionado);
            console.log('Categoria Salva:', categoriaSelecionada);
            console.log('Tempo Salvo:', tempoSelecionado);
            window.location.href = 'pages/pagina02.html';
        } else {
            // Idealmente, o botão "Próximo" não estaria habilitado.
            // Mas como fallback, podemos adicionar um alerta.
            alert('Por favor, selecione uma categoria e um tempo de pista.');
        }
    });

    // Não há mais um form#formPagina01, então o evento de submit foi removido
    // O botão "Próximo" agora tem seu próprio event listener.
});
