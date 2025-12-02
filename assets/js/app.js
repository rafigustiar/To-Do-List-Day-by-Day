//Nyimpan tugas di local
$(function () {
    const STORAGE_KEY = 'todo-app-tasks-v1';
    let tasks = [];
    let currentFilter = 'all';

    function loadTasks() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            tasks = raw ? JSON.parse(raw) : [];
        } catch (e) {
            tasks = [];
        }
    }

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function formatTime(date) {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.done).length;
        const remaining = total - completed;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        $('#stat-total').text(total);
        $('#stat-completed').text(completed);
        $('#stat-remaining').text(remaining);
        $('#progress-label').text(percent + '%');
        $('#progress-fill').css('width', percent + '%');
    }

    function updateEmptyState() {
        $('#empty-state').toggle(tasks.length === 0);
    }

    function priorityClass(priority) {
        if (priority === 'high') return 'priority-high';
        if (priority === 'low') return 'priority-low';
        return 'priority-normal';
    }

    function renderTasks() {
        const $list = $('#todo-list');
        $list.empty();

        let filtered = tasks;
        if (currentFilter === 'active') {
            filtered = tasks.filter(t => !t.done);
        } else if (currentFilter === 'done') {
            filtered = tasks.filter(t => t.done);
        }

        filtered.forEach(task => {
            const item = $(`
                <li class="todo-item ${task.done ? 'done' : ''}" data-id="${task.id}">
                    <div class="todo-main">
                        <input type="checkbox" class="todo-toggle" ${task.done ? 'checked' : ''}>
                        <span class="todo-text"></span>
                    </div>
                    <div class="todo-meta">
                        <span class="todo-date">${task.time}</span>
                        <span class="priority-pill ${priorityClass(task.priority)}">${task.priorityLabel}</span>
                        <span class="priority-pill priority-normal">${task.category}</span>
                    </div>
                    <button class="icon-btn todo-delete" aria-label="Hapus tugas">×</button>
                </li>
            `);

            item.find('.todo-text').text(task.text);
            $list.append(item);
        });

        updateStats();
        updateEmptyState();
    }

    function addTask(text, priority, category) {
        const trimmed = text.trim();
        if (!trimmed) return;

        const now = new Date();
        const task = {
            id: Date.now(),
            text: trimmed,
            done: false,
            priority,
            category,
            time: formatTime(now),
            priorityLabel:
                priority === 'high' ? 'Tinggi' :
                priority === 'low' ? 'Rendah' :
                'Normal'
        };

        tasks.unshift(task); 
        saveTasks();
        renderTasks();
    }

    function setTodayLabel() {
        const today = new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        $('#today-label').text(today);
    }

    
    $('#todo-form').on('submit', function (e) {
        e.preventDefault();
        const text = $('#todo-input').val();
        const priority = $('#priority').val();
        const category = $('#category').val();
        addTask(text, priority, category);
        $('#todo-input').val('').focus();
    });

    //Tambah tugas
    $('#todo-input').on('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            $('#todo-form').submit();
        }
    });

    //Hapus dan selesai tugas
    $('#todo-list')
        .on('click', '.todo-delete', function () {
            const id = Number($(this).closest('.todo-item').data('id'));
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        })
        .on('change', '.todo-toggle', function () {
            const id = Number($(this).closest('.todo-item').data('id'));
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.done = this.checked;
                saveTasks();
                renderTasks();
            }
        });

    //Filter tombol
    $('.filter-btn').on('click', function () {
        const filter = $(this).data('filter');
        if (!filter) return;
        currentFilter = filter;
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
        renderTasks();
    });

    //Clear Tugas
    $('#clear-completed').on('click', function () {
        tasks = tasks.filter(t => !t.done);
        saveTasks();
        renderTasks();
    });

    setTodayLabel();
    loadTasks();
    renderTasks();
});
