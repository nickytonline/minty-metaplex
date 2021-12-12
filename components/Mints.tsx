import React from 'react';
import Image from 'next/image';

// TODO: Type mints properly
export const Mints: React.FC<{ mints: any[] }> = ({ mints }) => {
  return (
    <>
      <h3>My Mints ✨</h3>
      {mints.length > 0 ? (
        <ul
          sx={{
            display: 'flex',
            gap: '1rem',
            listStyle: 'none',
            '& img': { borderRadius: '1rem' },
          }}
        >
          {mints.map((mint: any, index: number) => (
            <li key={mint}>
              <Image
                width="200"
                height="200"
                src={mint}
                alt={`Minted NFT #${index + 1}`}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div>You haven&apos;t minted any NFTs yet.</div>
      )}
    </>
  );
};
