import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Accordion } from './Accordion';

describe('Accordion', () => {
  it('renders title', () => {
    render(<Accordion title="Section">Content</Accordion>);
    expect(screen.getByText('Section')).toBeInTheDocument();
  });

  it('does not render content by default', () => {
    const { container } = render(<Accordion title="Closed">Hidden</Accordion>);
    expect(container.querySelector('.accordion-content')).not.toBeInTheDocument();
  });

  it('renders content when defaultOpen={true}', () => {
    render(
      <Accordion title="Open" defaultOpen>
        Visible
      </Accordion>
    );
    expect(screen.getByText('Visible')).toBeInTheDocument();
  });

  it('toggles content on header click', async () => {
    render(<Accordion title="Toggle">Content</Accordion>);
    const header = screen.getByRole('button');

    // Initially closed
    expect(screen.queryByText('Content')).not.toBeInTheDocument();

    // Click to open
    await userEvent.click(header);
    expect(screen.getByText('Content')).toBeInTheDocument();

    // Click to close
    await userEvent.click(header);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(<Accordion title="With badge" badge="(5/10)">Content</Accordion>);
    expect(screen.getByText('(5/10)')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<Accordion title="With icon" icon="⚽">Content</Accordion>);
    expect(screen.getByText('⚽')).toBeInTheDocument();
  });

  it('updates aria-expanded on toggle', async () => {
    render(<Accordion title="Aria">Content</Accordion>);
    const header = screen.getByRole('button');

    expect(header).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });
});
