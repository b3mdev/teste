// mock_data.js

// Função para gerar uma data aleatória nos próximos N dias ou passados M dias
function getRandomDate(startOffset = -30, endOffset = 30) {
    const today = new Date();
    const dayOffset = Math.floor(Math.random() * (endOffset - startOffset + 1)) + startOffset;
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    return date;
}

// Função para formatar data como YYYY-MM-DD para input date e DD/MM/YYYY para exibição
function formatDate(date, format = "YYYY-MM-DD") {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    if (format === "YYYY-MM-DD") {
        return [year, month, day].join('-');
    } else if (format === "DD/MM/YYYY") {
        return [day, month, year].join('/');
    }
    return d.toDateString(); // fallback
}

// Função para gerar um horário aleatório em slots de 30 min
function getRandomTime() {
    const hour = Math.floor(Math.random() * (18 - 9 + 1)) + 9; // 9 AM to 6 PM
    const minute = Math.random() < 0.5 ? '00' : '30';
    return `${String(hour).padStart(2, '0')}:${minute}`;
}

// Nomes fictícios
const firstNames = ["Ana", "Bruno", "Carlos", "Daniela", "Eduardo", "Fernanda", "Gustavo", "Helena", "Igor", "Julia"];
const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes"];

// CPFs e WhatsApps fictícios
function generateCPF() {
    return `${Math.floor(Math.random() * 999)}.${Math.floor(Math.random() * 999)}.${Math.floor(Math.random() * 999)}-${Math.floor(Math.random() * 99)}`;
}
function generateWhatsApp() {
    return `(${Math.floor(Math.random() * 90) + 10}) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`;
}


// Gerar Pilotos Fictícios
const mockPilotos = [];
for (let i = 1; i <= 20; i++) {
    const nome = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    mockPilotos.push({
        id: `p${i}`,
        nome: nome,
        email: `${nome.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        whatsapp: generateWhatsApp(),
        cpf: generateCPF(),
        dataCadastro: formatDate(getRandomDate(-180, 0), "DD/MM/YYYY") // Cadastrado nos últimos 6 meses
    });
}

// Gerar Reservas Fictícias
const mockReservas = [];
const categorias = ["CADETINHO (5,5HP HONDA)", "STANDART 6.5 HP Honda", "PREPARADO 8.5 HP Honda", "13HP HONDA Performance Elevada"];
const tempos = ["15min", "20min", "25min", "30min"];
const statusReserva = ["Pendente", "Confirmada", "Cancelada", "Realizada"];

for (let i = 1; i <= 50; i++) {
    const pilotoPrincipal = mockPilotos[Math.floor(Math.random() * mockPilotos.length)];
    const dataReserva = getRandomDate(-15, 45); // Reservas de 15 dias atrás até 45 dias no futuro
    const status = statusReserva[Math.floor(Math.random() * statusReserva.length)];

    // Se a data da reserva for no passado, o status não pode ser "Pendente"
    let currentStatus = status;
    if (new Date(dataReserva) < new Date() && status === "Pendente") {
        currentStatus = Math.random() < 0.8 ? "Realizada" : "Cancelada"; // 80% Realizada, 20% Cancelada
    }
     // Se a data da reserva for no futuro, o status não pode ser "Realizada"
    if (new Date(dataReserva) > new Date() && status === "Realizada") {
        currentStatus = Math.random() < 0.8 ? "Confirmada" : "Pendente"; // 80% Confirmada, 20% Pendente
    }


    const numPilotosAdicionais = Math.floor(Math.random() * 3); // 0 a 2 pilotos adicionais
    const pilotosAdicionais = [];
    for (let j = 0; j < numPilotosAdicionais; j++) {
        const tipoCadastro = Math.random() < 0.7 ? "completo" : "familiar";
        const nomeAdicional = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        if (tipoCadastro === "completo") {
            pilotosAdicionais.push({
                tipoCadastro: "completo",
                nome: nomeAdicional,
                email: `${nomeAdicional.toLowerCase().replace(/\s+/g, '.')}@example.com`
            });
        } else {
            pilotosAdicionais.push({
                tipoCadastro: "familiar",
                nome: nomeAdicional,
                parentesco: "Amigo/Familiar"
            });
        }
    }

    mockReservas.push({
        id: `r${i}`,
        data: formatDate(dataReserva, "YYYY-MM-DD"), // Formato para input date
        displayData: formatDate(dataReserva, "DD/MM/YYYY"), // Formato para exibição
        horario: getRandomTime(),
        categoria: categorias[Math.floor(Math.random() * categorias.length)],
        tempo: tempos[Math.floor(Math.random() * tempos.length)],
        pilotoPrincipalId: pilotoPrincipal.id,
        pilotoPrincipalNome: pilotoPrincipal.nome, // Denormalizado para facilitar exibição
        pilotosAdicionais: pilotosAdicionais,
        status: currentStatus,
        observacoes: Math.random() < 0.2 ? "Cliente pediu para confirmar por WhatsApp." : "" // Algumas com obs
    });
}

// Adicionar contagem de corridas aos pilotos
mockPilotos.forEach(piloto => {
    piloto.numCorridas = mockReservas.filter(reserva => reserva.pilotoPrincipalId === piloto.id && (reserva.status === "Confirmada" || reserva.status === "Realizada")).length;
});


// Disponibilizar os dados para outros scripts (se não usar módulos ES6)
window.mockPilotosGlobal = mockPilotos;
window.mockReservasGlobal = mockReservas;

console.log("Mock data loaded:", { pilotos: mockPilotosGlobal.length, reservas: mockReservasGlobal.length });
