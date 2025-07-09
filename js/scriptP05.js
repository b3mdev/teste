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
    const emailConfirmacaoSpan = document.getElementById('emailConfirmacao');
    const listaDetalhesReservaUl = document.getElementById('listaDetalhesReserva');
    const listaPilotosConfirmacaoDiv = document.getElementById('listaPilotosConfirmacao');

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

    // Preencher e-mail de confirmação
    if (pilotoPrincipal && pilotoPrincipal.email) {
        emailConfirmacaoSpan.textContent = pilotoPrincipal.email;
    } else {
        emailConfirmacaoSpan.textContent = "não informado";
    }

    // Preencher detalhes da reserva
    const detalhes = {
        "Categoria": categoria,
        "Tempo de Pista": tempo,
        "Data": dataReserva,
        "Horário": horarioReserva,
        "Forma de Pagamento": pagamento.forma === 'cartao' ? `Cartão de Crédito (final **** ${pagamento.cartao.numero || 'N/A'})` : "PIX"
    };

    for (const [chave, valor] of Object.entries(detalhes)) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${chave}:</strong> ${valor}`;
        listaDetalhesReservaUl.appendChild(li);
    }

    // Preencher pilotos
    let pilotosHtml = '<h4>Piloto Principal:</h4>';
    pilotosHtml += `<p><strong>Nome:</strong> ${pilotoPrincipal.nome}<br>`;
    pilotosHtml += `<strong>E-mail:</strong> ${pilotoPrincipal.email}<br>`;
    pilotosHtml += `<strong>WhatsApp:</strong> ${pilotoPrincipal.whatsapp}<br>`;
    pilotosHtml += `<strong>CPF:</strong> ${pilotoPrincipal.cpf}</p>`;

    if (pilotosAdicionais && pilotosAdicionais.length > 0) {
        pilotosHtml += '<h4>Pilotos Adicionais:</h4>';
        pilotosAdicionais.forEach((piloto, index) => {
            pilotosHtml += `<div class="piloto-confirmacao-item">`;
            pilotosHtml += `<p><strong>Piloto ${index + 1}:</strong> ${piloto.nome}`;
            if (piloto.tipoCadastro === 'completo' && piloto.email) {
                pilotosHtml += ` (E-mail: ${piloto.email})`;
            } else if (piloto.tipoCadastro === 'familiar' && piloto.parentesco) {
                pilotosHtml += ` (Familiar: ${piloto.parentesco})`;
            } else if (piloto.tipoCadastro === 'familiar') {
                 pilotosHtml += ` (Familiar)`;
            }
            pilotosHtml += `</p></div>`;
        });
    }
    listaPilotosConfirmacaoDiv.innerHTML = pilotosHtml;

    // Simular envio de e-mail (apenas log no console)
    console.log(`Simulação: E-mail de confirmação enviado para ${pilotoPrincipal.email} com os seguintes dados:`,
        { categoria, tempo, dataReserva, horarioReserva, pilotoPrincipal, pilotosAdicionais, pagamento }
    );

    // Limpar dados do localStorage após exibir a confirmação,
    // para que uma nova reserva comece do zero.
    // Isso é feito ao clicar no botão "Fazer Nova Reserva" ou se o usuário sair e voltar.
    // A função clearAllReservationDataForNewBooking() foi chamada em scriptP01.js ao iniciar.
    // Aqui, vamos garantir que, se o usuário recarregar esta página, os dados ainda estejam lá,
    // mas se ele clicar em "Nova Reserva", os dados são limpos por scriptP01.js.
    // Para este passo, não vamos limpar automaticamente, o usuário decide ao clicar no botão.
    // A limpeza efetiva ocorrerá quando o usuário for para index.html, que já chama clearAllReservationData() em scriptP01.js.

});

// Adicionar evento ao botão de nova reserva para garantir que os dados sejam limpos
// Embora scriptP01 já faça isso, é uma boa prática ser explícito.
// No entanto, o botão redireciona diretamente, então a limpeza em scriptP01.js será suficiente.
// Se o botão "Fazer Nova Reserva" fosse manipulado por JS aqui antes de redirecionar:
// const btnNovaReserva = document.querySelector('button.button');
// if (btnNovaReserva) {
//     btnNovaReserva.addEventListener('click', function() {
//         clearAllReservationDataForNewBooking();
//         window.location.href = '../index.html';
//     });
// }
