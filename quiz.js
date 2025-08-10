// Quiz Application State
const quizState = {
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    answers: [],
    isReviewMode: false
};

// DOM Elements
const elements = {
    startScreen: document.getElementById('startScreen'),
    questionScreen: document.getElementById('questionScreen'),
    resultsScreen: document.getElementById('resultsScreen'),
    reviewScreen: document.getElementById('reviewScreen'),
    startBtn: document.getElementById('startBtn'),
    nextBtn: document.getElementById('nextBtn'),
    reviewBtn: document.getElementById('reviewBtn'),
    retryBtn: document.getElementById('retryBtn'),
    backToResultsBtn: document.getElementById('backToResultsBtn'),
    retryFromReviewBtn: document.getElementById('retryFromReviewBtn'),
    startOverBtn: document.getElementById('startOverBtn'),
    questionText: document.getElementById('questionText'),
    optionsContainer: document.getElementById('optionsContainer'),
    feedbackSection: document.getElementById('feedbackSection'),
    feedbackHeader: document.getElementById('feedbackHeader'),
    feedbackExplanation: document.getElementById('feedbackExplanation'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    finalScore: document.getElementById('finalScore'),
    reviewContainer: document.getElementById('reviewContainer')
};

// Load questions from JSON file
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading questions:', error);
        // Fallback to hardcoded questions if JSON fails to load
        return getHardcodedQuestions();
    }
}

// Hardcoded questions as fallback
function getHardcodedQuestions() {
    return {
        quiz: {
            title: "Fluoroquinolone Antibiotics Safety Quiz",
            settings: {
                randomizeQuestions: true,
                randomizeAnswers: true,
                showImmediateFeedback: true,
                allowReview: true
            }
        },
        questions: [
            {
                id: "q1",
                type: "multiple-choice",
                question: "Which of the following is NOT a fluoroquinolone antibiotic?",
                options: [
                    { id: "a", text: "Ciprofloxacin", correct: false },
                    { id: "b", text: "Cephalexin", correct: true },
                    { id: "c", text: "Avelox", correct: false },
                    { id: "d", text: "Levofloxacin", correct: false }
                ],
                explanation: "Cephalexin is a cephalosporin antibiotic, not a fluoroquinolone. Ciprofloxacin, Avelox (moxifloxacin), and Levofloxacin are all fluoroquinolone antibiotics."
            }
            // Add more questions as needed for fallback
        ]
    };
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Initialize quiz
async function initQuiz() {
    const quizData = await loadQuestions();

    // Set up questions (keep original order, don't randomize)
    quizState.questions = quizData.questions;

    // Randomize answer options for multiple choice questions
    if (quizData.quiz.settings.randomizeAnswers) {
        quizState.questions.forEach(question => {
            if (question.type === 'multiple-choice' && question.options) {
                // Check if there's an "All of the Above" option
                const allOfAboveIndex = question.options.findIndex(opt =>
                    opt.text.toLowerCase().includes('all of the above')
                );

                if (allOfAboveIndex !== -1) {
                    // Remove "All of the Above" option temporarily
                    const allOfAboveOption = question.options[allOfAboveIndex];
                    const otherOptions = question.options.filter((_, index) => index !== allOfAboveIndex);

                    // Shuffle other options
                    const shuffledOthers = shuffleArray(otherOptions);

                    // Add "All of the Above" back at the end
                    question.options = [...shuffledOthers, allOfAboveOption];
                } else {
                    // No "All of the Above", shuffle normally
                    question.options = shuffleArray(question.options);
                }
            }
        });
    }

    // Save to session storage for persistence during navigation
    saveStateToSession();
}

// Save state to session storage
function saveStateToSession() {
    sessionStorage.setItem('quizState', JSON.stringify(quizState));
}

// Load state from session storage
function loadStateFromSession() {
    const savedState = sessionStorage.getItem('quizState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        Object.assign(quizState, parsedState);
        return true;
    }
    return false;
}

// Start quiz
function startQuiz() {
    quizState.currentQuestionIndex = 0;
    quizState.score = 0;
    quizState.answers = [];
    quizState.isReviewMode = false;

    hideAllScreens();
    elements.questionScreen.classList.remove('hidden');
    elements.feedbackSection.classList.add('hidden');

    // Show progress section when quiz starts
    document.querySelector('.progress-section').classList.add('active');

    // Track quiz start event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'quiz_start', {
            'quiz_name': 'Fluoroquinolone Safety Quiz',
            'total_questions': quizState.questions.length
        });
    }

    displayQuestion();
    updateProgress();
    saveStateToSession();
}

// Hide all screens
function hideAllScreens() {
    elements.startScreen.classList.add('hidden');
    elements.questionScreen.classList.add('hidden');
    elements.resultsScreen.classList.add('hidden');
    elements.reviewScreen.classList.add('hidden');
}

// Display current question
function displayQuestion() {
    const question = quizState.questions[quizState.currentQuestionIndex];

    // Update question text
    elements.questionText.textContent = question.question;

    // Clear previous options
    elements.optionsContainer.innerHTML = '';
    elements.feedbackSection.classList.add('hidden');

    // Track question view event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'question_view', {
            'question_number': quizState.currentQuestionIndex + 1,
            'question_id': question.id,
            'question_type': question.type,
            'question_text': question.question.substring(0, 100)
        });
    }

    // Create options based on question type
    if (question.type === 'true-false') {
        displayTrueFalseOptions(question);
    } else {
        displayMultipleChoiceOptions(question);
    }
}

// Display true/false options
function displayTrueFalseOptions(question) {
    const container = document.createElement('div');
    container.className = 'true-false-container';

    const trueBtn = createOptionButton('A. True', question.correct === true, question, 'A', 'True');
    const falseBtn = createOptionButton('B. False', question.correct === false, question, 'B', 'False');

    container.appendChild(trueBtn);
    container.appendChild(falseBtn);
    elements.optionsContainer.appendChild(container);
}

// Display multiple choice options
function displayMultipleChoiceOptions(question) {
    const labels = ['A', 'B', 'C', 'D'];
    question.options.forEach((option, index) => {
        const labeledText = `${labels[index]}. ${option.text}`;
        const button = createOptionButton(labeledText, option.correct, question, option.id, option.text);
        elements.optionsContainer.appendChild(button);
    });
}

// Create option button
function createOptionButton(displayText, isCorrect, question, optionId = null, originalText = null) {
    const button = document.createElement('button');
    button.className = 'option-button';
    button.textContent = displayText;
    button.setAttribute('aria-label', displayText);
    button.setAttribute('data-original-text', originalText || displayText);

    button.addEventListener('click', () => {
        handleAnswerSelection(button, isCorrect, question, originalText || displayText);
    });

    // Add keyboard support
    button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleAnswerSelection(button, isCorrect, question, originalText || displayText);
        }
    });

    return button;
}

// Handle answer selection
function handleAnswerSelection(selectedButton, isCorrect, question, answerText) {
    // Prevent multiple selections
    if (selectedButton.classList.contains('disabled')) return;

    // Disable all options
    const allButtons = elements.optionsContainer.querySelectorAll('.option-button');
    allButtons.forEach(btn => {
        btn.classList.add('disabled');
        btn.setAttribute('aria-disabled', 'true');
    });

    // Mark selected answer
    if (isCorrect) {
        selectedButton.classList.add('correct');
        quizState.score++;
    } else {
        selectedButton.classList.add('incorrect');

        // Show correct answer
        if (question.type === 'true-false') {
            const correctAnswer = question.correct ? 'A. True' : 'B. False';
            allButtons.forEach(btn => {
                if (btn.textContent === correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        } else {
            allButtons.forEach(btn => {
                const originalText = btn.getAttribute('data-original-text');
                const option = question.options.find(opt => opt.text === originalText);
                if (option && option.correct) {
                    btn.classList.add('correct');
                }
            });
        }
    }

    // Mark unselected options
    allButtons.forEach(btn => {
        if (!btn.classList.contains('correct') && !btn.classList.contains('incorrect')) {
            btn.classList.add('unselected');
        }
    });

    // Store answer
    quizState.answers.push({
        questionId: question.id,
        question: question.question,
        userAnswer: answerText,
        correctAnswer: getCorrectAnswerText(question),
        isCorrect: isCorrect,
        explanation: question.explanation
    });

    // Track answer selection event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'answer_selected', {
            'question_number': quizState.currentQuestionIndex + 1,
            'question_id': question.id,
            'is_correct': isCorrect,
            'answer_text': answerText.substring(0, 50)
        });
    }

    // Show feedback
    showFeedback(isCorrect, question.explanation);

    // Save state
    saveStateToSession();
}

// Get correct answer text
function getCorrectAnswerText(question) {
    if (question.type === 'true-false') {
        return question.correct ? 'True' : 'False';
    } else {
        const correctOption = question.options.find(opt => opt.correct);
        return correctOption ? correctOption.text : '';
    }
}

// Show feedback
function showFeedback(isCorrect, explanation) {
    elements.feedbackSection.classList.remove('hidden');

    // Set feedback header
    elements.feedbackHeader.textContent = isCorrect ? '✓ Correct!' : '✗ Incorrect';
    elements.feedbackHeader.className = 'feedback-header ' + (isCorrect ? 'correct' : 'incorrect');

    // Set explanation (use innerHTML to support links)
    elements.feedbackExplanation.innerHTML = explanation;

    // Update next button text
    const isLastQuestion = quizState.currentQuestionIndex === quizState.questions.length - 1;
    elements.nextBtn.textContent = isLastQuestion ? 'View Results' : 'Next Question';

    // Scroll Next button into view on mobile
    setTimeout(() => {
        elements.nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

// Move to next question
function nextQuestion() {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        quizState.currentQuestionIndex++;
        displayQuestion();
        updateProgress();
        saveStateToSession();
    } else {
        showResults();
    }
}

// Update progress bar and text
function updateProgress() {
    const progress = ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100;
    elements.progressBar.style.width = progress + '%';
    elements.progressText.textContent = `Question ${quizState.currentQuestionIndex + 1} of ${quizState.questions.length}`;
}

// Show results
function showResults() {
    hideAllScreens();
    elements.resultsScreen.classList.remove('hidden');

    // Hide progress section on results
    document.querySelector('.progress-section').classList.remove('active');

    // Calculate percentage
    const percentage = (quizState.score / quizState.questions.length) * 100;

    // Format percentage (no decimal if .0, otherwise one decimal)
    let percentageText;
    if (percentage % 1 === 0) {
        percentageText = percentage.toFixed(0) + '%';
    } else {
        percentageText = percentage.toFixed(1) + '%';
    }

    // Display score
    elements.finalScore.textContent = `You scored ${quizState.score} out of ${quizState.questions.length} (${percentageText})`;

    // Store results for sharing
    quizState.percentageText = percentageText;

    // Track quiz completion event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'quiz_complete', {
            'score': quizState.score,
            'total_questions': quizState.questions.length,
            'percentage': percentage,
            'percentage_text': percentageText
        });
    }

    // Clear session storage
    sessionStorage.removeItem('quizState');

    // Setup share buttons
    setupShareButtons();
}

// Setup share button functionality
function setupShareButtons() {
    const score = quizState.score;
    const total = quizState.questions.length;
    const percentage = quizState.percentageText;
    const percentageNum = (score / total) * 100;
    
    // Determine share message based on score
    let shareText;
    if (percentageNum >= 84) {
        shareText = `I scored ${score}/15 on the Fluoroquinolone Safety Quiz! Help spread awareness about these important medication risks:`;
    } else if (percentageNum >= 65) {
        shareText = `I learned so much! Scored ${score}/15 on the Fluoroquinolone Safety Quiz. This information could save lives:`;
    } else {
        shareText = `Eye-opening! I only got ${score}/15 on the Fluoroquinolone Safety Quiz, but learned crucial safety info everyone needs:`;
    }
    
    const url = 'https://fqquiz.com';
    
    // Remove any existing event listeners by cloning elements
    const shareFacebook = document.getElementById('shareFacebook');
    const newShareFacebook = shareFacebook.cloneNode(true);
    shareFacebook.parentNode.replaceChild(newShareFacebook, shareFacebook);
    
    const shareTwitter = document.getElementById('shareTwitter');
    const newShareTwitter = shareTwitter.cloneNode(true);
    shareTwitter.parentNode.replaceChild(newShareTwitter, shareTwitter);
    
    const shareLinkedIn = document.getElementById('shareLinkedIn');
    const newShareLinkedIn = shareLinkedIn.cloneNode(true);
    shareLinkedIn.parentNode.replaceChild(newShareLinkedIn, shareLinkedIn);
    
    const copyLink = document.getElementById('copyLink');
    const newCopyLink = copyLink.cloneNode(true);
    copyLink.parentNode.replaceChild(newCopyLink, copyLink);
    
    // Facebook share
    document.getElementById('shareFacebook').addEventListener('click', () => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', {
                'method': 'facebook',
                'content_type': 'quiz_result',
                'score': score,
                'percentage': percentage
            });
        }
        const fullShareText = `${shareText} ${url}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(fullShareText)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    });
    
    // Twitter/X share
    document.getElementById('shareTwitter').addEventListener('click', () => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', {
                'method': 'twitter',
                'content_type': 'quiz_result',
                'score': score,
                'percentage': percentage
            });
        }
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    });
    
    // LinkedIn share
    document.getElementById('shareLinkedIn').addEventListener('click', () => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', {
                'method': 'linkedin',
                'content_type': 'quiz_result',
                'score': score,
                'percentage': percentage
            });
        }
        // LinkedIn doesn't support pre-filled text in their current share API
        // The share will use the Open Graph meta tags from the page
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedInUrl, '_blank', 'width=600,height=400');
    });
    
    // Copy link (only copy URL, no text)
    document.getElementById('copyLink').addEventListener('click', () => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', {
                'method': 'copy_link',
                'content_type': 'quiz_result',
                'score': score,
                'percentage': percentage
            });
        }
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                showCopyFeedback();
            }).catch(() => {
                fallbackCopyToClipboard(url);
            });
        } else {
            fallbackCopyToClipboard(url);
        }
    });
}

// Show copy feedback message
function showCopyFeedback() {
    const feedback = document.getElementById('copyFeedback');
    feedback.classList.add('show');
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 2000);
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyFeedback();
    } catch (err) {
        console.error('Failed to copy text:', err);
    }
    
    document.body.removeChild(textArea);
}

// Show review screen
function showReview() {
    hideAllScreens();
    elements.reviewScreen.classList.remove('hidden');

    // Track review event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'quiz_review', {
            'score': quizState.score,
            'total_questions': quizState.questions.length
        });
    }

    // Hide progress section on review
    document.querySelector('.progress-section').classList.remove('active');

    // Clear previous review items
    elements.reviewContainer.innerHTML = '';

    // Create review items for each answer
    quizState.answers.forEach((answer, index) => {
        const reviewItem = createReviewItem(answer, index + 1);
        elements.reviewContainer.appendChild(reviewItem);
    });
}

// Create review item
function createReviewItem(answer, questionNumber) {
    const item = document.createElement('div');
    item.className = 'review-item ' + (answer.isCorrect ? 'correct' : 'incorrect');

    const questionEl = document.createElement('div');
    questionEl.className = 'review-question';
    questionEl.textContent = `${questionNumber}. ${answer.question}`;
    item.appendChild(questionEl);

    const userAnswerEl = document.createElement('div');
    userAnswerEl.className = 'review-answer user-answer';
    userAnswerEl.innerHTML = `<strong>Your answer:</strong> ${answer.userAnswer} ${answer.isCorrect ? '✓' : '✗'}`;
    item.appendChild(userAnswerEl);

    if (!answer.isCorrect) {
        const correctAnswerEl = document.createElement('div');
        correctAnswerEl.className = 'review-answer correct-answer';
        correctAnswerEl.innerHTML = `<strong>Correct answer:</strong> ${answer.correctAnswer}`;
        item.appendChild(correctAnswerEl);
    }

    const explanationEl = document.createElement('div');
    explanationEl.className = 'review-explanation';
    explanationEl.innerHTML = answer.explanation;
    item.appendChild(explanationEl);

    return item;
}

// Reset quiz
function resetQuiz() {
    // Clear session storage first
    sessionStorage.removeItem('quizState');

    quizState.currentQuestionIndex = 0;
    quizState.score = 0;
    quizState.answers = [];
    quizState.isReviewMode = false;

    // Track quiz retry event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'quiz_retry', {
            'quiz_name': 'Fluoroquinolone Safety Quiz'
        });
    }

    // Hide progress section
    document.querySelector('.progress-section').classList.remove('active');

    // Re-randomize questions
    initQuiz().then(() => {
        startQuiz();
    });
}

// Start over function
function startOver() {
    // Clear all state
    sessionStorage.clear();

    // Reset quiz state
    quizState.currentQuestionIndex = 0;
    quizState.score = 0;
    quizState.answers = [];
    quizState.isReviewMode = false;

    // Hide progress section
    document.querySelector('.progress-section').classList.remove('active');

    // Hide all screens and show start screen
    hideAllScreens();
    elements.startScreen.classList.remove('hidden');

    // Re-initialize quiz
    initQuiz();
}

// Event Listeners
elements.startBtn.addEventListener('click', startQuiz);
elements.nextBtn.addEventListener('click', nextQuestion);
elements.reviewBtn.addEventListener('click', showReview);
elements.retryBtn.addEventListener('click', resetQuiz);
elements.backToResultsBtn.addEventListener('click', showResults);
elements.retryFromReviewBtn.addEventListener('click', resetQuiz);
elements.startOverBtn.addEventListener('click', startOver);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // Press Enter to continue when feedback is shown
    if (!elements.feedbackSection.classList.contains('hidden') && e.key === 'Enter') {
        nextQuestion();
    }
});

// Initialize quiz on page load
window.addEventListener('DOMContentLoaded', () => {
    // Check for saved state
    if (loadStateFromSession() && quizState.questions.length > 0) {
        // Resume quiz from saved state
        if (quizState.currentQuestionIndex < quizState.questions.length && quizState.answers.length > 0) {
            hideAllScreens();
            elements.questionScreen.classList.remove('hidden');
            // Show progress section when resuming
            document.querySelector('.progress-section').classList.add('active');
            displayQuestion();
            updateProgress();
        } else if (quizState.answers.length === quizState.questions.length) {
            // Quiz completed, show results
            showResults();
        } else {
            // Invalid state, clear and restart
            sessionStorage.clear();
            initQuiz();
        }
    } else {
        // Initialize new quiz
        initQuiz();
    }
});

// Handle page visibility change (save state when user leaves)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        saveStateToSession();
    }
});