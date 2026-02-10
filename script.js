class Calculator {
    constructor() {
        this.displayMain = document.getElementById('displayMain');
        this.displaySecondary = document.getElementById('displaySecondary');
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.isScientificMode = false;
        this.angleMode = 'deg'; // 'deg' or 'rad'
        this.lastResult = null;
        this.history = [];
        
        this.init();
        this.loadHistory();
    }

    init() {
        // Mode switch
        const modeSwitch = document.getElementById('modeSwitch');
        const calculator = document.getElementById('calculator');
        const buttonsGrid = document.getElementById('buttonsGrid');

        modeSwitch.addEventListener('click', () => {
            modeSwitch.classList.toggle('scientific');
            calculator.classList.toggle('scientific-mode');
            buttonsGrid.classList.toggle('scientific-mode');
            this.isScientificMode = !this.isScientificMode;
        });

        // History toggle
        const historyToggle = document.getElementById('historyToggle');
        const historyPanel = document.getElementById('historyPanel');

        historyToggle.addEventListener('click', () => {
            historyToggle.classList.toggle('active');
            historyPanel.classList.toggle('active');
            calculator.classList.toggle('history-open');
        });

        // Clear history
        const clearHistory = document.getElementById('clearHistory');
        clearHistory.addEventListener('click', () => {
            this.clearHistory();
        });

        // Button clicks
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const value = e.target.textContent;

                switch(action) {
                    case 'number':
                        this.inputNumber(value);
                        break;
                    case 'decimal':
                        this.inputDecimal();
                        break;
                    case 'operator':
                        this.inputOperator(value);
                        break;
                    case 'equals':
                        this.calculate();
                        break;
                    case 'clear':
                        this.clear();
                        break;
                    case 'delete':
                        this.delete();
                        break;
                    case 'parenthesis':
                        this.inputParenthesis();
                        break;
                    case 'sin':
                    case 'cos':
                    case 'tan':
                        this.trigFunction(action);
                        break;
                    case 'ln':
                    case 'log':
                        this.logFunction(action);
                        break;
                    case 'sqrt':
                        this.squareRoot();
                        break;
                    case 'pow2':
                        this.power2();
                        break;
                    case 'pow':
                        this.inputOperator('^');
                        break;
                    case 'exp':
                        this.inputOperator('e^');
                        break;
                    case 'mod':
                        this.inputOperator('%');
                        break;
                    case 'pi':
                        this.inputConstant(Math.PI);
                        break;
                    case 'e':
                        this.inputConstant(Math.E);
                        break;
                    case 'rad':
                    case 'deg':
                        this.toggleAngleMode(action);
                        break;
                }
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9') {
                this.inputNumber(e.key);
            } else if (e.key === '.') {
                this.inputDecimal();
            } else if (e.key === '+' || e.key === '-') {
                this.inputOperator(e.key === '+' ? '+' : '−');
            } else if (e.key === '*') {
                this.inputOperator('×');
            } else if (e.key === '/') {
                this.inputOperator('÷');
            } else if (e.key === 'Enter' || e.key === '=') {
                this.calculate();
            } else if (e.key === 'Escape') {
                this.clear();
            } else if (e.key === 'Backspace') {
                this.delete();
            }
        });
    }

    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentValue = num;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        this.updateDisplay();
    }

    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }

    inputOperator(op) {
        const value = parseFloat(this.currentValue);

        if (this.previousValue === '') {
            this.previousValue = this.currentValue;
        } else if (this.operation) {
            const result = this.performCalculation();
            this.currentValue = String(result);
            this.previousValue = String(result);
        }

        this.waitingForOperand = true;
        this.operation = op;
        this.updateSecondaryDisplay();
    }

    inputParenthesis() {
        // Simple parenthesis handling - counts open/close
        const openCount = (this.currentValue.match(/\(/g) || []).length;
        const closeCount = (this.currentValue.match(/\)/g) || []).length;
        
        if (openCount === closeCount) {
            this.currentValue += '(';
        } else {
            this.currentValue += ')';
        }
        this.updateDisplay();
    }

    inputConstant(value) {
        if (this.waitingForOperand || this.currentValue === '0') {
            this.currentValue = String(value);
            this.waitingForOperand = false;
        } else {
            this.currentValue += String(value);
        }
        this.updateDisplay();
    }

    trigFunction(func) {
        let value = parseFloat(this.currentValue);
        const originalValue = this.currentValue;
        
        if (this.angleMode === 'deg') {
            value = value * (Math.PI / 180);
        }

        let result;
        let expression;
        switch(func) {
            case 'sin':
                result = Math.sin(value);
                expression = `sin(${originalValue})`;
                break;
            case 'cos':
                result = Math.cos(value);
                expression = `cos(${originalValue})`;
                break;
            case 'tan':
                result = Math.tan(value);
                expression = `tan(${originalValue})`;
                break;
        }

        result = this.roundResult(result);
        this.addToHistory(expression, result);
        this.currentValue = String(result);
        this.updateDisplay();
        this.waitingForOperand = true;
    }

    logFunction(func) {
        const value = parseFloat(this.currentValue);
        const originalValue = this.currentValue;
        let result;
        let expression;

        if (value <= 0) {
            this.showError();
            return;
        }

        switch(func) {
            case 'ln':
                result = Math.log(value);
                expression = `ln(${originalValue})`;
                break;
            case 'log':
                result = Math.log10(value);
                expression = `log(${originalValue})`;
                break;
        }

        result = this.roundResult(result);
        this.addToHistory(expression, result);
        this.currentValue = String(result);
        this.updateDisplay();
        this.waitingForOperand = true;
    }

    squareRoot() {
        const value = parseFloat(this.currentValue);
        const originalValue = this.currentValue;
        
        if (value < 0) {
            this.showError();
            return;
        }

        const result = this.roundResult(Math.sqrt(value));
        this.addToHistory(`√(${originalValue})`, result);
        this.currentValue = String(result);
        this.updateDisplay();
        this.waitingForOperand = true;
    }

    power2() {
        const value = parseFloat(this.currentValue);
        const originalValue = this.currentValue;
        const result = this.roundResult(Math.pow(value, 2));
        this.addToHistory(`(${originalValue})²`, result);
        this.currentValue = String(result);
        this.updateDisplay();
        this.waitingForOperand = true;
    }

    toggleAngleMode(mode) {
        this.angleMode = mode;
        const radBtn = document.querySelector('[data-action="rad"]');
        const degBtn = document.querySelector('[data-action="deg"]');
        
        if (mode === 'rad') {
            radBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            degBtn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
        } else {
            degBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            radBtn.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
        }
    }

    calculate() {
        if (this.operation && !this.waitingForOperand) {
            const expression = `${this.previousValue} ${this.operation} ${this.currentValue}`;
            const result = this.performCalculation();
            this.addToHistory(expression, result);
            this.currentValue = String(result);
            this.previousValue = '';
            this.operation = null;
            this.waitingForOperand = true;
            this.updateDisplay();
            this.displaySecondary.textContent = '';
        }
    }

    performCalculation() {
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;

        switch(this.operation) {
            case '+':
                result = prev + current;
                break;
            case '−':
                result = prev - current;
                break;
            case '×':
                result = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError();
                    return 0;
                }
                result = prev / current;
                break;
            case '^':
                result = Math.pow(prev, current);
                break;
            case '%':
                result = prev % current;
                break;
            case 'e^':
                result = Math.exp(current);
                break;
            default:
                return current;
        }

        return this.roundResult(result);
    }

    roundResult(num) {
        return Math.round(num * 100000000000) / 100000000000;
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.updateDisplay();
        this.displaySecondary.textContent = '';
    }

    delete() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
        this.updateDisplay();
    }

    showError() {
        this.displayMain.textContent = 'Error';
        this.displayMain.classList.add('error');
        setTimeout(() => {
            this.clear();
            this.displayMain.classList.remove('error');
        }, 1500);
    }

    updateDisplay() {
        this.displayMain.textContent = this.currentValue;
    }

    updateSecondaryDisplay() {
        if (this.operation && this.previousValue !== '') {
            this.displaySecondary.textContent = `${this.previousValue} ${this.operation}`;
        }
    }

    // History Management
    addToHistory(expression, result) {
        const historyItem = {
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleTimeString(),
            id: Date.now()
        };

        this.history.unshift(historyItem);
        
        // Keep only last 50 calculations
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
            return;
        }

        historyList.innerHTML = this.history.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="history-expression">${item.expression}</div>
                <div class="history-result">= ${item.result}</div>
                <div class="history-time">${item.timestamp}</div>
            </div>
        `).join('');

        // Add click handlers to history items
        historyList.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                const historyItem = this.history.find(h => h.id === id);
                if (historyItem) {
                    this.currentValue = String(historyItem.result);
                    this.updateDisplay();
                    this.waitingForOperand = true;
                }
            });
        });
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    saveHistory() {
        try {
            localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('calculatorHistory');
            if (saved) {
                this.history = JSON.parse(saved);
                this.renderHistory();
            }
        } catch (e) {
            console.error('Failed to load history:', e);
            this.history = [];
        }
    }
}

// Initialize calculator
const calculator = new Calculator();