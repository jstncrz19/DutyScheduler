// Duty Scheduler Application - Custom Time Ranges System

// DOM Elements
const scheduleForm = document.getElementById('scheduleForm');
const scheduleDateInput = document.getElementById('scheduleDate');
const startTimeInput = document.getElementById('startTime');
const numPeopleInput = document.getElementById('numPeople');
const dayOfWeekDisplay = document.getElementById('dayOfWeek');
const timeSlotsContainer = document.getElementById('timeSlotsContainer');
const assignmentFields = document.getElementById('assignmentFields');
const timelineVisualization = document.getElementById('timelineVisualization');
const validationStatus = document.getElementById('validationStatus');
const scheduleContainer = document.getElementById('scheduleContainer');
const scheduleContent = document.getElementById('scheduleContent');
const scheduleTitle = document.getElementById('scheduleTitle');
const scheduleList = document.getElementById('scheduleList');
const exportBtn = document.getElementById('exportBtn');
const resetBtn = document.getElementById('resetBtn');
const copyTextBtn = document.getElementById('copyTextBtn');
const copyImageBtn = document.getElementById('copyImageBtn');
const createSlotsBtn = document.getElementById('createSlotsBtn');
const generateBtn = document.getElementById('generateBtn');

// Color palette for shift entries
const shiftColors = [
    'color-0', 'color-1', 'color-2', 'color-3', 'color-4', 'color-5',
    'color-6', 'color-7', 'color-8', 'color-9', 'color-10', 'color-11'
];

// Store current schedule data and time ranges
let currentScheduleData = null;
let customTimeRanges = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default
    const today = new Date();
    scheduleDateInput.value = today.toISOString().split('T')[0];
    updateDayOfWeek();

    // Event listeners
    scheduleDateInput.addEventListener('change', updateDayOfWeek);
    createSlotsBtn.addEventListener('click', handleCreateSlots);
    scheduleForm.addEventListener('submit', handleGenerateSchedule);
    if (exportBtn) exportBtn.addEventListener('click', handleExportPNG);
    if (copyTextBtn) copyTextBtn.addEventListener('click', handleCopyAsText);
    if (copyImageBtn) copyImageBtn.addEventListener('click', handleCopyAsImage);
    if (resetBtn) resetBtn.addEventListener('click', handleReset);
});

/**
 * Update day of week display when date changes
 */
function updateDayOfWeek() {
    const dateValue = scheduleDateInput.value;
    if (dateValue) {
        const date = new Date(dateValue + 'T00:00:00');
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        dayOfWeekDisplay.textContent = `📅 ${dayName}`;
    }
}

/**
 * Handle Create Time Slots button click - Initialize custom time ranges
 */
function handleCreateSlots() {
    const numPeople = parseInt(numPeopleInput.value);
    
    if (isNaN(numPeople) || numPeople < 1 || numPeople > 20) {
        showToast('Please enter a valid number of people (1-20)', true);
        return;
    }

    // Distribute 24 hours equally among people
    const totalMinutes = 24 * 60; // 1440 minutes in 24 hours
    const minutesPerPerson = totalMinutes / numPeople;

    customTimeRanges = [];

    for (let i = 0; i < numPeople; i++) {
        const startMinutes = i * minutesPerPerson;
        const endMinutes = (i + 1) * minutesPerPerson;

        customTimeRanges.push({
            index: i,
            person: '',
            startTime: minutesToTimeInput(Math.round(startMinutes)),
            endTime: minutesToTimeInput(Math.round(endMinutes)),
            startMinutes: Math.round(startMinutes),
            endMinutes: Math.round(endMinutes)
        });
    }

    // Render custom time range fields
    renderCustomTimeRangeFields();

    // Show time slots container and generate button
    timeSlotsContainer.style.display = 'block';
    generateBtn.style.display = 'block';

    // Initial validation
    updateValidationStatus();

    // Scroll to assignments
    setTimeout(() => {
        timeSlotsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/**
 * Render custom time range fields for each person
 */
function renderCustomTimeRangeFields() {
    assignmentFields.innerHTML = '';

    customTimeRanges.forEach((range, index) => {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'custom-time-range';
        fieldGroup.id = `timeRange${index}`;

        // Person number label
        const label = document.createElement('div');
        label.className = 'time-range-label';
        label.textContent = `Person ${index + 1}`;

        // Person name field (dropdown or input)
        const personFieldWrapper = document.createElement('div');
        personFieldWrapper.className = 'time-range-person-field';

        const isFixedNameSlot = index < FIXED_NAMES.length;
        let personField;

        if (isFixedNameSlot) {
            personField = document.createElement('select');
            personField.className = 'form-control form-control-sm';
            personField.id = `person${index}`;

            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'Select name...';
            personField.appendChild(emptyOption);

            FIXED_NAMES.forEach((name) => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                personField.appendChild(option);
            });

            personField.addEventListener('change', (e) => {
                customTimeRanges[index].person = e.target.value;
                updateValidationStatus();
            });
        } else {
            personField = document.createElement('input');
            personField.type = 'text';
            personField.className = 'form-control form-control-sm';
            personField.id = `person${index}`;
            personField.placeholder = 'Custom name...';

            personField.addEventListener('change', (e) => {
                customTimeRanges[index].person = e.target.value;
                updateValidationStatus();
            });
        }

        personFieldWrapper.appendChild(personField);

        // Start time field
        const startTimeWrapper = document.createElement('div');
        startTimeWrapper.className = 'time-range-start-time';

        const startTimeInput = document.createElement('input');
        startTimeInput.type = 'time';
        startTimeInput.className = 'form-control form-control-sm';
        startTimeInput.id = `startTime${index}`;
        startTimeInput.value = range.startTime;

        startTimeInput.addEventListener('change', (e) => {
            customTimeRanges[index].startTime = e.target.value;
            customTimeRanges[index].startMinutes = timeToMinutes(e.target.value);
            updateValidationStatus();
            updateTimeline();
        });

        startTimeWrapper.appendChild(startTimeInput);

        // End time field
        const endTimeWrapper = document.createElement('div');
        endTimeWrapper.className = 'time-range-end-time';

        const endTimeInput = document.createElement('input');
        endTimeInput.type = 'time';
        endTimeInput.className = 'form-control form-control-sm';
        endTimeInput.id = `endTime${index}`;
        endTimeInput.value = range.endTime;

        endTimeInput.addEventListener('change', (e) => {
            customTimeRanges[index].endTime = e.target.value;
            customTimeRanges[index].endMinutes = timeToMinutes(e.target.value);
            updateValidationStatus();
            updateTimeline();
        });

        endTimeWrapper.appendChild(endTimeInput);

        // Duration display
        const durationDiv = document.createElement('div');
        durationDiv.className = 'time-range-duration';
        durationDiv.id = `duration${index}`;
        durationDiv.textContent = calculateDuration(range.startTime, range.endTime);

        // Append all elements
        fieldGroup.appendChild(label);
        fieldGroup.appendChild(personFieldWrapper);
        fieldGroup.appendChild(startTimeWrapper);
        fieldGroup.appendChild(endTimeWrapper);
        fieldGroup.appendChild(durationDiv);

        assignmentFields.appendChild(fieldGroup);
    });
}

/**
 * Calculate duration between two times in HH:MM format
 */
function calculateDuration(startTime, endTime) {
    const startMinutes = timeToMinutes(startTime);
    let endMinutes = timeToMinutes(endTime);

    // Handle midnight wraparound
    if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60;
    }

    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (minutes === 0) {
        return `${hours}h`;
    } else if (hours === 0) {
        return `${minutes}m`;
    } else {
        return `${hours}h ${minutes}m`;
    }
}

/**
 * Validate all time ranges for overlaps, gaps, and 24-hour coverage
 */
function validateTimeRanges() {
    const ranges = customTimeRanges.filter(r => r.person.trim());
    
    if (ranges.length === 0) {
        return { valid: false, message: 'Please assign at least one person' };
    }

    // Convert ranges to minutes for comparison
    const processedRanges = ranges.map(r => ({
        person: r.person,
        start: timeToMinutes(r.startTime),
        end: timeToMinutes(r.endTime),
        startTime: r.startTime,
        endTime: r.endTime
    }));

    // Check for overlaps
    for (let i = 0; i < processedRanges.length; i++) {
        for (let j = i + 1; j < processedRanges.length; j++) {
            const range1 = processedRanges[i];
            const range2 = processedRanges[j];

            // Handle midnight wraparound
            let end1 = range1.end;
            let end2 = range2.end;

            if (end1 <= range1.start) end1 += 24 * 60;
            if (end2 <= range2.start) end2 += 24 * 60;

            // Check for overlap
            if (!(end1 <= range2.start || end2 <= range1.start)) {
                return {
                    valid: false,
                    message: `Overlap detected: ${range1.person} (${range1.startTime}–${range1.endTime}) overlaps with ${range2.person} (${range2.startTime}–${range2.endTime})`
                };
            }
        }
    }

    // No overlaps found - schedule is valid
    return { valid: true, message: '✓ Schedule is valid - no overlaps' };
}

/**
 * Update validation status display
 */
function updateValidationStatus() {
    const validation = validateTimeRanges();

    validationStatus.style.display = 'block';
    validationStatus.className = 'validation-status';

    if (validation.valid) {
        validationStatus.classList.add('success');
        generateBtn.disabled = false;
    } else {
        validationStatus.classList.add('error');
        generateBtn.disabled = true;
    }

    validationStatus.textContent = validation.message;

    // Update field colors for any errors
    customTimeRanges.forEach((range, index) => {
        const fieldGroup = document.getElementById(`timeRange${index}`);
        const personField = document.getElementById(`person${index}`);

        if (!personField.value.trim() && index < customTimeRanges.length - 1) {
            fieldGroup.classList.add('error');
        } else {
            fieldGroup.classList.remove('error');
        }
    });
}

/**
 * Update timeline visualization
 */
function updateTimeline() {
    // Skip if timeline visualization is not in the DOM
    if (!timelineVisualization) return;

    const ranges = customTimeRanges.filter(r => r.person.trim());

    // Timeline visualization code skipped when not in DOM
}

/**
 * Convert time string (HH:MM) to total minutes
 */
function timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string and 12-hour format
 */
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return formatTime12Hour(hours, mins);
}

/**
 * Convert minutes to HH:MM format (for time input elements)
 */
function minutesToTimeInput(minutes) {
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Convert 24-hour time to 12-hour format with AM/PM
 */
function formatTime12Hour(hours, minutes) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    if (minutes === 0) {
        return `${displayHours} ${period}`;
    }
    const displayMinutes = String(minutes).padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Convert HH:MM format string to 12-hour format with AM/PM (e.g., "00:00" to "12 AM")
 */
function convertTimeStringTo12Hour(timeString) {
    if (!timeString) return timeString;
    const [hours, minutes] = timeString.split(':').map(Number);
    return formatTime12Hour(hours, minutes);
}

/**
 * Collect and validate custom time ranges
 */
function collectCustomTimeRanges() {
    const ranges = customTimeRanges.filter(r => r.person.trim());

    if (ranges.length === 0) {
        showToast('Please assign at least one person to a time range', true);
        throw new Error('No assignments');
    }

    return ranges;
}

/**
 * Generate schedule data with custom time ranges
 */
function generateScheduleDataWithCustomTimes() {
    try {
        const validation = validateTimeRanges();
        if (!validation.valid) {
            showToast(validation.message, true);
            return null;
        }

        const ranges = collectCustomTimeRanges();
        
        const dateObj = new Date(scheduleDateInput.value + 'T00:00:00');
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

        const entries = ranges.map((range, index) => ({
            person: range.person,
            startTime: range.startTime,
            endTime: range.endTime,
            colorClass: shiftColors[index % shiftColors.length]
        }));

        return {
            date: scheduleDateInput.value,
            dayOfWeek: dayOfWeek,
            entries: entries
        };
    } catch (error) {
        return null;
    }
}

/**
 * Display generated schedule
 */
function displaySchedule(scheduleData) {
    // Store schedule data for export functions
    currentScheduleData = scheduleData;

    // Update title
    const dateObj = new Date(scheduleData.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    scheduleTitle.textContent = `${scheduleData.dayOfWeek}, ${formattedDate}`;

    // Clear previous entries
    scheduleList.innerHTML = '';

    // Add schedule entries
    scheduleData.entries.forEach((entry) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = `schedule-entry ${entry.colorClass}`;

        const nameDiv = document.createElement('div');
        nameDiv.className = 'person-name';
        nameDiv.textContent = entry.person;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'time-range';
        const startTime12h = convertTimeStringTo12Hour(entry.startTime);
        const endTime12h = convertTimeStringTo12Hour(entry.endTime);
        timeDiv.textContent = `${startTime12h} - ${endTime12h}`;

        entryDiv.appendChild(nameDiv);
        entryDiv.appendChild(timeDiv);
        scheduleList.appendChild(entryDiv);
    });

    // Show schedule container
    scheduleContainer.style.display = 'block';

    // Scroll to schedule
    setTimeout(() => {
        scheduleContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/**
 * Handle schedule generation
 */
function handleGenerateSchedule(e) {
    e.preventDefault();

    const scheduleData = generateScheduleDataWithCustomTimes();
    if (!scheduleData) return;

    displaySchedule(scheduleData);
}

/**
 * Handle PNG export with square format
 */
async function handleExportPNG() {
    try {
        exportBtn.disabled = true;
        exportBtn.textContent = '⏳ Exporting...';

        // Get the schedule content element
        const element = document.getElementById('scheduleContent');

        // Temporarily force light theme for export to ensure readability
        const originalTheme = document.documentElement.getAttribute('data-theme');
        document.documentElement.removeAttribute('data-theme');

        // Use html2canvas to capture the schedule content with white background
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true
        });

        // Restore original theme
        if (originalTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // Create a square canvas (800x800) for proper square aspect ratio
        const squareSize = 800;
        const squareCanvas = document.createElement('canvas');
        const ctx = squareCanvas.getContext('2d');

        squareCanvas.width = squareSize;
        squareCanvas.height = squareSize;

        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, squareSize, squareSize);

        // Calculate scaling and positioning to fit content within square with padding
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const aspectRatio = canvasWidth / canvasHeight;

        const padding = 40;
        const availableSize = squareSize - 2 * padding;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (aspectRatio > 1) {
            // Content is wider than tall
            drawWidth = availableSize;
            drawHeight = availableSize / aspectRatio;
            offsetX = padding;
            offsetY = padding + (availableSize - drawHeight) / 2;
        } else {
            // Content is taller than wide
            drawWidth = availableSize * aspectRatio;
            drawHeight = availableSize;
            offsetX = padding + (availableSize - drawWidth) / 2;
            offsetY = padding;
        }

        // Draw scaled content
        ctx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight);

        // Convert to PNG blob and download
        squareCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            // Generate filename with date
            const date = new Date(scheduleDateInput.value + 'T00:00:00');
            const dateString = date.toISOString().split('T')[0];
            link.download = `duty_schedule_${dateString}.png`;

            link.href = url;
            link.click();

            // Cleanup
            URL.revokeObjectURL(url);

            exportBtn.disabled = false;
            exportBtn.textContent = '📥 Download PNG';
        });
    } catch (error) {
        console.error('Error exporting PNG:', error);
        showToast('Failed to export schedule', true);
        exportBtn.disabled = false;
        exportBtn.textContent = '📥 Download PNG';
    }
}

/**
 * Handle reset form
 */
function handleReset() {
    currentScheduleData = null;
    customTimeRanges = [];
    
    scheduleContainer.style.display = 'none';
    timeSlotsContainer.style.display = 'none';
    timelineVisualization.style.display = 'none';
    validationStatus.style.display = 'none';
    generateBtn.style.display = 'none';
    
    scheduleForm.reset();

    // Reset date to today
    const today = new Date();
    scheduleDateInput.value = today.toISOString().split('T')[0];
    startTimeInput.value = '00:00';
    numPeopleInput.value = 4;

    updateDayOfWeek();

    // Focus on first input
    setTimeout(() => {
        scheduleDateInput.focus();
    }, 100);
}

/**
 * Format schedule as plain text for clipboard
 */
function formatScheduleAsText(scheduleData) {
    if (!scheduleData) return '';

    const dateObj = new Date(scheduleData.date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const dayOfWeek = scheduleData.dayOfWeek.toUpperCase();

    let text = `Date: ${formattedDate} (${dayOfWeek}) - Schedule\n\n`;

    scheduleData.entries.forEach((entry) => {
        const startTime12h = convertTimeStringTo12Hour(entry.startTime);
        const endTime12h = convertTimeStringTo12Hour(entry.endTime);
        text += `${startTime12h} – ${endTime12h} : ${entry.person}\n`;
    });

    return text;
}

/**
 * Show toast notification
 */
function showToast(message, isError = false) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.copy-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `copy-toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Handle Copy as Text
 */
async function handleCopyAsText() {
    if (!currentScheduleData) {
        showToast('Please generate a schedule first', true);
        return;
    }

    try {
        const textToCopy = formatScheduleAsText(currentScheduleData);
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textToCopy);
            showToast('✓ Schedule copied to clipboard!');
            copyTextBtn.textContent = '✓ Copied!';
            setTimeout(() => {
                copyTextBtn.textContent = '📋 Copy as Text';
            }, 2000);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('✓ Schedule copied to clipboard!');
            copyTextBtn.textContent = '✓ Copied!';
            setTimeout(() => {
                copyTextBtn.textContent = '📋 Copy as Text';
            }, 2000);
        }
    } catch (error) {
        console.error('Error copying text:', error);
        showToast('Failed to copy schedule', true);
    }
}

/**
 * Handle Copy as Image
 */
async function handleCopyAsImage() {
    if (!currentScheduleData) {
        showToast('Please generate a schedule first', true);
        return;
    }

    try {
        copyImageBtn.disabled = true;
        copyImageBtn.textContent = '⏳ Processing...';

        // Get the schedule content element
        const element = document.getElementById('scheduleContent');

        // Use html2canvas to capture the schedule content
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: 'white',
            logging: false,
            useCORS: true,
            allowTaint: true
        });

        // Create a square canvas (800x800) with proper scaling
        const squareSize = 800;
        const squareCanvas = document.createElement('canvas');
        const ctx = squareCanvas.getContext('2d');

        squareCanvas.width = squareSize;
        squareCanvas.height = squareSize;

        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, squareSize, squareSize);

        // Calculate scaling and positioning
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const aspectRatio = canvasWidth / canvasHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (aspectRatio > 1) {
            drawWidth = squareSize;
            drawHeight = squareSize / aspectRatio;
            offsetX = 0;
            offsetY = (squareSize - drawHeight) / 2;
        } else {
            drawWidth = squareSize * aspectRatio;
            drawHeight = squareSize;
            offsetX = (squareSize - drawWidth) / 2;
            offsetY = 0;
        }

        // Add padding
        const padding = 40;
        const contentWidth = drawWidth - 2 * padding;
        const contentHeight = drawHeight - 2 * padding;
        const contentX = offsetX + padding;
        const contentY = offsetY + padding;

        // Draw scaled content
        ctx.drawImage(canvas, contentX, contentY, contentWidth, contentHeight);

        // Convert to blob and copy to clipboard
        squareCanvas.toBlob(async (blob) => {
            try {
                if (navigator.clipboard && navigator.clipboard.write) {
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);
                    showToast('✓ Image copied to clipboard!');
                    copyImageBtn.textContent = '✓ Copied!';
                    setTimeout(() => {
                        copyImageBtn.textContent = '🖼️ Copy as Image';
                        copyImageBtn.disabled = false;
                    }, 2000);
                } else {
                    showToast('Copy to clipboard not supported in this browser', true);
                    copyImageBtn.disabled = false;
                    copyImageBtn.textContent = '🖼️ Copy as Image';
                }
            } catch (error) {
                console.error('Error copying image:', error);
                showToast('Failed to copy image to clipboard', true);
                copyImageBtn.disabled = false;
                copyImageBtn.textContent = '🖼️ Copy as Image';
            }
        });
    } catch (error) {
        console.error('Error processing image:', error);
        showToast('Failed to process image', true);
        copyImageBtn.disabled = false;
        copyImageBtn.textContent = '🖼️ Copy as Image';
    }
}
