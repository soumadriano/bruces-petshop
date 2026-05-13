// ============================================
// DADOS (armazenados no localStorage)
// ============================================

function carregarDados() {
    const dados = localStorage.getItem('petshop_agendamentos');
    if (dados) {
        return JSON.parse(dados);
    }
    // Dados iniciais de exemplo
    return [
        {
            id: 1,
            cliente_nome: "Ana Silva",
            cliente_email: "ana@email.com",
            cliente_telefone: "(48) 99999-1111",
            pet_nome: "Rex",
            servico: "Banho",
            data_agendamento: new Date(Date.now() + 86400000).toISOString(),
            observacoes: "Pet é agitado",
            status: "pendente"
        },
        {
            id: 2,
            cliente_nome: "Carlos Santos",
            cliente_email: "carlos@email.com",
            cliente_telefone: "(49) 99999-2222",
            pet_nome: "Luna",
            servico: "Tosa",
            data_agendamento: new Date(Date.now() + 172800000).toISOString(),
            observacoes: "",
            status: "em_andamento"
        }
    ];
}

function salvarDados(agendamentos) {
    localStorage.setItem('petshop_agendamentos', JSON.stringify(agendamentos));
}

let agendamentos = carregarDados();

// ============================================
// FUNÇÕES DO KANBAN
// ============================================

function renderizarKanban() {
    const colunas = {
        pendente: document.getElementById('coluna-pendente'),
        em_andamento: document.getElementById('coluna-andamento'),
        concluido: document.getElementById('coluna-concluido')
    };
    
    // Limpar colunas
    Object.values(colunas).forEach(coluna => {
        if (coluna) coluna.innerHTML = '';
    });
    
    // Contadores
    let contadores = { pendente: 0, em_andamento: 0, concluido: 0 };
    
    agendamentos.forEach(agendamento => {
        const card = criarCard(agendamento);
        const coluna = colunas[agendamento.status];
        if (coluna) {
            coluna.appendChild(card);
            contadores[agendamento.status]++;
        }
    });
    
    // Atualizar contadores na tela
    document.getElementById('count-pendente').textContent = contadores.pendente;
    document.getElementById('count-andamento').textContent = contadores.em_andamento;
    document.getElementById('count-concluido').textContent = contadores.concluido;
}

function criarCard(agendamento) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.dataset.id = agendamento.id;
    
    const data = new Date(agendamento.data_agendamento);
    const dataFormatada = data.toLocaleString('pt-BR');
    
    card.innerHTML = `
        <h4>🐕 ${agendamento.pet_nome}</h4>
        <p><strong>Cliente:</strong> ${agendamento.cliente_nome}</p>
        <p><strong>Serviço:</strong> ${agendamento.servico}</p>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <div class="card-actions">
            ${agendamento.status === 'pendente' ? '<button onclick="mudarStatus(' + agendamento.id + ', \'em_andamento\')" title="Iniciar">✂️ Iniciar</button>' : ''}
            ${agendamento.status === 'em_andamento' ? '<button onclick="mudarStatus(' + agendamento.id + ', \'concluido\')" title="Concluir">✅ Concluir</button>' : ''}
            ${agendamento.status !== 'concluido' ? '<button onclick="cancelarAgendamento(' + agendamento.id + ')" title="Cancelar">❌ Cancelar</button>' : ''}
        </div>
    `;
    
    return card;
}

function mudarStatus(id, novoStatus) {
    const index = agendamentos.findIndex(a => a.id === id);
    if (index !== -1) {
        agendamentos[index].status = novoStatus;
        salvarDados(agendamentos);
        renderizarKanban();
        mostrarToast(`Status atualizado para ${novoStatus}`, 'sucesso');
    }
}

function cancelarAgendamento(id) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        const index = agendamentos.findIndex(a => a.id === id);
        if (index !== -1) {
            agendamentos.splice(index, 1);
            salvarDados(agendamentos);
            renderizarKanban();
            mostrarToast('Agendamento cancelado!', 'sucesso');
        }
    }
}

// ============================================
// CRIAR NOVO AGENDAMENTO
// ============================================

function criarAgendamento(event) {
    event.preventDefault();
    
    const novoAgendamento = {
        id: Date.now(),
        cliente_nome: document.getElementById('cliente_nome').value,
        cliente_email: document.getElementById('cliente_email').value,
        cliente_telefone: document.getElementById('cliente_telefone').value,
        pet_nome: document.getElementById('pet_nome').value,
        servico: document.getElementById('servico').value,
        data_agendamento: document.getElementById('data_agendamento').value,
        observacoes: document.getElementById('observacoes').value,
        status: 'pendente'
    };
    
    // Validação
    if (!novoAgendamento.cliente_nome || !novoAgendamento.cliente_email || 
        !novoAgendamento.pet_nome || !novoAgendamento.servico || !novoAgendamento.data_agendamento) {
        mostrarToast('Preencha todos os campos obrigatórios!', 'erro');
        return;
    }
    
    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(novoAgendamento.cliente_email)) {
        mostrarToast('Digite um e-mail válido!', 'erro');
        return;
    }
    
    agendamentos.push(novoAgendamento);
    salvarDados(agendamentos);
    renderizarKanban();
    
    document.getElementById('formAgendamento').reset();
    mostrarToast('Agendamento realizado com sucesso!', 'sucesso');
}

// ============================================
// ENVIAR CONTATO
// ============================================

function enviarContato(event) {
    event.preventDefault();
    
    const nome = document.getElementById('contato_nome').value;
    const email = document.getElementById('contato_email').value;
    const mensagem = document.getElementById('contato_mensagem').value;
    
    if (!nome || !email || !mensagem) {
        mostrarToast('Preencha todos os campos obrigatórios!', 'erro');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarToast('Digite um e-mail válido!', 'erro');
        return;
    }
    
    // Salvar contato no localStorage
    const contatos = JSON.parse(localStorage.getItem('petshop_contatos') || '[]');
    contatos.push({
        id: Date.now(),
        nome,
        email,
        telefone: document.getElementById('contato_telefone').value,
        mensagem,
        data: new Date().toISOString()
    });
    localStorage.setItem('petshop_contatos', JSON.stringify(contatos));
    
    document.getElementById('formContato').reset();
    mostrarToast('Mensagem enviada com sucesso! Entraremos em contato.', 'sucesso');
}

// ============================================
// TOAST
// ============================================

function mostrarToast(mensagem, tipo) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `
        <i class="fas ${tipo === 'sucesso' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${mensagem}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ============================================
// ANIMAÇÃO DOS NÚMEROS
// ============================================

function animarNumeros() {
    const numeros = document.querySelectorAll('.numero');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const elemento = entry.target;
                const target = parseInt(elemento.dataset.target);
                let current = 0;
                const increment = target / 50;
                
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        elemento.textContent = target;
                        clearInterval(timer);
                    } else {
                        elemento.textContent = Math.floor(current);
                    }
                }, 30);
                
                observer.unobserve(elemento);
            }
        });
    });
    
    numeros.forEach(numero => observer.observe(numero));
}

// ============================================
// MENU MOBILE
// ============================================

document.querySelector('.menu-hamburger')?.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
});

// ============================================
// SMOOTH SCROLL
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
        // Fechar menu mobile se estiver aberto
        document.querySelector('.nav-links')?.classList.remove('active');
    });
});

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    renderizarKanban();
    animarNumeros();
    
    const formAgendamento = document.getElementById('formAgendamento');
    const formContato = document.getElementById('formContato');
    
    if (formAgendamento) formAgendamento.addEventListener('submit', criarAgendamento);
    if (formContato) formContato.addEventListener('submit', enviarContato);
});

// Exportar funções globais
window.mudarStatus = mudarStatus;
window.cancelarAgendamento = cancelarAgendamento;