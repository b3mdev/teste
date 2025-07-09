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
    const btnAnteriorPagina03 = document.getElementById('btnAnteriorPagina03');
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
        novoPilotoDiv.dataset.index = index; // Mantemos o índice para remoção do array se necessário

        // Usar a mesma estrutura de form-group para consistência
        novoPilotoDiv.innerHTML = `
            <button type="button" class="btnRemoverPiloto"><i class="fas fa-times-circle"></i> Remover</button>
            <h4><i class="fas fa-user-plus"></i> Piloto Adicional ${index + 1}</h4>
            <div class="form-group">
                <label for="tipoCadastroPiloto${index}"><i class="fas fa-id-badge"></i> Tipo de Cadastro:</label>
                <select id="tipoCadastroPiloto${index}" name="tipoCadastroPiloto${index}">
                    <option value="completo" ${piloto.tipoCadastro === 'completo' ? 'selected' : ''}>Completo (receberá e-mail)</option>
                    <option value="familiar" ${piloto.tipoCadastro === 'familiar' ? 'selected' : ''}>Familiar (sem e-mail)</option>
                </select>
            </div>
            <div class="form-group">
                <label for="nomePiloto${index}"><i class="fas fa-user"></i> Nome:</label>
                <input type="text" id="nomePiloto${index}" name="nomePiloto${index}" value="${piloto.nome || ''}" placeholder="Nome do piloto adicional" required>
            </div>
            <div class="form-group email-piloto-adicional" style="${piloto.tipoCadastro === 'familiar' ? 'display:none;' : ''}">
                <label for="emailPiloto${index}"><i class="fas fa-envelope"></i> E-mail:</label>
                <input type="email" id="emailPiloto${index}" name="emailPiloto${index}" value="${piloto.email || ''}" placeholder="email@exemplo.com">
            </div>
            <div class="form-group parentesco-piloto-adicional" style="${piloto.tipoCadastro !== 'familiar' ? 'display:none;' : ''}">
                <label for="parentescoPiloto${index}"><i class="fas fa-users"></i> Parentesco (Ex: Filho, Esposa):</label>
                <input type="text" id="parentescoPiloto${index}" name="parentescoPiloto${index}" value="${piloto.parentesco || ''}" placeholder="Ex: Filho, Amigo">
            </div>
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
        selectTipoCadastro.dispatchEvent(new Event('change'));


        novoPilotoDiv.querySelector('.btnRemoverPiloto').addEventListener('click', function() {
            // Encontrar o índice real do elemento no array pilotosAdicionais
            // Esta parte pode ser complexa se os índices do DOM e do array divergirem muito após remoções.
            // Uma forma mais simples é reconstruir o array a partir do DOM ao submeter.
            // Por agora, vamos apenas remover do DOM. A coleta de dados já itera sobre o DOM.
            novoPilotoDiv.remove();
            // Se precisarmos manter o array `pilotosAdicionais` sincronizado aqui,
            // seria necessário um ID único por piloto ou uma reindexação mais cuidadosa.
            console.log("Piloto adicional removido do DOM.");
        });
    }

    function renderizarPilotoAdicional(piloto, index) { // Usado para carregar do localStorage
        adicionarNovoFormularioPiloto(piloto, index);
    }

    // Atualiza a função de coleta para usar os nomes corretos dos campos e estrutura
    function coletarDadosPilotosAdicionais() {
        const pilotosColetados = [];
        const formsPilotos = listaPilotosAdicionaisDiv.querySelectorAll('.piloto-adicional-item');

        // Iterar sobre os elementos do DOM que ainda existem
        formsPilotos.forEach((formPiloto, domIndex) => {
            // Usar o índice do loop (domIndex) para construir os seletores,
            // pois os IDs originais podem ter sido removidos.
            // Os IDs no HTML são gerados com o `index` original, que pode não ser sequencial após remoções.
            // Para simplificar, vamos assumir que os IDs são únicos e ainda correspondem à estrutura.
            // Uma abordagem mais robusta usaria classes e `querySelector` dentro de `formPiloto`.
            const currentFormIndex = formPiloto.dataset.index; // Pega o índice original com o qual o form foi criado

            const tipoCadastroEl = formPiloto.querySelector(`select[id="tipoCadastroPiloto${currentFormIndex}"]`);
            const nomeEl = formPiloto.querySelector(`input[id="nomePiloto${currentFormIndex}"]`);
            const emailEl = formPiloto.querySelector(`input[id="emailPiloto${currentFormIndex}"]`);
            const parentescoEl = formPiloto.querySelector(`input[id="parentescoPiloto${currentFormIndex}"]`);

            if(!tipoCadastroEl || !nomeEl) { // Checagem básica de integridade do form
                console.warn("Formulário de piloto adicional incompleto ou corrompido, pulando.", formPiloto);
                return;
            }

            const tipoCadastro = tipoCadastroEl.value;
            const nome = nomeEl.value.trim();
            let email = '';
            let parentesco = '';

            if (tipoCadastro === 'completo') {
                email = emailEl ? emailEl.value.trim() : '';
                if (!nome || !email) {
                    alert(`Por favor, preencha nome e e-mail para o Piloto Adicional (item ${domIndex + 1}).`);
                    throw new Error("Dados incompletos para piloto adicional.");
                }
            } else { // familiar
                parentesco = parentescoEl ? parentescoEl.value.trim() : '';
                if (!nome) {
                    alert(`Por favor, preencha o nome para o Piloto Adicional (item ${domIndex + 1}) (Familiar).`);
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

    btnAnteriorPagina03.addEventListener('click', function() {
        window.location.href = 'pagina02.html';
    });

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
