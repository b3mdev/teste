// Funções JavaScript para interatividade da Página 5

function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function clearAllReservationDataForNewBooking() {
    // Limpa todos os dados de reserva ao confirmar, exceto talvez preferências do usuário se existissem.
    // Para este sistema, limpar tudo é o comportamento esperado para uma nova reserva.
    localStorage.removeItem('reservaCategoria');
    localStorage.removeItem('reservaTempo');
    localStorage.removeItem('reservaData');
    localStorage.removeItem('reservaHorario');
    localStorage.removeItem('reservaPilotoPrincipal');
    localStorage.removeItem('reservaPilotosAdicionais');
    localStorage.removeItem('reservaPagamento');
    console.log("Todos os dados da reserva foram limpos do localStorage após a confirmação.");
}


document.addEventListener('DOMContentLoaded', function() {
    const nomePilotoSpan = document.getElementById('nomePilotoConfirmacao');
    const emailConfirmacaoSpan = document.getElementById('emailConfirmacao');
    const listaDetalhesReservaUl = document.getElementById('listaDetalhesReserva');
    const listaPilotosConfirmacaoDiv = document.getElementById('listaPilotosConfirmacao');
    const btnNovaReserva = document.getElementById('btnNovaReservaConfirmacao');

    // Carregar todos os dados da reserva do localStorage
    const categoria = loadData('reservaCategoria');
    const tempo = loadData('reservaTempo');
    const dataReserva = loadData('reservaData');
    const horarioReserva = loadData('reservaHorario');
    const pilotoPrincipal = loadData('reservaPilotoPrincipal');
    const pilotosAdicionais = loadData('reservaPilotosAdicionais');
    const pagamento = loadData('reservaPagamento');

    // Verificar se todos os dados essenciais estão presentes
    if (!categoria || !tempo || !dataReserva || !horarioReserva || !pilotoPrincipal || !pagamento) {
        alert("Não foi possível carregar os detalhes da reserva. Por favor, tente novamente.");
        // Idealmente, não deveria chegar aqui se o fluxo anterior funcionou.
        // Pode redirecionar para a primeira página ou exibir uma mensagem de erro mais robusta.
        document.getElementById('resumoReserva').innerHTML = '<p>Erro ao carregar os detalhes da sua reserva. Por favor, inicie uma nova reserva.</p>';
        return;
    }

    // Preencher nome e e-mail de confirmação
    if (pilotoPrincipal) {
        if (pilotoPrincipal.nome && nomePilotoSpan) {
            nomePilotoSpan.textContent = pilotoPrincipal.nome.split(" ")[0]; // Pega o primeiro nome
        }
        if (pilotoPrincipal.email && emailConfirmacaoSpan) {
            emailConfirmacaoSpan.textContent = pilotoPrincipal.email;
        } else if (emailConfirmacaoSpan) {
            emailConfirmacaoSpan.textContent = "não informado";
        }
    }


    // Preencher detalhes da reserva
    const nomeCategoria = loadData('reservaNomeCategoria') || categoria; // Usa nome curto se disponível

    const detalhes = {
        "Categoria": `<i class="fas fa-flag-checkered"></i> ${nomeCategoria}`,
        "Tempo de Pista": `<i class="fas fa-stopwatch"></i> ${tempo}`,
        "Data": `<i class="fas fa-calendar-day"></i> ${dataReserva}`,
        "Horário": `<i class="fas fa-clock"></i> ${horarioReserva}`,
        "Forma de Pagamento": `<i class="fas fa-credit-card"></i> ${pagamento.forma === 'cartao' ? `Cartão de Crédito (final **** ${pagamento.cartao.numero || 'N/A'})` : "PIX"}`
    };

    listaDetalhesReservaUl.innerHTML = ''; // Limpa antes de adicionar
    for (const [chave, valor] of Object.entries(detalhes)) {
        const li = document.createElement('li');
        // O valor já contém o ícone
        li.innerHTML = `<strong>${chave}:</strong> ${valor}`;
        listaDetalhesReservaUl.appendChild(li);
    }

    // Preencher pilotos
    let pilotosHtml = '';
    if (pilotoPrincipal) {
        pilotosHtml += `<h4><i class="fas fa-user-shield"></i> Piloto Principal:</h4>`;
        pilotosHtml += `<p><strong>Nome:</strong> ${pilotoPrincipal.nome}<br>`;
        pilotosHtml += `<strong>E-mail:</strong> ${pilotoPrincipal.email}<br>`;
        pilotosHtml += `<strong>WhatsApp:</strong> ${pilotoPrincipal.whatsapp}<br>`;
        pilotosHtml += `<strong>CPF:</strong> ${pilotoPrincipal.cpf}</p>`;
    }


    if (pilotosAdicionais && pilotosAdicionais.length > 0) {
        pilotosHtml += `<h4><i class="fas fa-users"></i> Pilotos Adicionais:</h4>`;
        pilotosAdicionais.forEach((piloto, index) => {
            pilotosHtml += `<div class="piloto-confirmacao-item">`;
            pilotosHtml += `<p><strong><i class="fas fa-user"></i> ${piloto.nome}</strong>`;
            if (piloto.tipoCadastro === 'completo' && piloto.email) {
                pilotosHtml += ` <span class="piloto-detalhe">(<i class="fas fa-envelope"></i> ${piloto.email})</span>`;
            } else if (piloto.tipoCadastro === 'familiar' && piloto.parentesco) {
                pilotosHtml += ` <span class="piloto-detalhe">(<i class="fas fa-user-friends"></i> ${piloto.parentesco})</span>`;
            } else if (piloto.tipoCadastro === 'familiar') {
                 pilotosHtml += ` <span class="piloto-detalhe">(Familiar)</span>`;
            }
            pilotosHtml += `</p></div>`;
        });
    }
    listaPilotosConfirmacaoDiv.innerHTML = pilotosHtml;

    // Simular envio de e-mail (apenas log no console)
    if (pilotoPrincipal && pilotoPrincipal.email) {
        console.log(`Simulação: E-mail de confirmação enviado para ${pilotoPrincipal.email} com os seguintes dados:`,
            { categoria, tempo, dataReserva, horarioReserva, pilotoPrincipal, pilotosAdicionais, pagamento }
        );
    }

    if(btnNovaReserva) {
        btnNovaReserva.addEventListener('click', function() {
            // A limpeza de dados já é feita em scriptP01.js ao carregar a index.html
            window.location.href = '../index.html';
        });
    }

});
