"use client";

import React, { useState, useEffect } from 'react';
import { getTokensAction } from '@/app/wallets/actions';
import { Tokens } from '@/types/appwrite.d.ts';
import Card from './ui/Card';

interface TokenListProps {
  walletId: string;
}

export default function TokenList({ walletId }: TokenListProps) {
  const [tokens, setTokens] = useState<Tokens[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTokens() {
      try {
        const fetchedTokens = await getTokensAction(walletId);
        setTokens(fetchedTokens);
      } catch (err) {
        setError('Failed to fetch tokens.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchTokens();
  }, [walletId]);

  if (isLoading) {
    return <p>Loading tokens...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (tokens.length === 0) {
    return <p>No tokens found for this wallet.</p>;
  }

  return (
    <div className="space-y-2 mt-4">
      <h4 className="text-md font-semibold">Tokens</h4>
      {tokens.map((token) => (
        <Card key={token.$id} className="p-2">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{token.name} ({token.symbol})</p>
              <p className="text-sm text-gray-500">{token.balance}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">{token.network}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
