// import { Button } from '@components/Button';
import { Button } from '@components/Button';
import Image from 'next/image';

interface WalletProps {
  walletAddress: string | undefined;
  connectWallet: () => void;
}

export const Wallet: React.FC<WalletProps> = ({
  walletAddress,
  connectWallet,
}) => {
  return (
    <div sx={{ display: 'grid', placeItems: 'center', margin: '1rem 0' }}>
      {walletAddress ? (
        <span
          sx={{
            display: 'inline-flex',
            fontWeight: 500,
            borderRadius: '0.5rem',
          }}
        >
          <span sx={{ marginRight: '0.25rem' }}>Account:</span>{' '}
          <a
            sx={{ wordBreak: 'break-word' }}
            target="solscan"
            href={`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`}
          >
            {walletAddress}
          </a>
        </span>
      ) : (
        <div sx={{ display: 'grid', gridGap: '1rem' }}>
          <Image
            src="https://media.giphy.com/media/3o6UB5RrlQuMfZp82Y/giphy.gif"
            layout="responsive"
            width="480"
            height="356"
            alt="John Travolta in Pulp Fiction wandering around inside a wallet"
          />
          <Button onClick={connectWallet}>Connect Wallet</Button>
        </div>
      )}
    </div>
  );
};
