// dashboard_main.js - Lógica para a página principal do dashboard admin (index.html)

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação (auth.js já deve ter redirecionado se não estiver logado)
    if (!isAdminLoggedIn()) {
        // Segurança extra, caso auth.js falhe ou seja removido
        window.location.href = 'login.html';
        return;
    }

    // Carregar dados fictícios (já devem estar no escopo global por mock_data.js)
    const todasReservas = window.mockReservasGlobal || [];
    const todosPilotos = window.mockPilotosGlobal || [];

    // Preencher Cards de Estatísticas
    const totalReservasEl = document.getElementById('totalReservas');
    const reservasPendentesEl = document.getElementById('reservasPendentes');
    const totalPilotosEl = document.getElementById('totalPilotos');

    if (totalReservasEl) totalReservasEl.textContent = todasReservas.length;

    const pendentes = todasReservas.filter(r => r.status === 'Pendente').length;
    if (reservasPendentesEl) reservasPendentesEl.textContent = pendentes;

    if (totalPilotosEl) totalPilotosEl.textContent = todosPilotos.length;


    // --- GRÁFICOS SIMULADOS COM CHART.JS ---

    // 1. Gráfico de Reservas por Categoria
    const ctxReservasPorCategoria = document.getElementById('reservasPorCategoriaChart')?.getContext('2d');
    if (ctxReservasPorCategoria) {
        const categoriasContagem = {};
        todasReservas.forEach(reserva => {
            categoriasContagem[reserva.categoria] = (categoriasContagem[reserva.categoria] || 0) + 1;
        });
        new Chart(ctxReservasPorCategoria, {
            type: 'doughnut', // ou 'pie'
            data: {
                labels: Object.keys(categoriasContagem),
                datasets: [{
                    label: 'Reservas por Categoria',
                    data: Object.values(categoriasContagem),
                    backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                }
            }
        });
    }

    // 2. Gráfico de Reservas nos Próximos 7 Dias
    const ctxReservasProximos7Dias = document.getElementById('reservasProximos7DiasChart')?.getContext('2d');
    if (ctxReservasProximos7Dias) {
        const labelsProximos7Dias = [];
        const dataProximos7Dias = [];
        const hoje = new Date();
        hoje.setHours(0,0,0,0);

        for (let i = 0; i < 7; i++) {
            const dia = new Date(hoje);
            dia.setDate(hoje.getDate() + i);
            labelsProximos7Dias.push(dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));

            const reservasNoDia = todasReservas.filter(reserva => {
                const dataReserva = new Date(reserva.data + 'T00:00:00'); // Considerar fuso local
                return dataReserva.getTime() === dia.getTime() && (reserva.status === 'Confirmada' || reserva.status === 'Pendente');
            }).length;
            dataProximos7Dias.push(reservasNoDia);
        }

        new Chart(ctxReservasProximos7Dias, {
            type: 'line',
            data: {
                labels: labelsProximos7Dias,
                datasets: [{
                    label: 'Reservas Confirmadas/Pendentes',
                    data: dataProximos7Dias,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                plugins: { legend: { display: true } }
            }
        });
    }

    // 3. Gráfico de Taxa de Ocupação por Horário (Hoje)
    const ctxOcupacaoHorario = document.getElementById('ocupacaoHorarioChart')?.getContext('2d');
    if (ctxOcupacaoHorario) {
        const horariosFuncionamento = []; // Ex: 09:00, 09:30 ... 18:00
        for (let h = 9; h <= 18; h++) {
            horariosFuncionamento.push(`${String(h).padStart(2, '0')}:00`);
            if (h < 18) horariosFuncionamento.push(`${String(h).padStart(2, '0')}:30`);
        }

        const dataHoje = new Date();
        dataHoje.setHours(0,0,0,0);
        const stringDataHoje = dataHoje.toISOString().split('T')[0]; // YYYY-MM-DD

        const ocupacaoPorHorario = horariosFuncionamento.map(horario => {
            return todasReservas.filter(r =>
                r.data === stringDataHoje &&
                r.horario === horario &&
                (r.status === "Confirmada" || r.status === "Pendente")
            ).length;
        });

        // Supondo um máximo de karts por horário (ex: 10 karts)
        const maxKartsPorHorario = 10;
        const taxaOcupacaoPercentual = ocupacaoPorHorario.map(ocupados => (ocupados / maxKartsPorHorario) * 100);


        new Chart(ctxOcupacaoHorario, {
            type: 'bar',
            data: {
                labels: horariosFuncionamento,
                datasets: [{
                    label: 'Ocupação de Karts Hoje (%)',
                    data: taxaOcupacaoPercentual,
                    backgroundColor: '#17a2b8',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 10,
                            callback: function(value) { return value + "%" }
                        }
                    }
                },
                plugins: { legend: { display: true } }
            }
        });
    }

    // 4. Gráfico de Novos Pilotos por Mês (Últimos 6 meses)
    const ctxNovosPilotosMes = document.getElementById('novosPilotosMesChart')?.getContext('2d');
    if (ctxNovosPilotosMes && todosPilotos.length > 0) {
        const contagemNovosPilotos = {}; // { "MM/YYYY": count }
        const hoje = new Date();

        todosPilotos.forEach(piloto => {
            if (piloto.dataCadastro) { // DD/MM/YYYY
                const [dia, mes, ano] = piloto.dataCadastro.split('/');
                const dataCadastroPiloto = new Date(ano, mes - 1, dia);

                // Considerar apenas os últimos 6 meses + mês atual
                const seisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);

                if (dataCadastroPiloto >= seisMesesAtras && dataCadastroPiloto <= hoje) {
                    const chaveMesAno = `${String(dataCadastroPiloto.getMonth() + 1).padStart(2, '0')}/${dataCadastroPiloto.getFullYear()}`;
                    contagemNovosPilotos[chaveMesAno] = (contagemNovosPilotos[chaveMesAno] || 0) + 1;
                }
            }
        });

        // Ordenar as chaves (meses) para o gráfico
        const labelsMeses = Object.keys(contagemNovosPilotos).sort((a, b) => {
            const [mesA, anoA] = a.split('/');
            const [mesB, anoB] = b.split('/');
            return new Date(anoA, mesA - 1) - new Date(anoB, mesB - 1);
        });
        const dataValores = labelsMeses.map(label => contagemNovosPilotos[label]);

        if (labelsMeses.length > 0) {
             new Chart(ctxNovosPilotosMes, {
                type: 'bar',
                data: {
                    labels: labelsMeses,
                    datasets: [{
                        label: 'Novos Pilotos Cadastrados',
                        data: dataValores,
                        backgroundColor: '#6f42c1', // Roxo
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                    plugins: { legend: { display: true } }
                }
            });
        } else {
            const p = document.createElement('p');
            p.textContent = "Não há dados de cadastro de pilotos nos últimos 6 meses para exibir.";
            ctxNovosPilotosMes.parentElement.appendChild(p);
        }
    } else if(ctxNovosPilotosMes) {
        const p = document.createElement('p');
        p.textContent = "Não há dados de pilotos para exibir o gráfico.";
        ctxNovosPilotosMes.parentElement.appendChild(p);
    }
});
