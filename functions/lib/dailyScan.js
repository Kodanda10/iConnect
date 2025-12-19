"use strict";
/**
 * @file dailyScan.ts
 * @description System Brain - Daily scan for birthdays and anniversaries
 * @changelog
 * - 2024-12-11: Initial implementation with TDD
 * - 2025-01-28: Optimized task existence check using Set lookup (O(1))
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanForTasks = scanForTasks;
const uuid_1 = require("uuid");
/**
 * Check if a date string (YYYY-MM-DD) matches a target date (month and day only)
 */
function isDateMatch(dateStr, targetDate) {
    if (!dateStr)
        return false;
    // Handle YYYY-MM-DD format
    const parts = dateStr.split('-');
    if (parts.length !== 3)
        return false;
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    return (day === targetDate.getDate() &&
        month === targetDate.getMonth());
}
/**
 * Create a new task object with denormalized data
 */
function createTask(constituent, type, dueDate, TimestampClass) {
    return {
        id: (0, uuid_1.v4)(),
        constituent_id: constituent.id,
        constituent_name: constituent.name,
        constituent_mobile: constituent.mobile_number,
        ward_number: constituent.ward_number,
        type,
        due_date: TimestampClass.fromDate(dueDate),
        status: 'PENDING',
        created_at: TimestampClass.now(),
    };
}
/**
 * Generates a unique key for task existence check
 */
function getTaskKey(constituentId, type, dueDateStr) {
    return `${constituentId}|${type}|${dueDateStr}`;
}
/**
 * Scan constituents for upcoming birthdays and anniversaries
 * Creates tasks for today and tomorrow
 * Optimized to use Set lookup for O(1) existence check
 */
function scanForTasks(constituents, existingTasks, TimestampClass) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const newTasks = [];
    // Create a Set of existing task keys for O(1) lookup
    const existingTaskKeys = new Set();
    for (const task of existingTasks) {
        let taskDateStr = '';
        if (task.due_date && typeof task.due_date.toDate === 'function') {
            taskDateStr = task.due_date.toDate().toISOString().split('T')[0];
        }
        else if (typeof task.due_date === 'string') {
            taskDateStr = task.due_date;
        }
        // Handle potential schema inconsistency (camelCase vs snake_case)
        const cId = task.constituent_id || task.constituentId;
        if (cId && taskDateStr) {
            existingTaskKeys.add(getTaskKey(cId, task.type, taskDateStr));
        }
    }
    // Helper to check and add task
    const checkAndAddTask = (constituent, type, date) => {
        const dueDateStr = date.toISOString().split('T')[0];
        const key = getTaskKey(constituent.id, type, dueDateStr);
        if (!existingTaskKeys.has(key)) {
            newTasks.push(createTask(constituent, type, date, TimestampClass));
            // Add to Set to prevent duplicates within the same run (though unlikely)
            existingTaskKeys.add(key);
        }
    };
    for (const constituent of constituents) {
        // Check Birthday - Today
        if (isDateMatch(constituent.dob, today)) {
            checkAndAddTask(constituent, 'BIRTHDAY', today);
        }
        // Check Birthday - Tomorrow
        if (isDateMatch(constituent.dob, tomorrow)) {
            checkAndAddTask(constituent, 'BIRTHDAY', tomorrow);
        }
        // Check Anniversary - Today
        if (isDateMatch(constituent.anniversary, today)) {
            checkAndAddTask(constituent, 'ANNIVERSARY', today);
        }
        // Check Anniversary - Tomorrow
        if (isDateMatch(constituent.anniversary, tomorrow)) {
            checkAndAddTask(constituent, 'ANNIVERSARY', tomorrow);
        }
    }
    return {
        count: newTasks.length,
        newTasks,
    };
}
//# sourceMappingURL=dailyScan.js.map