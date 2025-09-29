import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskPage from '../../src/components/Homepage';

describe('TaskPage Component', () => {
    beforeEach(() => {
        render(<TaskPage />);
    });

    const getGroupHeaderByText = (text: any) => {
        const candidates = screen.getAllByText(text);
        return candidates.find(el => el.closest('tr') === null);
    };

    it('should render the main title and task groups', () => {
        expect(screen.getByRole('heading', { name: /tasks/i })).toBeInTheDocument();

        expect(getGroupHeaderByText('Todo')).toBeInTheDocument();
        expect(getGroupHeaderByText('In Progress')).toBeInTheDocument();
        expect(getGroupHeaderByText('Complete')).toBeInTheDocument();
    });

    it('should expand and collapse subtasks on click', () => {
        const parentTaskName = 'Design homepage';
        const subtaskName = 'Wireframe header';

        expect(screen.queryByText(subtaskName)).not.toBeInTheDocument();

        const parentRow = screen.getByText(parentTaskName).closest('tr');
        const toggleButton = parentRow?.querySelector('div[style*="cursor: pointer"]');
        
        expect(toggleButton).toBeInTheDocument();
        fireEvent.click(toggleButton);

        expect(screen.getByText(subtaskName)).toBeInTheDocument();
        const icon = toggleButton?.querySelector('span');
        expect(icon?.textContent).toBe('▾');

        fireEvent.click(toggleButton);
        expect(screen.queryByText(subtaskName)).not.toBeInTheDocument();
        expect(icon?.textContent).toBe('▸');
    });
});

