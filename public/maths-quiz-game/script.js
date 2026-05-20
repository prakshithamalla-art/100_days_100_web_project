class MathQuiz {
    constructor() {
        this.score = 0;
        this.currentQuestion = 0;
        this.totalQuestions = 10;
        this.difficulty = 'medium';
        this.questions = [];
        this.timer = null;
        this.timeLeft = 15;
        this.answerLocked = false;
        this.highScore = localStorage.getItem('mathQuizHighScore') || 0;
    }

    generateQuestion() {
        let num1, num2, operator, answer, questionText;

        // Set ranges based on difficulty
        let range;
        switch(this.difficulty) {
            case 'easy':
                range = { min: 1, max: 20 };
                this.timeLeft = 20;
                break;
            case 'medium':
                range = { min: 10, max: 50 };
                this.timeLeft = 15;
                break;
            case 'hard':
                range = { min: 20, max: 100 };
                this.timeLeft = 10;
                break;
        }

        // Randomly select operator
        const operators = ['+', '-', '×', '÷'];
        operator = operators[Math.floor(Math.random() * operators.length)];

        // Generate numbers based on operator
        switch(operator) {
            case '+':
                num1 = this.randomNum(range.min, range.max);
                num2 = this.randomNum(range.min, range.max);
                answer = num1 + num2;
                questionText = `${num1} + ${num2} = ?`;
                break;
            case '-':
                num1 = this.randomNum(range.min, range.max);
                num2 = this.randomNum(range.min, num1);
                answer = num1 - num2;
                questionText = `${num1} - ${num2} = ?`;
                break;
            case '×':
                num1 = this.randomNum(range.min, Math.min(12, range.max));
                num2 = this.randomNum(range.min, Math.min(12, range.max));
                answer = num1 * num2;
                questionText = `${num1} × ${num2} = ?`;
                break;
            case '÷':
                answer = this.randomNum(range.min, Math.min(12, range.max));
                num2 = this.randomNum(range.min, Math.min(12, range.max));
                num1 = answer * num2;
                questionText = `${num1} ÷ ${num2} = ?`;
                break;
        }

        // Generate 4 options including correct answer
        let options = [answer];
        while(options.length < 4) {
            let offset = this.randomNum(-5, 5);
            let wrongAnswer = answer + offset;
            if(wrongAnswer !== answer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
                options.push(wrongAnswer);
            }
        }
        // Shuffle options
        options.sort(() => Math.random() - 0.5);

        return { questionText, options, answer };
    }

    randomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateQuestions() {
        this.questions = [];
        for(let i = 0; i < this.totalQuestions; i++) {
            this.questions.push(this.generateQuestion());
        }
    }

    startTimer() {
        if(this.timer) clearInterval(this.timer);
        
        const timerElement = document.getElementById('timer');
        timerElement.textContent = this.timeLeft;
        timerElement.parentElement.classList.remove('warning', 'danger');
        
        this.timer = setInterval(() => {
            if(!this.answerLocked) {
                this.timeLeft--;
                timerElement.textContent = this.timeLeft;
                
                if(this.timeLeft <= 5) {
                    timerElement.parentElement.classList.add('danger');
                } else if(this.timeLeft <= 10) {
                    timerElement.parentElement.classList.add('warning');
                }
                
                if(this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    this.timeout();
                }
            }
        }, 1000);
    }

    timeout() {
        this.answerLocked = true;
        this.showFeedback(false, 'Time\'s up!');
        setTimeout(() => this.nextQuestion(), 1500);
    }

    showFeedback(isCorrect, message) {
        const options = document.querySelectorAll('.option');
        const currentQ = this.questions[this.currentQuestion];
        
        options.forEach(opt => {
            opt.disabled = true;
            if(parseInt(opt.textContent) === currentQ.answer) {
                opt.classList.add('correct');
            }
            if(isCorrect && opt === this.selectedOption) {
                opt.classList.add('correct');
            }
            if(!isCorrect && opt === this.selectedOption && parseInt(opt.textContent) !== currentQ.answer) {
                opt.classList.add('wrong');
            }
        });
        
        // Show feedback message
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.textContent = message;
        feedback.style.cssText = 'margin-top: 20px; padding: 10px; border-radius: 8px; background: ' + 
            (isCorrect ? '#d4edda' : '#f8d7da') + '; color: ' + (isCorrect ? '#155724' : '#721c24');
        
        const quizArea = document.querySelector('.quiz-area');
        const existing = document.querySelector('.feedback-message');
        if(existing) existing.remove();
        quizArea.appendChild(feedback);
        setTimeout(() => feedback.remove(), 1500);
    }

    checkAnswer(selected, button) {
        if(this.answerLocked) return;
        
        this.selectedOption = button;
        const currentQ = this.questions[this.currentQuestion];
        const isCorrect = parseInt(selected) === currentQ.answer;
        
        if(isCorrect) {
            let points = this.difficulty === 'easy' ? 10 : (this.difficulty === 'medium' ? 20 : 30);
            this.score += points;
            document.getElementById('score').textContent = this.score;
            this.showFeedback(true, 'Correct! +' + points + ' points');
        } else {
            this.showFeedback(false, 'Wrong! The correct answer was ' + currentQ.answer);
        }
        
        this.answerLocked = true;
        clearInterval(this.timer);
        
        setTimeout(() => this.nextQuestion(), 1500);
    }

    nextQuestion() {
        this.currentQuestion++;
        
        if(this.currentQuestion < this.totalQuestions) {
            this.loadQuestion();
        } else {
            this.endQuiz();
        }
    }

    loadQuestion() {
        this.answerLocked = false;
        const q = this.questions[this.currentQuestion];
        
        document.getElementById('question').textContent = q.questionText;
        document.getElementById('question-num').textContent = this.currentQuestion + 1;
        
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option';
            btn.textContent = opt;
            btn.addEventListener('click', () => this.checkAnswer(opt, btn));
            optionsContainer.appendChild(btn);
        });
        
        this.timeLeft = this.difficulty === 'easy' ? 20 : (this.difficulty === 'medium' ? 15 : 10);
        this.startTimer();
    }

    startQuiz() {
        this.score = 0;
        this.currentQuestion = 0;
        this.answerLocked = false;
        document.getElementById('score').textContent = '0';
        document.getElementById('question-num').textContent = '1';
        document.getElementById('total-questions').textContent = this.totalQuestions;
        
        document.querySelector('.quiz-area').style.display = 'block';
        document.querySelector('.next-area').style.display = 'block';
        document.getElementById('result-area').style.display = 'none';
        
        this.generateQuestions();
        this.loadQuestion();
    }

    endQuiz() {
        clearInterval(this.timer);
        
        document.querySelector('.quiz-area').style.display = 'none';
        document.querySelector('.next-area').style.display = 'none';
        document.getElementById('result-area').style.display = 'block';
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-total').textContent = this.totalQuestions;
        
        if(this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('mathQuizHighScore', this.highScore);
            document.getElementById('feedback-message').innerHTML = '🏆 New High Score! 🏆';
        } else {
            document.getElementById('feedback-message').innerHTML = `High Score: ${this.highScore}`;
        }
    }

    restartQuiz() {
        this.startQuiz();
    }

    setDifficulty(level) {
        this.difficulty = level;
        this.startQuiz();
    }
}

// Initialize
const quiz = new MathQuiz();

// Difficulty buttons
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        quiz.setDifficulty(btn.dataset.diff);
    });
});

// Next button (for manual next - but we auto-advance)
document.getElementById('next-btn').addEventListener('click', () => {
    if(quiz.answerLocked) {
        quiz.nextQuestion();
    }
});

// Restart button
document.getElementById('restart-btn').addEventListener('click', () => {
    quiz.restartQuiz();
});

// Start the quiz
quiz.startQuiz();