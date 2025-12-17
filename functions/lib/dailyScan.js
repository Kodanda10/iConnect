"use strict";
/**
 * @file dailyScan.ts
 * @description System Brain - Daily scan for birthdays and anniversaries
 * @changelog
 * - 2024-12-11: Initial implementation with TDD
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
    const date = new Date(dateStr);
    return (date.getDate() === targetDate.getDate() &&
        date.getMonth() === targetDate.getMonth());
}
/**
 * Create a new task object
 */
function createTask(constituentId, type, dueDate) {
    return {
        id: (0, uuid_1.v4)(),
        constituentId: constituentId,
        type,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'PENDING',
        createdAt: new Date().toISOString(),
    };
}
/**
 * Check if a task already exists for this constituent, type, and date
 */
function taskExists(existingTasks, constituentId, type, dueDate) {
    return existingTasks.some((task) => task.constituentId === constituentId &&
        task.type === type &&
        task.dueDate === dueDate);
}
/**
 * Scan constituents for upcoming birthdays and anniversaries
 * Creates tasks for today and tomorrow
 */
function scanForTasks(constituents, existingTasks) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const newTasks = [];
    for (const constituent of constituents) {
        // Check Birthday - Today
        if (isDateMatch(constituent.dob, today)) {
            const dueDate = today.toISOString().split('T')[0];
            if (!taskExists(existingTasks, constituent.id, 'BIRTHDAY', dueDate)) {
                newTasks.push(createTask(constituent.id, 'BIRTHDAY', today));
            }
        }
        // Check Birthday - Tomorrow
        if (isDateMatch(constituent.dob, tomorrow)) {
            const dueDate = tomorrow.toISOString().split('T')[0];
            if (!taskExists(existingTasks, constituent.id, 'BIRTHDAY', dueDate)) {
                newTasks.push(createTask(constituent.id, 'BIRTHDAY', tomorrow));
            }
        }
        // Check Anniversary - Today
        if (isDateMatch(constituent.anniversary, today)) {
            const dueDate = today.toISOString().split('T')[0];
            if (!taskExists(existingTasks, constituent.id, 'ANNIVERSARY', dueDate)) {
                newTasks.push(createTask(constituent.id, 'ANNIVERSARY', today));
            }
        }
        // Check Anniversary - Tomorrow
        if (isDateMatch(constituent.anniversary, tomorrow)) {
            const dueDate = tomorrow.toISOString().split('T')[0];
            if (!taskExists(existingTasks, constituent.id, 'ANNIVERSARY', dueDate)) {
                newTasks.push(createTask(constituent.id, 'ANNIVERSARY', tomorrow));
            }
        }
    }
    return {
        count: newTasks.length,
        newTasks,
    };
}
//# sourceMappingURL=dailyScan.js.map