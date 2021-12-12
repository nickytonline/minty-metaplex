import { MouseEventHandler } from 'react';
import { Button } from '@components/Button';

export const Minter: React.FC<{
  onMint: MouseEventHandler<HTMLButtonElement>;
  isSoldOut: boolean;
}> = ({ onMint, isSoldOut }) => {
  if (isSoldOut) {
    return (
      <div
        sx={{
          fontWeight: 700,
          backgroundColor: '#000000',
          color: '#ff0000',
          fontSize: '2rem',
          border: '4px solid #ff0000',
          padding: '0.5rem',
          transform: 'rotate(-15deg) scale(1.5) translateY(-25%)',
        }}
      >
        sold out!
      </div>
    );
  }
  return (
    <Button className="cta-button mint-button" onClick={onMint}>
      Mint NFT
    </Button>
  );
};
