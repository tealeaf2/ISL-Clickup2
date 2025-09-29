/**
 * Test utilities and helpers for the task dependency map application
 */

import React from 'react';
import { render } from '@testing-library/react';

/**
 * Custom render function that includes providers
 * @param {React.Component} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result
 */
export const renderWithProviders = (ui, options = {}) => {
  const AllTheProviders = ({ children }) => {
    return (
      <div>
        {children}
      </div>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

/**
 * Create a mock task object for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock task object
 */
export const createMockTask = (overrides = {}) => ({
  id: 'T1',
  name: 'Test Task',
  owner: 'Test Owner',
  status: 'todo',
  start: 0,
  duration: 5,
  lane: 0,
  parentId: null,
  depends: [],
  estimatedHours: 8,
  priority: 'medium',
  ...overrides,
});

/**
 * Create a mock task with rectangle for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock task with rect
 */
export const createMockTaskWithRect = (overrides = {}) => ({
  ...createMockTask(overrides),
  rect: {
    x: 110,
    y: 110,
    w: 700,
    h: 26,
  },
});

/**
 * Create mock tasks array for testing
 * @param {number} count - Number of tasks to create
 * @returns {Array} Array of mock tasks
 */
export const createMockTasks = (count = 3) => {
  return Array.from({ length: count }, (_, index) => 
    createMockTask({
      id: `T${index + 1}`,
      name: `Task ${index + 1}`,
      start: index * 5,
      lane: index,
    })
  );
};

/**
 * Create mock dependencies array for testing
 * @param {Array} tasks - Array of tasks
 * @returns {Array} Array of dependencies
 */
export const createMockDependencies = (tasks) => {
  if (tasks.length < 2) return [];
  
  return [
    { from: tasks[0].id, to: tasks[1].id },
    ...(tasks.length > 2 ? [{ from: tasks[1].id, to: tasks[2].id }] : []),
  ];
};

/**
 * Mock event object for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock event
 */
export const createMockEvent = (overrides = {}) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  clientX: 100,
  clientY: 100,
  button: 0,
  target: {
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
    }),
  },
  ...overrides,
});

/**
 * Mock pointer event for testing
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock pointer event
 */
export const createMockPointerEvent = (overrides = {}) => ({
  ...createMockEvent(overrides),
  pointerId: 1,
  type: 'pointerdown',
});

/**
 * Wait for async operations to complete
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export const waitFor = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock console methods to avoid test output
 */
export const mockConsole = () => {
  const originalConsole = { ...console };
  
  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });
  
  afterEach(() => {
    Object.assign(console, originalConsole);
  });
};

/**
 * Create a mock container ref for testing
 * @returns {Object} Mock container ref
 */
export const createMockContainerRef = () => ({
  current: {
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
    }),
    setPointerCapture: jest.fn(),
    releasePointerCapture: jest.fn(),
  },
});

/**
 * Test data factory for different scenarios
 */
export const TestDataFactory = {
  /**
   * Create a simple project with tasks
   */
  createSimpleProject: () => ({
    tasks: [
      createMockTask({ id: 'P', name: 'Project Alpha', duration: 15 }),
      createMockTask({ id: 'T1', name: 'Task 1', start: 0, duration: 5, depends: ['P'] }),
      createMockTask({ id: 'T2', name: 'Task 2', start: 5, duration: 5, depends: ['T1'] }),
    ],
    dependencies: [
      { from: 'P', to: 'T1' },
      { from: 'T1', to: 'T2' },
    ],
  }),

  /**
   * Create a complex project with multiple lanes
   */
  createComplexProject: () => ({
    tasks: [
      createMockTask({ id: 'P', name: 'Project Beta', duration: 20 }),
      createMockTask({ id: 'T1', name: 'Frontend', start: 0, duration: 10, lane: 0 }),
      createMockTask({ id: 'T2', name: 'Backend', start: 0, duration: 10, lane: 1 }),
      createMockTask({ id: 'T3', name: 'Integration', start: 10, duration: 5, lane: 0, depends: ['T1', 'T2'] }),
    ],
    dependencies: [
      { from: 'T1', to: 'T3' },
      { from: 'T2', to: 'T3' },
    ],
  }),
};

// Re-export everything for convenience
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
