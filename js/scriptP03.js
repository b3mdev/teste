// Funções JavaScript para interatividade da Página 3

// Funções genéricas de localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

document.addEventListener('DOMContentLoaded', function() {
    const formPagina03 = document.getElementById('formPagina03');
    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const whatsappInput = document.getElementById('whatsapp');
    const cpfInput = document.getElementById('cpf');
    // const btnProxima = document.getElementById('btnProximaPagina03');

    // Carregar dados das páginas anteriores para verificar o fluxo
    const categoria = loadData('reservaCategoria');
    const tempo = loadData('reservaTempo');
    const dataReserva = loadData('reservaData');
    const horarioReserva = loadData('reservaHorario');

    if (!categoria || !tempo || !dataReserva || !horarioReserva) {
        alert("Por favor, complete os passos anteriores antes de prosseguir.");
        window.location.href = '../index.html'; // Redireciona para a primeira página se faltar dados
        return;
    }

    // Simples máscara para WhatsApp e CPF para melhorar a UX (não é uma validação robusta)
    whatsappInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        e.target.value = value.slice(0, 15); // (XX) XXXXX-XXXX
    });

    cpfInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = value.slice(0, 14); // XXX.XXX.XXX-XX
    });


    const btnAdicionarPiloto = document.getElementById('btnAdicionarPiloto');
    const listaPilotosAdicionaisDiv = document.getElementById('listaPilotosAdicionais');
    let pilotosAdicionais = []; // Array para armazenar os pilotos adicionais

    // Carregar pilotos adicionais se já existirem no localStorage (ex: ao voltar de outra página)
    const pilotosSalvos = loadData('reservaPilotosAdicionais');
    if (pilotosSalvos) {
        pilotosAdicionais = pilotosSalvos;
        pilotosAdicionais.forEach((piloto, index) => renderizarPilotoAdicional(piloto, index));
    }


    btnAdicionarPiloto.addEventListener('click', function() {
        adicionarNovoFormularioPiloto();
    });

    function adicionarNovoFormularioPiloto(piloto = {}, index = pilotosAdicionais.length) {
        const novoPilotoDiv = document.createElement('div');
        novoPilotoDiv.classList.add('piloto-adicional-item');
        novoPilotoDiv.dataset.index = index;

        novoPilotoDiv.innerHTML = `
            <h4>Piloto Adicional ${index + 1}</h4>
            <div>
                <label for="tipoCadastroPiloto${index}">Tipo de Cadastro:</label>
                <select id="tipoCadastroPiloto${index}" name="tipoCadastroPiloto${index}">
                    <option value="completo" ${piloto.tipoCadastro === 'completo' ? 'selected' : ''}>Completo (receberá e-mail)</option>
                    <option value="familiar" ${piloto.tipoCadastro === 'familiar' ? 'selected' : ''}>Familiar (sem e-mail)</option>
                </select>
            </div>
            <div>
                <label for="nomePiloto${index}">Nome:</label>
                <input type="text" id="nomePiloto${index}" name="nomePiloto${index}" value="${piloto.nome || ''}" required>
            </div>
            <div class="email-piloto-adicional" style="${piloto.tipoCadastro === 'familiar' ? 'display:none;' : ''}">
                <label for="emailPiloto${index}">E-mail:</label>
                <input type="email" id="emailPiloto${index}" name="emailPiloto${index}" value="${piloto.email || ''}">
            </div>
            <div class="parentesco-piloto-adicional" style="${piloto.tipoCadastro !== 'familiar' ? 'display:none;' : ''}">
                <label for="parentescoPiloto${index}">Parentesco (Ex: Filho, Esposa):</label>
                <input type="text" id="parentescoPiloto${index}" name="parentescoPiloto${index}" value="${piloto.parentesco || ''}">
            </div>
            <button type="button" class="btnRemoverPiloto">Remover Piloto</button>
            <hr>
        `;

        listaPilotosAdicionaisDiv.appendChild(novoPilotoDiv);

        const selectTipoCadastro = novoPilotoDiv.querySelector(`#tipoCadastroPiloto${index}`);
        const emailDiv = novoPilotoDiv.querySelector('.email-piloto-adicional');
        const parentescoDiv = novoPilotoDiv.querySelector('.parentesco-piloto-adicional');
        const emailInputPiloto = novoPilotoDiv.querySelector(`#emailPiloto${index}`);

        selectTipoCadastro.addEventListener('change', function() {
            if (this.value === 'familiar') {
                emailDiv.style.display = 'none';
                parentescoDiv.style.display = 'block';
                emailInputPiloto.required = false;
            } else {
                emailDiv.style.display = 'block';
                parentescoDiv.style.display = 'none';
                emailInputPiloto.required = true;
            }
        });
        // Trigger change para garantir o estado correto inicial se houver dados pré-carregados
        selectTipoCadastro.dispatchEvent(new Event('change'));


        novoPilotoDiv.querySelector('.btnRemoverPiloto').addEventListener('click', function() {
            const divToRemove = this.closest('.piloto-adicional-item');
            const idxToRemove = parseInt(divToRemove.dataset.index, 10);
            pilotosAdicionais.splice(idxToRemove, 1); // Remove do array
            divToRemove.remove(); // Remove do DOM
            // Re-renderizar ou re-indexar se necessário, ou simplesmente garantir que a coleta de dados ignore os removidos.
            // Para simplificar, a coleta de dados vai iterar sobre os elementos existentes no DOM.
            console.log("Piloto adicional removido, atualizando dados:", pilotosAdicionais);
        });
    }

    function renderizarPilotoAdicional(piloto, index) {
        adicionarNovoFormularioPiloto(piloto, index);
    }


    function coletarDadosPilotosAdicionais() {
        const pilotosColetados = [];
        const formsPilotos = listaPilotosAdicionaisDiv.querySelectorAll('.piloto-adicional-item');
        formsPilotos.forEach((formPiloto, i) => {
            const tipoCadastro = formPiloto.querySelector(`select[name="tipoCadastroPiloto${i}"]`).value;
            const nome = formPiloto.querySelector(`input[name="nomePiloto${i}"]`).value.trim();
            let email = '';
            let parentesco = '';

            if (tipoCadastro === 'completo') {
                email = formPiloto.querySelector(`input[name="emailPiloto${i}"]`).value.trim();
                if (!nome || !email) { // Validação básica
                    alert(`Por favor, preencha nome e e-mail para o Piloto Adicional ${i + 1}.`);
                    throw new Error("Dados incompletos para piloto adicional.");
                }
            } else { // familiar
                parentesco = formPiloto.querySelector(`input[name="parentescoPiloto${i}"]`).value.trim();
                if (!nome) { // Nome ainda é obrigatório para familiar
                    alert(`Por favor, preencha o nome para o Piloto Adicional ${i + 1} (Familiar).`);
                    throw new Error("Nome incompleto para piloto adicional familiar.");
                }
            }

            pilotosColetados.push({
                tipoCadastro,
                nome,
                email: tipoCadastro === 'completo' ? email : undefined,
                parentesco: tipoCadastro === 'familiar' ? parentesco : undefined
            });
        });
        return pilotosColetados;
    }


    formPagina03.addEventListener('submit', function(event) {
        event.preventDefault();

        // Validação simples (HTML5 'required' já ajuda)
        if (!nomeInput.value.trim() || !emailInput.value.trim() || !whatsappInput.value.trim() || !cpfInput.value.trim()) {
            alert('Por favor, preencha todos os campos obrigatórios do piloto principal.');
            return;
        }

        // Simulação de validação de reCAPTCHA (sempre válida nesta demo)
        const isRecaptchaValid = true;
        if (!isRecaptchaValid) {
            alert('Por favor, complete o reCAPTCHA.');
            return;
        }

        const pilotoPrincipal = {
            nome: nomeInput.value.trim(),
            email: emailInput.value.trim(),
            whatsapp: whatsappInput.value.trim(),
            cpf: cpfInput.value.trim()
        };
        saveData('reservaPilotoPrincipal', pilotoPrincipal);
        console.log('Dados do Piloto Principal Salvos:', pilotoPrincipal);

        try {
            pilotosAdicionais = coletarDadosPilotosAdicionais();
            saveData('reservaPilotosAdicionais', pilotosAdicionais);
            console.log('Dados dos Pilotos Adicionais Salvos:', pilotosAdicionais);
            window.location.href = 'pagina04.html';
        } catch (error) {
            console.error("Erro ao coletar dados dos pilotos adicionais:", error.message);
            // A mensagem de alerta já foi exibida pela função coletarDadosPilotosAdicionais
        }
    });
});
