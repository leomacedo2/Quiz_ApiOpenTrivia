let listaPerguntas = [];
let indiceAtual = 0;
let acertos = 0;

async function comecarQuiz() {
    let qtd = document.getElementById("qtd_perguntas").value;
    let categoriaEscolhida = document.getElementById("categoria").value;
    let dificuldadeEscolhida = document.getElementById("dificuldade").value; // Pega a dificuldade
    
    document.getElementById("tela-inicial").style.display = "none";
    document.getElementById("tela-carregando").style.display = "flex";

    let url = `https://opentdb.com/api.php?amount=${qtd}&type=multiple`;
    
    if (categoriaEscolhida !== "") {
        url = url + `&category=${categoriaEscolhida}`;
    }

    if (dificuldadeEscolhida !== "") {
        url = url + `&difficulty=${dificuldadeEscolhida}`;
    }

    let resposta = await fetch(url);
    let dados = await resposta.json();
    
    listaPerguntas = await traduzirPerguntas(dados.results);
    
    indiceAtual = 0;
    acertos = 0;

    document.getElementById("tela-carregando").style.display = "none";
    document.getElementById("tela-quiz").style.display = "flex";

    mostrarPergunta();
}

async function apiTraduzir(texto) {
    let resposta = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=en|pt-br`);
    let dados = await resposta.json();
    
    return dados.responseData.translatedText;
}

async function traduzirPerguntas(arrayIngles) {
    let arrayTraduzido = [];
    for (let i = 0; i < arrayIngles.length; i++) {
        let item = arrayIngles[i];
        let perguntaPt = await apiTraduzir(item.question);
        let corretaPt = await apiTraduzir(item.correct_answer);
        
        let incorretasPt = [];
        for (let j = 0; j < item.incorrect_answers.length; j++) {
            let errada = await apiTraduzir(item.incorrect_answers[j]);
            incorretasPt.push(errada);
        }

        arrayTraduzido.push({
            pergunta: perguntaPt,
            correta: corretaPt,
            incorretas: incorretasPt
        });
    }
    return arrayTraduzido;
}

function mostrarPergunta() {
    let dadosAtuais = listaPerguntas[indiceAtual];
    

    document.getElementById("bloco-proxima").style.display = "none";

    document.getElementById("contador-perguntas").innerHTML = `Pergunta ${indiceAtual + 1} de ${listaPerguntas.length}`;
    document.getElementById("pergunta").innerHTML = dadosAtuais.pergunta;

    let divAlternativas = document.getElementById("alternativas");
    divAlternativas.innerHTML = ""; 

    let todasRespostas = [...dadosAtuais.incorretas, dadosAtuais.correta];
    todasRespostas.sort(() => Math.random() - 0.5);

    for (let i = 0; i < todasRespostas.length; i++) {
        let btn = document.createElement("button");
        btn.innerHTML = todasRespostas[i];
        
        btn.className = "btn-opcao";
        
        btn.onclick = function() {
            verificarResposta(this, todasRespostas[i], dadosAtuais.correta);
        };
        
        divAlternativas.appendChild(btn);
    }
}

function verificarResposta(botaoClicado, respostaUsuario, respostaCorreta) {
    let botoes = document.querySelectorAll(".btn-opcao");
    
    for (let i = 0; i < botoes.length; i++) {
        botoes[i].disabled = true;
        botoes[i].style.cursor = "default";
        
        if (botoes[i].innerHTML === respostaCorreta) {
            botoes[i].style.backgroundColor = "#28a745"; 
            botoes[i].style.color = "white";
        }
    }

    if (respostaUsuario === respostaCorreta) {
        acertos++;
    } else {
        botaoClicado.style.backgroundColor = "#dc3545"; 
        botaoClicado.style.color = "white";
    }

    document.getElementById("bloco-proxima").style.display = "block";
}

function irParaProxima() {
    indiceAtual++;

    if (indiceAtual < listaPerguntas.length) {
        mostrarPergunta();
    } else {
        mostrarResultado();
    }
}

function mostrarResultado() {
    document.getElementById("tela-quiz").style.display = "none";
    document.getElementById("tela-resultado").style.display = "flex";
    document.getElementById("nota-final").innerHTML = `Você acertou <strong>${acertos}</strong> de ${listaPerguntas.length} questões!`;
}

function reiniciarQuiz() {
    document.getElementById("tela-resultado").style.display = "none";
    document.getElementById("tela-inicial").style.display = "flex";
}