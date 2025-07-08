// Funções JavaScript para interatividade da Página 4

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

document.addEventListener('DOMContentLoaded', function() {
    const formPagina04 = document.getElementById('formPagina04');
    const radiosFormaPagamento = document.querySelectorAll('input[name="formaPagamento"]');
    const dadosCartaoDiv = document.getElementById('dadosCartao');
    const dadosPixDiv = document.getElementById('dadosPix');
    const btnFinalizarPagamento = document.getElementById('btnFinalizarPagamento');
    const mensagemPagamentoDiv = document.getElementById('mensagemPagamento');

    // Campos do cartão
    const numeroCartaoInput = document.getElementById('numeroCartao');
    const nomeCartaoInput = document.getElementById('nomeCartao');
    const validadeCartaoInput = document.getElementById('validadeCartao');
    const cvvCartaoInput = document.getElementById('cvvCartao');

    // PIX
    const btnCopiarPix = document.getElementById('btnCopiarPix');
    const pixCodigoInput = document.getElementById('pixCodigo');

    let formaPagamentoSelecionada = null;

    // Verificar se os dados das etapas anteriores existem
    if (!loadData('reservaPilotoPrincipal')) {
        alert("Por favor, complete os dados do piloto antes de prosseguir para o pagamento.");
        window.location.href = 'pagina03.html';
        return;
    }

    radiosFormaPagamento.forEach(radio => {
        radio.addEventListener('change', function() {
            formaPagamentoSelecionada = this.value;
            if (this.value === 'cartao') {
                dadosCartaoDiv.style.display = 'block';
                dadosPixDiv.style.display = 'none';
                // Tornar campos de cartão obrigatórios
                numeroCartaoInput.required = true;
                nomeCartaoInput.required = true;
                validadeCartaoInput.required = true;
                cvvCartaoInput.required = true;
            } else if (this.value === 'pix') {
                dadosCartaoDiv.style.display = 'none';
                dadosPixDiv.style.display = 'block';
                // Campos de cartão não são mais obrigatórios
                numeroCartaoInput.required = false;
                nomeCartaoInput.required = false;
                validadeCartaoInput.required = false;
                cvvCartaoInput.required = false;
            }
        });
    });

    // Máscaras para cartão (simples)
    numeroCartaoInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value.slice(0, 19); // XXXX XXXX XXXX XXXX
    });
    validadeCartaoInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{2})(\d)/, '$1/$2');
        e.target.value = value.slice(0, 5); // MM/AA
    });
    cvvCartaoInput.addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); // CVV geralmente 3 ou 4 dígitos
    });


    if(btnCopiarPix) {
        btnCopiarPix.addEventListener('click', function() {
            pixCodigoInput.select();
            try {
                document.execCommand('copy');
                alert('Código PIX copiado para a área de transferência!');
            } catch (err) {
                alert('Não foi possível copiar o código. Tente manualmente.');
            }
        });
    }


    formPagina04.addEventListener('submit', function(event) {
        event.preventDefault();
        btnFinalizarPagamento.disabled = true;
        btnFinalizarPagamento.textContent = 'Processando...';
        mensagemPagamentoDiv.textContent = '';

        const dadosPagamento = {
            forma: formaPagamentoSelecionada
        };

        if (formaPagamentoSelecionada === 'cartao') {
            if (!numeroCartaoInput.value || !nomeCartaoInput.value || !validadeCartaoInput.value || !cvvCartaoInput.value) {
                mensagemPagamentoDiv.textContent = 'Erro: Por favor, preencha todos os dados do cartão.';
                mensagemPagamentoDiv.style.color = 'red';
                btnFinalizarPagamento.disabled = false;
                btnFinalizarPagamento.textContent = 'Finalizar Pagamento';
                return;
            }
            dadosPagamento.cartao = {
                numero: numeroCartaoInput.value.slice(-4), // Salvar apenas os últimos 4 dígitos por segurança (simulação)
                nome: nomeCartaoInput.value,
                validade: validadeCartaoInput.value,
                // Não salvar CVV
            };
            // Simulação de processamento de cartão
            setTimeout(() => {
                // Simular sucesso ou falha aleatoriamente
                const sucesso = Math.random() > 0.2; // 80% de chance de sucesso
                if (sucesso) {
                    mensagemPagamentoDiv.textContent = 'Pagamento com cartão aprovado!';
                    mensagemPagamentoDiv.style.color = 'green';
                    saveData('reservaPagamento', dadosPagamento);
                    console.log("Pagamento Salvo:", dadosPagamento);
                    window.location.href = 'pagina05.html';
                } else {
                    mensagemPagamentoDiv.textContent = 'Falha no pagamento com cartão. Verifique os dados ou tente outra forma.';
                    mensagemPagamentoDiv.style.color = 'red';
                    btnFinalizarPagamento.disabled = false;
                    btnFinalizarPagamento.textContent = 'Finalizar Pagamento';
                }
            }, 2000);

        } else if (formaPagamentoSelecionada === 'pix') {
            dadosPagamento.pix = {
                codigo: pixCodigoInput.value
            };
            // Simulação de confirmação de PIX
            mensagemPagamentoDiv.textContent = 'Aguardando confirmação do pagamento PIX... (Isso pode levar alguns instantes)';
            mensagemPagamentoDiv.style.color = 'blue';
            setTimeout(() => {
                // Simular sucesso (PIX geralmente é rápido)
                mensagemPagamentoDiv.textContent = 'Pagamento PIX confirmado!';
                mensagemPagamentoDiv.style.color = 'green';
                saveData('reservaPagamento', dadosPagamento);
                console.log("Pagamento Salvo:", dadosPagamento);
                window.location.href = 'pagina05.html';
            }, 3000); // Simula um tempo para "confirmação"
        } else {
            mensagemPagamentoDiv.textContent = 'Por favor, selecione uma forma de pagamento.';
            mensagemPagamentoDiv.style.color = 'red';
            btnFinalizarPagamento.disabled = false;
            btnFinalizarPagamento.textContent = 'Finalizar Pagamento';
        }
    });
});
