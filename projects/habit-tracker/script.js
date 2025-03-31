document.addEventListener('DOMContentLoaded', () => {
    console.log("Habit Tracker script loaded.");

    // --- DOM Elements ---
    const newHabitInput = document.getElementById('newHabitInput');
    const addHabitBtn = document.getElementById('addHabitBtn');
    const habitList = document.getElementById('habitList');
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const currentStreakEl = document.getElementById('currentStreak');
    const longestStreakEl = document.getElementById('longestStreak');
    const completionRateEl = document.getElementById('completionRate');

    // --- State ---
    let habits = []; // Array to store habit objects { id: Date.now(), name: '...', completedDates: ['YYYY-MM-DD'] }
    let currentDate = new Date();

    // --- Utility Functions ---
    const getTodayDateString = () => new Date().toISOString().split('T')[0];

    // --- Local Storage ---
    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }

    function loadHabits() {
        const storedHabits = localStorage.getItem('habits');
        if (storedHabits) {
            habits = JSON.parse(storedHabits);
        } else {
            habits = []; // Initialize if nothing is stored
        }
    }


    // --- Core Functions ---

    // Function to render the habit list
    function renderHabitList() {
        habitList.innerHTML = ''; // Clear existing list
        if (habits.length === 0) {
            habitList.innerHTML = `
                <div class="placeholder-message">
                    <i class="fas fa-tasks"></i>
                    <p>Add your first habit to start tracking!</p>
                </div>`;
            return;
        }

        habits.forEach(habit => {
            const habitItem = document.createElement('div');
            habitItem.classList.add('habit-item');
            habitItem.dataset.id = habit.id;

            const todayStr = getTodayDateString();
            const isCompletedToday = habit.completedDates.includes(todayStr);

            habitItem.innerHTML = `
                <span class="habit-name">${habit.name}</span>
                <div class="habit-actions">
                    <button class="complete-btn ${isCompletedToday ? 'completed' : ''}" title="${isCompletedToday ? 'Mark as incomplete' : 'Mark as complete'} for today">
                        <i class="fas ${isCompletedToday ? 'fa-times' : 'fa-check'}"></i>
                    </button>
                    <button class="delete-btn" title="Delete habit"><i class="fas fa-trash"></i></button>
                </div>
            `;
            habitList.appendChild(habitItem);
        });
    }

    // Function to render the calendar
    function renderCalendar() {
        calendarGrid.innerHTML = ''; // Clear grid
        currentMonthYear.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add day headers (Sun, Mon, ...)
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('calendar-header');
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Add empty cells for days before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'other-month');
            calendarGrid.appendChild(emptyCell);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.textContent = day;
            dayCell.dataset.date = new Date(year, month, day).toISOString().split('T')[0]; // YYYY-MM-DD

            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayCell.classList.add('today');
            }

            // Check if *any* habit was completed on this date
            const dateStr = dayCell.dataset.date;
            const wasAnyHabitCompleted = habits.some(habit => habit.completedDates.includes(dateStr));
            if (wasAnyHabitCompleted) {
                dayCell.classList.add('completed');
            }

            calendarGrid.appendChild(dayCell);
        }
        // Add empty cells for days after the last day of the month
        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);
        for (let i = 0; i < remainingCells; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'other-month');
            calendarGrid.appendChild(emptyCell);
        }
    }

    // Function to add a new habit
    function addHabit() {
        const habitName = newHabitInput.value.trim();
        if (habitName) {
            const newHabit = {
                id: Date.now(),
                name: habitName,
                completedDates: [] // Store YYYY-MM-DD strings
            };
            habits.push(newHabit);
            newHabitInput.value = ''; // Clear input
            saveHabits(); // Save after adding
            renderHabitList();
            renderCalendar(); // Re-render calendar in case it affects today's view
            updateStats();
        } else {
            alert("Please enter a habit name.");
        }
    }

    // Function to handle clicks within the habit list (delegation)
    function handleHabitListClick(event) {
        const target = event.target;
        const habitItem = target.closest('.habit-item');
        if (!habitItem) return;

        const habitId = parseInt(habitItem.dataset.id);

        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        if (target.closest('.complete-btn')) {
            const todayStr = getTodayDateString();
            const completedIndex = habit.completedDates.indexOf(todayStr);

            if (completedIndex > -1) {
                // Already completed, so mark as incomplete (toggle)
                habit.completedDates.splice(completedIndex, 1);
                console.log(`Marked incomplete for habit ID: ${habitId} on ${todayStr}`);
            } else {
                // Not completed, so mark as complete
                habit.completedDates.push(todayStr);
                console.log(`Marked complete for habit ID: ${habitId} on ${todayStr}`);
            }

            saveHabits();
            renderHabitList(); // Update button appearance
            renderCalendar(); // Update calendar day appearance
            updateStats(); // Update stats

        } else if (target.closest('.delete-btn')) {
            if (confirm(`Are you sure you want to delete the habit "${habit.name}"?`)) {
                console.log(`Delete habit ID: ${habitId}`);
                habits = habits.filter(h => h.id !== habitId);
                saveHabits();
                renderHabitList();
                renderCalendar(); // Update calendar as deleted habit completions are removed
                updateStats();
            }
        }
    }

    // Function to update statistics (basic implementation)
    function updateStats() {
        console.log("Updating stats...");
        // --- Basic Completion Rate (for visible month) ---
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let completedCount = 0;
        let totalPossibleCompletions = 0; // Only count days up to today if in current month

        const today = new Date();
        const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
        const lastDayToCheck = isCurrentMonth ? today.getDate() : daysInMonth;


        for (let day = 1; day <= lastDayToCheck; day++) {
             const dateStr = new Date(year, month, day).toISOString().split('T')[0];
             habits.forEach(habit => {
                 totalPossibleCompletions++; // Increment for each habit for each day checked
                 if (habit.completedDates.includes(dateStr)) {
                     completedCount++;
                 }
             });
        }
        const completionRate = totalPossibleCompletions > 0 ? Math.round((completedCount / totalPossibleCompletions) * 100) : 0;
        completionRateEl.textContent = `${completionRate}%`;


        // --- Streak Calculation (Simplified: based on *any* habit completed) ---
        // This is complex to do accurately across all habits.
        // For now, let's leave streak calculation basic or as a TODO.
        let currentStreak = 0;
        let longestStreak = 0; // Needs more logic to track properly across sessions

        // Placeholder logic - needs refinement
        let tempCurrentStreak = 0;
        let checkingDate = new Date(); // Start from today
        while (true) {
            const dateStr = checkingDate.toISOString().split('T')[0];
            const anyCompleted = habits.some(h => h.completedDates.includes(dateStr));
            if (anyCompleted) {
                tempCurrentStreak++;
                checkingDate.setDate(checkingDate.getDate() - 1); // Go back one day
            } else {
                break; // Streak broken
            }
        }
        currentStreak = tempCurrentStreak;

        // TODO: Implement proper longest streak tracking (requires storing it)
        longestStreak = Math.max(longestStreak, currentStreak); // Very basic update

        currentStreakEl.textContent = `${currentStreak} days`;
        longestStreakEl.textContent = `${longestStreak} days`; // This won't persist correctly yet

        console.log(`Stats updated: Rate=${completionRate}%, Current Streak=${currentStreak}, Longest Streak=${longestStreak}`);
    }

    // --- Event Listeners ---
    addHabitBtn.addEventListener('click', addHabit);
    newHabitInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addHabit();
        }
    });

    habitList.addEventListener('click', handleHabitListClick);

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // --- Initial Load ---
    loadHabits(); // Load habits first
    renderHabitList();
    renderCalendar();
    updateStats();

});
