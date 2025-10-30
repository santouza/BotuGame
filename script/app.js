window.addEventListener('DOMContentLoaded', () => {
  const dra = document.getElementById('drHigieneContainer');
  if (dra && !dra.classList.contains('hidden')) dra.classList.add('hidden');
});

function mostrarDra(texto) {
  const cont = document.getElementById('drHigieneContainer');
  const bal = document.getElementById('drHigieneBaloon');
  if (!cont) return;
  cont.classList.remove('hidden');
  cont.setAttribute('aria-hidden', 'false');
  if (bal && texto) {
    bal.textContent = texto;
    bal.classList.add('show');
    clearTimeout(bal._hideTimeout);
    bal._hideTimeout = setTimeout(() => bal.classList.remove('show'), 6000);
  }
}

function esconderDra() {
  const cont = document.getElementById('drHigieneContainer');
  const bal = document.getElementById('drHigieneBaloon');
  if (!cont) return;
  if (bal) {
    bal.classList.remove('show');
    clearTimeout(bal._hideTimeout);
  }
  cont.classList.add('hidden');
  cont.setAttribute('aria-hidden', 'true');
}


const DATA = {
    mercado: [{
            id: 'lata-estufada',
            emoji: '🥫',
            titulo: 'Lata estufada',
            seguro: false,
            motivo: 'Latas estufadas podem ter gás pela ação de bactérias e podem conter toxina botulínica.',
            dica: 'Nunca compre latas estufadas, amassadas ou enferrujadas.'
        },
        {
            id: 'lata-integra',
            emoji: '🥫',
            titulo: 'Lata íntegra',
            seguro: true,
            motivo: 'Lata sem amassados/estufamento e dentro do prazo.',
            dica: 'Verifique prazo de validade e integridade.'
        },
        {
            id: 'conserva-caseira-tampa-alta',
            emoji: '🥒',
            titulo: 'Conserva caseira — tampa alta',
            seguro: false,
            motivo: 'Tampa estufada/alto risco: possível produção de toxina em ambiente sem oxigênio.',
            dica: 'Descarte frascos com tampa estufada ou vazando.'
        },
        {
            id: 'pao-fresco',
            emoji: '🍞',
            titulo: 'Pão do dia',
            seguro: true,
            motivo: 'Produto fresco, não enlatado; baixo risco para botulismo.',
            dica: 'Armazene corretamente após comprar.'
        },
        {
            id: 'embalagem-rasgada',
            emoji: '🧀',
            titulo: 'Embalagem rasgada',
            seguro: false,
            motivo: 'Selagem comprometida aumenta contaminação.',
            dica: 'Escolha embalagens íntegras.'
        },
        {
            id: 'fruta-fresca',
            emoji: '🍎',
            titulo: 'Fruta fresca',
            seguro: true,
            motivo: 'Alimentos frescos e bem lavados são escolhas seguras.',
            dica: 'Lave bem antes de consumir.'
        }
    ],
    cozinha: [{
            id: 'lata-aberta-bancada',
            emoji: '🥫',
            titulo: 'Lata aberta na bancada',
            correto: 'geladeira',
            motivo: 'Após abrir, transfira o conteúdo para pote limpo/tampado e leve à geladeira.',
            dica: 'Nunca guarde alimento em lata aberta.'
        },
        {
            id: 'conserva-suspeita',
            emoji: '🥒',
            titulo: 'Conserva com tampa estufada',
            correto: 'lixo',
            motivo: 'Sinal de gás produzido por microrganismos; descarte sem provar.',
            dica: 'Se borbulhar, cheirar mal ou estufar, descarte.'
        },
        {
            id: 'legumes-frescos',
            emoji: '🥕',
            titulo: 'Legumes frescos',
            correto: 'despensa',
            motivo: 'Podem ir à despensa fresca/arejada (ou geladeira conforme alimento);.',
            dica: 'Higienize antes de usar.'
        },
        {
            id: 'sobras-pote',
            emoji: '🍲',
            titulo: 'Sobras em pote tampado',
            correto: 'geladeira',
            motivo: 'Armazenar sobras tampadas e refrigeradas reduz risco.',
            dica: 'Reaqueça completamente antes de comer.'
        }
    ],
    quiz: [{
            q: 'Latas estufadas ou enferrujadas devem ser compradas se o preço estiver bom.',
            a: false,
            exp: 'Nunca compre latas estufadas/amassadas/enferrujadas.'
        },
        {
            q: 'Conservas com a tampa alta/estufada podem conter toxina do botulismo.',
            a: true,
            exp: 'Tampa estufada indica gás; descarte sem provar.'
        },
        {
            q: 'Depois de abrir uma lata, posso guardar o alimento na própria lata, fora da geladeira.',
            a: false,
            exp: 'Transfira para pote limpo/tampado e refrigere.'
        },
        {
            q: 'O botulismo gosta de lugares sem oxigênio, como conservas mal preparadas.',
            a: true,
            exp: 'Ambiente anaeróbio favorece a toxina botulínica.'
        },
        {
            q: 'Se um vidro de conserva fizer barulho de gás ao abrir, devo provar um pouquinho para ver o gosto.',
            a: false,
            exp: 'Nunca prove alimento suspeito; descarte com segurança.'
        }
    ]
};

const state = {
    pontos: 0,
    fase: 'menu',
    selecionados: new Set(),
    cozinhaDrops: { geladeira: [], despensa: [], lixo: [] },
    nomeJogador: '',
};

const $ = (sel, root = document) => root.querySelector(sel);
const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
        if (k === 'class') n.className = v;
        else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
        else if (v !== null && v !== undefined) n.setAttribute(k, v);
    });
    kids.forEach(k => n.append(k));
    return n;
};

function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1600);
}

function setStage(name) {
    state.fase = name;
    $('#stagePill').textContent = name[0].toUpperCase() + name.slice(1);
    render();
    $('#view').focus();
}

function addPoints(n) {
    state.pontos = Math.max(0, state.pontos + n);
    $('#score').textContent = state.pontos;
}

function render() {
    const view = $('#view');
    view.innerHTML = '';

if (state.fase === 'menu') {
    view.append(
        
        el('section', { class: 'panel' },
            el('h2', { class: 'stage-title' }, 'Bem-vindo!'),
            el('p', {}, 'Ajude a ', el('strong', {}, 'Dra. Higiene'), ' a escolher e armazenar alimentos com segurança.'),
            el('div', { class: 'row cols-2' },
                el('div', { class: 'panel' },
                    el('h3', {}, 'Como jogar'),
                    el('ul', {},
                        el('li', {}, 'Fase Mercado: escolha os itens seguros.'),
                        el('li', {}, 'Fase Cozinha: envie cada item para ', el('strong', {}, 'Geladeira, Despensa ou Lixo'), '.'),
                        el('li', {}, 'Quiz final: responda para virar Guardião(ã) da Saúde!'),
                    ),
                    el('p', { class: 'hint' }, 'Conteúdo educativo: sinais de risco (lata estufada), armazenamento correto, e por que descartar itens suspeitos.')
                ),
                el('div', { class: 'panel' },
                    el('label', { for: 'nome' }, 'Seu nome (opcional)'),
                    el('input', { id: 'nome', type: 'text', placeholder: 'Ex.: Ana', style: 'width:100%; padding:10px; border-radius:10px; border:1px solid #dbe2ff', value: state.nomeJogador }),
                    el('div', { style: 'height:12px' }),
                    el('button', {
                        class: 'btn',
                        onClick: () => {
                            state.nomeJogador = $('#nome').value.trim();
                            setStage('mercado');
                            setTimeout(() => {
                            }, 500);
                        }
                    }, '▶ Começar')
                )
            )
        )
    );
    return;
}


    if (state.fase === 'mercado') {
        const header = el('div', {},
            el('h2', { class: 'stage-title' }, 'Fase 1 — Mercado 🛒'),
            el('div', { class: 'hint' }, 'Clique nos itens SEGUROS para colocá-los no carrinho. Itens inseguros dão dica e tiram pontos.')
        );

        const grid = el('div', { class: 'items', role: 'list' });
        DATA.mercado.forEach(item => {
            const card = el('button', {
                    class: 'card',
                    role: 'listitem',
                    'aria-pressed': state.selecionados.has(item.id) ? 'true' : 'false',
                    onClick: () => handleMercadoChoose(item),
                    onKeydown: (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleMercadoChoose(item);
                        }
                    }
                },
                el('div', { class: 'emoji', 'aria-hidden': 'true' }, item.emoji),
                el('div', { class: 'title' }, item.titulo),
                el('div', { class: 'desc' }, state.selecionados.has(item.id) ? (item.seguro ? 'Adicionado ao carrinho.' : 'Marcado como inseguro.') : 'Clique para escolher.'),
                el('div', { class: 'choice' })
            );
            grid.append(card);
        });

        const actions = el('div', {},
            el('button', { class: 'btn', onClick: () => setStage('cozinha') }, 'Ir para a Cozinha ➪')
        );

        view.append(el('section', { class: 'panel' }, header, grid, el('div', { style: 'height:8px' }), actions));
        return;
    }

    if (state.fase === 'cozinha') {
        const info = el('div', {},
            el('h2', { class: 'stage-title' }, 'Fase 2 — Cozinha 👩‍🍳'),
            el('div', { class: 'status' },
                'Envie cada item para o destino correto: ',
                el('strong', {}, 'Geladeira, Despensa ou Lixo'),
                '. Clique no item e depois no destino (ou use teclado).'
            )
        );

        const itemsWrap = el('div', { class: 'items', role: 'list' });
        DATA.cozinha.forEach(item => {
            const alreadyPlaced = Object.values(state.cozinhaDrops).some(arr => arr.includes(item.id));
            if (alreadyPlaced) return;
            itemsWrap.append(
                el('div', {
                        class: 'card',
                        role: 'listitem',
                        tabIndex: '0',
                        onClick: () => selectForDrop(item),
                        onKeydown: (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                selectForDrop(item);
                            }
                        }
                    },
                    el('div', { class: 'emoji', 'aria-hidden': 'true' }, item.emoji),
                    el('div', { class: 'title' }, item.titulo),
                    el('div', { class: 'desc' }, 'Selecione e depois clique num destino abaixo.')
                )
            );
        });

        const dest = el('div', { class: 'destinations' },
            dropZone('Geladeira ❄️', 'geladeira', 'Manter frio em pote limpo/tampado.'),
            dropZone('Despensa 🗄️', 'despensa', 'Local fresco/arejado, longe do sol.'),
            dropZone('Lixo 🗑️', 'lixo', 'Descarte seguro, não prove alimentos suspeitos.')
        );

        const allPlaced = Object.values(state.cozinhaDrops).reduce((a, b) => a + b.length, 0) === DATA.cozinha.length;

        const actions = el('div', {},
            el('div', { class: 'hint' }, allPlaced ? 'Tudo classificado! ' : 'Ainda faltam itens…'),
            el('div', { style: 'height:8px' }),
            el('button', { class: 'btn', disabled: allPlaced ? null : 'disabled', onClick: () => setStage('quiz') }, 'Ir para o Quiz ➪')
        );

        view.append(el('section', { class: 'panel' }, info, itemsWrap, el('div', { style: 'height:12px' }), dest, el('div', { style: 'height:12px' }), actions));
        return;
    }

    if (state.fase === 'quiz') {
        const qState = getQuizState();
        const question = DATA.quiz[qState.index];

        const container = el('div', { class: 'quiz' },
            el('h2', { class: 'stage-title' }, `Fase 3 — Quiz 💡 (${qState.index+1}/${DATA.quiz.length})`),
            el('p', { class: 'hint' }, 'Marque a alternativa correta.'),
            el('div', { class: 'panel' },
                el('p', { style: 'font-weight:700' }, question.q),
                el('label', { class: 'opt' },
                    el('input', { type: 'radio', name: 'alt', value: 'true' }),
                    el('span', {}, 'Verdadeiro')
                ),
                el('label', { class: 'opt' },
                    el('input', { type: 'radio', name: 'alt', value: 'false' }),
                    el('span', {}, 'Falso')
                )
            ),
            el('div', {},
                el('button', { class: 'btn', onClick: () => submitQuizAnswer() }, 'Responder')
            )
        );

        view.append(container);
        return;
    }

    if (state.fase === 'fim') {
        const nome = state.nomeJogador || 'Jogador(a)';
        const desempenho = performanceMessage(state.pontos);
        view.append(
            el('section', { class: 'panel' },
                el('div', { class: 'cert', id: 'cert' },
                    el('h2', {}, '🏆 Certificado — Guardião(ã) da Saúde'),
                    el('p', {}, `Parabéns, ${nome}! Você concluiu todas as fases e aprendeu a prevenir o botulismo.`),
                    el('p', {}, `Pontuação final: `, el('strong', {}, state.pontos.toString())),
                    el('p', { class: 'hint' }, desempenho),
                    el('div', { style: 'height:12px' }),
                    el('button', { class: 'btn success', onClick: () => window.print() }, '🖨️ Imprimir/Salvar certificado')
                ),
                el('div', { style: 'height:12px' }),
                el('button', { class: 'btn ghost', onClick: resetGame }, 'Jogar novamente')
            )
        );
        return;
    }
}

function handleMercadoChoose(item) {
    if (item.seguro) {
        if (!state.selecionados.has(item.id)) {
            state.selecionados.add(item.id);
            addPoints(5);
            toast('Boa escolha! +5 pontos');
        } else {
            toast('Esse já está no carrinho.');
        }
    } else {
        addPoints(-3);
        toast('Ops! Item inseguro. -3 pontos');
        drHigieneFala(`Cuidado com "${item.titulo}".\n\nPor quê?\n${item.motivo}\n\nDica: ${item.dica}`);
    }
    render();
}

let selectedForDrop = null;

function selectForDrop(item) {
    selectedForDrop = item;
    toast(`Selecionado: ${item.titulo}. Agora escolha o destino.`);
}

function dropZone(label, key, helper) {
    const wrap = el('div', { class: 'drop', role: 'group', 'aria-label': label });
    wrap.append(el('h4', {}, label), el('div', { class: 'hint' }, helper));
    const slot = el('div', { class: 'slot' });
    wrap.append(slot);

    state.cozinhaDrops[key].forEach(id => {
        const item = DATA.cozinha.find(x => x.id === id);
        slot.append(renderMini(item, key));
    });

    wrap.addEventListener('click', () => {
        if (!selectedForDrop) {
            toast('Selecione um item primeiro.');
            return;
        }

        if (selectedForDrop.correto === key) {
            addPoints(5);
            toast('Perfeito! +5 pontos');
        } else {
            addPoints(-4);
            toast('Destino incorreto. -4 pontos');
            drHigieneFala(`Melhor destino para "${selectedForDrop.titulo}": ${selectedForDrop.correto.toUpperCase()}.\n\nMotivo: ${selectedForDrop.motivo}\nDica: ${selectedForDrop.dica}`);
        }
        state.cozinhaDrops[key].push(selectedForDrop.id);
        selectedForDrop = null;
        render();
    });

    return wrap;
}

function renderMini(item, key) {
    const chip = el('span', { class: 'mini', title: item.titulo },
        el('span', {}, item.emoji),
        el('span', {}, item.titulo),
        el('span', {
            class: 'x',
            role: 'button',
            tabIndex: '0',
            onClick: (e) => {
                e.stopPropagation();
                removeFromDrop(item, key);
            },
            onKeydown: (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    removeFromDrop(item, key);
                }
            }
        }, '×')
    );
    return chip;
}

function removeFromDrop(item, key) {
    state.cozinhaDrops[key] = state.cozinhaDrops[key].filter(x => x !== item.id);
    toast('Item removido.');
    render();
}

function getQuizState() {
    const total = DATA.quiz.length;
    const answered = window.__answered || [];
    return { index: answered.length, total, answered };
}

function submitQuizAnswer() {
    const qState = getQuizState();
    const question = DATA.quiz[qState.index];
    const selected = [...document.querySelectorAll('input[name="alt"]')].find(i => i.checked);
    if (!selected) { toast('Marque uma alternativa.'); return; }
    const val = selected.value === 'true';
    if (val === question.a) {
        addPoints(6);
        toast('Acertou! +6 pontos');
    } else {
        addPoints(-3);
        toast('Errou. -3 pontos');
        drHigieneFala(`Explicação:\n${question.exp}`);
    }
    window.__answered = (window.__answered || []);
    window.__answered.push({ i: qState.index, ok: val === question.a });
    if (window.__answered.length === DATA.quiz.length) {
        setStage('fim');
    } else {
        render();
    }
}

function performanceMessage(p) {
    if (p >= 40) {
        drHigieneFala('Excelente! Você está pronto(a) para orientar outras pessoas sobre alimentos seguros.');
        return 'Excelente! Você está pronto(a) para orientar outras pessoas sobre alimentos seguros.';
    }
    if (p >= 25) {
        drHigieneFala('Muito bom! Só mais atenção a alguns detalhes.');
        return 'Muito bom! Só mais atenção a alguns detalhes.';
    }
    if (p >= 10) {
        drHigieneFala('Bom começo! Revise as dicas e tente novamente para melhorar.');
        return 'Bom começo! Revise as dicas e tente novamente para melhorar.';
    }
    drHigieneFala('Que tal tentar de novo? As dicas vão te ajudar a mandar bem!');
    return 'Que tal tentar de novo? As dicas vão te ajudar a mandar bem!';
}


function resetGame() {
    state.pontos = 0;
    state.fase = 'menu';
    state.selecionados.clear();
    state.cozinhaDrops = { geladeira: [], despensa: [], lixo: [] };
    window.__answered = [];
    $('#score').textContent = state.pontos;
    setStage('menu');
}

document.addEventListener('DOMContentLoaded', () => {
    $('#btnReset').addEventListener('click', resetGame);
    render();
});

function drHigieneFala(texto) {
    let balao = document.getElementById('drHigieneBaloon');
    const container = document.getElementById('drHigieneContainer');
    if (!balao) {
        balao = document.createElement('div');
        balao.id = 'drHigieneBaloon';
        if (container) container.appendChild(balao);
    }

    balao.textContent = texto;
    balao.classList.add('show');
    balao.style.opacity = '1';

    const esconderBalao = () => {
        setTimeout(() => {
            balao.classList.remove('show');
            balao.style.opacity = '0';
        }, 500);
    };

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    const speakNow = () => {
        const fala = new SpeechSynthesisUtterance(texto);
        fala.lang = 'pt-BR';

        fala.rate = isMobile ? 0.65 : 1.0;
        fala.pitch = 1.0;

        const vozes = speechSynthesis.getVoices();
        const vozFeminina = vozes.find(v =>
            v.lang && v.lang.startsWith('pt') &&
            (v.name.includes(' Microsoft Maria') || v.name.includes('Luciana') || v.name.includes('Ana'))
        );
        if (vozFeminina) fala.voice = vozFeminina;

        window._lastUtterance = fala;

        fala.onend = () => {
            window._lastUtterance = null;
            esconderBalao();
        };

        fala.onerror = () => {
            window._lastUtterance = null;
            esconderBalao();
        };

        try {
            speechSynthesis.speak(fala);
        } catch (err) {
            console.warn('speechSynthesis.speak falhou:', err);
            esconderBalao();
        }
    };

    if (speechSynthesis.getVoices().length === 0) {
        const onVoices = () => {
            speechSynthesis.removeEventListener('voiceschanged', onVoices);
            setTimeout(speakNow, 200);
        };
        speechSynthesis.addEventListener('voiceschanged', onVoices);
    } else {
        speakNow();
    }

}

function pararDraHigiene() {
    if (window.speechSynthesis) {
        try {
            speechSynthesis.cancel();
        } catch (e) {
            console.warn('Erro ao cancelar speechSynthesis:', e);
        }
    }

    const balao = document.getElementById('drHigieneBaloon');
    if (balao) {
        balao.classList.remove('show');
        balao.style.opacity = '0';
    }

    window._lastUtterance = null;
}

}
