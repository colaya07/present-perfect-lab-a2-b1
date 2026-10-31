/**
 * PRESENT PERFECT LAB - Logic & Dashboard Engine
 * Version 4: Segmented Accuracy, Full Competency Display, Adaptive Recs & Mobile A11y
 */

const db = {
    matching: [
        { id: "m1", prompt: "I ___ (visit) Paris three times.", options: ["have visited", "has visited", "visited"], answer: "have visited", tag: "have_has", feedback: "Use 'have' with I, you, we, they." },
        { id: "m2", prompt: "She ___ (not / finish) her homework.", options: ["haven't finished", "hasn't finished", "didn't finish"], answer: "hasn't finished", tag: "have_has", feedback: "Use 'hasn't' for the third person singular (she)." },
        { id: "m3", prompt: "We have ___ (see) that movie.", options: ["seed", "saw", "seen"], answer: "seen", tag: "past_participle", feedback: "'See' is irregular. The past participle is 'seen'." },
        { id: "m4", prompt: "I ___ to London in 2019.", options: ["have gone", "went", "have been"], answer: "went", tag: "vs_past_simple", feedback: "We use Past Simple (went) with a finished time in the past (in 2019)." }
    ],
    reading: [
        { id: "r1", prompt: "Why does Leo have a guitar?", options: ["He took lessons.", "He decided to buy one.", "Someone gave it to him."], answer: "He decided to buy one.", tag: "reading_comp", feedback: "Text evidence: 'Last year, he decided to buy a guitar.'" },
        { id: "r2", prompt: "How long has Leo had the guitar?", options: ["For December", "Since December", "Already December"], answer: "Since December", tag: "since_for", feedback: "We use 'since' for a specific starting point in time." },
        { id: "r3", prompt: "Has Leo learned any chords?", options: ["Yes, he has already learned five.", "No, not yet.", "Yes, he just learned one."], answer: "Yes, he has already learned five.", tag: "already_yet_just", feedback: "Text evidence: 'He has already learned five different chords.'" }
    ],
    ordering: [
        { id: "o1", words: ["Have", "you", "ever", "eaten", "sushi?"], answer: "Have you ever eaten sushi?", tag: "ever_never", feedback: "'Ever' goes before the main verb in a question." },
        { id: "o2", words: ["She", "has", "just", "arrived", "home."], answer: "She has just arrived home.", tag: "already_yet_just", feedback: "'Just' goes between have/has and the past participle." },
        { id: "o3", words: ["They", "haven't", "finished", "the project", "yet."], answer: "They haven't finished the project yet.", tag: "already_yet_just", feedback: "'Yet' usually goes at the end of negative sentences." }
    ],
    timeExp: [
        { id: "t1", prompt: "I have lived here ___ 2015.", options: ["for", "since", "already"], answer: "since", tag: "since_for", feedback: "'2015' is a specific point in time, so we use 'since'." },
        { id: "t2", prompt: "We have been friends ___ five years.", options: ["for", "since", "yet"], answer: "for", tag: "since_for", feedback: "'Five years' is a duration/period of time, so we use 'for'." },
        { id: "t3", prompt: "I don't want to eat. I have ___ had lunch.", options: ["yet", "ever", "already"], answer: "already", tag: "already_yet_just", feedback: "Use 'already' for something that happened sooner than expected." }
    ]
};

const tagInfo = {
    have_has: { name: "Have / Has Usage", rule: "Review how to use HAVE and HAS with different subjects.", link: "#grammar-have-has" },
    past_participle: { name: "Past Participles", rule: "You should review irregular past participles.", link: "#grammar-participles" },
    vs_past_simple: { name: "Present Perfect vs Past Simple", rule: "Review the difference between actions connected to the present and completed past actions.", link: "#grammar-vs-past-simple" },
    since_for: { name: "Since vs For", rule: "Review the difference between SINCE (starting point) and FOR (duration).", link: "#grammar-time-exp" },
    ever_never: { name: "Ever / Never", rule: "Review how to use EVER in questions and NEVER for negative experiences.", link: "#grammar-time-exp" },
    already_yet_just: { name: "Already / Yet / Just", rule: "Check the position of Already, Yet, and Just.", link: "#grammar-time-exp" },
    reading_comp: { name: "Reading Comprehension", rule: "Read carefully and look for evidence in the text.", link: "#reading" }
};

const APP_VERSION = 4; 

let state = {
    version: APP_VERSION,
    userInputs: {}, 
    questionStats: {}, 
    orderingAnswers: {}, 
    guidedWritingText: "",
    guidedWritingChecks: {}
};

// 1. MOBILE NAVIGATION TOGGLE (A11y Improved)
function toggleMobileMenu() {
    const nav = document.getElementById('main-nav');
    const btn = document.querySelector('.menu-toggle');
    if (nav && btn) {
        nav.classList.toggle('open');
        const isOpen = nav.classList.contains('open');
        btn.setAttribute('aria-expanded', isOpen);
    }
}

// 2. STATE MANAGEMENT
function loadState() {
    const saved = localStorage.getItem("presentPerfectLabState");
    if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version === APP_VERSION) {
            state = parsed;
        } else {
            localStorage.removeItem("presentPerfectLabState");
        }
    }
}

function saveState() {
    localStorage.setItem("presentPerfectLabState", JSON.stringify(state));
    updateDashboard();
}

function resetProgress() {
    if(confirm("Are you sure you want to reset all your progress?")) {
        localStorage.removeItem("presentPerfectLabState");
        location.reload();
    }
}

// 3. RENDERERS
function renderMatching() {
    const container = document.getElementById('matching-container');
    container.innerHTML = db.matching.map((q, i) => `
        <div class="question-block" id="block-${q.id}">
            <p><strong>${i + 1}.</strong> ${q.prompt}</p>
            <select id="${q.id}" onchange="saveInput('${q.id}', this.value)">
                <option value="">Select an option...</option>
                ${q.options.map(opt => `<option value="${opt}" ${state.userInputs[q.id] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
            <div class="feedback-box" id="feedback-${q.id}"></div>
        </div>
    `).join('');
}

function renderReading() {
    const container = document.getElementById('reading-container');
    container.innerHTML = db.reading.map((q, i) => `
        <div class="question-block" id="block-${q.id}">
            <p><strong>${i + 1}.</strong> ${q.prompt}</p>
            <div class="options-group">
                ${q.options.map(opt => `
                    <label><input type="radio" name="${q.id}" value="${opt}" ${state.userInputs[q.id] === opt ? 'checked' : ''} onchange="saveInput('${q.id}', this.value)"> ${opt}</label>
                `).join('')}
            </div>
            <div class="feedback-box" id="feedback-${q.id}"></div>
        </div>
    `).join('');
}

function renderTimeExp() {
    const container = document.getElementById('timeexp-container');
    container.innerHTML = db.timeExp.map((q, i) => `
        <div class="question-block" id="block-${q.id}">
            <p><strong>${i + 1}.</strong> ${q.prompt}</p>
            <select id="${q.id}" onchange="saveInput('${q.id}', this.value)">
                <option value="">Choose...</option>
                ${q.options.map(opt => `<option value="${opt}" ${state.userInputs[q.id] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
            </select>
            <div class="feedback-box" id="feedback-${q.id}"></div>
        </div>
    `).join('');
}

function renderOrdering() {
    const container = document.getElementById('ordering-container');
    container.innerHTML = '';
    
    db.ordering.forEach((q, i) => {
        if (!state.orderingAnswers[q.id]) state.orderingAnswers[q.id] = [];

        let block = document.createElement('div');
        block.className = 'question-block';
        block.id = `block-${q.id}`;
        
        block.innerHTML = `
            <p><strong>${i + 1}.</strong> Build the sentence:</p>
            <div class="answer-line" id="answer-${q.id}"></div>
            <div class="word-bank" id="bank-${q.id}">
                ${q.words.map((word, wIdx) => {
                    let isUsed = state.orderingAnswers[q.id].includes(wIdx);
                    return `<button class="word-btn ${isUsed ? 'used' : ''}" id="word-${q.id}-${wIdx}" onclick="moveWord('${q.id}', ${wIdx}, '${word.replace(/'/g, "\\'")}')">${word}</button>`;
                }).join('')}
            </div>
            <div class="feedback-box" id="feedback-${q.id}"></div>
        `;
        container.appendChild(block);

        const answerLine = block.querySelector(`#answer-${q.id}`);
        state.orderingAnswers[q.id].forEach(savedIdx => {
            const wordText = q.words[savedIdx];
            const ansBtn = document.createElement('button');
            ansBtn.className = 'word-btn';
            ansBtn.textContent = wordText;
            ansBtn.onclick = function() { removeWord(q.id, savedIdx, ansBtn); };
            answerLine.appendChild(ansBtn);
        });
    });
}

function renderGuidedWriting() {
    const textArea = document.getElementById('guided-text');
    if(textArea) {
        textArea.value = state.guidedWritingText || '';
        textArea.addEventListener('input', (e) => { 
            state.guidedWritingText = e.target.value; 
            saveState(); 
        });
    }

    ['check-time', 'check-form', 'check-sense'].forEach(id => {
        const checkbox = document.getElementById(id);
        if(checkbox) {
            checkbox.checked = state.guidedWritingChecks && state.guidedWritingChecks[id] ? true : false;
            checkbox.addEventListener('change', (e) => {
                if(!state.guidedWritingChecks) state.guidedWritingChecks = {};
                state.guidedWritingChecks[id] = e.target.checked;
                saveState();
            });
        }
    });
}

// 4. INTERACTION LOGIC
function saveInput(id, value) {
    state.userInputs[id] = value;
    saveState();
}

function moveWord(qId, wIdx, word) {
    const btn = document.getElementById(`word-${qId}-${wIdx}`);
    const answerLine = document.getElementById(`answer-${qId}`);
    
    if (btn.classList.contains('used')) return;
    
    btn.classList.add('used');
    state.orderingAnswers[qId].push(wIdx);
    
    const ansBtn = document.createElement('button');
    ansBtn.className = 'word-btn';
    ansBtn.textContent = word;
    ansBtn.onclick = function() { removeWord(qId, wIdx, ansBtn); };
    
    answerLine.appendChild(ansBtn);
    saveState();
}

function removeWord(qId, wIdx, btnElement) {
    btnElement.remove();
    state.orderingAnswers[qId] = state.orderingAnswers[qId].filter(idx => idx !== wIdx);
    const originalBtn = document.getElementById(`word-${qId}-${wIdx}`);
    if (originalBtn) originalBtn.classList.remove('used');
    saveState();
}

// 5. EVALUATION ENGINE
function processSection(dbArray, valueExtractorFn) {
    dbArray.forEach(q => {
        const userValue = valueExtractorFn(q);
        const block = document.getElementById(`block-${q.id}`);
        const feedbackBox = document.getElementById(`feedback-${q.id}`);
        
        if (!userValue || (typeof userValue === 'string' && userValue.trim() === '')) {
            if (state.questionStats[q.id]) {
                delete state.questionStats[q.id]; 
                block.classList.remove('correct', 'incorrect');
                feedbackBox.className = 'feedback-box';
                feedbackBox.innerHTML = '';
            }
            return;
        }
        
        const isCorrect = (userValue === q.answer);
        
        state.questionStats[q.id] = { correct: isCorrect, tag: q.tag };
        
        if (isCorrect) {
            block.classList.add('correct');
            block.classList.remove('incorrect');
            feedbackBox.innerHTML = `<strong>Correct!</strong> ${q.feedback}`;
            feedbackBox.className = 'feedback-box success show';
        } else {
            block.classList.add('incorrect');
            block.classList.remove('correct');
            feedbackBox.innerHTML = `<strong>Not quite.</strong> ${q.feedback}<br><span class="es-hint block">Your answer: ${userValue}</span>`;
            feedbackBox.className = 'feedback-box error show';
        }
    });
    saveState();
}

function checkMatching() { processSection(db.matching, q => state.userInputs[q.id]); }
function checkReading() { processSection(db.reading, q => state.userInputs[q.id]); }
function checkTimeExp() { processSection(db.timeExp, q => state.userInputs[q.id]); }
function checkOrdering() { 
    processSection(db.ordering, q => {
        const indices = state.orderingAnswers[q.id];
        return indices && indices.length > 0 ? indices.map(idx => q.words[idx]).join(' ') : null;
    }); 
}

// 6. DASHBOARD & RECOMMENDATIONS (Separated Progress & Accuracy)
function updateDashboard() {
    const totals = { matching: db.matching.length, reading: db.reading.length, ordering: db.ordering.length, timeExp: db.timeExp.length };
    
    let evaluated = { matching: 0, reading: 0, ordering: 0, timeExp: 0, total: 0 };
    let correct = { total: 0 };
    let tagsStats = {}; 

    Object.keys(tagInfo).forEach(tag => tagsStats[tag] = { correct: 0, attempted: 0 });

    Object.keys(state.questionStats).forEach(qId => {
        const stat = state.questionStats[qId];
        
        evaluated.total++;
        if (qId.startsWith('m')) evaluated.matching++;
        if (qId.startsWith('r')) evaluated.reading++;
        if (qId.startsWith('o')) evaluated.ordering++;
        if (qId.startsWith('t')) evaluated.timeExp++;
        
        tagsStats[stat.tag].attempted++;
        
        if (stat.correct) {
            correct.total++;
            tagsStats[stat.tag].correct++;
        }
    });

    const maxScore = totals.matching + totals.reading + totals.ordering + totals.timeExp;
    
    // Calculates accuracy exclusively on evaluated questions, not total available.
    const accuracyPercent = evaluated.total > 0 ? Math.round((correct.total / evaluated.total) * 100) : 0;
    const completionPercent = (evaluated.total / maxScore) * 100;
    
    // UI Metric updates
    document.getElementById('progress-text').innerHTML = `<strong>Questions evaluated:</strong> ${evaluated.total} / ${maxScore}`;
    document.getElementById('correct-text').innerHTML = `<strong>Correct answers:</strong> ${correct.total} / ${evaluated.total}`;
    document.getElementById('accuracy-text').innerHTML = `<strong>Accuracy:</strong> ${accuracyPercent}%`;
    document.getElementById('completion-progress').style.width = `${completionPercent}%`;
    
    document.getElementById('section-scores-list').innerHTML = `
        <li>Matching: ${evaluated.matching}/${totals.matching}</li>
        <li>Reading: ${evaluated.reading}/${totals.reading}</li>
        <li>Ordering: ${evaluated.ordering}/${totals.ordering}</li>
        <li>Time Expressions: ${evaluated.timeExp}/${totals.timeExp}</li>
    `;

    const recoContainer = document.getElementById('recommendations-container');
    const tagsContainer = document.getElementById('tags-container');
    recoContainer.innerHTML = '';
    tagsContainer.innerHTML = '';

    let hasRecommendations = false;

    // Output all categories regardless of attempts
    Object.keys(tagInfo).forEach(tag => {
        const stats = tagsStats[tag];
        const info = tagInfo[tag];
        
        let badgeClass = '';
        let statusText = '';
        let recoHTML = '';

        if (stats.attempted === 0) {
            badgeClass = 'not-evaluated';
            statusText = 'Not evaluated yet';
        } 
        else if (stats.attempted === 1) {
            badgeClass = 'insufficient';
            statusText = 'Insufficient evidence';
            
            if (stats.correct === 0) {
                hasRecommendations = true;
                recoHTML = `
                    <div class="reco-item">
                        <strong>Review Needed: ${info.name}</strong><br>
                        ${info.rule}<br>
                        <a href="${info.link}">→ Go to targeted section</a>
                    </div>
                `;
            } else {
                hasRecommendations = true;
                recoHTML = `
                    <div class="reco-item success-hint">
                        <strong>Keep going: ${info.name}</strong><br>
                        Good start! Answer more questions in this category to prove your mastery.
                    </div>
                `;
            }
        } 
        else { // >= 2 attempts
            const ratio = stats.correct / stats.attempted;
            if (ratio >= 0.8) {
                badgeClass = 'mastered';
                statusText = 'Mastered ✓';
            } else {
                badgeClass = 'needs-work';
                statusText = 'Needs improvement';
                
                hasRecommendations = true;
                recoHTML = `
                    <div class="reco-item">
                        <strong>Review Needed: ${info.name}</strong><br>
                        ${info.rule}<br>
                        <a href="${info.link}">→ Go to targeted section</a>
                    </div>
                `;
            }
        }

        tagsContainer.innerHTML += `
            <span class="tag-badge ${badgeClass}">
                ${info.name} (${stats.correct}/${stats.attempted}) — ${statusText}
            </span>
        `;
        
        if (recoHTML) recoContainer.innerHTML += recoHTML;
    });

    if (!hasRecommendations && evaluated.total > 0) {
        recoContainer.innerHTML = `<p style="color:var(--accent)">Excellent job! You are tracking well across all your attempted topics.</p>`;
    }
}

// 7. INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    loadState();
    renderMatching();
    renderReading();
    renderOrdering();
    renderTimeExp();
    renderGuidedWriting();
    
    checkMatching();
    checkReading();
    checkTimeExp();
    checkOrdering();
});