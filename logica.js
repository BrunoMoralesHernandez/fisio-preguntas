/* 🧠 LÓGICA DEL JUEGO (logica.js) */

// --- 1. CONSTANTE CON TUS ÍNDICES ESPECÍFICOS ---
const INDICES_BLOQUE_1 = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 15, 16, 17, 18, 
    91, 92, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 
    116, 117, 204, 205, 207, 208, 209, 213, 217, 253, 
    254, 255, 256, 257, 258, 263, 276, 277, 278, 279, 
    280, 281, 282, 283, 285, 307, 320, 321, 322, 323, 
    324, 325, 326
];

// Elementos del DOM (Igual que antes)
const menuScreen = document.getElementById('menu-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const nextButton = document.getElementById('next-btn');
const skipButton = document.getElementById('skip-btn');
const progressText = document.getElementById('progress-text');
const scoreLive = document.getElementById('score-live');

// Variables de estado (Igual que antes)
let shuffledQuestions, currentQuestionIndex;
let score = 0;
let mistakes = 0;
let skipped = 0;
let failedQuestions = []; 
let isExamMode = false;
let handicapActive = false;
let handicapRatio = 3;

// Configuración Inputs (Igual que antes)
function toggleHandicapInput() {
    const isChecked = document.getElementById('handicap-check').checked;
    const settingsDiv = document.getElementById('handicap-settings');
    if(isChecked) {
        settingsDiv.style.opacity = "1";
        settingsDiv.style.pointerEvents = "auto";
    } else {
        settingsDiv.style.opacity = "0.5";
        settingsDiv.style.pointerEvents = "none";
    }
}

// --- 2. NUEVA FUNCIÓN PARA TU BLOQUE PERSONALIZADO ---
function startBloquePersonalizado() {
    if (!validateQuestions()) return;

    // Filtramos las preguntas usando tu lista de índices
    // Los índices en INDICES_BLOQUE_1 van del 1 al total, restamos 1 para acceder al array (que empieza en 0)
    const preguntasFiltradas = INDICES_BLOQUE_1
        .map(numero => questions[numero - 1]) // Convertir de 1-based a 0-based
        .filter(p => p !== undefined && p !== null); // Eliminar preguntas no encontradas

    // Verificar si encontramos preguntas
    if (preguntasFiltradas.length === 0) {
        alert("❌ Error: No se encontraron preguntas para el Bloque 1");
        return;
    }

    // Las mezclamos
    shuffledQuestions = preguntasFiltradas.sort(() => Math.random() - 0.5);
    
    // Configuramos modo
    isExamMode = false;
    document.getElementById('mode-indicator').innerText = `Bloque Específico 1 (${preguntasFiltradas.length} preguntas)`;
    
    beginGame();
}

// ... (EL RESTO DEL ARCHIVO SIGUE IGUAL: startRepaso, startExamen, beginGame, etc.) ...
// Copia aquí el resto de funciones que ya tenías (startRepaso, startExamen, beginGame, etc.)
// para no repetir todo el código gigante otra vez.

function startRepaso() {
    if (!validateQuestions()) return;
    isExamMode = false;
    document.getElementById('mode-indicator').innerText = "Modo Infinito";
    shuffledQuestions = questions.sort(() => Math.random() - .5);
    beginGame();
}

function startExamen() {
    if (!validateQuestions()) return;
    isExamMode = true;
    document.getElementById('mode-indicator').innerText = "Modo Examen";
    
    handicapActive = document.getElementById('handicap-check').checked;
    handicapRatio = parseInt(document.getElementById('handicap-ratio').value);

    const numToPlay = parseInt(document.getElementById('exam-num').value);
    shuffledQuestions = questions.sort(() => Math.random() - .5).slice(0, numToPlay);
    
    beginGame();
}

function validateQuestions() {
    if (typeof questions === 'undefined' || questions.length === 0) {
        alert("⚠️ Error: No encuentro las preguntas.");
        return false;
    }
    return true;
}

function beginGame() {
    menuScreen.classList.add('hide');
    resultScreen.classList.add('hide');
    quizScreen.classList.remove('hide');
    
    currentQuestionIndex = 0;
    score = 0;
    mistakes = 0;
    skipped = 0;
    failedQuestions = []; 
    scoreLive.innerText = 'Aciertos: ' + score;
    
    const newNextBtn = nextButton.cloneNode(true);
    nextButton.parentNode.replaceChild(newNextBtn, nextButton);
    const updatedNextBtn = document.getElementById('next-btn');
    updatedNextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        setNextQuestion();
    });

    const newSkipBtn = skipButton.cloneNode(true);
    skipButton.parentNode.replaceChild(newSkipBtn, skipButton);
    const updatedSkipBtn = document.getElementById('skip-btn');
    updatedSkipBtn.addEventListener('click', skipQuestion);
    
    setNextQuestion();
}

function setNextQuestion() {
    resetState();
    showQuestion(shuffledQuestions[currentQuestionIndex]);
    if(progressText) progressText.innerText = `Pregunta ${currentQuestionIndex + 1} de ${shuffledQuestions.length}`;
}

function showQuestion(question) {
    questionElement.innerText = question.question;
    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer.text;
        button.classList.add('btn');
        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener('click', selectAnswer);
        answerButtonsElement.appendChild(button);
    });
}

function resetState() {
    const nextBtn = document.getElementById('next-btn');
    const skipBtn = document.getElementById('skip-btn');
    nextBtn.classList.add('hide');
    skipBtn.classList.remove('hide');
    skipBtn.disabled = false;
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

function skipQuestion() {
    skipped++;
    revealAnswer();
}

function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === "true";
    if(correct) {
        score++;
        scoreLive.innerText = 'Aciertos: ' + score;
    } else {
        mistakes++;
        const currentQ = shuffledQuestions[currentQuestionIndex];
        const correctAns = currentQ.answers.find(a => a.correct).text;
        failedQuestions.push({
            q: currentQ.question,
            correctA: correctAns,
            userA: selectedButton.innerText
        });
    }
    setStatusClass(selectedButton, correct);
    revealAnswer();
}

function revealAnswer() {
    const nextBtn = document.getElementById('next-btn');
    const skipBtn = document.getElementById('skip-btn');
    Array.from(answerButtonsElement.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add('correct');
        }
        button.disabled = true;
    });
    skipBtn.classList.add('hide');
    if (shuffledQuestions.length > currentQuestionIndex + 1) {
        nextBtn.classList.remove('hide');
    } else {
        setTimeout(showResults, 1000);
    }
}

function setStatusClass(element, correct) {
    clearStatusClass(element);
    if (correct) {
        element.classList.add('correct');
    } else {
        element.classList.add('wrong');
    }
}

function clearStatusClass(element) {
    element.classList.remove('correct');
    element.classList.remove('wrong');
}

function showResults() {
    quizScreen.classList.add('hide');
    resultScreen.classList.remove('hide');

    let finalScoreCalc = score;
    let deduction = 0;

    if (handicapActive && isExamMode) {
        deduction = mistakes / handicapRatio;
        finalScoreCalc = score - deduction;
        document.getElementById('handicap-msg').style.display = 'block';
        document.getElementById('points-deducted').innerText = deduction.toFixed(2);
    } else {
        document.getElementById('handicap-msg').style.display = 'none';
    }

    if (finalScoreCalc < 0) finalScoreCalc = 0;

    document.getElementById('final-correct').innerText = score;
    document.getElementById('final-wrong').innerText = mistakes;
    document.getElementById('final-skipped').innerText = skipped;
    document.getElementById('final-total').innerText = shuffledQuestions.length;
    
    if (isExamMode) {
        let grade = (finalScoreCalc / shuffledQuestions.length) * 10;
        document.getElementById('final-score').innerText = grade.toFixed(2);
    } else {
        document.getElementById('final-score').innerText = finalScoreCalc.toFixed(2) + " pts";
    }

    const listContainer = document.getElementById('failed-list');
    listContainer.innerHTML = ""; 

    if (failedQuestions.length === 0) {
        listContainer.innerHTML = "<p style='text-align:center; color:#27ae60;'>¡Perfecto! No has tenido fallos. 🎉</p>";
    } else {
        failedQuestions.forEach((fail, index) => {
            const item = document.createElement('div');
            item.classList.add('failed-item');
            item.innerHTML = `
                <p style="margin:0 0 5px 0;"><strong>⚠️ Fallo:</strong> ${fail.q}</p>
                <p style="margin:0; font-size: 0.85rem;">
                    ❌ Tu respuesta: <i style="text-decoration:line-through; color:#e74c3c;">${fail.userA}</i><br>
                    ✅ Correcta: <span>${fail.correctA}</span>
                </p>
            `;
            listContainer.appendChild(item);
        });
    }
}