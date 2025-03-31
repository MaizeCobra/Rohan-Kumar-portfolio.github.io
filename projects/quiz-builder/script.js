document.addEventListener('DOMContentLoaded', () => {
    console.log("Quiz Builder Script Initialized");

    // --- DOM Elements ---
    // Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Create Tab
    const createQuizForm = document.getElementById('create-quiz-form');
    const quizTitleInput = document.getElementById('quiz-title');
    const quizDescriptionInput = document.getElementById('quiz-description');
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const saveQuizBtn = document.getElementById('save-quiz-btn');
    const clearFormBtn = document.getElementById('clear-form-btn');
    const editQuizIdInput = document.getElementById('edit-quiz-id');
    const noQuestionsMsg = questionsContainer.querySelector('.no-questions-msg');

    // Question Modal
    const questionModal = document.getElementById('question-modal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const modalQuestionTextInput = document.getElementById('modal-question-text');
    const modalOptionsContainer = document.getElementById('modal-options-container');
    const modalAddOptionBtn = document.getElementById('modal-add-option-btn');
    const modalSaveQuestionBtn = document.getElementById('modal-save-question-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const editQuestionIndexInput = document.getElementById('edit-question-index');

    // Play Tab
    const quizSelectionArea = document.getElementById('quiz-selection-area');
    const playQuizList = document.getElementById('play-quiz-list');
    const quizPlayerArea = document.getElementById('quiz-player-area');
    const playerQuizTitle = document.getElementById('player-quiz-title');
    const playerQuestionContainer = document.getElementById('player-question-container');
    const playerQuestionText = document.getElementById('player-question-text');
    const playerOptionsContainer = document.getElementById('player-options-container');
    const playerFeedback = document.getElementById('player-feedback');
    const playerProgress = document.getElementById('player-progress');
    const playerNextBtn = document.getElementById('player-next-btn');
    const playerFinishBtn = document.getElementById('player-finish-btn');
    const quizResultsArea = document.getElementById('quiz-results-area');
    const resultsScore = document.getElementById('results-score');
    const resultsPercentage = document.getElementById('results-percentage');
    const playAgainBtn = document.getElementById('play-again-btn');

    // Library Tab
    const libraryQuizList = document.getElementById('library-quiz-list');

    // --- State Variables ---
    let quizzes = []; // Array to hold all quiz objects
    let currentQuizForCreation = { // Holds data while creating/editing a quiz
        id: null,
        title: '',
        description: '',
        questions: [] // { text: '', options: [], correctAnswerIndex: null }
    };
    let currentQuizForPlaying = null; // Holds the quiz being played
    let currentQuestionIndex = 0;
    let score = 0;
    let editingQuestionIndex = null; // Index of question being edited in modal

    // --- Utility Functions ---
    const generateId = () => `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // --- Local Storage ---
    function saveQuizzesToLocalStorage() {
        try {
            localStorage.setItem('quizzes', JSON.stringify(quizzes));
        } catch (e) {
            console.error("Error saving quizzes to localStorage:", e);
            alert("Could not save quizzes. LocalStorage might be full or disabled.");
        }
    }

    function loadQuizzesFromLocalStorage() {
        try {
            const storedQuizzes = localStorage.getItem('quizzes');
            quizzes = storedQuizzes ? JSON.parse(storedQuizzes) : [];
        } catch (e) {
            console.error("Error loading quizzes from localStorage:", e);
            quizzes = []; // Reset to empty array on error
        }
    }

    // --- Tab Switching ---
    function switchTab(targetTabId) {
        tabContents.forEach(content => content.classList.remove('active'));
        tabButtons.forEach(button => button.classList.remove('active'));

        const activeTabContent = document.getElementById(`${targetTabId}-tab`);
        const activeTabButton = document.querySelector(`.tab-btn[data-tab="${targetTabId}"]`);

        if (activeTabContent) activeTabContent.classList.add('active');
        if (activeTabButton) activeTabButton.classList.add('active');

        // Refresh lists when switching to Play or Library
        if (targetTabId === 'play') renderQuizList(playQuizList, true);
        if (targetTabId === 'library') renderQuizList(libraryQuizList, false);
        if (targetTabId !== 'play') resetPlayer(); // Reset player if leaving play tab
    }

    // --- Modal Management ---
    function openQuestionModal(questionIndex = null) {
        editingQuestionIndex = questionIndex;
        modalQuestionTextInput.value = '';
        modalOptionsContainer.innerHTML = ''; // Clear previous options

        if (questionIndex !== null && currentQuizForCreation.questions[questionIndex]) {
            // Editing existing question
            const question = currentQuizForCreation.questions[questionIndex];
            modalQuestionTextInput.value = question.text;
            question.options.forEach((option, index) => {
                addOptionToModal(option, index === question.correctAnswerIndex);
            });
            modalSaveQuestionBtn.textContent = 'Update Question';
        } else {
            // Adding new question - add default options
            addOptionToModal('', true); // First option defaults to correct initially
            addOptionToModal('');
            modalSaveQuestionBtn.textContent = 'Save Question';
        }
        if (questionModal) questionModal.style.display = 'block';
    }

    function closeQuestionModal() {
        if (questionModal) questionModal.style.display = 'none';
        editingQuestionIndex = null; // Reset editing state
    }

    function addOptionToModal(value = '', isCorrect = false) {
        const optionIndex = modalOptionsContainer.children.length;
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('modal-option');
        optionDiv.innerHTML = `
            <input type="text" class="option-input" placeholder="Option ${optionIndex + 1}" value="${escapeHtml(value)}" required>
            <input type="radio" name="correct-option" class="correct-option-radio" value="${optionIndex}" title="Mark as correct" ${isCorrect ? 'checked' : ''}>
            <button type="button" class="remove-option-btn" title="Remove option">&times;</button>
        `;
        modalOptionsContainer.appendChild(optionDiv);

        // Add event listener to remove button
        const removeBtn = optionDiv.querySelector('.remove-option-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (modalOptionsContainer.children.length > 2) { // Keep at least 2 options
                    optionDiv.remove();
                    // Re-assign values to radio buttons after removal
                    modalOptionsContainer.querySelectorAll('.correct-option-radio').forEach((radio, index) => {
                        radio.value = index;
                    });
                    // Ensure at least one radio is checked if the checked one was removed
                    if (!modalOptionsContainer.querySelector('input[name="correct-option"]:checked') && modalOptionsContainer.children.length > 0) {
                       modalOptionsContainer.querySelector('.correct-option-radio').checked = true;
                    }
                } else {
                    alert("A question must have at least two options.");
                }
            });
        }
    }

    function saveQuestionFromModal() {
        const questionText = modalQuestionTextInput.value.trim();
        const optionInputs = modalOptionsContainer.querySelectorAll('.option-input');
        const correctOptionRadio = modalOptionsContainer.querySelector('input[name="correct-option"]:checked');

        if (!questionText) {
            alert("Please enter the question text.");
            return;
        }
        if (optionInputs.length < 2) {
             alert("Please add at least two answer options.");
            return;
        }
        if (!correctOptionRadio) {
            alert("Please mark one option as correct.");
            return;
        }

        const options = Array.from(optionInputs).map(input => input.value.trim());
        if (options.some(opt => !opt)) {
            alert("Please fill in all answer options.");
            return;
        }

        const correctAnswerIndex = parseInt(correctOptionRadio.value);

        const questionData = {
            text: questionText,
            options: options,
            correctAnswerIndex: correctAnswerIndex
        };

        if (editingQuestionIndex !== null) {
            // Update existing question
            if (currentQuizForCreation.questions[editingQuestionIndex]) {
                currentQuizForCreation.questions[editingQuestionIndex] = questionData;
            } else {
                 console.error("Error: Trying to edit a question that doesn't exist at index", editingQuestionIndex);
                 // Optionally add as new question instead
                 // currentQuizForCreation.questions.push(questionData);
            }
        } else {
            // Add new question
            currentQuizForCreation.questions.push(questionData);
        }

        renderQuestionsInCreator();
        closeQuestionModal();
    }

    // --- Quiz Creation ---
    function renderQuestionsInCreator() {
        if (!questionsContainer || !noQuestionsMsg) return; // Guard clause
        questionsContainer.innerHTML = ''; // Clear existing
        if (currentQuizForCreation.questions.length === 0) {
            questionsContainer.appendChild(noQuestionsMsg);
            noQuestionsMsg.style.display = 'block';
            return;
        }

        noQuestionsMsg.style.display = 'none';
        currentQuizForCreation.questions.forEach((q, index) => {
            const card = document.createElement('div');
            card.classList.add('question-card');
            card.dataset.index = index;

            let optionsHtml = '<ol>';
            q.options.forEach((opt, optIndex) => {
                optionsHtml += `<li class="${optIndex === q.correctAnswerIndex ? 'correct-answer' : ''}">${escapeHtml(opt)}</li>`;
            });
            optionsHtml += '</ol>';

            card.innerHTML = `
                <p>${index + 1}. ${escapeHtml(q.text)}</p>
                ${optionsHtml}
                <div class="question-actions">
                    <button type="button" class="edit-question-btn" title="Edit question"><i class="fas fa-edit"></i></button>
                    <button type="button" class="delete-question-btn" title="Delete question"><i class="fas fa-trash"></i></button>
                </div>
            `;
            questionsContainer.appendChild(card);
        });

        // Add event listeners for edit/delete buttons
        questionsContainer.querySelectorAll('.edit-question-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Use currentTarget to ensure the button itself is the reference
                const card = e.currentTarget.closest('.question-card');
                if (card && card.dataset.index) {
                    const index = parseInt(card.dataset.index);
                    openQuestionModal(index);
                }
            });
        });
        questionsContainer.querySelectorAll('.delete-question-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                 const card = e.currentTarget.closest('.question-card');
                 if (card && card.dataset.index) {
                    if (confirm("Are you sure you want to delete this question?")) {
                        const index = parseInt(card.dataset.index);
                        currentQuizForCreation.questions.splice(index, 1);
                        renderQuestionsInCreator();
                    }
                 }
            });
        });
    }

    function saveQuiz() {
        currentQuizForCreation.title = quizTitleInput.value.trim();
        currentQuizForCreation.description = quizDescriptionInput.value.trim();

        if (!currentQuizForCreation.title) {
            alert("Please enter a quiz title.");
            return;
        }
        if (currentQuizForCreation.questions.length === 0) {
            alert("Please add at least one question to the quiz.");
            return;
        }

        const existingQuizIndex = quizzes.findIndex(q => q.id === currentQuizForCreation.id);

        if (existingQuizIndex > -1) {
            // Update existing quiz
            quizzes[existingQuizIndex] = { ...currentQuizForCreation }; // Create a copy
            alert("Quiz updated successfully!");
        } else {
            // Save new quiz
            currentQuizForCreation.id = generateId();
            quizzes.push({ ...currentQuizForCreation }); // Create a copy
            alert("Quiz saved successfully!");
        }

        saveQuizzesToLocalStorage();
        clearQuizForm(); // Clear form after saving
        renderQuizList(libraryQuizList, false); // Update library list
        renderQuizList(playQuizList, true); // Update play list
    }

    function clearQuizForm() {
        currentQuizForCreation = { id: null, title: '', description: '', questions: [] };
        if (createQuizForm) createQuizForm.reset();
        if (editQuizIdInput) editQuizIdInput.value = '';
        renderQuestionsInCreator();
    }

    function loadQuizForEditing(quizId) {
        const quizToEdit = quizzes.find(q => q.id === quizId);
        if (quizToEdit) {
            // Deep copy to avoid modifying the original object in the quizzes array directly
            currentQuizForCreation = JSON.parse(JSON.stringify(quizToEdit));
            if (quizTitleInput) quizTitleInput.value = currentQuizForCreation.title;
            if (quizDescriptionInput) quizDescriptionInput.value = currentQuizForCreation.description;
            if (editQuizIdInput) editQuizIdInput.value = currentQuizForCreation.id;
            renderQuestionsInCreator();
            switchTab('create'); // Switch to create tab
        } else {
            alert("Error: Quiz not found for editing.");
        }
    }

    // --- Quiz Playing ---
    function startQuiz(quizId) {
        const quizToPlay = quizzes.find(q => q.id === quizId);
        if (!quizToPlay || quizToPlay.questions.length === 0) {
            alert("Cannot start quiz. It might be empty or invalid.");
            return;
        }
        // Deep copy for playing session
        currentQuizForPlaying = JSON.parse(JSON.stringify(quizToPlay));
        currentQuestionIndex = 0;
        score = 0;

        if (quizSelectionArea) quizSelectionArea.style.display = 'none';
        if (quizResultsArea) quizResultsArea.style.display = 'none';
        if (quizPlayerArea) quizPlayerArea.style.display = 'block';
        if (playerQuizTitle) playerQuizTitle.textContent = escapeHtml(currentQuizForPlaying.title);

        loadQuestionForPlayer();
    }

    function loadQuestionForPlayer() {
        if (!currentQuizForPlaying || currentQuestionIndex >= currentQuizForPlaying.questions.length) {
            showResults();
            return;
        }

        const question = currentQuizForPlaying.questions[currentQuestionIndex];
        if (playerQuestionText) playerQuestionText.textContent = escapeHtml(question.text);
        if (playerOptionsContainer) playerOptionsContainer.innerHTML = ''; // Clear previous options
        if (playerFeedback) {
            playerFeedback.textContent = '';
            playerFeedback.className = 'feedback'; // Reset feedback class
        }

        // Shuffle options
        const shuffledOptions = question.options
            .map((option, index) => ({ text: option, originalIndex: index }))
            .sort(() => Math.random() - 0.5);


        shuffledOptions.forEach(optionData => {
            const button = document.createElement('button');
            button.classList.add('player-option-btn');
            button.textContent = escapeHtml(optionData.text);
            button.dataset.originalIndex = optionData.originalIndex;
            button.addEventListener('click', handleAnswerSelection);
            if (playerOptionsContainer) playerOptionsContainer.appendChild(button);
        });

        if (playerProgress) playerProgress.textContent = `Question ${currentQuestionIndex + 1} / ${currentQuizForPlaying.questions.length}`;
        if (playerNextBtn) playerNextBtn.style.display = 'none';
        if (playerFinishBtn) playerFinishBtn.style.display = 'none';
    }

    function handleAnswerSelection(event) {
        const selectedButton = event.target;
        if (!currentQuizForPlaying || !playerOptionsContainer) return; // Guard clause

        const selectedOriginalIndex = parseInt(selectedButton.dataset.originalIndex);
        const question = currentQuizForPlaying.questions[currentQuestionIndex];
        const correctOriginalIndex = question.correctAnswerIndex;

        // Disable all option buttons
        playerOptionsContainer.querySelectorAll('.player-option-btn').forEach(btn => {
            btn.disabled = true;
            // Highlight correct and incorrect answers
            const btnOriginalIndex = parseInt(btn.dataset.originalIndex);
            if (btnOriginalIndex === correctOriginalIndex) {
                btn.classList.add('correct');
            } else if (btn === selectedButton) { // Only mark selected as incorrect if it's not the correct one
                 btn.classList.add('incorrect');
            }
        });

        // Provide feedback and update score
        if (playerFeedback) {
            if (selectedOriginalIndex === correctOriginalIndex) {
                playerFeedback.textContent = "Correct!";
                playerFeedback.classList.add('correct');
                score++;
            } else {
                playerFeedback.textContent = `Incorrect. The correct answer was: ${escapeHtml(question.options[correctOriginalIndex])}`;
                playerFeedback.classList.add('incorrect');
            }
        }

        // Show Next or Finish button
        if (currentQuestionIndex < currentQuizForPlaying.questions.length - 1) {
            if (playerNextBtn) playerNextBtn.style.display = 'inline-flex';
        } else {
            if (playerFinishBtn) playerFinishBtn.style.display = 'inline-flex';
        }
    }

    function nextQuestion() {
        currentQuestionIndex++;
        loadQuestionForPlayer();
    }

    function showResults() {
        if (quizPlayerArea) quizPlayerArea.style.display = 'none';
        if (quizResultsArea) quizResultsArea.style.display = 'block';

        if (currentQuizForPlaying && resultsScore && resultsPercentage) {
            const totalQuestions = currentQuizForPlaying.questions.length;
            const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
            resultsScore.textContent = `Your score: ${score} / ${totalQuestions}`;
            resultsPercentage.textContent = `Percentage: ${percentage}%`;
        }
    }

    function resetPlayer() {
        currentQuizForPlaying = null;
        currentQuestionIndex = 0;
        score = 0;
        if (quizPlayerArea) quizPlayerArea.style.display = 'none';
        if (quizResultsArea) quizResultsArea.style.display = 'none';
        if (quizSelectionArea) quizSelectionArea.style.display = 'block';
        renderQuizList(playQuizList, true); // Refresh the list
    }


    // --- Library Management ---
    function renderQuizList(listContainer, isPlayList) {
        if (!listContainer) return; // Guard clause
        listContainer.innerHTML = ''; // Clear list
        if (quizzes.length === 0) {
            const message = isPlayList
                ? "No quizzes found in your library. Create one first!"
                : "Your saved quizzes will appear here.";
             listContainer.innerHTML = `<p class="placeholder-message">${message}</p>`;
            return;
        }

        quizzes.forEach(quiz => {
            const item = document.createElement('div');
            item.classList.add('quiz-list-item');
            item.dataset.id = quiz.id;

            item.innerHTML = `
                <div class="quiz-info">
                    <h4>${escapeHtml(quiz.title)}</h4>
                    <p>${escapeHtml(quiz.description) || 'No description'} (${quiz.questions.length} questions)</p>
                </div>
                <div class="quiz-actions">
                    ${isPlayList ? `<button class="btn primary-btn play-quiz-btn small-btn"><i class="fas fa-play"></i> Play</button>` : ''}
                    <button class="btn secondary-btn edit-quiz-btn small-btn"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn danger-btn delete-quiz-btn small-btn"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            listContainer.appendChild(item);
        });

         // Add event listeners for list items
        listContainer.querySelectorAll('.play-quiz-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const quizItem = e.currentTarget.closest('.quiz-list-item');
                if (quizItem && quizItem.dataset.id) startQuiz(quizItem.dataset.id);
            });
        });
        listContainer.querySelectorAll('.edit-quiz-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                 const quizItem = e.currentTarget.closest('.quiz-list-item');
                 if (quizItem && quizItem.dataset.id) loadQuizForEditing(quizItem.dataset.id);
            });
        });
        listContainer.querySelectorAll('.delete-quiz-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const quizItem = e.currentTarget.closest('.quiz-list-item');
                if (quizItem && quizItem.dataset.id) {
                    const quizId = quizItem.dataset.id;
                    const quizTitle = quizItem.querySelector('h4')?.textContent || 'this quiz';
                    if (confirm(`Are you sure you want to delete the quiz "${quizTitle}"?`)) {
                        deleteQuiz(quizId);
                    }
                }
            });
        });
    }

     function deleteQuiz(quizId) {
        quizzes = quizzes.filter(q => q.id !== quizId);
        saveQuizzesToLocalStorage();
        renderQuizList(libraryQuizList, false); // Refresh library
        renderQuizList(playQuizList, true); // Refresh play list
        alert("Quiz deleted.");
    }

    // --- HTML Escaping ---
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe;
        // Correctly replace special characters with HTML entities
        return unsafe
             .replace(/&/g, "&")
             .replace(/</g, "<")
             .replace(/>/g, ">")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
     }

    // --- Event Listeners ---
    // Tab switching
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => switchTab(button.dataset.tab));
        });
    }

    // Create Tab
    if (addQuestionBtn) addQuestionBtn.addEventListener('click', () => openQuestionModal());
    if (createQuizForm) {
        createQuizForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveQuiz();
        });
    }
    if (clearFormBtn) clearFormBtn.addEventListener('click', clearQuizForm);

    // Modal
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeQuestionModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeQuestionModal);
    if (modalAddOptionBtn) modalAddOptionBtn.addEventListener('click', () => addOptionToModal());
    if (modalSaveQuestionBtn) modalSaveQuestionBtn.addEventListener('click', saveQuestionFromModal);
    // Close modal if clicking outside the content
    if (questionModal) {
        questionModal.addEventListener('click', (e) => {
            if (e.target === questionModal) {
                closeQuestionModal();
            }
        });
    }

    // Player
    if (playerNextBtn) playerNextBtn.addEventListener('click', nextQuestion);
    if (playerFinishBtn) playerFinishBtn.addEventListener('click', showResults);
    if (playAgainBtn) playAgainBtn.addEventListener('click', resetPlayer);


    // --- Initial Load ---
    loadQuizzesFromLocalStorage();
    switchTab('create'); // Start on create tab by default
    renderQuestionsInCreator(); // Render initially empty state or load existing questions if editing

});
