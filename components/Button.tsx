type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
        fontWeight: 700,
        borderRadius: '0.5rem',
        border: 'none',
        padding: '0.25rem 0.5rem',
        cursor: 'pointer',
        background: 'linear-gradient(to left,#00ff00 0%, #fff 100%)',
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
