// Funções JavaScript para interatividade da Página 4

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

document.addEventListener('DOMContentLoaded', function() {
    // const formPagina04 = document.getElementById('formPagina04'); // Removido, agora é formPagamentoDetalhes
    const formaPagamentoButtons = document.querySelectorAll('.forma-pagamento-btn');
    const dadosCartaoDiv = document.getElementById('dadosCartao');
    const dadosPixDiv = document.getElementById('dadosPix');
    const formPagamentoDetalhes = document.getElementById('formPagamentoDetalhes'); // Novo form
    const btnFinalizarPagamento = document.getElementById('btnFinalizarPagamento');
    const btnAnteriorPagina04 = document.getElementById('btnAnteriorPagina04');
    const mensagemPagamentoDiv = document.getElementById('mensagemPagamento');
    const pixStatusMsg = document.getElementById('pixStatusMsg');


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

    formaPagamentoButtons.forEach(button => {
        button.addEventListener('click', function() {
            formaPagamentoButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            formaPagamentoSelecionada = this.dataset.valor;
            btnFinalizarPagamento.disabled = false; // Habilita o botão de finalizar

            if (formaPagamentoSelecionada === 'cartao') {
                dadosCartaoDiv.style.display = 'block';
                dadosPixDiv.style.display = 'none';
                pixStatusMsg.style.display = 'none';
                // Tornar campos de cartão obrigatórios dinamicamente se necessário (HTML5 required já pode estar lá)
                numeroCartaoInput.required = true;
                nomeCartaoInput.required = true;
                validadeCartaoInput.required = true;
                cvvCartaoInput.required = true;
            } else if (formaPagamentoSelecionada === 'pix') {
                dadosCartaoDiv.style.display = 'none';
                dadosPixDiv.style.display = 'block';
                 pixStatusMsg.style.display = 'block'; // Mostra "Aguardando..."
                // Campos de cartão não são mais obrigatórios
                numeroCartaoInput.required = false;
                nomeCartaoInput.required = false;
                validadeCartaoInput.required = false;
                cvvCartaoInput.required = false;
            }
            // Força um reflow para a animação CSS funcionar ao mudar display de none para block
            void dadosCartaoDiv.offsetWidth;
            void dadosPixDiv.offsetWidth;
        });
    });

    btnAnteriorPagina04.addEventListener('click', function() {
        window.location.href = 'pagina03.html';
    });

    // Máscaras para cartão (simples) - Mantidas
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

    if (formPagamentoDetalhes) { // Verifica se o formulário existe
        formPagamentoDetalhes.addEventListener('submit', function(event) {
            event.preventDefault();
            btnFinalizarPagamento.disabled = true;
            btnFinalizarPagamento.innerHTML = 'Processando <i class="fas fa-spinner fa-spin"></i>';

            mensagemPagamentoDiv.textContent = '';
            mensagemPagamentoDiv.style.display = 'none';
            mensagemPagamentoDiv.className = 'payment-message';

            const dadosPagamento = {
                forma: formaPagamentoSelecionada
            };

            if (formaPagamentoSelecionada === 'cartao') {
                if (!numeroCartaoInput.value || !nomeCartaoInput.value || !validadeCartaoInput.value || !cvvCartaoInput.value) {
                    mensagemPagamentoDiv.textContent = 'Erro: Por favor, preencha todos os dados do cartão.';
                    mensagemPagamentoDiv.className = 'payment-message error';
                    mensagemPagamentoDiv.style.display = 'block';
                    btnFinalizarPagamento.disabled = false;
                    btnFinalizarPagamento.innerHTML = 'Finalizar Pagamento <i class="fas fa-check-circle"></i>';
                    return;
                }
                dadosPagamento.cartao = {
                    numero: numeroCartaoInput.value.slice(-4),
                    nome: nomeCartaoInput.value,
                    validade: validadeCartaoInput.value,
                };

                setTimeout(() => {
                    const sucesso = Math.random() > 0.2;
                    if (sucesso) {
                        mensagemPagamentoDiv.textContent = 'Pagamento com cartão aprovado!';
                        mensagemPagamentoDiv.className = 'payment-message success';
                        saveData('reservaPagamento', dadosPagamento);
                        console.log("Pagamento Salvo:", dadosPagamento);
                        setTimeout(() => { window.location.href = 'pagina05.html'; }, 1500);
                    } else {
                        mensagemPagamentoDiv.textContent = 'Falha no pagamento com cartão. Verifique os dados ou tente outra forma.';
                        mensagemPagamentoDiv.className = 'payment-message error';
                        btnFinalizarPagamento.disabled = false;
                        btnFinalizarPagamento.innerHTML = 'Finalizar Pagamento <i class="fas fa-check-circle"></i>';
                    }
                    mensagemPagamentoDiv.style.display = 'block';
                }, 2000);

            } else if (formaPagamentoSelecionada === 'pix') {
                dadosPagamento.pix = {
                    codigo: pixCodigoInput.value
                };
                pixStatusMsg.style.display = 'block'; // Já deve estar visível se PIX foi selecionado
                pixStatusMsg.innerHTML = 'Aguardando confirmação do pagamento PIX... <i class="fas fa-spinner fa-spin"></i>';

                setTimeout(() => {
                    pixStatusMsg.innerHTML = 'Pagamento PIX confirmado! <i class="fas fa-check-square" style="color: var(--color-success);"></i>';

                    mensagemPagamentoDiv.textContent = 'Pagamento PIX confirmado!';
                    mensagemPagamentoDiv.className = 'payment-message success';
                    mensagemPagamentoDiv.style.display = 'block';

                    saveData('reservaPagamento', dadosPagamento);
                    console.log("Pagamento Salvo:", dadosPagamento);
                    setTimeout(() => { window.location.href = 'pagina05.html'; }, 1500);
                }, 3000);
            } else {
                mensagemPagamentoDiv.textContent = 'Por favor, selecione uma forma de pagamento.';
                mensagemPagamentoDiv.className = 'payment-message error';
                mensagemPagamentoDiv.style.display = 'block';
                btnFinalizarPagamento.disabled = false;
                btnFinalizarPagamento.innerHTML = 'Finalizar Pagamento <i class="fas fa-check-circle"></i>';
            }
        });
    }
});
