// Trò chơi Toán học Sinh động Lớp 3 - Phiên bản nâng cao với chọn số câu hỏi và phân bổ độ khó
class MathGameAdvanced {
    constructor() {
        // Khởi tạo các biến trạng thái cơ bản
        this.currentScreen = 'start';
        this.playerName = '';
        this.currentQuestion = 1;
        this.score = 0;
        this.totalQuestions = 20; // Mặc định 20 câu
        this.selectedQuestions = 20;
        this.timePerQuestion = 20;
        this.timeLeft = this.timePerQuestion;
        this.timerInterval = null;
        this.gameTimerInterval = null;
        
        // Cấu trúc câu hỏi theo độ khó
        this.questionStructure = {
            basic: { percentage: 40, questions: [], count: 0 },
            advanced: { percentage: 30, questions: [], count: 0 },
            expert: { percentage: 30, questions: [], count: 0 }
        };
        
        this.gameData = {
            correctAnswer: 0,
            answers: [],
            questionType: 'basic',
            difficulty: 'basic'
        };
        
        // Thống kê chi tiết theo mức độ
        this.gameStats = {
            startTime: null,
            endTime: null,
            totalTime: 0,
            currentQuestionStartTime: null,
            questionTimes: [],
            // Thống kê theo mức độ
            basic: { correct: 0, total: 0, time: 0 },
            advanced: { correct: 0, total: 0, time: 0 },
            expert: { correct: 0, total: 0, time: 0 }
        };
        
        // Cài đặt âm thanh và hiệu ứng
        this.audioEnabled = true;
        this.sounds = {};
        this.confettiActive = false;
        
        // Random seed cho đề bài khác nhau
        this.currentSeed = Date.now();
        this.questionPool = {
            basic: [],
            advanced: [],
            expert: []
        };
        this.gameQuestions = []; // Danh sách câu hỏi cho game hiện tại
        this.currentQuestionIndex = 0;
        
        // Thêm Math.seedrandom implementation
        this.addSeedRandom();
        
        console.log('🎮 Khởi tạo MathGame Nâng Cao...');
        this.initializeGame();
    }

    // Thêm Math.seedrandom implementation
    addSeedRandom() {
        Math.seedrandom = function(seed) {
            let m = 0x80000000; // 2^31
            let a = 1103515245;
            let c = 12345;
            
            let state = seed ? seed : Math.floor(Math.random() * (m - 1));
            
            Math.random = function() {
                state = (a * state + c) % m;
                return state / (m - 1);
            };
        };
    }

    // Khởi tạo trò chơi
    async initializeGame() {
        console.log('✨ Đang khởi tạo game ma thuật...');
        this.setupEventListeners();
        this.setupAudio();
        this.generateQuestionPools();
        this.loadLeaderboard();
        this.showScreen('start');
        this.addMagicalEffects();
        console.log('🌟 Game đã sẵn sàng!');
    }

    // Thêm hiệu ứng ma thuật vào trang
    addMagicalEffects() {
        this.addTypingEffect();
        this.addSparkleEffects();
        this.setupConfetti();
    }

    // Hiệu ứng typing
    addTypingEffect() {
        const typingElements = document.querySelectorAll('.typing-text');
        typingElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid var(--color-primary)';
            
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                    setTimeout(() => {
                        element.style.borderRight = 'none';
                    }, 1000);
                }
            }, 50);
        });
    }

    // Hiệu ứng sparkle cho buttons
    addSparkleEffects() {
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach((btn, index) => {
            const sparkle = btn.querySelector('.answer-sparkle');
            if (sparkle) {
                sparkle.style.animationDelay = `${index * 0.5}s`;
            }
        });
    }

    // Khởi tạo confetti
    setupConfetti() {
        this.confettiContainer = document.getElementById('confettiContainer');
    }

    // Tạo hiệu ứng confetti
    createConfetti() {
        if (!this.confettiContainer || this.confettiActive) return;
        
        this.confettiActive = true;
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 3 + 's';
                
                this.confettiContainer.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 100);
        }
        
        setTimeout(() => {
            this.confettiActive = false;
        }, 3000);
    }

    // Tạo pool câu hỏi theo mức độ khó
    generateQuestionPools() {
        // Tạo seed cho random
        Math.seedrandom(this.currentSeed);
        
        // Reset pools
        this.questionPool = {
            basic: [],
            advanced: [],
            expert: []
        };
        
        // Tạo câu hỏi cơ bản (40%)
        this.generateBasicQuestions();
        
        // Tạo câu hỏi nâng cao (30%)
        this.generateAdvancedQuestions();
        
        // Tạo câu hỏi khó (30%)
        this.generateExpertQuestions();
        
        // Trộn mỗi pool
        this.shuffleArray(this.questionPool.basic);
        this.shuffleArray(this.questionPool.advanced);
        this.shuffleArray(this.questionPool.expert);
        
        console.log(`📚 Đã tạo pools: ${this.questionPool.basic.length} cơ bản, ${this.questionPool.advanced.length} nâng cao, ${this.questionPool.expert.length} khó`);
    }

    // Tạo câu hỏi cơ bản (40% - học sinh trung bình khá)
    generateBasicQuestions() {
        const basicTypes = [
            () => this.createBasicAddition(),
            () => this.createBasicSubtraction(),
            () => this.createBasicMultiplication(),
            () => this.createBasicDivision(),
            () => this.createBasicComparison(),
            () => this.createSimpleWordProblem()
        ];
        
        for (let i = 0; i < 50; i++) {
            const randomType = basicTypes[Math.floor(Math.random() * basicTypes.length)];
            const question = randomType();
            if (question) {
                this.questionPool.basic.push(question);
            }
        }
    }

    // Câu hỏi cộng cơ bản
    createBasicAddition() {
        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;
        const correctAnswer = num1 + num2;
        
        return {
            question: `➕ ${num1} + ${num2} = ?`,
            correctAnswer: correctAnswer,
            answers: this.generateAnswerOptions(correctAnswer),
            difficulty: 'basic',
            type: 'addition',
            emoji: '➕'
        };
    }

    // Câu hỏi trừ cơ bản
    createBasicSubtraction() {
        const num1 = Math.floor(Math.random() * 30) + 10;
        const num2 = Math.floor(Math.random() * num1) + 1;
        const correctAnswer = num1 - num2;
        
        return {
            question: `➖ ${num1} - ${num2} = ?`,
            correctAnswer: correctAnswer,
            answers: this.generateAnswerOptions(correctAnswer),
            difficulty: 'basic',
            type: 'subtraction',
            emoji: '➖'
        };
    }

    // Câu hỏi nhân cơ bản (bảng cửu chương 2-5)
    createBasicMultiplication() {
        const num1 = Math.floor(Math.random() * 4) + 2; // 2-5
        const num2 = Math.floor(Math.random() * 9) + 1; // 1-9
        const correctAnswer = num1 * num2;
        
        return {
            question: `✖️ ${num1} × ${num2} = ?`,
            correctAnswer: correctAnswer,
            answers: this.generateAnswerOptions(correctAnswer),
            difficulty: 'basic',
            type: 'multiplication',
            emoji: '✖️'
        };
    }

    // Câu hỏi chia cơ bản
    createBasicDivision() {
        const divisor = Math.floor(Math.random() * 5) + 2; // 2-6
        const quotient = Math.floor(Math.random() * 8) + 1; // 1-8
        const dividend = divisor * quotient;
        
        return {
            question: `➗ ${dividend} ÷ ${divisor} = ?`,
            correctAnswer: quotient,
            answers: this.generateAnswerOptions(quotient),
            difficulty: 'basic',
            type: 'division',
            emoji: '➗'
        };
    }

    // So sánh số cơ bản
    createBasicComparison() {
        const num1 = Math.floor(Math.random() * 50) + 1;
        const num2 = Math.floor(Math.random() * 50) + 1;
        
        let correctAnswer;
        if (num1 > num2) correctAnswer = '>';
        else if (num1 < num2) correctAnswer = '<';
        else correctAnswer = '=';
        
        return {
            question: `⚖️ So sánh: ${num1} ___ ${num2}`,
            correctAnswer: correctAnswer,
            answers: ['>', '<', '=', '≠'],
            difficulty: 'basic',
            type: 'comparison',
            emoji: '⚖️'
        };
    }

    // Bài toán có lời văn đơn giản
    createSimpleWordProblem() {
        const problems = [
            {
                template: "🍎 Lan có {num1} quả táo. Mẹ cho thêm {num2} quả nữa. Hỏi Lan có tất cả bao nhiêu quả táo?",
                operation: (a, b) => a + b,
                range: [5, 15]
            },
            {
                template: "🚗 Trong bãi đỗ xe có {num1} chiếc ô tô. Có {num2} chiếc chạy đi. Hỏi còn lại bao nhiêu chiếc?",
                operation: (a, b) => a - b,
                range: [10, 25]
            },
            {
                template: "📚 Mỗi hộp có {num1} quyển sách. Có {num2} hộp. Hỏi tất cả có bao nhiêu quyển sách?",
                operation: (a, b) => a * b,
                range: [2, 8]
            }
        ];
        
        const problem = problems[Math.floor(Math.random() * problems.length)];
        const [min, max] = problem.range;
        const num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        const num2 = problem.operation === ((a, b) => a - b) ? 
            Math.floor(Math.random() * num1) + 1 : 
            Math.floor(Math.random() * (max - min + 1)) + min;
        
        const correctAnswer = problem.operation(num1, num2);
        const questionText = problem.template.replace('{num1}', num1).replace('{num2}', num2);
        
        return {
            question: questionText,
            correctAnswer: correctAnswer,
            answers: this.generateAnswerOptions(correctAnswer),
            difficulty: 'basic',
            type: 'word_problem',
            emoji: '📖'
        };
    }

    // Tạo câu hỏi nâng cao (30% - học sinh khá giỏi)
    generateAdvancedQuestions() {
        const advancedTypes = [
            () => this.createAdvancedArithmetic(),
            () => this.createMoneyProblem(),
            () => this.createTimeProblem(),
            () => this.createSimpleExpression(),
            () => this.createGeometryProblem(),
            () => this.createFractionProblem()
        ];
        
        for (let i = 0; i < 40; i++) {
            const randomType = advancedTypes[Math.floor(Math.random() * advancedTypes.length)];
            const question = randomType();
            if (question) {
                this.questionPool.advanced.push(question);
            }
        }
    }

    // Phép tính 2-3 chữ số
    createAdvancedArithmetic() {
        const operations = ['+', '-', '×'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, correctAnswer;
        
        if (operation === '+') {
            num1 = Math.floor(Math.random() * 90) + 10; // 10-99
            num2 = Math.floor(Math.random() * 90) + 10;
            correctAnswer = num1 + num2;
        } else if (operation === '-') {
            num1 = Math.floor(Math.random() * 90) + 50; // 50-139
            num2 = Math.floor(Math.random() * 40) + 10; // 10-49
            correctAnswer = num1 - num2;
        } else { // multiplication
            num1 = Math.floor(Math.random() * 20) + 5; // 5-24
            num2 = Math.floor(Math.random() * 8) + 2; // 2-9
            correctAnswer = num1 * num2;
        }
        
        return {
            question: `🔢 ${num1} ${operation} ${num2} = ?`,
            correctAnswer: correctAnswer,
            answers: this.generateAnswerOptions(correctAnswer),
            difficulty: 'advanced',
            type: 'arithmetic',
            emoji: '🔢'
        };
    }

    // Bài toán về tiền
    createMoneyProblem() {
        const problems = [
            {
                template: "💰 Bạn có {money1}đ, mua kẹo hết {money2}đ. Còn lại bao nhiêu tiền?",
                operation: (a, b) => a - b,
                range: [5000, 20000]
            },
            {
                template: "🛒 Mẹ cho {money1}đ, bà cho thêm {money2}đ. Tổng cộng có bao nhiêu tiền?",
                operation: (a, b) => a + b,
                range: [2000, 15000]
            },
            {
                template: "🏪 Mỗi cây bút giá {money1}đ. Mua {num} cây hết bao nhiêu tiền?",
                operation: (a, b) => a * b,
                range: [1000, 5000]
            }
        ];
        
        const problem = problems[Math.floor(Math.random() * problems.length)];
        const [min, max] = problem.range;
        
        if (problem.template.includes('{num}')) {
            const money1 = Math.floor(Math.random() * (max - min + 1) / 1000) * 1000 + min;
            const num = Math.floor(Math.random() * 5) + 2;
            const correctAnswer = problem.operation(money1, num);
            
            const questionText = problem.template
                .replace('{money1}', money1.toLocaleString())
                .replace('{num}', num);
                
            return {
                question: questionText,
                correctAnswer: correctAnswer,
                answers: this.generateAnswerOptions(correctAnswer, 'money'),
                difficulty: 'advanced',
                type: 'money',
                emoji: '💰'
            };
        } else {
            const money1 = Math.floor(Math.random() * (max - min + 1) / 1000) * 1000 + min;
            const money2 = Math.floor(Math.random() * money1 / 1000) * 1000;
            const correctAnswer = problem.operation(money1, money2);
            
            const questionText = problem.template
                .replace('{money1}', money1.toLocaleString())
                .replace('{money2}', money2.toLocaleString());
                
            return {
                question: questionText,
                correctAnswer: correctAnswer,
                answers: this.generateAnswerOptions(correctAnswer, 'money'),
                difficulty: 'advanced',
                type: 'money',
                emoji: '💰'
            };
        }
    }

    // Bài toán về thời gian
    createTimeProblem() {
        const problems = [
            { question: "🕐 1 giờ có bao nhiêu phút?", answer: 60 },
            { question: "⏰ Nếu bây giờ là 3 giờ, sau 4 giờ nữa là mấy giờ?", answer: 7 },
            { question: "🕕 30 phút bằng mấy phần tư giờ?", answer: 2 },
            { question: "⏱️ Từ 9 giờ đến 12 giờ là bao nhiêu giờ?", answer: 3 }
        ];
        
        const problem = problems[Math.floor(Math.random() * problems.length)];
        
        return {
            question: problem.question,
            correctAnswer: problem.answer,
            answers: this.generateAnswerOptions(problem.answer),
            difficulty: 'advanced',
            type: 'time',
            emoji: '⏰'
        };
    }

    // Biểu thức đơn giản (2 phép tính)
    createSimpleExpression() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const num3 = Math.floor(Math.random() * 5) + 1;
        
        const expressions = [
            { expr: `${num1} + ${num2} × ${num3}`, answer: num1 + (num2 * num3) },
            { expr: `${num1} × ${num2} + ${num3}`, answer: (num1 * num2) + num3 },
            { expr: `${num1 + num3} - ${num2}`, answer: (num1 + num3) - num2 }
        ];
        
        const expression = expressions[Math.floor(Math.random() * expressions.length)];
        
        return {
            question: `🧮 Tính: ${expression.expr} = ?`,
            correctAnswer: expression.answer,
            answers: this.generateAnswerOptions(expression.answer),
            difficulty: 'advanced',
            type: 'expression',
            emoji: '🧮'
        };
    }

    // Đếm hình học cơ bản
    createGeometryProblem() {
        const shapes = [
            { shape: '△', name: 'tam giác', count: Math.floor(Math.random() * 6) + 3 },
            { shape: '⬜', name: 'hình vuông', count: Math.floor(Math.random() * 5) + 2 },
            { shape: '⭕', name: 'hình tròn', count: Math.floor(Math.random() * 4) + 2 }
        ];
        
        const selectedShape = shapes[Math.floor(Math.random() * shapes.length)];
        const shapeString = selectedShape.shape.repeat(selectedShape.count);
        
        return {
            question: `📐 Đếm số ${selectedShape.name}:`,
            correctAnswer: selectedShape.count,
            answers: this.generateAnswerOptions(selectedShape.count),
            difficulty: 'advanced',
            type: 'geometry',
            hasImage: true,
            imageContent: shapeString,
            emoji: '📐'
        };
    }

    // Phân số 1/2, 1/4
    createFractionProblem() {
        const fractions = [
            { question: "🍕 1/2 của 8 là bao nhiêu?", answer: 4 },
            { question: "🍰 1/4 của 12 là bao nhiêu?", answer: 3 },
            { question: "🧁 1/2 của 10 là bao nhiêu?", answer: 5 },
            { question: "🍎 1/4 của 16 là bao nhiêu?", answer: 4 }
        ];
        
        const fraction = fractions[Math.floor(Math.random() * fractions.length)];
        
        return {
            question: fraction.question,
            correctAnswer: fraction.answer,
            answers: this.generateAnswerOptions(fraction.answer),
            difficulty: 'advanced',
            type: 'fraction',
            emoji: '🍕'
        };
    }

    // Tạo câu hỏi khó (30% - phân loại giỏi xuất sắc)
    generateExpertQuestions() {
        const expertTypes = [
            () => this.createComplexExpression(),
            () => this.createMissingNumber(),
            () => this.createLogicProblem(),
            () => this.createPatternProblem(),
            () => this.createComplexGeometry(),
            () => this.createFractionComparison(),
            () => this.createReverseProblem()
        ];
        
        for (let i = 0; i < 35; i++) {
            const randomType = expertTypes[Math.floor(Math.random() * expertTypes.length)];
            const question = randomType();
            if (question) {
                this.questionPool.expert.push(question);
            }
        }
    }

    // Biểu thức phức tạp (3+ phép tính)
    createComplexExpression() {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 6) + 1;
        const c = Math.floor(Math.random() * 5) + 1;
        const d = Math.floor(Math.random() * 4) + 1;
        
        const expressions = [
            { expr: `${a} + ${b} × ${c} - ${d}`, answer: a + (b * c) - d },
            { expr: `${a} × ${b} + ${c} - ${d}`, answer: (a * b) + c - d },
            { expr: `${a + d} - ${b} + ${c}`, answer: (a + d) - b + c }
        ];
        
        const expression = expressions[Math.floor(Math.random() * expressions.length)];
        
        return {
            question: `⚡ Tính: ${expression.expr} = ?`,
            correctAnswer: expression.answer,
            answers: this.generateAnswerOptions(expression.answer),
            difficulty: 'expert',
            type: 'complex_expression',
            emoji: '⚡'
        };
    }

    // Tìm số thiếu
    createMissingNumber() {
        const missing = Math.floor(Math.random() * 20) + 5;
        const other = Math.floor(Math.random() * 30) + 10;
        const total = missing + other;
        
        const problems = [
            { template: `🔍 Tìm số còn thiếu: ${other} + ? = ${total}`, answer: missing },
            { template: `🔍 Tìm số còn thiếu: ${total} - ? = ${other}`, answer: missing },
            { template: `🔍 Tìm số còn thiếu: ? + ${other} = ${total}`, answer: missing }
        ];
        
        const problem = problems[Math.floor(Math.random() * problems.length)];
        
        return {
            question: problem.template,
            correctAnswer: problem.answer,
            answers: this.generateAnswerOptions(problem.answer),
            difficulty: 'expert',
            type: 'missing_number',
            emoji: '🔍'
        };
    }

    // Bài toán logic tuổi
    createLogicProblem() {
        const problems = [
            {
                template: "🧠 An hơn Bình {diff} tuổi. Tổng tuổi hai bạn là {sum}. Hỏi An bao nhiêu tuổi?",
                generateAnswer: (diff, sum) => (sum + diff) / 2
            },
            {
                template: "🧠 Mẹ hơn con {diff} tuổi. Tổng tuổi là {sum}. Hỏi mẹ bao nhiêu tuổi?",
                generateAnswer: (diff, sum) => (sum + diff) / 2
            }
        ];
        
        const problem = problems[Math.floor(Math.random() * problems.length)];
        const diff = Math.floor(Math.random() * 8) + 2; // 2-9
        const childAge = Math.floor(Math.random() * 8) + 6; // 6-13
        const sum = (childAge * 2) + diff;
        const correctAnswer = problem.generateAnswer(diff, sum);
        
        const questionText = problem.template
            .replace('{diff}', diff)
            .replace('{sum}', sum);
        
        return {
            question: questionText,
            correctAnswer: correctAnswer,
            answers: this.generateAnswerOptions(correctAnswer),
            difficulty: 'expert',
            type: 'logic',
            emoji: '🧠'
        };
    }

    // Tìm quy luật dãy số
    createPatternProblem() {
        const patterns = [
            { sequence: [2, 4, 6, 8], next: 10, description: "2, 4, 6, 8, ?" },
            { sequence: [1, 3, 5, 7], next: 9, description: "1, 3, 5, 7, ?" },
            { sequence: [5, 10, 15, 20], next: 25, description: "5, 10, 15, 20, ?" },
            { sequence: [3, 6, 9, 12], next: 15, description: "3, 6, 9, 12, ?" },
            { sequence: [10, 8, 6, 4], next: 2, description: "10, 8, 6, 4, ?" }
        ];
        
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        return {
            question: `🔢 Tìm số tiếp theo: ${pattern.description}`,
            correctAnswer: pattern.next,
            answers: this.generateAnswerOptions(pattern.next),
            difficulty: 'expert',
            type: 'pattern',
            emoji: '🔢'
        };
    }

    // Bài toán hình học phức tạp
    createComplexGeometry() {
        const problems = [
            {
                question: "📐 Trong hình có bao nhiêu tam giác?",
                imageContent: "△ ▲ △ ▲ △ ▲",
                answer: 6
            },
            {
                question: "📐 Đếm tất cả các hình:",
                imageContent: "⬜ △ ⭕ ⬜ △",
                answer: 5
            }
        ];
        
        const problem = problems[Math.floor(Math.random() * problems.length)];
        
        return {
            question: problem.question,
            correctAnswer: problem.answer,
            answers: this.generateAnswerOptions(problem.answer),
            difficulty: 'expert',
            type: 'complex_geometry',
            hasImage: true,
            imageContent: problem.imageContent,
            emoji: '📐'
        };
    }

    // So sánh phân số
    createFractionComparison() {
        const fractions = [
            { question: "🔍 So sánh: 1/2 ___ 1/4", answer: '>' },
            { question: "🔍 So sánh: 1/3 ___ 1/2", answer: '<' },
            { question: "🔍 So sánh: 2/4 ___ 1/2", answer: '=' }
        ];
        
        const fraction = fractions[Math.floor(Math.random() * fractions.length)];
        
        return {
            question: fraction.question,
            correctAnswer: fraction.answer,
            answers: ['>', '<', '=', '≠'],
            difficulty: 'expert',
            type: 'fraction_comparison',
            emoji: '🔍'
        };
    }

    // Bài toán ngược
    createReverseProblem() {
        const problems = [
            {
                template: "🔄 Nếu 3 quả táo có giá {price}đ, thì 5 quả táo có giá bao nhiêu?",
                calculate: (price) => Math.round(price * 5 / 3)
            },
            {
                template: "🔄 Một hộp có {items} cây bút. Cần bao nhiêu hộp để có 15 cây bút?",
                calculate: (items) => Math.ceil(15 / items)
            }
        ];
        
        const problem = problems[Math.floor(Math.random() * problems.length)];
        
        if (problem.template.includes('táo')) {
            const price = (Math.floor(Math.random() * 4) + 2) * 3000; // 6000, 9000, 12000, 15000
            const correctAnswer = problem.calculate(price);
            
            return {
                question: problem.template.replace('{price}', price.toLocaleString()),
                correctAnswer: correctAnswer,
                answers: this.generateAnswerOptions(correctAnswer, 'money'),
                difficulty: 'expert',
                type: 'reverse_problem',
                emoji: '🔄'
            };
        } else {
            const items = Math.floor(Math.random() * 4) + 3; // 3, 4, 5, 6
            const correctAnswer = problem.calculate(items);
            
            return {
                question: problem.template.replace('{items}', items),
                correctAnswer: correctAnswer,
                answers: this.generateAnswerOptions(correctAnswer),
                difficulty: 'expert',
                type: 'reverse_problem',
                emoji: '🔄'
            };
        }
    }

    // Trộn mảng
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Tạo các lựa chọn đáp án
    generateAnswerOptions(correctAnswer, type = 'number') {
        const answers = [correctAnswer];
        
        while (answers.length < 4) {
            let wrongAnswer;
            
            if (type === 'money') {
                const variation = Math.floor(Math.random() * 8000) + 2000;
                wrongAnswer = Math.max(1000, correctAnswer + (Math.random() > 0.5 ? variation : -variation));
                wrongAnswer = Math.floor(wrongAnswer / 1000) * 1000;
            } else {
                const variation = Math.floor(Math.random() * 10) + 1;
                wrongAnswer = Math.max(0, correctAnswer + (Math.random() > 0.5 ? variation : -variation));
            }
            
            if (!answers.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
                answers.push(wrongAnswer);
            }
        }
        
        this.shuffleArray(answers);
        return answers;
    }

    // Thiết lập event listeners
    setupEventListeners() {
        console.log('🎛️ Đang thiết lập event listeners...');
        
        // Question selection
        const questionOptions = document.querySelectorAll('.question-option');
        questionOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectQuestionCount(parseInt(option.dataset.value));
            });
        });
        
        // Màn hình bắt đầu
        const startBtn = document.getElementById('startBtn');
        const playerNameInput = document.getElementById('playerName');
        
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startGame();
            });
        }

        if (playerNameInput) {
            playerNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.startGame();
                }
            });
        }

        // Màn hình game
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectAnswer(index);
            });
        });

        // Màn hình kết thúc - FIX RESTART FUNCTIONALITY
        const newGameBtn = document.getElementById('newGameBtn');
        const practiceAgainBtn = document.getElementById('practiceAgainBtn');
        const homeBtn = document.getElementById('homeBtn');
        
        if (newGameBtn) {
            newGameBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startNewGame();
            });
        }
        
        if (practiceAgainBtn) {
            practiceAgainBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.practiceAgain();
            });
        }
        
        if (homeBtn) {
            homeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.goHome();
            });
        }

        // Nút âm thanh
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSound();
            });
        }
    }

    // Chọn số câu hỏi
    selectQuestionCount(count) {
        // Remove selected class from all options
        document.querySelectorAll('.question-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        document.querySelector(`[data-value="${count}"]`).classList.add('selected');
        
        // Update selected questions
        this.selectedQuestions = count;
        this.totalQuestions = count;
        
        console.log(`🎯 Đã chọn ${count} câu hỏi`);
    }

    // Tính toán phân bổ câu hỏi theo tỷ lệ
    calculateQuestionDistribution() {
        const total = this.totalQuestions;
        
        // Tỷ lệ: 40% cơ bản, 30% nâng cao, 30% khó
        this.questionStructure.basic.count = Math.round(total * 0.4);
        this.questionStructure.advanced.count = Math.round(total * 0.3);
        this.questionStructure.expert.count = total - this.questionStructure.basic.count - this.questionStructure.advanced.count;
        
        console.log(`📊 Phân bổ: ${this.questionStructure.basic.count} cơ bản, ${this.questionStructure.advanced.count} nâng cao, ${this.questionStructure.expert.count} khó`);
    }

    // Tạo danh sách câu hỏi cho game
    generateGameQuestions() {
        this.calculateQuestionDistribution();
        this.gameQuestions = [];
        
        // Lấy câu hỏi từ mỗi pool theo tỷ lệ
        const basicQuestions = this.getRandomQuestions(this.questionPool.basic, this.questionStructure.basic.count);
        const advancedQuestions = this.getRandomQuestions(this.questionPool.advanced, this.questionStructure.advanced.count);
        const expertQuestions = this.getRandomQuestions(this.questionPool.expert, this.questionStructure.expert.count);
        
        // Gộp và trộn câu hỏi
        this.gameQuestions = [...basicQuestions, ...advancedQuestions, ...expertQuestions];
        this.shuffleArray(this.gameQuestions);
        
        console.log(`🎮 Đã tạo ${this.gameQuestions.length} câu hỏi cho game`);
    }

    // Lấy câu hỏi ngẫu nhiên từ pool
    getRandomQuestions(pool, count) {
        const shuffled = [...pool];
        this.shuffleArray(shuffled);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    // Thiết lập âm thanh
    async setupAudio() {
        try {
            this.sounds.correct = {
                play: () => {
                    if (this.audioEnabled) {
                        this.playTone([523.25, 659.25, 783.99], 0.3);
                    }
                }
            };

            this.sounds.incorrect = {
                play: () => {
                    if (this.audioEnabled) {
                        this.playTone([196, 185, 175], 0.5);
                    }
                }
            };

            this.sounds.victory = {
                play: () => {
                    if (this.audioEnabled) {
                        this.playVictoryFanfare();
                    }
                }
            };
            
        } catch (error) {
            console.log('⚠️ Lỗi khởi tạo âm thanh:', error);
        }
    }

    // Phát tone đơn giản
    playTone(frequencies, duration) {
        if (!this.audioEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            frequencies.forEach((freq, index) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime + index * 0.1);
                oscillator.stop(audioContext.currentTime + duration + index * 0.1);
            });
        } catch (error) {
            console.log('Lỗi phát âm thanh:', error);
        }
    }

    // Phát nhạc chiến thắng
    playVictoryFanfare() {
        const melody = [523.25, 659.25, 783.99, 1046.50];
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone([freq], 0.4);
            }, index * 200);
        });
    }

    // Bật/tắt âm thanh
    toggleSound() {
        this.audioEnabled = !this.audioEnabled;
        const soundIcon = document.getElementById('soundIcon');
        const soundToggle = document.getElementById('soundToggle');
        
        if (this.audioEnabled) {
            soundIcon.textContent = '🔊';
            soundToggle.classList.remove('muted');
        } else {
            soundIcon.textContent = '🔇';
            soundToggle.classList.add('muted');
        }
    }

    // Phát âm thanh hiệu ứng
    playSound(type) {
        if (this.sounds[type]) {
            this.sounds[type].play();
        }
    }

    // Hiển thị màn hình
    showScreen(screenName) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
        
        const targetScreen = document.getElementById(screenName + 'Screen');
        if (targetScreen) {
            setTimeout(() => {
                targetScreen.classList.add('active');
                this.currentScreen = screenName;
            }, 300);
        }
    }

    // Bắt đầu trò chơi
    startGame() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput.value.trim();
        
        if (!name) {
            nameInput.classList.add('shake');
            setTimeout(() => nameInput.classList.remove('shake'), 500);
            return;
        }
        
        this.playerName = name;
        this.resetGameStats();
        this.gameStats.startTime = Date.now();
        this.generateGameQuestions();
        this.currentQuestionIndex = 0;
        this.currentQuestion = 1;
        
        this.showScreen('game');
        this.startGameTimer();
        this.generateQuestion();
    }

    // Reset thống kê game
    resetGameStats() {
        this.score = 0;
        this.gameStats = {
            startTime: null,
            endTime: null,
            totalTime: 0,
            currentQuestionStartTime: null,
            questionTimes: [],
            basic: { correct: 0, total: 0, time: 0 },
            advanced: { correct: 0, total: 0, time: 0 },
            expert: { correct: 0, total: 0, time: 0 }
        };
    }

    // Bắt đầu timer tổng
    startGameTimer() {
        // Clear existing timer
        if (this.gameTimerInterval) {
            clearInterval(this.gameTimerInterval);
        }
        
        this.gameTimerInterval = setInterval(() => {
            if (this.gameStats.startTime) {
                this.gameStats.totalTime = Date.now() - this.gameStats.startTime;
                this.updateTotalTimeDisplay();
            }
        }, 1000);
    }

    // Cập nhật hiển thị thời gian tổng
    updateTotalTimeDisplay() {
        const totalTimeElement = document.getElementById('totalTime');
        if (totalTimeElement) {
            const minutes = Math.floor(this.gameStats.totalTime / 60000);
            const seconds = Math.floor((this.gameStats.totalTime % 60000) / 1000);
            totalTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Tạo câu hỏi
    generateQuestion() {
        this.resetTimer();
        this.enableAnswerButtons();
        this.gameStats.currentQuestionStartTime = Date.now();
        
        // Lấy câu hỏi từ danh sách đã tạo
        if (this.currentQuestionIndex >= this.gameQuestions.length) {
            this.endGame();
            return;
        }
        
        this.gameData = this.gameQuestions[this.currentQuestionIndex];
        this.displayQuestion();
        this.startTimer();
        this.updateGameInfo();
    }

    // Hiển thị câu hỏi
    displayQuestion() {
        const questionText = document.getElementById('questionText');
        const questionImage = document.getElementById('questionImage');
        const answerButtons = document.querySelectorAll('.answer-btn');
        const difficultyBadge = document.getElementById('questionDifficulty');
        const questionProgress = document.getElementById('questionProgress');
        
        // Cập nhật difficulty indicator
        if (difficultyBadge) {
            difficultyBadge.className = `difficulty-badge ${this.gameData.difficulty}`;
            const difficultyTexts = {
                basic: '⭐ Cơ bản',
                advanced: '⭐⭐ Nâng cao',
                expert: '⭐⭐⭐ Khó'
            };
            difficultyBadge.textContent = difficultyTexts[this.gameData.difficulty];
        }
        
        if (questionProgress) {
            questionProgress.textContent = `Câu ${this.currentQuestion}/${this.totalQuestions}`;
        }
        
        // Hiệu ứng typing cho câu hỏi
        if (questionText) {
            questionText.textContent = '';
            questionText.classList.add('typing-effect');
            
            const text = this.gameData.question;
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    questionText.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                    questionText.classList.remove('typing-effect');
                }
            }, 50);
        }
        
        // Hiển thị hình ảnh nếu có
        if (questionImage) {
            if (this.gameData.hasImage && this.gameData.imageContent) {
                questionImage.textContent = this.gameData.imageContent;
                questionImage.classList.remove('hidden');
                questionImage.classList.add('bounce-in');
            } else {
                questionImage.classList.add('hidden');
            }
        }
        
        // Hiển thị các đáp án với hiệu ứng
        answerButtons.forEach((btn, index) => {
            const answerText = btn.querySelector('.answer-text');
            if (answerText) {
                if (typeof this.gameData.answers[index] === 'number' && this.gameData.type === 'money') {
                    answerText.textContent = this.gameData.answers[index].toLocaleString() + 'đ';
                } else {
                    answerText.textContent = this.gameData.answers[index];
                }
            }
            
            // Reset trạng thái button
            btn.classList.remove('correct', 'incorrect');
            btn.disabled = false;
            
            // Thêm hiệu ứng delay cho mỗi button
            btn.style.animationDelay = `${index * 0.1}s`;
            btn.classList.add('slide-in');
        });
    }

    // Bật các nút đáp án
    enableAnswerButtons() {
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });
    }

    // Chọn đáp án
    selectAnswer(answerIndex) {
        this.stopTimer();
        
        // Tính thời gian trả lời câu này
        const questionTime = Date.now() - this.gameStats.currentQuestionStartTime;
        this.gameStats.questionTimes.push(questionTime);
        
        const selectedAnswer = this.gameData.answers[answerIndex];
        const isCorrect = selectedAnswer === this.gameData.correctAnswer;
        const answerButtons = document.querySelectorAll('.answer-btn');
        const difficulty = this.gameData.difficulty;
        
        // Cập nhật thống kê theo mức độ
        this.gameStats[difficulty].total++;
        this.gameStats[difficulty].time += questionTime;
        
        if (isCorrect) {
            this.gameStats[difficulty].correct++;
            this.score += difficulty === 'basic' ? 5 : difficulty === 'advanced' ? 8 : 12;
            this.playSound('correct');
            this.createConfetti();
        } else {
            this.playSound('incorrect');
        }
        
        // Hiển thị kết quả
        answerButtons.forEach((btn, index) => {
            btn.disabled = true;
            const btnAnswer = this.gameData.answers[index];
            
            if (btnAnswer === this.gameData.correctAnswer) {
                btn.classList.add('correct');
            } else if (index === answerIndex && !isCorrect) {
                btn.classList.add('incorrect');
                btn.classList.add('shake');
            }
        });
        
        this.updateGameInfo();
        
        // Chuyển câu tiếp theo
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    // Câu hỏi tiếp theo
    nextQuestion() {
        if (this.currentQuestion >= this.totalQuestions) {
            this.endGame();
        } else {
            this.currentQuestion++;
            this.currentQuestionIndex++;
            this.generateQuestion();
        }
    }

    // Cập nhật thông tin game
    updateGameInfo() {
        const scoreElement = document.getElementById('currentScore');
        const counterElement = document.getElementById('questionCounter');
        
        if (scoreElement) {
            scoreElement.textContent = this.score;
            scoreElement.classList.add('pulse');
            setTimeout(() => scoreElement.classList.remove('pulse'), 500);
        }
        
        if (counterElement) {
            counterElement.textContent = `${this.currentQuestion} / ${this.totalQuestions}`;
        }
    }

    // Kết thúc game
    endGame() {
        this.gameStats.endTime = Date.now();
        
        // Clear tất cả intervals
        if (this.gameTimerInterval) {
            clearInterval(this.gameTimerInterval);
            this.gameTimerInterval = null;
        }
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.saveScore();
        this.showDetailedResults();
        this.showScreen('end');
        this.playSound('victory');
        
        // Hiệu ứng confetti cho kết thúc
        setTimeout(() => this.createConfetti(), 500);
        setTimeout(() => this.createConfetti(), 1500);
    }

    // Hiển thị kết quả chi tiết
    showDetailedResults() {
        // Thông tin cơ bản
        const finalPlayerName = document.getElementById('finalPlayerName');
        const finalScore = document.getElementById('finalScore');
        const scoreMessage = document.getElementById('scoreMessage');
        
        if (finalPlayerName) finalPlayerName.textContent = this.playerName;
        if (finalScore) finalScore.textContent = this.score;
        
        // Thống kê theo mức độ
        this.updateDifficultyStats();
        
        // Thống kê tổng quan
        const correctAnswers = document.getElementById('correctAnswers');
        const wrongAnswers = document.getElementById('wrongAnswers');
        const finalTotalTime = document.getElementById('finalTotalTime');
        const averageTime = document.getElementById('averageTime');
        
        const totalCorrect = this.gameStats.basic.correct + this.gameStats.advanced.correct + this.gameStats.expert.correct;
        const totalWrong = this.totalQuestions - totalCorrect;
        
        if (correctAnswers) correctAnswers.textContent = totalCorrect;
        if (wrongAnswers) wrongAnswers.textContent = totalWrong;
        
        if (finalTotalTime) {
            const minutes = Math.floor(this.gameStats.totalTime / 60000);
            const seconds = Math.floor((this.gameStats.totalTime % 60000) / 1000);
            finalTotalTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (averageTime && this.gameStats.questionTimes.length > 0) {
            const avgTime = this.gameStats.questionTimes.reduce((a, b) => a + b, 0) / this.gameStats.questionTimes.length;
            averageTime.textContent = `${Math.round(avgTime / 1000)}s`;
        }
        
        // Đánh giá thành tích và gợi ý
        this.updateAchievement();
        this.displayLeaderboard();
    }

    // Cập nhật thống kê theo mức độ
    updateDifficultyStats() {
        // Basic stats
        const basicCorrect = document.getElementById('basicCorrect');
        const basicTotal = document.getElementById('basicTotal');
        const basicPercentage = document.getElementById('basicPercentage');
        
        if (basicCorrect) basicCorrect.textContent = this.gameStats.basic.correct;
        if (basicTotal) basicTotal.textContent = this.gameStats.basic.total;
        if (basicPercentage) {
            const percentage = this.gameStats.basic.total > 0 ? 
                Math.round((this.gameStats.basic.correct / this.gameStats.basic.total) * 100) : 0;
            basicPercentage.textContent = `${percentage}%`;
        }
        
        // Advanced stats  
        const advancedCorrect = document.getElementById('advancedCorrect');
        const advancedTotal = document.getElementById('advancedTotal');
        const advancedPercentage = document.getElementById('advancedPercentage');
        
        if (advancedCorrect) advancedCorrect.textContent = this.gameStats.advanced.correct;
        if (advancedTotal) advancedTotal.textContent = this.gameStats.advanced.total;
        if (advancedPercentage) {
            const percentage = this.gameStats.advanced.total > 0 ? 
                Math.round((this.gameStats.advanced.correct / this.gameStats.advanced.total) * 100) : 0;
            advancedPercentage.textContent = `${percentage}%`;
        }
        
        // Expert stats
        const expertCorrect = document.getElementById('expertCorrect');
        const expertTotal = document.getElementById('expertTotal');
        const expertPercentage = document.getElementById('expertPercentage');
        
        if (expertCorrect) expertCorrect.textContent = this.gameStats.expert.correct;
        if (expertTotal) expertTotal.textContent = this.gameStats.expert.total;
        if (expertPercentage) {
            const percentage = this.gameStats.expert.total > 0 ? 
                Math.round((this.gameStats.expert.correct / this.gameStats.expert.total) * 100) : 0;
            expertPercentage.textContent = `${percentage}%`;
        }
    }

    // Cập nhật thành tích và gợi ý
    updateAchievement() {
        const achievementBadge = document.getElementById('achievementBadge');
        const achievementMessage = document.getElementById('achievementMessage');
        const scoreMessage = document.getElementById('scoreMessage');
        const suggestionMessage = document.getElementById('suggestionMessage');
        
        let badge, message, scoreMsg, suggestion;
        
        const totalCorrect = this.gameStats.basic.correct + this.gameStats.advanced.correct + this.gameStats.expert.correct;
        const percentage = (totalCorrect / this.totalQuestions) * 100;
        const totalTimeSeconds = this.gameStats.totalTime / 1000;
        
        // Tính tỷ lệ từng mức độ
        const basicRate = this.gameStats.basic.total > 0 ? (this.gameStats.basic.correct / this.gameStats.basic.total) * 100 : 0;
        const advancedRate = this.gameStats.advanced.total > 0 ? (this.gameStats.advanced.correct / this.gameStats.advanced.total) * 100 : 0;
        const expertRate = this.gameStats.expert.total > 0 ? (this.gameStats.expert.correct / this.gameStats.expert.total) * 100 : 0;
        
        // Đánh giá và gợi ý
        if (percentage >= 90 && totalTimeSeconds < this.totalQuestions * 15) {
            badge = { icon: '🏆', text: 'Xuất Sắc!', color: '#FFD700' };
            message = 'Thật tuyệt vời! Bạn là thiên tài toán học! 🌟';
            scoreMsg = 'Hoàn hảo!';
            suggestion = 'Bạn đã thành thạo tất cả mức độ! Hãy thử với nhiều câu hỏi hơn để thách thức bản thânt! 💪';
        } else if (percentage >= 70) {
            badge = { icon: '🥈', text: 'Giỏi Lắm!', color: '#C0C0C0' };
            message = 'Rất tốt! Tiếp tục phát huy nhé! 👏';
            scoreMsg = 'Tuyệt vời!';
            
            if (expertRate < 50) {
                suggestion = 'Bạn làm tốt ở mức cơ bản và nâng cao! Hãy luyện tập thêm các bài khó để hoàn thiện kỹ năng. 🧠';
            } else {
                suggestion = 'Thành tích rất tốt! Hãy tiếp tục luyện tập để đạt mức xuất sắc! ⭐';
            }
        } else if (percentage >= 50) {
            badge = { icon: '🥉', text: 'Khá Tốt!', color: '#CD7F32' };
            message = 'Khá tốt! Hãy luyện tập thêm! 💪';
            scoreMsg = 'Cố gắng!';
            
            if (basicRate < 70) {
                suggestion = 'Hãy tập trung luyện tập các phép tính cơ bản trước, sau đó mới nâng cao độ khó. 📚';
            } else {
                suggestion = 'Nền tảng cơ bản tốt! Bây giờ hãy thử thách bản thân với các bài nâng cao hơn. 🚀';
            }
        } else {
            badge = { icon: '🎯', text: 'Cố Gắng!', color: '#87CEEB' };
            message = 'Đừng bỏ cuộc! Hãy thử lại nhé! 🌈';
            scoreMsg = 'Thử lại!';
            suggestion = 'Hãy bắt đầu với ít câu hỏi hơn và tập trung vào các phép tính cơ bản. Luyện tập đều đặn sẽ giúp bạn tiến bộ! 🌱';
        }
        
        if (achievementBadge) {
            const badgeIcon = achievementBadge.querySelector('.badge-icon');
            const badgeText = achievementBadge.querySelector('.badge-text');
            
            if (badgeIcon) badgeIcon.textContent = badge.icon;
            if (badgeText) badgeText.textContent = badge.text;
            achievementBadge.style.background = `linear-gradient(135deg, ${badge.color}, #FFF)`;
        }
        
        if (achievementMessage) achievementMessage.textContent = message;
        if (scoreMessage) scoreMessage.textContent = scoreMsg;
        if (suggestionMessage) suggestionMessage.textContent = suggestion;
    }

    // Timer functions
    startTimer() {
        this.timeLeft = this.timePerQuestion;
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        this.timeLeft = this.timePerQuestion;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const timerText = document.getElementById('timerText');
        const timerProgress = document.getElementById('timerProgress');
        const timerCircle = document.getElementById('timerCircle');
        
        if (timerText) timerText.textContent = `${this.timeLeft}s`;
        
        if (timerProgress) {
            const percentage = (this.timeLeft / this.timePerQuestion) * 100;
            timerProgress.style.width = `${percentage}%`;
            
            timerProgress.classList.remove('warning', 'danger');
            if (this.timeLeft <= 5 && this.timeLeft > 3) {
                timerProgress.classList.add('warning');
            } else if (this.timeLeft <= 3) {
                timerProgress.classList.add('danger');
            }
        }
        
        // Cập nhật timer tròn
        if (timerCircle) {
            const circumference = 2 * Math.PI * 35;
            const offset = circumference - (this.timeLeft / this.timePerQuestion) * circumference;
            timerCircle.style.strokeDashoffset = offset;
        }
    }

    // Hết thời gian
    timeUp() {
        this.stopTimer();
        this.playSound('incorrect');
        
        // Thêm thời gian cho câu hỏi này và cập nhật thống kê
        const questionTime = Date.now() - this.gameStats.currentQuestionStartTime;
        this.gameStats.questionTimes.push(questionTime);
        
        const difficulty = this.gameData.difficulty;
        this.gameStats[difficulty].total++;
        this.gameStats[difficulty].time += questionTime;
        
        // Hiển thị đáp án đúng
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach((btn, index) => {
            btn.disabled = true;
            const btnAnswer = this.gameData.answers[index];
            if (btnAnswer === this.gameData.correctAnswer) {
                btn.classList.add('correct');
            }
        });
        
        // Hiệu ứng hết thời gian
        const timerElement = document.querySelector('.magical-timer');
        if (timerElement) {
            timerElement.classList.add('shake');
            setTimeout(() => {
                timerElement.classList.remove('shake');
            }, 500);
        }
        
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    // FIXED RESTART FUNCTIONS
    
    // Bắt đầu game mới với đề khác (new seed)
    startNewGame() {
        console.log('🆕 Bắt đầu game mới...');
        
        // Clear all timers and intervals
        this.clearAllTimers();
        
        // Generate new seed for different questions
        this.currentSeed = Date.now();
        this.generateQuestionPools();
        
        // Reset all game state
        this.resetGameState();
        
        // Start new game
        this.gameStats.startTime = Date.now();
        this.showScreen('game');
        this.startGameTimer();
        this.generateQuestion();
    }

    // Luyện tập lại với cài đặt tương tự (same seed, same settings)
    practiceAgain() {
        console.log('🔄 Luyện tập lại...');
        
        // Clear all timers and intervals
        this.clearAllTimers();
        
        // Keep same seed but reset game state
        this.resetGameState();
        
        // Generate same question set
        this.generateGameQuestions();
        
        // Start practice session
        this.gameStats.startTime = Date.now();
        this.showScreen('game');
        this.startGameTimer();
        this.generateQuestion();
    }

    // Về trang chủ (complete reset)
    goHome() {
        console.log('🏠 Về trang chủ...');
        
        // Clear all timers and intervals
        this.clearAllTimers();
        
        // Complete reset
        this.resetGameState();
        this.currentSeed = Date.now();
        
        // Reset UI
        this.showScreen('start');
        
        const playerNameInput = document.getElementById('playerName');
        if (playerNameInput) {
            playerNameInput.value = '';
        }
        
        // Reset question selection to default
        document.querySelectorAll('.question-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        document.querySelector('[data-value="20"]').classList.add('selected');
        this.selectedQuestions = 20;
        this.totalQuestions = 20;
    }

    // Helper function to clear all timers
    clearAllTimers() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        if (this.gameTimerInterval) {
            clearInterval(this.gameTimerInterval);
            this.gameTimerInterval = null;
        }
    }

    // Helper function to reset game state
    resetGameState() {
        this.currentQuestion = 1;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.resetGameStats();
        this.gameQuestions = [];
    }

    // Lưu điểm số
    saveScore() {
        try {
            let leaderboard = JSON.parse(localStorage.getItem('mathGameLeaderboard') || '[]');
            
            const totalCorrect = this.gameStats.basic.correct + this.gameStats.advanced.correct + this.gameStats.expert.correct;
            
            const gameRecord = {
                name: this.playerName,
                score: this.score,
                totalQuestions: this.totalQuestions,
                totalTime: this.gameStats.totalTime,
                correctAnswers: totalCorrect,
                wrongAnswers: this.totalQuestions - totalCorrect,
                averageTime: this.gameStats.questionTimes.length > 0 ? 
                    Math.round(this.gameStats.questionTimes.reduce((a, b) => a + b, 0) / this.gameStats.questionTimes.length / 1000) : 0,
                difficultyStats: {
                    basic: this.gameStats.basic,
                    advanced: this.gameStats.advanced,
                    expert: this.gameStats.expert
                },
                date: new Date().toISOString()
            };
            
            leaderboard.push(gameRecord);
            leaderboard.sort((a, b) => b.score - a.score || a.totalTime - b.totalTime);
            leaderboard = leaderboard.slice(0, 10);
            
            localStorage.setItem('mathGameLeaderboard', JSON.stringify(leaderboard));
        } catch (error) {
            console.log('Lỗi lưu điểm:', error);
        }
    }

    // Load bảng xếp hạng
    loadLeaderboard() {
        try {
            return JSON.parse(localStorage.getItem('mathGameLeaderboard') || '[]');
        } catch (error) {
            console.log('Lỗi load bảng xếp hạng:', error);
            return [];
        }
    }

    // Hiển thị bảng xếp hạng
    displayLeaderboard() {
        const leaderboard = this.loadLeaderboard();
        const leaderboardList = document.getElementById('leaderboardList');
        
        if (!leaderboardList) return;
        
        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">🌟 Chưa có siêu sao nào! Hãy là người đầu tiên! 🌟</p>';
            return;
        }
        
        leaderboardList.innerHTML = '';
        
        leaderboard.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            // Highlight điểm của người chơi hiện tại
            if (player.name === this.playerName && 
                Math.abs(player.score - this.score) < 5 && 
                Math.abs(player.totalTime - this.gameStats.totalTime) < 5000) {
                item.classList.add('current-player');
            }
            
            const rankEmoji = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐';
            
            item.innerHTML = `
                <span class="leaderboard-rank">${rankEmoji} ${index + 1}</span>
                <span class="leaderboard-name">${player.name}</span>
                <span class="leaderboard-score">${player.score}đ (${player.totalQuestions}c)</span>
            `;
            
            leaderboardList.appendChild(item);
        });
    }
}

// Khởi tạo game khi DOM đã load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 DOM sẵn sàng, khởi tạo MathGame Nâng Cao...');
    window.gameInstance = new MathGameAdvanced();
});