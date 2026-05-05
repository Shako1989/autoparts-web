import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Hello</Button>);
    expect(screen.getByRole('button', { name: 'Hello' })).toBeInTheDocument();
  });

  it('applies the variant class for secondary', () => {
    render(<Button variant="secondary">x</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');
  });
});
