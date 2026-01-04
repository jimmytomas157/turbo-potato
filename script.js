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

// 双人游戏状态对象
const doubleGameState = {
    players: {
        player1: {
            character: null,
            score: 0,
            currentQuestionIndex: 0,
            progress: 0,
            timeRemaining: 10,
            timerInterval: null,
            currentProblem: null,
            correctAnswer: '',
            input: '',
            firstInput: '',
            secondInput: '',
            difficulty: 'easy',
            questionBank: [],
            answerSubmitted: false
        },
        player2: {
            character: null,
            score: 0,
            currentQuestionIndex: 0,
            progress: 0,
            timeRemaining: 10,
            timerInterval: null,
            currentProblem: null,
            correctAnswer: '',
            input: '',
            firstInput: '',
            secondInput: '',
            difficulty: 'easy',
            questionBank: [],
            answerSubmitted: false
        }
    },
    sharedQuestionBank: [],
    isGameActive: false
};

// 角色配置
const characterConfig = {
    monkey: { emoji: '🐵', name: '猴子' },
    rabbit: { emoji: '🐰', name: '兔子' },
    panda: { emoji: '🐼', name: '熊猫' },
    tiger: { emoji: '🐯', name: '老虎' },
    elephant: { emoji: '🐘', name: '大象' }
};

// DOM元素对象
const elements = {};

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 初始化DOM元素
    initializeElements();
    
    // 初始化音频
    setupAudioSources();
    
    // 添加事件监听器
    addEventListeners();
});

// 初始化DOM元素
function initializeElements() {
    // 单人模式元素
    elements.difficultyBtns = document.querySelectorAll('.difficulty-btn');
    elements.singlePlayerArea = document.querySelector('.game-area.single-player');
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
    elements.inputArea = document.querySelector('.input-area');
    elements.numBtns = document.querySelectorAll('.num-btn');
    elements.submitBtn = document.querySelector('.submit-btn');
    elements.deleteBtn = document.querySelector('.delete-btn');
    elements.optionsContainer = document.querySelector('.options');
    
    // 模式选择元素
    elements.modeBtns = document.querySelectorAll('.mode-btn');
    elements.characterSelection = document.querySelector('.character-selection');
    elements.startDoubleGameBtn = document.querySelector('.start-double-game-btn');
    elements.restartDoubleBtn = document.getElementById('restart-double-btn');
    elements.doublePlayerArea = document.querySelector('.game-area.double-player');
    
    // 角色选择元素
    elements.player1Characters = document.querySelectorAll('.player-selection.player1 .character');
    elements.player2Characters = document.querySelectorAll('.player-selection.player2 .character');
    elements.selectedCharacter1 = document.getElementById('player1-character');
    elements.selectedCharacter2 = document.getElementById('player2-character');
    
    // 音频元素
    elements.correctSound = document.getElementById('correct-sound');
    elements.wrongSound = document.getElementById('wrong-sound');
}

// 添加事件监听器
function addEventListeners() {
    // 难度选择按钮事件
    elements.difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const level = btn.getAttribute('data-level');
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
    
    // 模式选择按钮事件
    elements.modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-mode');
            selectGameMode(mode);
        });
    });
    
    // 数字键盘事件
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
    
    // 角色选择事件
    elements.player1Characters.forEach(character => {
        character.addEventListener('click', (event) => {
            selectCharacter(1, character.getAttribute('data-character'), event);
        });
    });
    
    elements.player2Characters.forEach(character => {
        character.addEventListener('click', (event) => {
            selectCharacter(2, character.getAttribute('data-character'), event);
        });
    });
    
    // 开始双人游戏按钮事件
    elements.startDoubleGameBtn.addEventListener('click', startDoubleGame);
    
    // 重新开始双人游戏按钮事件
    elements.restartDoubleBtn.addEventListener('click', restartDoubleGame);
}

// 游戏模式选择
function selectGameMode(mode) {
    if (mode === 'double') {
        // 切换到双人模式
        elements.difficultySelector.style.display = 'none';
        elements.characterSelection.style.display = 'block';
        elements.singlePlayerArea.style.display = 'none';
        elements.doublePlayerArea.style.display = 'none';
    } else {
        // 切换到单人模式
        elements.difficultySelector.style.display = 'block';
        elements.characterSelection.style.display = 'none';
        elements.singlePlayerArea.style.display = 'none';
        elements.doublePlayerArea.style.display = 'none';
    }
}

// 开始游戏
function startGame() {
    // 重置游戏状态
    resetGameState();
    
    // 更新显示
    updateScore();
    updateQuestionCount();
    
    // 切换界面
    elements.difficultySelector.style.display = 'none';
    elements.singlePlayerArea.style.display = 'block';
    
    // 生成第一题
    generateQuestion();
}

// 重置游戏状态
function resetGameState() {
    gameState.score = 0;
    gameState.currentQuestion = 0;
    gameState.currentProblem = null;
    gameState.correctAnswer = '';
    gameState.firstInput = '';
    gameState.secondInput = '';
    gameState.currentInputPosition = 1;
    gameState.simpleLevelTargetResult = 0;
    gameState.hardLevelInput = '';
    resetTimer();
    clearFeedback();
}

// 生成题目
function generateQuestion() {
    clearFeedback();
    
    // 增加题目计数
    gameState.currentQuestion++;
    updateQuestionCount();
    
    let question, options, correctAnswer;
    
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
    }
    
    gameState.currentProblem = question;
    gameState.correctAnswer = correctAnswer;
    
    // 更新题目显示
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
    // 移除固定id，避免多个玩家时id冲突
    const question = `(<span class="input-placeholder"></span>) × (<span class="input-placeholder"></span>) = ${correctResult}`;
    
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
    // 移除固定id，避免多个玩家时id冲突
    const question = `(<span class="input-placeholder"></span>) × ${factor} ≤ ${target}，最大能填几？`;
    
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
        playSound('correct');
    } else {
        showFeedback(`回答错误！正确答案是 ${gameState.correctAnswer}`, 'wrong');
        playSound('wrong');
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
    if (gameState.timeRemaining <= 5) {
        elements.timerContainer.classList.add('danger');
    } else if (gameState.timeRemaining <= 10) {
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
            const targetResult = gameState.simpleLevelTargetResult;
            
            const allPossibleAnswers = [];
            for (let i = 1; i <= 9; i++) {
                if (targetResult % i === 0) {
                    const j = targetResult / i;
                    if (j >= 1 && j <= 9 && i <= j) {
                        allPossibleAnswers.push(`${i} × ${j}`);
                    }
                }
            }
            
            showFeedback(`时间到！正确答案可以是：${allPossibleAnswers.join(' 或 ')}`, 'wrong');
        } else {
            // 困难级
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
            if (gameState.difficulty === 'easy') {
                elements.optionBtns.forEach(btn => {
                    btn.disabled = false;
                    btn.className = 'option-btn';
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
    
    // 隐藏选项按钮和输入区域
    elements.optionsContainer.style.display = 'none';
    elements.inputArea.style.display = 'none';
    
    // 显示重新开始按钮
    elements.restartBtn.style.display = 'block';
}

// 重新开始游戏
function restartGame() {
    // 重置游戏状态
    resetGameState();
    
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
    elements.singlePlayerArea.style.display = 'none';
    
    // 重置题目显示
    elements.questionText.textContent = '请选择难度开始游戏';
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
    const inputElements = document.querySelectorAll('.input-placeholder');
    
    if (inputElements.length >= 2) {
        // 简单级：两个输入框
        inputElements[0].textContent = gameState.firstInput || '';
        inputElements[1].textContent = gameState.secondInput || '';
    }
}

// 更新困难级输入显示
function updateHardLevelInputDisplay() {
    // 获取输入占位符元素（每次更新前重新获取，确保最新）
    const inputElements = document.querySelectorAll('.input-placeholder');
    
    if (inputElements.length >= 1) {
        // 困难级：一个输入框
        inputElements[0].textContent = gameState.hardLevelInput || '';
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
                playSound('correct');
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
                playSound('wrong');
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
            playSound('correct');
        } else {
            showFeedback(`回答错误！正确答案是 ${gameState.correctAnswer}`, 'wrong');
            playSound('wrong');
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

// 角色选择函数
function selectCharacter(playerNumber, character, event) {
    const player = `player${playerNumber}`;
    const playerCharacters = playerNumber === 1 ? elements.player1Characters : elements.player2Characters;
    const selectedCharacterElement = playerNumber === 1 ? elements.selectedCharacter1 : elements.selectedCharacter2;
    
    // 更新游戏状态
    doubleGameState.players[player].character = character;
    
    // 更新UI显示
    playerCharacters.forEach(char => {
        char.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // 更新选中角色显示
    const characterInfo = characterConfig[character];
    selectedCharacterElement.innerHTML = `${characterInfo.emoji} ${characterInfo.name}`;
    
    // 检查是否两个玩家都已选择角色
    if (doubleGameState.players.player1.character && doubleGameState.players.player2.character) {
        elements.startDoubleGameBtn.disabled = false;
    } else {
        elements.startDoubleGameBtn.disabled = true;
    }
}

// 开始双人游戏
function startDoubleGame() {
    // 生成共享题库
    generateSharedQuestionBank();
    
    // 为两个玩家创建独立的题目列表
    doubleGameState.players.player1.questionBank = [...doubleGameState.sharedQuestionBank];
    doubleGameState.players.player2.questionBank = [...doubleGameState.sharedQuestionBank];
    
    // 打乱两个玩家的题目顺序
    shuffleArray(doubleGameState.players.player1.questionBank);
    shuffleArray(doubleGameState.players.player2.questionBank);
    
    // 重置玩家状态
    resetDoublePlayerState(1);
    resetDoublePlayerState(2);
    
    // 切换界面
    elements.characterSelection.style.display = 'none';
    elements.doublePlayerArea.style.display = 'block';
    
    // 更新UI
    updateDoubleGameUI();
    
    // 重置角色位置
    updatePlayerProgress(1);
    updatePlayerProgress(2);
    
    // 开始游戏
    startPlayerQuestion(1);
    startPlayerQuestion(2);
}

// 重置双人玩家状态
function resetDoublePlayerState(playerNumber) {
    const player = doubleGameState.players[`player${playerNumber}`];
    player.score = 0;
    player.currentQuestionIndex = 0;
    player.progress = 0;
    player.timeRemaining = 10;
    player.timerInterval = null;
    player.currentProblem = null;
    player.correctAnswer = '';
    player.input = '';
    player.firstInput = '';
    player.secondInput = '';
    player.answerSubmitted = false;
}

// 生成共享题库
function generateSharedQuestionBank() {
    doubleGameState.sharedQuestionBank = [];
    
    // 生成10道题
    for (let i = 0; i < 10; i++) {
        // 随机选择难度
        const difficulty = ['easy', 'simple', 'hard'][Math.floor(Math.random() * 3)];
        let question, options, correctAnswer;
        
        switch (difficulty) {
            case 'easy':
                ({ question, options, correctAnswer } = generateEasyQuestion());
                break;
            case 'simple':
                ({ question, options, correctAnswer } = generateSimpleQuestion());
                break;
            case 'hard':
                ({ question, options, correctAnswer } = generateHardQuestion());
                break;
        }
        
        doubleGameState.sharedQuestionBank.push({
            question,
            options,
            correctAnswer,
            difficulty
        });
    }
}

// 开始单个玩家的题目
function startPlayerQuestion(playerNumber) {
    const player = doubleGameState.players[`player${playerNumber}`];
    
    // 检查玩家是否已经达到胜利条件
    if (player.progress >= 10) {
        endDoubleGame(playerNumber);
        return;
    }
    
    // 检查玩家是否还有题目
    if (player.currentQuestionIndex >= player.questionBank.length) {
        // 玩家已完成所有题目
        return;
    }
    
    // 获取当前题目
    const currentQuestion = player.questionBank[player.currentQuestionIndex];
    
    // 更新玩家状态
    player.currentProblem = currentQuestion.question;
    player.correctAnswer = currentQuestion.correctAnswer;
    player.difficulty = currentQuestion.difficulty;
    player.input = '';
    player.firstInput = '';
    player.secondInput = '';
    player.answerSubmitted = false;
    
    // 更新UI
    updatePlayerQuestionUI(playerNumber, currentQuestion);
    
    // 启动计时器
    startDoublePlayerTimer(playerNumber);
    
    // 递增题目索引
    player.currentQuestionIndex++;
}

// 更新玩家题目UI
function updatePlayerQuestionUI(playerNumber, questionInfo) {
    const playerElementPrefix = `p${playerNumber}`;
    
    // 更新题目显示
    const questionTextElement = document.getElementById(`${playerElementPrefix}-question-text`);
    questionTextElement.innerHTML = questionInfo.question;
    
    // 更新反馈
    const feedbackElement = document.getElementById(`${playerElementPrefix}-feedback`);
    feedbackElement.textContent = '';
    feedbackElement.className = 'player-feedback';
    
    // 根据难度显示不同的输入区域
    const optionsContainer = document.querySelector(`.player-area.player${playerNumber} .player-options`);
    const inputArea = document.querySelector(`.player-area.player${playerNumber} .player-input-area`);
    
    if (questionInfo.difficulty === 'easy') {
        // 容易级：显示选项按钮
        optionsContainer.style.display = 'grid';
        inputArea.style.display = 'none';
        
        // 更新选项
        const optionBtns = [
            document.getElementById(`${playerElementPrefix}-option-1`),
            document.getElementById(`${playerElementPrefix}-option-2`),
            document.getElementById(`${playerElementPrefix}-option-3`),
            document.getElementById(`${playerElementPrefix}-option-4`)
        ];
        
        optionBtns.forEach((btn, index) => {
            btn.textContent = questionInfo.options[index];
            btn.className = 'option-btn';
            btn.disabled = false;
            
            // 添加点击事件
            btn.onclick = () => {
                checkDoublePlayerAnswer(playerNumber, btn.textContent);
            };
        });
    } else {
        // 简单级或困难级：显示输入区域
        optionsContainer.style.display = 'none';
        inputArea.style.display = 'block';
        
        // 为输入区域的数字键盘添加事件监听器
        const numBtns = inputArea.querySelectorAll('.num-btn');
        const submitBtn = inputArea.querySelector('.submit-btn');
        const deleteBtn = inputArea.querySelector('.delete-btn');
        
        // 根据难度决定是否显示提交按钮
        if (questionInfo.difficulty === 'simple') {
            // 简单级：显示提交按钮
            submitBtn.style.display = 'block';
        } else {
            // 困难级：隐藏提交按钮
            submitBtn.style.display = 'none';
        }
        
        // 使用onclick属性绑定事件，确保只有一个事件监听器被绑定
        // 添加数字按钮事件监听器
        numBtns.forEach(btn => {
            btn.onclick = () => {
                const value = btn.getAttribute('data-value');
                if (value) {
                    handleDoublePlayerNumberInput(playerNumber, value);
                }
            };
        });
        
        // 添加提交按钮事件监听器
        submitBtn.onclick = () => {
            handleDoublePlayerSubmit(playerNumber);
        };
        
        // 添加删除按钮事件监听器
        deleteBtn.onclick = () => {
            handleDoublePlayerDelete(playerNumber);
        };
        
        // 更新输入显示
        updateDoublePlayerInputDisplay(playerNumber);
    }
}

// 检查双人玩家答案
function checkDoublePlayerAnswer(playerNumber, answer) {
    const player = doubleGameState.players[`player${playerNumber}`];
    const playerElementPrefix = `p${playerNumber}`;
    
    // 停止计时器
    stopDoublePlayerTimer(playerNumber);
    
    let isCorrect = false;
    
    // 检查答案是否正确
    // 对于简单级题目，需要考虑乘法交换律和所有可能的乘法组合
    if (player.difficulty === 'simple') {
        // 统一乘法符号格式（处理用户输入的*和系统生成的×）
        const normalizedUserAnswer = answer.replace(/\*/g, ' × ');
        
        // 将用户答案分解为两个数字
        const userAnswerParts = normalizedUserAnswer.split(' × ').map(Number);
        
        // 检查是否是有效的数字对
        if (userAnswerParts.length === 2) {
            // 计算用户答案的结果
            const userResult = userAnswerParts[0] * userAnswerParts[1];
            
            // 获取目标结果
            // 从题目文本中提取目标结果
            const questionText = player.currentProblem;
            const targetResultMatch = questionText.match(/=\s*(\d+)/);
            
            if (targetResultMatch) {
                const targetResult = parseInt(targetResultMatch[1]);
                
                // 检查用户答案的结果是否等于目标结果
                // 并且两个数字都在1-9之间（乘法口诀范围）
                isCorrect = (userResult === targetResult) && 
                           (userAnswerParts[0] >= 1 && userAnswerParts[0] <= 9) &&
                           (userAnswerParts[1] >= 1 && userAnswerParts[1] <= 9);
            }
        }
    } else {
        // 其他难度直接比较字符串
        isCorrect = (answer === player.correctAnswer);
    }
    
    if (isCorrect) {
        player.score++;
        player.progress++;
        
        // 更新UI
        const feedbackElement = document.getElementById(`${playerElementPrefix}-feedback`);
        feedbackElement.textContent = '回答正确！';
        feedbackElement.className = 'player-feedback correct';
        
        // 更新进度
        updatePlayerProgress(playerNumber);
        
        // 播放动画和音效
        playCharacterAnimation(playerNumber, 'jump');
        playSound('correct');
        
        // 检查是否达到胜利条件
        if (player.progress >= 10) {
            endDoubleGame(playerNumber);
            return;
        }
    } else {
        // 更新UI
        const feedbackElement = document.getElementById(`${playerElementPrefix}-feedback`);
        feedbackElement.textContent = `回答错误！正确答案是 ${player.correctAnswer}`;
        feedbackElement.className = 'player-feedback wrong';
        
        // 播放动画和音效
        playCharacterAnimation(playerNumber, 'slip');
        playSound('wrong');
    }
    
    // 更新得分显示
    updateDoubleGameUI();
    
    // 延迟后开始下一题
    setTimeout(() => {
        startPlayerQuestion(playerNumber);
    }, 1500);
}

// 双人游戏数字输入处理
function handleDoublePlayerNumberInput(playerNumber, value) {
    const player = doubleGameState.players[`player${playerNumber}`];
    
    // 直接检查输入占位符数量来判断输入类型，而不是依赖难度
    const playerElementPrefix = `p${playerNumber}`;
    const questionElement = document.getElementById(`${playerElementPrefix}-question-text`);
    const inputElements = questionElement.querySelectorAll('.input-placeholder');
    
    if (inputElements.length >= 2) {
        // 有两个输入占位符，应该是简单级乘法题
        if (!player.firstInput) {
            // 第一个括号为空，输入到第一个括号
            player.firstInput = value;
        } else if (!player.secondInput) {
            // 第二个括号为空，输入到第二个括号
            player.secondInput = value;
        }
    } else if (inputElements.length >= 1) {
        // 有一个输入占位符，应该是困难级题
        player.input = value;
        // 自动提交答案
        handleDoublePlayerSubmit(playerNumber);
    }
    
    // 更新输入显示
    updateDoublePlayerInputDisplay(playerNumber);
}

// 双人游戏删除处理
function handleDoublePlayerDelete(playerNumber) {
    const player = doubleGameState.players[`player${playerNumber}`];
    
    // 直接检查输入占位符数量来判断删除类型，而不是依赖难度
    const playerElementPrefix = `p${playerNumber}`;
    const questionElement = document.getElementById(`${playerElementPrefix}-question-text`);
    const inputElements = questionElement.querySelectorAll('.input-placeholder');
    
    if (inputElements.length >= 2) {
        // 有两个输入占位符，应该是简单级乘法题
        if (player.secondInput) {
            player.secondInput = '';
        } else if (player.firstInput) {
            player.firstInput = '';
        }
    } else if (inputElements.length >= 1) {
        // 有一个输入占位符，应该是困难级题
        player.input = '';
    }
    
    // 更新输入显示
    updateDoublePlayerInputDisplay(playerNumber);
}

// 双人游戏提交处理
function handleDoublePlayerSubmit(playerNumber) {
    const player = doubleGameState.players[`player${playerNumber}`];
    
    let answer = '';
    
    // 直接检查输入占位符数量来判断提交类型，而不是依赖难度
    const playerElementPrefix = `p${playerNumber}`;
    const questionElement = document.getElementById(`${playerElementPrefix}-question-text`);
    const inputElements = questionElement.querySelectorAll('.input-placeholder');
    
    if (inputElements.length >= 2) {
        // 有两个输入占位符，应该是简单级乘法题
        if (!player.firstInput || !player.secondInput) {
            const feedbackElement = document.getElementById(`p${playerNumber}-feedback`);
            feedbackElement.textContent = '请将两个括号都填写完整！';
            feedbackElement.className = 'player-feedback wrong';
            return;
        }
        
        answer = `${player.firstInput} × ${player.secondInput}`;
    } else if (inputElements.length >= 1) {
        // 有一个输入占位符，应该是困难级题
        if (!player.input) {
            const feedbackElement = document.getElementById(`p${playerNumber}-feedback`);
            feedbackElement.textContent = '请输入答案！';
            feedbackElement.className = 'player-feedback wrong';
            return;
        }
        
        answer = player.input;
    }
    
    checkDoublePlayerAnswer(playerNumber, answer);
}

// 更新双人游戏输入显示
function updateDoublePlayerInputDisplay(playerNumber) {
    const player = doubleGameState.players[`player${playerNumber}`];
    const playerElementPrefix = `p${playerNumber}`;
    
    // 获取当前玩家的题目文本元素
    const questionElement = document.getElementById(`${playerElementPrefix}-question-text`);
    if (!questionElement) return;
    
    // 获取当前玩家题目文本元素内的输入占位符元素
    const inputElements = questionElement.querySelectorAll('.input-placeholder');
    
    // 修复：不管难度如何，只要有输入占位符就显示输入
    // 简单级：两个输入框
    if (inputElements.length >= 2) {
        inputElements[0].textContent = player.firstInput || '';
        inputElements[1].textContent = player.secondInput || '';
    } 
    // 困难级：一个输入框
    else if (inputElements.length >= 1) {
        inputElements[0].textContent = player.input || '';
    }
}

// 启动双人玩家计时器
function startDoublePlayerTimer(playerNumber) {
    const player = doubleGameState.players[`player${playerNumber}`];
    const playerElementPrefix = `p${playerNumber}`;
    
    // 停止可能存在的计时器
    stopDoublePlayerTimer(playerNumber);
    
    // 重置时间
    player.timeRemaining = 10;
    
    // 更新显示
    document.getElementById(`${playerElementPrefix}-timer`).textContent = player.timeRemaining;
    
    // 启动计时器
    player.timerInterval = setInterval(() => {
        player.timeRemaining--;
        document.getElementById(`${playerElementPrefix}-timer`).textContent = player.timeRemaining;
        
        // 时间到，自动判定为错误
        if (player.timeRemaining <= 0) {
            handleDoublePlayerTimeUp(playerNumber);
        }
    }, 1000);
}

// 停止双人玩家计时器
function stopDoublePlayerTimer(playerNumber) {
    const player = doubleGameState.players[`player${playerNumber}`];
    
    if (player.timerInterval) {
        clearInterval(player.timerInterval);
        player.timerInterval = null;
    }
}

// 处理双人玩家时间到
function handleDoublePlayerTimeUp(playerNumber) {
    const player = doubleGameState.players[`player${playerNumber}`];
    const playerElementPrefix = `p${playerNumber}`;
    
    // 停止计时器
    stopDoublePlayerTimer(playerNumber);
    
    // 更新UI
    const feedbackElement = document.getElementById(`${playerElementPrefix}-feedback`);
    feedbackElement.textContent = `时间到！正确答案是 ${player.correctAnswer}`;
    feedbackElement.className = 'player-feedback wrong';
    
    // 播放动画和音效
    playCharacterAnimation(playerNumber, 'slip');
    playSound('wrong');
    
    // 延迟后开始下一题
    setTimeout(() => {
        startPlayerQuestion(playerNumber);
    }, 1500);
}

// 更新双人游戏UI
function updateDoubleGameUI() {
    // 更新玩家1信息
    document.getElementById('p1-score').textContent = doubleGameState.players.player1.score;
    document.getElementById('p1-character').textContent = characterConfig[doubleGameState.players.player1.character].emoji;
    
    // 更新玩家2信息
    document.getElementById('p2-score').textContent = doubleGameState.players.player2.score;
    document.getElementById('p2-character').textContent = characterConfig[doubleGameState.players.player2.character].emoji;
    
    // 更新角色位置显示
    document.getElementById('p1-position').textContent = characterConfig[doubleGameState.players.player1.character].emoji;
    document.getElementById('p2-position').textContent = characterConfig[doubleGameState.players.player2.character].emoji;
}

// 更新玩家进度
function updatePlayerProgress(playerNumber) {
    const player = doubleGameState.players[`player${playerNumber}`];
    const positionElement = document.getElementById(`p${playerNumber}-position`);
    
    // 计算新的位置
    const newPosition = 450 - (player.progress * 50);
    
    // 更新位置
    positionElement.style.top = `${newPosition}px`;
}

// 播放角色动画
function playCharacterAnimation(playerNumber, animationType) {
    const positionElement = document.getElementById(`p${playerNumber}-position`);
    const character = doubleGameState.players[`player${playerNumber}`].character;
    
    if (!positionElement) return;
    
    // 先移除所有动画类
    positionElement.classList.remove('jump', 'slip', 'monkey', 'rabbit', 'panda', 'tiger', 'elephant', 
        'monkeyJump', 'rabbitJump', 'pandaJump', 'tigerJump', 'elephantJump');
    
    // 添加角色特定的动画类
    if (animationType === 'jump' && character) {
        positionElement.classList.add(character, 'jump', `${character}Jump`);
    } else {
        positionElement.classList.add('slip');
    }
    
    // 动画结束后移除类
    setTimeout(() => {
        positionElement.classList.remove('jump', 'slip', 'monkey', 'rabbit', 'panda', 'tiger', 'elephant', 
            'monkeyJump', 'rabbitJump', 'pandaJump', 'tigerJump', 'elephantJump');
    }, 800);
}

// 结束双人游戏
function endDoubleGame(winnerNumber) {
    // 停止所有计时器
    stopDoublePlayerTimer(1);
    stopDoublePlayerTimer(2);
    
    // 确定获胜者和失败者
    let winner, loser;
    if (winnerNumber) {
        winner = winnerNumber;
        loser = winnerNumber === 1 ? 2 : 1;
    } else {
        // 比较得分
        const player1Score = doubleGameState.players.player1.score;
        const player2Score = doubleGameState.players.player2.score;
        
        if (player1Score > player2Score) {
            winner = 1;
            loser = 2;
        } else if (player2Score > player1Score) {
            winner = 2;
            loser = 1;
        } else {
            // 平局情况
            winner = null;
            loser = null;
        }
    }
    
    // 隐藏选项和输入区域
    document.querySelector('.player-area.player1 .player-options').style.display = 'none';
    document.querySelector('.player-area.player1 .player-input-area').style.display = 'none';
    document.querySelector('.player-area.player2 .player-options').style.display = 'none';
    document.querySelector('.player-area.player2 .player-input-area').style.display = 'none';
    
    // 为每个玩家显示结果
    [1, 2].forEach(playerNum => {
        const playerArea = document.querySelector(`.player-area.player${playerNum}`);
        const questionTextElement = document.getElementById(`p${playerNum}-question-text`);
        const character = doubleGameState.players[`player${playerNum}`].character;
        const characterEmoji = characterConfig[character]?.emoji || '❓';
        
        // 清空题目文本
        questionTextElement.innerHTML = '';
        
        // 创建结果容器
        const resultContainer = document.createElement('div');
        resultContainer.style.textAlign = 'center';
        resultContainer.style.marginTop = '20px';
        
        // 添加大头像
        const avatar = document.createElement('div');
        avatar.textContent = characterEmoji;
        avatar.style.fontSize = '80px';
        avatar.style.marginBottom = '10px';
        
        // 为获胜者添加winner文字和撒花效果，为失败者添加流泪效果
        if (winner === playerNum) {
            // 获胜者
            avatar.style.animation = 'bounce 1s infinite alternate';
            
            const winnerText = document.createElement('div');
            winnerText.textContent = 'WINNER!';
            winnerText.style.fontSize = '36px';
            winnerText.style.fontWeight = 'bold';
            winnerText.style.color = '#FFD700';
            winnerText.style.marginBottom = '10px';
            
            resultContainer.appendChild(avatar);
            resultContainer.appendChild(winnerText);
            
            // 添加撒花效果
            createConfetti(playerArea);
        } else if (loser === playerNum) {
            // 失败者
            const loserAvatar = document.createElement('div');
            loserAvatar.innerHTML = `${characterEmoji}<span style="font-size: 20px; vertical-align: top; margin-left: -20px;">😢</span>`;
            loserAvatar.style.fontSize = '80px';
            loserAvatar.style.marginBottom = '10px';
            resultContainer.appendChild(loserAvatar);
        } else {
            // 平局
            avatar.style.fontSize = '60px';
            const drawText = document.createElement('div');
            drawText.textContent = '平局';
            drawText.style.fontSize = '24px';
            drawText.style.color = '#666';
            
            resultContainer.appendChild(avatar);
            resultContainer.appendChild(drawText);
        }
        
        // 添加得分显示
        const score = doubleGameState.players[`player${playerNum}`].score;
        const scoreText = document.createElement('div');
        scoreText.textContent = `得分: ${score}`;
        scoreText.style.fontSize = '20px';
        scoreText.style.color = '#333';
        resultContainer.appendChild(scoreText);
        
        questionTextElement.appendChild(resultContainer);
    });
    
    // 显示重新开始按钮
    document.getElementById('restart-double-btn').style.display = 'block';
}

// 创建撒花效果
function createConfetti(container) {
    // 添加CSS动画样式（如果还没有的话）
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes bounce {
                from { transform: translateY(0px); }
                to { transform: translateY(-10px); }
            }
            
            @keyframes confetti-fall {
                0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
            
            .confetti {
                position: absolute;
                width: 10px;
                height: 10px;
                background-color: #f00;
                opacity: 0;
                animation: confetti-fall 3s ease-in infinite;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 创建100个彩色纸屑
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // 随机颜色
        const colors = ['#FFD700', '#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#FFFF00', '#00FFFF'];
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // 随机大小
        const size = Math.random() * 10 + 5;
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        
        // 随机位置
        confetti.style.left = `${Math.random() * 100}%`;
        
        // 随机动画延迟和持续时间
        confetti.style.animationDelay = `${Math.random() * 2}s`;
        confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
        
        // 添加到容器
        container.appendChild(confetti);
        
        // 3秒后移除
        setTimeout(() => confetti.remove(), 5000);
    }
}

// 重新开始双人游戏
function restartDoubleGame() {
    // 切换到角色选择界面
    elements.characterSelection.style.display = 'block';
    elements.doublePlayerArea.style.display = 'none';
    
    // 重置角色选择
    elements.player1Characters.forEach(char => {
        char.classList.remove('selected');
    });
    elements.player2Characters.forEach(char => {
        char.classList.remove('selected');
    });
    
    elements.selectedCharacter1.textContent = '选择角色';
    elements.selectedCharacter2.textContent = '选择角色';
    
    // 禁用开始按钮
    elements.startDoubleGameBtn.disabled = true;
    
    // 隐藏重新开始按钮
    document.getElementById('restart-double-btn').style.display = 'none';
}

// 洗牌函数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 设置音频源
function setupAudioSources() {
    // 使用Web Audio API创建简单音效
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 初始化元素
    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');
    
    // 创建正确答案音效（上升音调）
    createAudioBuffer(audioContext, [
        { frequency: 523, duration: 0.1, volume: 0.3 },  // C5
        { frequency: 659, duration: 0.1, volume: 0.4 },  // E5
        { frequency: 784, duration: 0.2, volume: 0.5 }   // G5
    ], correctSound);
    
    // 创建错误答案音效（下降音调）
    createAudioBuffer(audioContext, [
        { frequency: 784, duration: 0.1, volume: 0.3 },  // G5
        { frequency: 659, duration: 0.1, volume: 0.3 },  // E5
        { frequency: 523, duration: 0.2, volume: 0.4 }   // C5
    ], wrongSound);
}

// 创建音频缓冲区
function createAudioBuffer(audioContext, notes, audioElement) {
    const sampleRate = audioContext.sampleRate;
    const totalDuration = notes.reduce((sum, note) => sum + note.duration, 0);
    const buffer = audioContext.createBuffer(1, sampleRate * totalDuration, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    let offset = 0;
    notes.forEach(note => {
        const { frequency, duration, volume } = note;
        const noteLength = Math.floor(sampleRate * duration);
        
        for (let i = 0; i < noteLength; i++) {
            const t = i / sampleRate;
            const amplitude = volume * Math.sin(2 * Math.PI * frequency * t);
            channelData[offset + i] = amplitude;
        }
        
        offset += noteLength;
    });
    
    // 创建可播放的音频URL
    const blob = audioBufferToBlob(buffer);
    const url = URL.createObjectURL(blob);
    audioElement.src = url;
}

// 将AudioBuffer转换为Blob
function audioBufferToBlob(buffer) {
    const sampleRate = buffer.sampleRate;
    const length = buffer.length;
    const data = buffer.getChannelData(0);
    
    // 转换为16位PCM格式
    const outputArray = new Int16Array(length);
    for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, data[i]));
        outputArray[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    
    // 创建WAV格式的Blob
    const wavHeader = createWavHeader(sampleRate, length);
    const wavData = new Uint8Array(wavHeader.byteLength + outputArray.byteLength);
    wavData.set(new Uint8Array(wavHeader), 0);
    wavData.set(new Uint8Array(outputArray.buffer), wavHeader.byteLength);
    
    return new Blob([wavData], { type: 'audio/wav' });
}

// 创建WAV文件头
function createWavHeader(sampleRate, length) {
    const arrayBuffer = new ArrayBuffer(44);
    const dataView = new DataView(arrayBuffer);
    
    // RIFF标识符
    dataView.setUint32(0, 0x52494646, false);
    // 文件大小 - 8
    dataView.setUint32(4, 36 + length * 2, true);
    // WAVE标识符
    dataView.setUint32(8, 0x57415645, false);
    // fmt标识符
    dataView.setUint32(12, 0x666D7420, false);
    // fmt块大小
    dataView.setUint32(16, 16, true);
    // 音频格式 (1 = PCM)
    dataView.setUint16(20, 1, true);
    // 声道数
    dataView.setUint16(22, 1, true);
    // 采样率
    dataView.setUint32(24, sampleRate, true);
    // 字节率 (采样率 * 声道数 * 每个样本的字节数)
    dataView.setUint32(28, sampleRate * 2, true);
    // 块对齐 (声道数 * 每个样本的字节数)
    dataView.setUint16(32, 2, true);
    // 每个样本的位数
    dataView.setUint16(34, 16, true);
    // data标识符
    dataView.setUint32(36, 0x64617461, false);
    // 数据大小
    dataView.setUint32(40, length * 2, true);
    
    return arrayBuffer;
}

// 播放音效
function playSound(soundType) {
    try {
        const audioElement = soundType === 'correct' ? document.getElementById('correct-sound') : document.getElementById('wrong-sound');
        audioElement.currentTime = 0;
        audioElement.play();
    } catch (error) {
        console.log('播放音效失败:', error);
    }
}