// reservas_admin.js - Lógica para a página de gerenciamento de reservas (reservas.html)

document.addEventListener('DOMContentLoaded', function() {
    if (!isAdminLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const todasReservas = window.mockReservasGlobal || [];
    const tabelaReservasBody = document.getElementById('tabelaReservasBody');
    const filtroStatusSelect = document.getElementById('filtroStatus');
    const filtroDataInput = document.getElementById('filtroData');
    const btnAplicarFiltrosReservas = document.getElementById('btnAplicarFiltrosReservas');

    // Modal
    const modalDetalhesReserva = document.getElementById('modalDetalhesReserva');
    const conteudoModalReserva = document.getElementById('conteudoModalReserva');
    const closeBtnModal = modalDetalhesReserva.querySelector('.close-btn');

    if (closeBtnModal) {
        closeBtnModal.onclick = function() {
            modalDetalhesReserva.style.display = 'none';
        }
    }
    window.onclick = function(event) {
        if (event.target == modalDetalhesReserva) {
            modalDetalhesReserva.style.display = 'none';
        }
    }

    function renderizarTabela(reservas) {
        if (!tabelaReservasBody) return;
        tabelaReservasBody.innerHTML = ''; // Limpa tabela

        if (reservas.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 6; // Número de colunas na tabela
            td.textContent = 'Nenhuma reserva encontrada com os filtros aplicados.';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            tabelaReservasBody.appendChild(tr);
            return;
        }

        reservas.forEach(reserva => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${reserva.displayData}</td>
                <td>${reserva.horario}</td>
                <td>${reserva.categoria}</td>
                <td>${reserva.pilotoPrincipalNome}</td>
                <td><span class="status-badge status-${reserva.status.replace(/\s+/g, '')}">${reserva.status}</span></td>
                <td>
                    <button class="action-btn view-details" data-id="${reserva.id}">Detalhes</button>
                    <select class="action-btn edit-status" data-id="${reserva.id}" title="Mudar Status">
                        <option value="Pendente" ${reserva.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="Confirmada" ${reserva.status === 'Confirmada' ? 'selected' : ''}>Confirmada</option>
                        <option value="Cancelada" ${reserva.status === 'Cancelada' ? 'selected' : ''}>Cancelada</option>
                        <option value="Realizada" ${reserva.status === 'Realizada' ? 'selected' : ''}>Realizada</option>
                    </select>
                </td>
            `;
            tabelaReservasBody.appendChild(tr);
        });

        // Adicionar event listeners para os botões de ação
        tabelaReservasBody.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                const reservaId = this.dataset.id;
                exibirDetalhesReserva(reservaId);
            });
        });

        tabelaReservasBody.querySelectorAll('.edit-status').forEach(select => {
            select.addEventListener('change', function() {
                const reservaId = this.dataset.id;
                const novoStatus = this.value;
                mudarStatusReserva(reservaId, novoStatus);
            });
        });
    }

    function exibirDetalhesReserva(reservaId) {
        const reserva = todasReservas.find(r => r.id === reservaId);
        if (!reserva || !conteudoModalReserva || !modalDetalhesReserva) return;

        let htmlPilotosAdicionais = 'Nenhum';
        if (reserva.pilotosAdicionais && reserva.pilotosAdicionais.length > 0) {
            htmlPilotosAdicionais = '<ul>';
            reserva.pilotosAdicionais.forEach(p => {
                htmlPilotosAdicionais += `<li>${p.nome} ${p.email ? `(${p.email})` : ''} ${p.parentesco ? `(${p.parentesco})` : ''}</li>`;
            });
            htmlPilotosAdicionais += '</ul>';
        }

        const pilotoPrincipal = window.mockPilotosGlobal.find(p => p.id === reserva.pilotoPrincipalId);

        conteudoModalReserva.innerHTML = `
            <p><strong>ID da Reserva:</strong> ${reserva.id}</p>
            <p><strong>Data:</strong> ${reserva.displayData}</p>
            <p><strong>Horário:</strong> ${reserva.horario}</p>
            <p><strong>Categoria:</strong> ${reserva.categoria}</p>
            <p><strong>Tempo:</strong> ${reserva.tempo}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${reserva.status.replace(/\s+/g, '')}">${reserva.status}</span></p>
            <hr>
            <h4>Piloto Principal:</h4>
            <p><strong>Nome:</strong> ${pilotoPrincipal ? pilotoPrincipal.nome : 'N/A'}</p>
            <p><strong>Email:</strong> ${pilotoPrincipal ? pilotoPrincipal.email : 'N/A'}</p>
            <p><strong>CPF:</strong> ${pilotoPrincipal ? pilotoPrincipal.cpf : 'N/A'}</p>
            <p><strong>WhatsApp:</strong> ${pilotoPrincipal ? pilotoPrincipal.whatsapp : 'N/A'}</p>
            <hr>
            <h4>Pilotos Adicionais:</h4>
            ${htmlPilotosAdicionais}
            <hr>
            <p><strong>Observações:</strong> ${reserva.observacoes || 'Nenhuma'}</p>
        `;
        modalDetalhesReserva.style.display = 'flex';
    }

    function mudarStatusReserva(reservaId, novoStatus) {
        const reservaIndex = todasReservas.findIndex(r => r.id === reservaId);
        if (reservaIndex !== -1) {
            todasReservas[reservaIndex].status = novoStatus;
            console.log(`Status da reserva ${reservaId} alterado para ${novoStatus}. (Simulado)`);
            // Re-renderizar a tabela para refletir a mudança
            aplicarFiltros();
            // Em um sistema real, isso enviaria uma requisição para o backend.
            // Poderia atualizar também os cards de estatísticas no dashboard principal se a lógica fosse compartilhada.
        }
    }

    function aplicarFiltros() {
        const statusFiltrado = filtroStatusSelect.value;
        const dataFiltrada = filtroDataInput.value; // YYYY-MM-DD

        let reservasFiltradas = todasReservas;

        if (statusFiltrado) {
            reservasFiltradas = reservasFiltradas.filter(r => r.status === statusFiltrado);
        }
        if (dataFiltrada) {
            // Comparar apenas a parte da data, ignorando fuso/hora do mock_data.js que já está em YYYY-MM-DD
            reservasFiltradas = reservasFiltradas.filter(r => r.data === dataFiltrada);
        }

        // Ordenar por data e horário (mais recentes primeiro, por exemplo)
        reservasFiltradas.sort((a, b) => {
            const dataA = new Date(a.data + 'T' + a.horario);
            const dataB = new Date(b.data + 'T' + b.horario);
            return dataB - dataA; // Mais recentes primeiro
        });

        renderizarTabela(reservasFiltradas);
    }

    if (btnAplicarFiltrosReservas) {
        btnAplicarFiltrosReservas.addEventListener('click', aplicarFiltros);
    }

    // Renderização inicial
    aplicarFiltros(); // Renderiza com filtros padrão (todos)
});
