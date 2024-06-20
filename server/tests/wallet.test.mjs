import { it, describe, expect, beforeEach } from 'vitest';
import Wallet from '../models/Wallet.mjs';
import { verifySignature } from '../utilities/crypto-lib.mjs';
import Transaction from '../models/Transaction.mjs';
import Blockchain from '../models/Blockchain.mjs';
import { INITIAL_BALANCE } from '../config/settings.mjs';

describe('Wallet', () => {
  let wallet; 

  beforeEach(() => {
    wallet = new Wallet();
  });

  describe('Properties', () => {
    it('should have a property named balance', () => {
      expect(wallet).toHaveProperty('balance');
    });

    it('should have a property named publicKey', () => {
      expect(wallet).toHaveProperty('publicKey');
    });
  });

  describe('Signing Process', () => {
    let data = 'test';

    it('should verify a signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data),
        })
      ).toBe(true);
    });

    it('should not verify an invalid signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data),
        })
      ).toBe(false);
    });
  });

});
