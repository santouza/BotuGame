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

    // Detecta se é iPhone/iPad (Safari)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    // Cancela fala anterior
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    // Caso iOS: simular fala lenta com pausas entre frases
    if (isIOS) {
        const partes = texto.split(/([,.!?])/).filter(t => t.trim());
        let i = 0;

        function falarParte() {
            if (i >= partes.length) {
                esconderBalao();
                return;
            }
            const fala = new SpeechSynthesisUtterance(partes[i]);
            fala.lang = 'pt-BR';
            fala.rate = 1; // Safari ignora, mas deixamos por segurança
            speechSynthesis.speak(fala);
            fala.onend = () => {
                i++;
                // pausa de 500ms entre frases para parecer mais lento
                setTimeout(falarParte, 600);
            };
        }

        falarParte();
        return;
    }

    // Android ou desktop → respeita rate
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    fala.rate = isMobile ? 0.65 : 1.0; // bem mais lento no celular Android
    fala.pitch = 1.0;

    const vozes = speechSynthesis.getVoices();
    const vozFeminina = vozes.find(v =>
        v.lang.startsWith('pt') &&
        (v.name.includes(' Microsoft Maria') || v.name.includes('Luciana') || v.name.includes('Ana'))
    );
    if (vozFeminina) fala.voice = vozFeminina;

    fala.onend = esconderBalao;
    fala.onerror = esconderBalao;

    window._lastUtterance = fala;
    speechSynthesis.speak(fala);
}
