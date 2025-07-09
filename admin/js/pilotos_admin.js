// pilotos_admin.js - Lógica para a página de gerenciamento de pilotos (pilotos.html)

document.addEventListener('DOMContentLoaded', function() {
    if (!isAdminLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const todosPilotos = window.mockPilotosGlobal || [];
    const todasReservas = window.mockReservasGlobal || []; // Para buscar reservas do piloto
    const tabelaPilotosBody = document.getElementById('tabelaPilotosBody');
    const buscaPilotoInput = document.getElementById('buscaPiloto');
    const btnBuscarPiloto = document.getElementById('btnBuscarPiloto');

    // Modal
    const modalDetalhesPiloto = document.getElementById('modalDetalhesPiloto');
    const conteudoModalPiloto = document.getElementById('conteudoModalPiloto');
    const closeBtnModal = modalDetalhesPiloto.querySelector('.close-btn');

    if (closeBtnModal) {
        closeBtnModal.onclick = function() {
            modalDetalhesPiloto.style.display = 'none';
        }
    }
    window.onclick = function(event) {
        if (event.target == modalDetalhesPiloto) {
            modalDetalhesPiloto.style.display = 'none';
        }
    }

    function renderizarTabela(pilotos) {
        if (!tabelaPilotosBody) return;
        tabelaPilotosBody.innerHTML = ''; // Limpa tabela

        if (pilotos.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 5; // Número de colunas na tabela
            td.textContent = 'Nenhum piloto encontrado com os filtros aplicados.';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            tabelaPilotosBody.appendChild(tr);
            return;
        }

        // Recalcular número de corridas (caso os status das reservas tenham mudado)
        pilotos.forEach(piloto => {
            piloto.numCorridas = todasReservas.filter(
                reserva => reserva.pilotoPrincipalId === piloto.id &&
                           (reserva.status === "Confirmada" || reserva.status === "Realizada")
            ).length;
        });


        pilotos.forEach(piloto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${piloto.nome}</td>
                <td>${piloto.email}</td>
                <td>${piloto.cpf}</td>
                <td>${piloto.numCorridas}</td>
                <td>
                    <button class="action-btn view-details" data-id="${piloto.id}">Detalhes</button>
                </td>
            `;
            tabelaPilotosBody.appendChild(tr);
        });

        // Adicionar event listeners para os botões de ação
        tabelaPilotosBody.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                const pilotoId = this.dataset.id;
                exibirDetalhesPiloto(pilotoId);
            });
        });
    }

    function exibirDetalhesPiloto(pilotoId) {
        const piloto = todosPilotos.find(p => p.id === pilotoId);
        if (!piloto || !conteudoModalPiloto || !modalDetalhesPiloto) return;

        const reservasDoPiloto = todasReservas.filter(r => r.pilotoPrincipalId === piloto.id)
            .sort((a,b) => new Date(b.data) - new Date(a.data)); // Mais recentes primeiro

        let htmlReservas = 'Nenhuma reserva encontrada.';
        if (reservasDoPiloto.length > 0) {
            htmlReservas = '<ul>';
            reservasDoPiloto.forEach(r => {
                htmlReservas += `<li>${r.displayData} às ${r.horario} - ${r.categoria} (Status: <span class="status-badge status-${r.status.replace(/\s+/g, '')}">${r.status}</span>)</li>`;
            });
            htmlReservas += '</ul>';
        }

        conteudoModalPiloto.innerHTML = `
            <p><strong>ID do Piloto:</strong> ${piloto.id}</p>
            <p><strong>Nome:</strong> ${piloto.nome}</p>
            <p><strong>Email:</strong> ${piloto.email}</p>
            <p><strong>CPF:</strong> ${piloto.cpf}</p>
            <p><strong>WhatsApp:</strong> ${piloto.whatsapp}</p>
            <p><strong>Data de Cadastro:</strong> ${piloto.dataCadastro || 'N/A'}</p>
            <p><strong>Total de Corridas (Confirmadas/Realizadas):</strong> ${piloto.numCorridas}</p>
            <hr>
            <h4>Histórico de Reservas:</h4>
            ${htmlReservas}
        `;
        modalDetalhesPiloto.style.display = 'flex';
    }

    function aplicarBusca() {
        const termoBusca = buscaPilotoInput.value.toLowerCase().trim();
        let pilotosFiltrados = todosPilotos;

        if (termoBusca) {
            pilotosFiltrados = todosPilotos.filter(piloto =>
                piloto.nome.toLowerCase().includes(termoBusca) ||
                piloto.cpf.replace(/[^\d]/g, '').includes(termoBusca.replace(/[^\d]/g, '')) // Compara só números do CPF
            );
        }

        // Ordenar por nome
        pilotosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));

        renderizarTabela(pilotosFiltrados);
    }

    if (btnBuscarPiloto) {
        btnBuscarPiloto.addEventListener('click', aplicarBusca);
    }
    // Permitir busca ao pressionar Enter no input
    if (buscaPilotoInput) {
        buscaPilotoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                aplicarBusca();
            }
        });
    }

    // Renderização inicial
    renderizarTabela(todosPilotos.sort((a, b) => a.nome.localeCompare(b.nome)));
});
