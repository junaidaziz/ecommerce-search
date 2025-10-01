import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SocialButton from '@components/UI/SocialButton';
import GoogleIcon from '@components/icons/GoogleIcon';
import FacebookIcon from '@components/icons/FacebookIcon';
import GithubIcon from '@components/icons/GithubIcon';

describe('SocialButton', () => {
  it('renders Google button correctly', () => {
    const onClick = jest.fn();
    render(
      <SocialButton
        icon={<GoogleIcon className="h-5 w-5" />}
        provider="Google"
        onClick={onClick}
      />
    );
    
    const button = screen.getByRole('button', { name: /continue with google/i });
    expect(button).toBeInTheDocument();
  });

  it('renders Facebook button correctly', () => {
    const onClick = jest.fn();
    render(
      <SocialButton
        icon={<FacebookIcon className="h-5 w-5" />}
        provider="Facebook"
        onClick={onClick}
      />
    );
    
    const button = screen.getByRole('button', { name: /continue with facebook/i });
    expect(button).toBeInTheDocument();
  });

  it('renders GitHub button correctly', () => {
    const onClick = jest.fn();
    render(
      <SocialButton
        icon={<GithubIcon className="h-5 w-5" />}
        provider="GitHub"
        onClick={onClick}
      />
    );
    
    const button = screen.getByRole('button', { name: /continue with github/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(
      <SocialButton
        icon={<GoogleIcon className="h-5 w-5" />}
        provider="Google"
        onClick={onClick}
      />
    );
    
    const button = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders custom children text', () => {
    const onClick = jest.fn();
    render(
      <SocialButton
        icon={<GoogleIcon className="h-5 w-5" />}
        provider="Google"
        onClick={onClick}
      >
        Custom Text
      </SocialButton>
    );
    
    expect(screen.getByText('Custom Text')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const onClick = jest.fn();
    const { container } = render(
      <SocialButton
        icon={<GoogleIcon className="h-5 w-5" />}
        provider="Google"
        onClick={onClick}
        className="custom-class"
      />
    );
    
    const button = container.querySelector('.custom-class');
    expect(button).toBeInTheDocument();
  });

  it('has transition styles for all providers', () => {
    const onClick = jest.fn();
    
    // Test Google
    const { rerender, container } = render(
      <SocialButton
        icon={<GoogleIcon className="h-5 w-5" />}
        provider="Google"
        onClick={onClick}
      />
    );
    let button = container.querySelector('button');
    expect(button?.className).toContain('transition-all');
    expect(button?.className).toContain('duration-200');

    // Test Facebook
    rerender(
      <SocialButton
        icon={<FacebookIcon className="h-5 w-5" />}
        provider="Facebook"
        onClick={onClick}
      />
    );
    button = container.querySelector('button');
    expect(button?.className).toContain('transition-all');
    expect(button?.className).toContain('duration-200');

    // Test GitHub
    rerender(
      <SocialButton
        icon={<GithubIcon className="h-5 w-5" />}
        provider="GitHub"
        onClick={onClick}
      />
    );
    button = container.querySelector('button');
    expect(button?.className).toContain('transition-all');
    expect(button?.className).toContain('duration-200');
  });
});
