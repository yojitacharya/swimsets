// DOM Elements
const workoutForm = document.getElementById('workoutForm');
const exercisesContainer = document.getElementById('exercisesContainer');
const addExerciseBtn = document.getElementById('addExerciseBtn');
const tagsContainer = document.getElementById('tagsContainer');
const tagInput = document.getElementById('tagInput');
const addTagBtn = document.getElementById('addTagBtn');
const searchInput = document.getElementById('searchInput');
const filterType = document.getElementById('filterType');
const workoutsContainer = document.getElementById('workoutsContainer');

/*
const exercisePreviewContainer = document.createElement('div');
exercisePreviewContainer.className = 'exercise-preview-container';
exercisePreviewContainer.innerHTML = '<h3>Added Exercises</h3>';
*/

// State
let exercisePreviewContainer;
let workouts = [];
let currentTags = [];
let exerciseCounter = 1;

// Initialize the app
function init() {
    // Log what elements we've found
    
    loadWorkouts();
    renderWorkouts();
    setupEventListeners();
    
    // Create and insert exercise preview container
    exercisePreviewContainer = document.createElement('div');
    exercisePreviewContainer.className = 'exercise-preview-container';
    exercisePreviewContainer.innerHTML = '<h3>Added Exercises</h3>';
    
    // Check if elements exist before inserting
    if (!exercisesContainer) {
        console.error('Exercises container not found!');
        return;
    }
    
    if (!exercisesContainer.parentNode) {
        console.error('Exercises container parent not found!');
        return;
    }
    
    if (!addExerciseBtn) {
        console.error('Add exercise button not found!');
        // Fall back to appending to exercises container
        exercisesContainer.appendChild(exercisePreviewContainer);
    } else {
        // Insert after exercises container but before add button
        console.log('Inserting preview container');
        exercisesContainer.parentNode.insertBefore(exercisePreviewContainer, addExerciseBtn.nextSibling);
    }
    
    // Set up initial exercise row buttons
    const initialRow = exercisesContainer.querySelector('.exercise-row');
}

// Load workouts from localStorage
function loadWorkouts() {
    const savedWorkouts = localStorage.getItem('swimWorkouts');
    workouts = savedWorkouts ? JSON.parse(savedWorkouts) : [];
}

// Save workouts to localStorage
function saveWorkouts() {
    localStorage.setItem('swimWorkouts', JSON.stringify(workouts));
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    workoutForm.addEventListener('submit', handleFormSubmit);
    
    // Add exercise button
    addExerciseBtn.addEventListener('click', addExercise);
    
    // Add tag button
    addTagBtn.addEventListener('click', addTag);
    tagInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    });
    
    // Search and filter
    searchInput.addEventListener('input', renderWorkouts);
    filterType.addEventListener('change', renderWorkouts);
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Collect exercises from preview
    const exercises = [];
    const previewItems = exercisePreviewContainer.querySelectorAll('.exercise-preview-item');
    
    previewItems.forEach(item => {
        const repeats = item.querySelector('.preview-repeats').value;
        const amount = item.querySelector('.preview-amount').value;
        const stroke = item.querySelector('.preview-stroke').value;
        const drill = item.querySelector('.preview-drill').value;
        const interval = item.querySelector('.preview-interval').value;
        
        exercises.push({
            repeats,
            amount,
            stroke,
            drill,
            interval
        });
    });
    
    // Check if there are any exercises
    if (exercises.length === 0) {
        alert('No exercises have been added to this workout. Please add at least one exercise before saving.');
        return;
    }
    
    // Get other form values
    const title = document.getElementById('title').value;
    let totalDistance = document.getElementById('totalDistance').value;
    const mainStroke = document.getElementById('mainStroke').value;
    const intensity = document.getElementById('intensity').value;
    const distanceType = document.getElementById('distanceType').value;
    const notes = document.getElementById('notes').value;
    
    // Auto-calculate total distance if not provided
    if (!totalDistance) {
        totalDistance = exercises.reduce((sum, ex) => {
            return sum + (parseInt(ex.repeats) || 1) * (parseInt(ex.amount) || 0);
        }, 0);
    }
    
    // Create workout summary for confirmation
    let confirmMessage = `Workout Summary:\n\n`;
    confirmMessage += `Title: ${title}\n`;
    confirmMessage += `Total Distance: ${totalDistance}m\n`;
    confirmMessage += `Main Stroke: ${mainStroke}\n`;
    confirmMessage += `Intensity: ${intensity}\n`;
    confirmMessage += `Distance Type: ${distanceType}\n\n`;
    
    confirmMessage += `Exercises (${exercises.length}):\n`;
    exercises.forEach((ex, index) => {
        const repeats = parseInt(ex.repeats) > 1 ? `${ex.repeats}x ` : '';
        confirmMessage += `${index + 1}. ${repeats}${ex.amount}m ${ex.stroke}${ex.drill ? ` (${ex.drill})` : ''}${ex.interval ? ` @ ${ex.interval}` : ''}\n`;
    });
    
    confirmMessage += `\nDo you want to save this workout?`;
    
    // Show confirmation dialog
    if (confirm(confirmMessage)) {
        // Create workout object
        const workout = {
            id: Date.now(),
            title,
            totalDistance,
            mainStroke,
            intensity,
            distanceType,
            notes,
            exercises,
            tags: [...currentTags],
            date: new Date().toISOString()
        };
        
        // Add to workouts and save
        workouts.unshift(workout);
        saveWorkouts();
        
        // Reset form
        workoutForm.reset();
        resetExercises();
        resetTags();
        resetExercisePreview();
        
        // Update the UI
        renderWorkouts();
        
        alert('Workout saved successfully!');
    }
}

// Add a new exercise row
function addExercise() {
    const newExerciseRow = document.createElement('div');
    newExerciseRow.className = 'exercise-row';
    newExerciseRow.dataset.index = exerciseCounter++;
    
    newExerciseRow.innerHTML = `
        <div class="exercise-grid">
            <div class="form-group">
                <label>Repeats</label>
                <input type="number" class="exercise-repeats" value="1" min="1">
            </div>
            
            <div class="form-group">
                <label>Amount (m)</label>
                <input type="number" class="exercise-amount" required>
            </div>
            
            <div class="form-group">
                <label>Stroke</label>
                <select class="exercise-stroke">
                    <option value="freestyle">Freestyle</option>
                    <option value="backstroke">Backstroke</option>
                    <option value="breaststroke">Breaststroke</option>
                    <option value="butterfly">Butterfly</option>
                    <option value="im">IM</option>
                    <option value="kick">Kick</option>
                    <option value="drill">Drill</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Drill/Description</label>
                <input type="text" class="exercise-drill" placeholder="Optional">
            </div>
            
            <div class="form-group">
                <label>Interval</label>
                <input type="text" class="exercise-interval" placeholder="e.g. 1:30">
            </div>
        </div>
        <div class="exercise-actions">
            <button type="button" class="button button-secondary add-to-preview">Add to Workout</button>
            <button type="button" class="remove-exercise">Cancel</button>
        </div>
    `;
    
    exercisesContainer.appendChild(newExerciseRow);
    setupExerciseRowButtons(newExerciseRow);


}

// Set up buttons for an exercise row
function setupExerciseRowButtons(row) {
    // Add remove exercise button functionality
    const removeBtn = row.querySelector('.remove-exercise');
    if (!removeBtn) {
        console.error("Remove button not found in row:", row)
    }
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {

            // If this is the only row, just clear it
            if (exercisesContainer.querySelectorAll('.exercise-row').length === 1) {
                row.querySelector('.exercise-repeats').value = 1;
                row.querySelector('.exercise-amount').value = '';
                row.querySelector('.exercise-drill').value = '';
                row.querySelector('.exercise-interval').value = '';
                
                // Reset the add button if it was modified
                const addBtn = row.querySelector('.add-to-preview');
                addBtn.textContent = 'Add to Workout';
                addBtn.disabled = false;
            } else {
                // Otherwise, remove the row
                exercisesContainer.removeChild(row);
            }
        });
    }
    // Add "Add to Preview" button functionality
// In setupExerciseRowButtons function
    const addToPreviewBtn = row.querySelector('.add-to-preview');
    if (addToPreviewBtn) {
        addToPreviewBtn.addEventListener('click', function() {
            const repeats = row.querySelector('.exercise-repeats').value || 1;
            const amount = row.querySelector('.exercise-amount').value;
            const stroke = row.querySelector('.exercise-stroke').value;
            const drill = row.querySelector('.exercise-drill').value;
            const interval = row.querySelector('.exercise-interval').value;
            
            // Only check for amount, make everything else optional
            if (!amount || amount <= 0) {
                alert('Please enter a valid amount for the exercise');
                return;
            }
            
            addExerciseToPreview(repeats, amount, stroke, drill, interval);
            
            // Add visual feedback
            this.textContent = 'Added!';
            this.disabled = true;
            
            setTimeout(() => {
                this.textContent = 'Add to Workout';
                this.disabled = false;
            }, 1500);
        });
    }
}

// Function to display exercise in the preview
function addExerciseToPreview(repeats, amount, stroke, drill, interval) {

    if(!exercisePreviewContainer) {
        console.error("Exercise preview container not found!");
        return;
    }
    const exercisePreview = document.createElement('div');
    exercisePreview.className = 'exercise-preview-item';
    
    const repeatText = parseInt(repeats) > 1 ? `${repeats}x ` : '';
    const drillText = drill ? ` (${drill})` : '';
    const intervalText = interval ? ` @ ${interval}` : '';
    
    exercisePreview.innerHTML = `
        <span class="preview-text">${repeatText}${amount}m ${stroke}${drillText}${intervalText}</span>
        <button type="button" class="button button-small remove-preview">×</button>
        <input type="hidden" class="preview-repeats" value="${repeats}">
        <input type="hidden" class="preview-amount" value="${amount}">
        <input type="hidden" class="preview-stroke" value="${stroke}">
        <input type="hidden" class="preview-drill" value="${drill}">
        <input type="hidden" class="preview-interval" value="${interval}">
    `;
    
    // Add remove functionality
    const removeBtn = exercisePreview.querySelector('.remove-preview');
    removeBtn.addEventListener('click', () => {
        exercisePreviewContainer.removeChild(exercisePreview);
        updateTotalDistance();
    });
    
    exercisePreviewContainer.appendChild(exercisePreview);
    updateTotalDistance();
}

// Update total distance based on preview exercises
function updateTotalDistance() {
    const totalDistanceInput = document.getElementById('totalDistance');
    if (totalDistanceInput.value !== '') return; // Don't auto-calculate if manually set
    
    const previewItems = exercisePreviewContainer.querySelectorAll('.exercise-preview-item');
    let totalDistance = 0;
    
    previewItems.forEach(item => {
        const repeats = parseInt(item.querySelector('.preview-repeats').value) || 1;
        const amount = parseInt(item.querySelector('.preview-amount').value) || 0;
        totalDistance += repeats * amount;
    });
    
    totalDistanceInput.placeholder = `Auto-calculated: ${totalDistance}m`;
}

// Reset exercise preview
function resetExercisePreview() {
    exercisePreviewContainer.innerHTML = '<h3>Added Exercises</h3>';
}

// Reset exercises to initial state
function resetExercises() {
    exercisesContainer.innerHTML = `
        <div class="exercise-row" data-index="0">
            <div class="exercise-grid">
                <div class="form-group">
                    <label>Repeats</label>
                    <input type="number" class="exercise-repeats" value="1" min="1">
                </div>
                
                <div class="form-group">
                    <label>Amount (m)</label>
                    <input type="number" class="exercise-amount" required>
                </div>
                
                <div class="form-group">
                    <label>Stroke</label>
                    <select class="exercise-stroke">
                        <option value="freestyle">Freestyle</option>
                        <option value="backstroke">Backstroke</option>
                        <option value="breaststroke">Breaststroke</option>
                        <option value="butterfly">Butterfly</option>
                        <option value="im">IM</option>
                        <option value="kick">Kick</option>
                        <option value="drill">Drill</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Drill/Description</label>
                    <input type="text" class="exercise-drill" placeholder="Optional">
                </div>
                
                <div class="form-group">
                    <label>Interval</label>
                    <input type="text" class="exercise-interval" placeholder="e.g. 1:30">
                </div>
            </div>
            <div class="exercise-actions">
                <button type="button" class="button button-secondary add-to-preview">Add to Workout</button>
                <button type="button" class="remove-exercise">Cancel</button>
            </div>
        </div>
    `;
    
    // Setup buttons for the initial row
    setupExerciseRowButtons(exercisesContainer.querySelector('.exercise-row'));
    
    exerciseCounter = 1;
}

// Add a tag
function addTag() {
    const tag = tagInput.value.trim();
    if (tag && !currentTags.includes(tag)) {
        currentTags.push(tag);
        renderTags();
        tagInput.value = '';
    }
}

// Remove a tag
function removeTag(tag) {
    currentTags = currentTags.filter(t => t !== tag);
    renderTags();
}

// Render tags
function renderTags() {
    tagsContainer.innerHTML = '';
    
    currentTags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.innerHTML = `
            ${tag}
            <span class="tag-remove">×</span>
        `;
        
        const removeBtn = tagElement.querySelector('.tag-remove');
        removeBtn.addEventListener('click', () => removeTag(tag));
        
        tagsContainer.appendChild(tagElement);
    });
}

// Reset tags
function resetTags() {
    currentTags = [];
    renderTags();
}

// Filter workouts based on search and filter type
function filterWorkouts() {
    const searchTerm = searchInput.value.toLowerCase();
    const filter = filterType.value;
    
    return workouts.filter(workout => {
        const matchesSearch = 
            workout.title.toLowerCase().includes(searchTerm) ||
            workout.mainStroke.toLowerCase().includes(searchTerm) ||
            workout.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            workout.exercises.some(ex => ex.stroke.toLowerCase().includes(searchTerm));
        
        if (filter === 'all') return matchesSearch;
        if (filter === 'stroke') return workout.mainStroke.toLowerCase().includes(searchTerm);
        if (filter === 'tag') return workout.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        return matchesSearch;
    });
}

// Render workouts
function renderWorkouts() {
    const filteredWorkouts = filterWorkouts();
    
    if (filteredWorkouts.length === 0) {
        workoutsContainer.innerHTML = `
            <div class="card empty-state">
                <p>No workouts found. Try a different search or add your first workout!</p>
            </div>
        `;
        return;
    }
    
    workoutsContainer.innerHTML = '';
    
    filteredWorkouts.forEach(workout => {
        const workoutCard = document.createElement('div');
        workoutCard.className = 'card workout-card';
        
        // Meta items
        const metaItems = `
            <div class="meta-item">
                <span class="meta-label">Distance:</span> ${workout.totalDistance}m
            </div>
            <div class="meta-item">
                <span class="meta-label">Main:</span> ${workout.mainStroke}
            </div>
            <div class="meta-item">
                <span class="meta-label">Intensity:</span> ${workout.intensity}
            </div>
            <div class="meta-item">
                <span class="meta-label">Type:</span> ${workout.distanceType}
            </div>
        `;
        
        // Exercises table
        let exercisesHTML = `
            <div class="section-heading">Exercises:</div>
            <div class="exercises-container">
                <table class="exercises-table">
                    <thead>
                        <tr>
                            <th>Exercise</th>
                            <th>Stroke/Drill</th>
                            <th>Interval</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        workout.exercises.forEach(ex => {
            const repeats = parseInt(ex.repeats) || 1;
            const repeatText = repeats > 1 ? `${repeats}x ` : '';
            
            exercisesHTML += `
                <tr>
                    <td>${repeatText}${ex.amount}m</td>
                    <td>${ex.stroke} ${ex.drill ? `(${ex.drill})` : ''}</td>
                    <td>${ex.interval ? `@ ${ex.interval}` : 'N/A'}</td>
                </tr>
            `;
        });
        
        exercisesHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        // Tags
        let tagsHTML = '';
        if (workout.tags && workout.tags.length > 0) {
            tagsHTML = `
                <div class="workout-tags">
                    <div class="section-heading">Tags:</div>
                    <div class="tags-container">
                        ${workout.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        // Notes
        let notesHTML = '';
        if (workout.notes) {
            notesHTML = `
                <div class="workout-notes">
                    <div class="section-heading">Notes:</div>
                    <p>${workout.notes}</p>
                </div>
            `;
        }
        
        workoutCard.innerHTML = `
            <div class="workout-header">
                <h3 class="workout-title">${workout.title}</h3>
                <button class="button button-danger delete-workout" data-id="${workout.id}">Delete</button>
            </div>
            
            <div class="workout-meta">
                ${metaItems}
            </div>
            
            <div class="workout-exercises">
                ${exercisesHTML}
            </div>
            
            ${tagsHTML}
            ${notesHTML}
            
            <div class="workout-date">
                Added: ${new Date(workout.date).toLocaleDateString()}
            </div>
        `;
        
        // Add delete button functionality
        const deleteBtn = workoutCard.querySelector('.delete-workout');
        deleteBtn.addEventListener('click', () => deleteWorkout(workout.id));
        
        workoutsContainer.appendChild(workoutCard);
    });
}

// Delete a workout
function deleteWorkout(id) {
    if (confirm('Are you sure you want to delete this workout?')) {
        workouts = workouts.filter(workout => workout.id !== id);
        saveWorkouts();
        renderWorkouts();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);