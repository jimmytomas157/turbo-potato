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
    timeLimit: 10, // 每个题目的时间限制（秒）
    // 简单级输入相关
    firstInput: '', // 第一个括号中的数字
    secondInput: '', // 第二个括号中的数字
    currentInputPosition: 1, // 当前输入位置，1表示第一个括号，2表示第二个括号
    // 简单级目标结果
    simpleLevelTargetResult: 0,
    // 困难级输入相关
    hardLevelInput: '' // 困难级用户输入的数字
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
    
    // 初始化简单级输入区域元素
    elements.inputArea = document.querySelector('.input-area');
    elements.numBtns = document.querySelectorAll('.num-btn');
    elements.submitBtn = document.querySelector('.submit-btn');
    elements.deleteBtn = document.querySelector('.delete-btn');
    elements.optionsContainer = document.querySelector('.options');
    // 输入占位符元素（将在生成题目后获取）
    elements.firstInput = null;
    elements.secondInput = null;
    
    // 数字键盘按钮事件
    elements.numBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const value = btn.getAttribute('data-value');
            if (value) {
                handleNumberInput(value);
            }
        });
    });
    
    // 提交按钮事件
    elements.submitBtn.addEventListener('click', handleSubmit);
    
    // 删除按钮事件
    elements.deleteBtn.addEventListener('click', handleDelete);
    
    // 全局变量：当前输入内容
    let currentInput = '';
    
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
    // 使用innerHTML以便渲染括号中的HTML占位符
    elements.questionText.innerHTML = question;
    
    // 根据难度显示或隐藏选项和输入区域
    if (gameState.difficulty === 'simple' || gameState.difficulty === 'hard') {
            // 简单级和困难级：隐藏选项，显示输入区域
            elements.optionsContainer.style.display = 'none';
            elements.inputArea.style.display = 'block';
            
            if (gameState.difficulty === 'simple') {
                // 简单级：重置输入
                gameState.firstInput = '';
                gameState.secondInput = '';
                gameState.currentInputPosition = 1;
                updateInputDisplay();
            } else {
                // 困难级：重置输入
                gameState.hardLevelInput = '';
                // 更新困难级输入显示
                updateHardLevelInputDisplay();
            }
        } else {
        // 容易级：显示选项，隐藏输入区域
        elements.optionsContainer.style.display = 'block';
        elements.inputArea.style.display = 'none';
        
        // 更新选项显示
        options.forEach((option, index) => {
            elements.optionBtns[index].textContent = option;
            elements.optionBtns[index].className = 'option-btn';
            elements.optionBtns[index].disabled = false;
        });
    }
    
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

// 生成简单级题目（出结果，让学生输入算式）
function generateSimpleQuestion() {
    // 生成两个1-9之间的随机数（乘法口诀范围）
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const correctResult = a * b;
    
    // 生成题目，格式为"( ) × ( ) = 得数"，使用占位符标记输入位置
    const question = `(<span class="input-placeholder" id="input-first"></span>) × (<span class="input-placeholder" id="input-second"></span>) = ${correctResult}`;
    
    // 生成正确算式
    const correctOption = `${a} × ${b}`;
    
    // 将正确结果存储在游戏状态中，以便验证时使用
    gameState.simpleLevelTargetResult = correctResult;
    
    // 简单级现在不生成选项，只返回题目和正确答案
    return { question, options: [], correctAnswer: correctOption };
}

// 生成困难级题目（给出一个随机得数以及一个因数，让学生选最大能填几）
function generateHardQuestion() {
    // 生成一个1-9之间的因数（乘法口诀范围）
    const factor = Math.floor(Math.random() * 9) + 1;
    // 生成一个随机得数，范围是1到因数×9之间（确保学生需要填写的数在0-9之间）
    const target = Math.floor(Math.random() * (factor * 9)) + 1;
    
    // 计算最大能填的数（结果在0-9之间，符合乘法口诀范围）
    const correct = Math.floor(target / factor);
    
    // 生成题目，使用占位符标记输入位置
    const question = `(<span class="input-placeholder" id="input-hard"></span>) × ${factor} ≤ ${target}，最大能填几？`;
    
    // 困难级现在不生成选项，只返回题目和正确答案
    return { question, options: [], correctAnswer: correct.toString() };
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
    
    // 不同难度模式的处理
    if (gameState.difficulty === 'simple' || gameState.difficulty === 'hard') {
        // 简单级或困难级（输入模式）
        if (gameState.difficulty === 'simple') {
            // 简单级
            // 使用直接存储在游戏状态中的目标结果，这更可靠
            const targetResult = gameState.simpleLevelTargetResult;
            
            const allPossibleAnswers = [];
            for (let i = 1; i <= 9; i++) {
                if (targetResult % i === 0) {
                    const j = targetResult / i;
                    if (j >= 1 && j <= 9 && i <= j) { // 只添加不重复的组合
                        allPossibleAnswers.push(`${i} × ${j}`);
                    }
                }
            }
            
            // 显示超时反馈
            showFeedback(`时间到！正确答案可以是：${allPossibleAnswers.join(' 或 ')}`, 'wrong');
        } else {
            // 困难级
            // 显示超时反馈
            showFeedback(`时间到！正确答案是 ${gameState.correctAnswer}`, 'wrong');
        }
    } else {
        // 容易级（选项按钮模式）
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
    }
    
    // 延迟后进入下一题或结束游戏
    setTimeout(() => {
        if (gameState.currentQuestion < gameState.totalQuestions) {
            generateQuestion();
            // 如果是选项按钮模式，启用按钮
            if (gameState.difficulty !== 'simple' && gameState.difficulty !== 'hard') {
                elements.optionBtns.forEach(btn => {
                    btn.disabled = false;
                });
            }
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
    gameState.firstInput = '';
    gameState.secondInput = '';
    gameState.currentInputPosition = 1;
    gameState.simpleLevelTargetResult = 0;
    gameState.hardLevelInput = '';
    
    // 重置倒计时
    resetTimer();
    
    // 重置UI
    updateScore();
    updateQuestionCount();
    clearFeedback();
    updateInputDisplay();
    
    // 重置输入区域显示
    elements.inputArea.style.display = 'none';
    
    // 显示选项按钮
    elements.optionBtns.forEach(btn => {
        btn.style.display = 'block';
        btn.disabled = false;
        btn.className = 'option-btn';
    });
    
    // 重置选项容器显示
    elements.optionsContainer.style.display = 'block';
    
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

// 处理数字输入
function handleNumberInput(value) {
    if (gameState.difficulty === 'simple') {
        // 简单级：根据当前输入位置将数字添加到相应的输入字段
        if (gameState.currentInputPosition === 1) {
            // 第一个括号只能输入一个数字
            if (!gameState.firstInput) {
                gameState.firstInput = value;
                // 输入完成后自动切换到第二个括号
                gameState.currentInputPosition = 2;
            }
        } else {
            // 第二个括号只能输入一个数字
            if (!gameState.secondInput) {
                gameState.secondInput = value;
                // 两个数字都输入完成后可以提交
            }
        }
        
        // 更新简单级显示
        updateInputDisplay();
    } else if (gameState.difficulty === 'hard') {
        // 困难级：只能输入一个数字（0-9）
        if (!gameState.hardLevelInput) {
            gameState.hardLevelInput = value;
        }
        
        // 更新困难级显示
        updateHardLevelInputDisplay();
    }
}

// 更新输入显示
function updateInputDisplay() {
    // 获取输入占位符元素（每次更新前重新获取，确保最新）
    const firstInputElement = document.getElementById('input-first');
    const secondInputElement = document.getElementById('input-second');
    
    if (firstInputElement && secondInputElement) {
        firstInputElement.textContent = gameState.firstInput;
        secondInputElement.textContent = gameState.secondInput;
    }
}

// 更新困难级输入显示
function updateHardLevelInputDisplay() {
    // 获取输入占位符元素（每次更新前重新获取，确保最新）
    const hardInputElement = document.getElementById('input-hard');
    
    if (hardInputElement) {
        hardInputElement.textContent = gameState.hardLevelInput;
    }
}

// 重置简单级输入
function resetSimpleLevelInput() {
    gameState.firstInput = '';
    gameState.secondInput = '';
    gameState.currentInputPosition = 1;
    updateInputDisplay();
}

// 处理删除功能
function handleDelete() {
    if (gameState.difficulty === 'simple') {
        // 简单级删除逻辑
        if (gameState.currentInputPosition === 2) {
            // 如果在第二个括号，先清空第二个括号
            if (gameState.secondInput) {
                gameState.secondInput = '';
            } else {
                // 第二个括号为空，切换到第一个括号
                gameState.currentInputPosition = 1;
                gameState.firstInput = '';
            }
        } else {
            // 如果在第一个括号，清空第一个括号
            gameState.firstInput = '';
        }
        
        // 更新简单级显示
        updateInputDisplay();
    } else if (gameState.difficulty === 'hard') {
        // 困难级删除逻辑
        gameState.hardLevelInput = '';
        
        // 更新困难级显示
        updateHardLevelInputDisplay();
    }
}

// 处理提交答案
function handleSubmit() {
    let isCorrect = false;
    
    if (gameState.difficulty === 'simple') {
        // 简单级验证
        // 检查两个括号是否都有输入
        if (!gameState.firstInput || !gameState.secondInput) {
            showFeedback('请将两个括号都填写完整！', 'wrong');
            return;
        }
        
        // 解析用户输入的因数
        const userFirst = parseInt(gameState.firstInput);
        const userSecond = parseInt(gameState.secondInput);
        
        // 使用直接存储在游戏状态中的目标结果，这更可靠
        const targetResult = gameState.simpleLevelTargetResult;
        
        // 检查条件：
        // 1. 用户输入的乘积等于目标结果
        // 2. 两个因数都在1-9之间（符合乘法口诀范围）
        if (userFirst * userSecond === targetResult && 
            userFirst >= 1 && userFirst <= 9 && 
            userSecond >= 1 && userSecond <= 9) {
            gameState.score++;
            isCorrect = true;
            showFeedback('回答正确！', 'correct');
            updateScore();
        } else {
            // 提示所有可能的正确答案
            const allPossibleAnswers = [];
            for (let i = 1; i <= 9; i++) {
                if (targetResult % i === 0) {
                    const j = targetResult / i;
                    if (j >= 1 && j <= 9 && i <= j) { // 只添加不重复的组合
                        allPossibleAnswers.push(`${i} × ${j}`);
                    }
                }
            }
            showFeedback(`回答错误！正确答案可以是：${allPossibleAnswers.join(' 或 ')}`, 'wrong');
        }
    } else if (gameState.difficulty === 'hard') {
        // 困难级验证
        // 检查是否有输入
        if (!gameState.hardLevelInput) {
            showFeedback('请输入答案！', 'wrong');
            return;
        }
        
        // 检查答案是否正确
        if (gameState.hardLevelInput === gameState.correctAnswer) {
            gameState.score++;
            isCorrect = true;
            showFeedback('回答正确！', 'correct');
            updateScore();
        } else {
            showFeedback(`回答错误！正确答案是 ${gameState.correctAnswer}`, 'wrong');
        }
    }
    
    // 停止倒计时
    stopTimer();
    
    // 延迟后进入下一题或结束游戏
    setTimeout(() => {
        if (gameState.currentQuestion < gameState.totalQuestions) {
            // 重置输入状态
            if (gameState.difficulty === 'simple') {
                resetSimpleLevelInput();
            } else if (gameState.difficulty === 'hard') {
                gameState.hardLevelInput = '';
            }
            generateQuestion();
        } else {
            endGame();
        }
    }, 1500);
}

