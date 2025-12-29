// 游戏状态对象
const gameState = {
    difficulty: '',
    score: 0,
    currentQuestion: 0,
    totalQuestions: 10,
    currentProblem: null,
    correctAnswer: '',
    // 倒计时相关属性
    timeRemaining: 10, // 默认10秒
    timerInterval: null,
    timeLimit: 10 // 每个题目的时间限制（秒）
};

// DOM元素对象（将在DOM加载完成后初始化）
const elements = {};

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 初始化DOM元素
    elements.difficultyBtns = document.querySelectorAll('.difficulty-btn');
    elements.gameArea = document.querySelector('.game-area');
    elements.difficultySelector = document.querySelector('.difficulty-selector');
    elements.scoreElement = document.getElementById('score');
    elements.currentQuestionElement = document.getElementById('current-question');
    elements.totalQuestionsElement = document.getElementById('total-questions');
    elements.questionText = document.getElementById('question-text');
    elements.optionBtns = [
        document.getElementById('option-1'),
        document.getElementById('option-2'),
        document.getElementById('option-3'),
        document.getElementById('option-4')
    ];
    elements.feedbackElement = document.getElementById('feedback');
    elements.restartBtn = document.getElementById('restart-btn');
    elements.timerElement = document.getElementById('timer');
    elements.timerContainer = document.querySelector('.timer');
    
    // 难度选择按钮事件
    elements.difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const level = btn.getAttribute('data-level');
            console.log('选择难度：', level);
            gameState.difficulty = level;
            startGame();
        });
    });
    
    // 选项按钮事件
    elements.optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            checkAnswer(btn.textContent);
        });
    });
    
    // 重新开始按钮事件
    elements.restartBtn.addEventListener('click', restartGame);
});

// 开始游戏
function startGame() {
    // 重置游戏状态
    gameState.score = 0;
    gameState.currentQuestion = 0;
    
    // 更新显示
    updateScore();
    updateQuestionCount();
    
    // 切换界面
    elements.difficultySelector.style.display = 'none';
    elements.gameArea.style.display = 'block';
    
    // 确保难度已设置
    console.log('开始游戏，难度：', gameState.difficulty);
    
    // 生成第一题
    // 注意：不在这里调用updateQuestionCount，因为generateQuestion会处理
    generateQuestion();
}

// 生成题目
function generateQuestion() {
    clearFeedback();
    
    // 只有当难度已设置时才增加题目计数
    if (gameState.difficulty) {
        gameState.currentQuestion++;
        updateQuestionCount();
    }
    
    let question, options, correctAnswer;
    
    console.log('生成题目，当前难度：', gameState.difficulty);
    
    switch (gameState.difficulty) {
        case 'easy':
            ({ question, options, correctAnswer } = generateEasyQuestion());
            break;
        case 'simple':
            ({ question, options, correctAnswer } = generateSimpleQuestion());
            break;
        case 'hard':
            ({ question, options, correctAnswer } = generateHardQuestion());
            break;
        default:
            question = '请选择难度开始游戏';
            options = ['', '', '', ''];
            correctAnswer = '';
            console.log('难度未设置或无效');
    }
    
    console.log('生成的题目：', question);
    console.log('选项：', options);
    console.log('正确答案：', correctAnswer);
    
    gameState.currentProblem = question;
    gameState.correctAnswer = correctAnswer;
    
    // 更新题目显示
    elements.questionText.textContent = question;
    
    // 更新选项显示
    options.forEach((option, index) => {
        elements.optionBtns[index].textContent = option;
        elements.optionBtns[index].className = 'option-btn';
    });
    
    // 启动倒计时
    startTimer();
}

// 生成容易级题目（出算式，提供得数选择）
function generateEasyQuestion() {
    // 生成两个1-9之间的随机数（乘法口诀范围）
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const correct = a * b;
    
    // 生成题目
    const question = `${a} × ${b} = ( )`;
    
    // 生成选项（包含正确答案和三个干扰项）
    const options = [correct];
    
    // 生成干扰项
    const maxAttempts = 100; // 防止无限循环
    let attempts = 0;
    
    while (options.length < 4 && attempts < maxAttempts) {
        attempts++;
        // 生成一个接近正确答案的干扰项
        const distractor = correct + Math.floor(Math.random() * 15) - 7;
        // 确保干扰项在1-81之间（9×9的结果范围）且不重复
        if (distractor >= 1 && distractor <= 81 && !options.includes(distractor)) {
            options.push(distractor);
        }
    }
    
    // 如果尝试了很多次还是不够选项，就生成完全随机的数字
    while (options.length < 4) {
        const distractor = Math.floor(Math.random() * 81) + 1;
        if (!options.includes(distractor)) {
            options.push(distractor);
        }
    }
    
    // 随机排序选项
    shuffleArray(options);
    
    return { question, options, correctAnswer: correct.toString() };
}

// 生成简单级题目（出结果，让学生选择算式）
function generateSimpleQuestion() {
    // 生成两个1-9之间的随机数（乘法口诀范围）
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const correctResult = a * b;
    
    // 生成题目
    const question = `( ) = ${correctResult}`;
    
    // 生成正确算式
    const correctOption = `${a} × ${b}`;
    
    // 生成选项
    const options = [correctOption];
    
    // 生成干扰项
    const maxAttempts = 100; // 防止无限循环
    let attempts = 0;
    
    while (options.length < 4 && attempts < maxAttempts) {
        attempts++;
        // 生成两个1-9之间的随机数，确保乘积不等于正确结果
        const x = Math.floor(Math.random() * 9) + 1;
        const y = Math.floor(Math.random() * 9) + 1;
        if (x * y !== correctResult) {
            const distractor = `${x} × ${y}`;
            if (!options.includes(distractor)) {
                options.push(distractor);
            }
        }
    }
    
    // 如果尝试了很多次还是不够选项，就生成完全随机的算式
    while (options.length < 4) {
        const x = Math.floor(Math.random() * 9) + 1;
        const y = Math.floor(Math.random() * 9) + 1;
        const distractor = `${x} × ${y}`;
        if (!options.includes(distractor)) {
            options.push(distractor);
        }
    }
    
    // 随机排序选项
    shuffleArray(options);
    
    return { question, options, correctAnswer: correctOption };
}

// 生成困难级题目（给出一个随机得数以及一个因数，让学生选最大能填几）
function generateHardQuestion() {
    // 生成一个1-9之间的因数（乘法口诀范围）
    const factor = Math.floor(Math.random() * 9) + 1;
    // 生成一个随机得数，范围是1到因数×9之间（确保学生需要填写的数在0-9之间）
    const target = Math.floor(Math.random() * (factor * 9)) + 1;
    
    // 计算最大能填的数（结果在0-9之间，符合乘法口诀范围）
    const correct = Math.floor(target / factor);
    
    // 生成题目
    const question = `( ) × ${factor} ≤ ${target}，最大能填几？`;
    
    // 生成选项：先生成0-9的所有可能值，排除正确答案后随机选3个
    const allPossibleOptions = Array.from({length: 10}, (_, i) => i);
    const possibleDistractors = allPossibleOptions.filter(num => num !== correct);
    
    // 随机选择3个干扰项
    const distractors = [];
    while (distractors.length < 3) {
        const randomIndex = Math.floor(Math.random() * possibleDistractors.length);
        const distractor = possibleDistractors[randomIndex];
        if (!distractors.includes(distractor)) {
            distractors.push(distractor);
        }
    }
    
    // 组合正确答案和干扰项
    const options = [correct, ...distractors];
    
    // 随机排序选项
    shuffleArray(options);
    
    return { question, options, correctAnswer: correct.toString() };
}

// 检查答案
function checkAnswer(selectedOption) {
    // 停止倒计时
    stopTimer();
    
    // 禁用所有选项按钮
    elements.optionBtns.forEach(btn => {
        btn.disabled = true;
    });
    
    let isCorrect = false;
    
    // 检查答案是否正确
    if (selectedOption === gameState.correctAnswer) {
        gameState.score++;
        isCorrect = true;
        showFeedback('回答正确！', 'correct');
        updateScore();
    } else {
        showFeedback(`回答错误！正确答案是 ${gameState.correctAnswer}`, 'wrong');
    }
    
    // 高亮显示正确和错误选项
    elements.optionBtns.forEach(btn => {
        if (btn.textContent === gameState.correctAnswer) {
            btn.classList.add('correct');
        } else if (btn.textContent === selectedOption) {
            btn.classList.add('wrong');
        }
    });
    
    // 延迟后进入下一题或结束游戏
    setTimeout(() => {
        if (gameState.currentQuestion < gameState.totalQuestions) {
            generateQuestion();
            elements.optionBtns.forEach(btn => {
                btn.disabled = false;
            });
        } else {
            endGame();
        }
    }, 1500);
}

// 显示反馈
function showFeedback(message, type) {
    elements.feedbackElement.textContent = message;
    elements.feedbackElement.className = `feedback ${type}`;
}

// 清除反馈
function clearFeedback() {
    elements.feedbackElement.textContent = '';
    elements.feedbackElement.className = 'feedback';
}

// 更新得分
function updateScore() {
    elements.scoreElement.textContent = gameState.score;
}

// 更新题目计数
function updateQuestionCount() {
    elements.currentQuestionElement.textContent = gameState.currentQuestion;
}

// 更新倒计时显示
function updateTimer() {
    elements.timerElement.textContent = gameState.timeRemaining;
    
    // 根据剩余时间添加视觉反馈
    elements.timerContainer.className = 'timer';
    if (gameState.timeRemaining <= 10) {
        elements.timerContainer.classList.add('danger');
    } else if (gameState.timeRemaining <= 20) {
        elements.timerContainer.classList.add('warning');
    }
}

// 启动倒计时
function startTimer() {
    // 先停止可能存在的定时器
    stopTimer();
    
    // 重置剩余时间
    gameState.timeRemaining = gameState.timeLimit;
    updateTimer();
    
    // 启动定时器
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        updateTimer();
        
        // 时间到，自动判定为错误
        if (gameState.timeRemaining <= 0) {
            handleTimeUp();
        }
    }, 1000);
}

// 停止倒计时
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// 重置倒计时
function resetTimer() {
    stopTimer();
    gameState.timeRemaining = gameState.timeLimit;
    updateTimer();
    elements.timerContainer.className = 'timer';
}

// 处理时间到的情况
function handleTimeUp() {
    // 停止倒计时
    stopTimer();
    
    // 禁用所有选项按钮
    elements.optionBtns.forEach(btn => {
        btn.disabled = true;
    });
    
    // 显示超时反馈
    showFeedback(`时间到！正确答案是 ${gameState.correctAnswer}`, 'wrong');
    
    // 高亮显示正确选项
    elements.optionBtns.forEach(btn => {
        if (btn.textContent === gameState.correctAnswer) {
            btn.classList.add('correct');
        }
    });
    
    // 延迟后进入下一题或结束游戏
    setTimeout(() => {
        if (gameState.currentQuestion < gameState.totalQuestions) {
            generateQuestion();
            elements.optionBtns.forEach(btn => {
                btn.disabled = false;
            });
        } else {
            endGame();
        }
    }, 1500);
}

// 结束游戏
function endGame() {
    // 停止倒计时
    stopTimer();
    
    elements.questionText.textContent = `游戏结束！你的得分是 ${gameState.score}/${gameState.totalQuestions}`;
    
    // 隐藏选项按钮
    elements.optionBtns.forEach(btn => {
        btn.style.display = 'none';
    });
    
    // 显示重新开始按钮
    elements.restartBtn.style.display = 'block';
}

// 重新开始游戏
function restartGame() {
    // 重置游戏状态
    gameState.score = 0;
    gameState.currentQuestion = 0;
    gameState.currentProblem = null;
    gameState.correctAnswer = '';
    gameState.difficulty = '';
    
    // 重置倒计时
    resetTimer();
    
    // 重置UI
    updateScore();
    updateQuestionCount();
    clearFeedback();
    
    // 显示选项按钮
    elements.optionBtns.forEach(btn => {
        btn.style.display = 'block';
        btn.disabled = false;
        btn.className = 'option-btn';
    });
    
    // 返回难度选择界面
    elements.difficultySelector.style.display = 'block';
    elements.gameArea.style.display = 'none';
    elements.questionText.textContent = '请选择难度开始游戏';
}

// 随机排序数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}