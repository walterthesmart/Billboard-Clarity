import { describe, it, expect } from 'vitest';
import { Cl } from '@stacks/transactions';
import { initSimnet } from '@hirosystems/clarinet-sdk';

const simnet = await initSimnet();

describe('Billboard Contract Tests', () => {
  it('should allow setting and getting messages with payment', () => {
    const accounts = simnet.getAccounts();
    const wallet1 = accounts.get('wallet_1')!;
    const deployer = accounts.get('deployer')!;

    // Test setting first message
    const setMessage1 = simnet.callPublicFn(
      'billboard',
      'set-message',
      [Cl.stringUtf8('testing')],
      wallet1
    );
    expect(setMessage1.result).toBeOk(Cl.uint(110)); // price increases by 10

    // Test getting the message
    const getMessage1 = simnet.callReadOnlyFn(
      'billboard',
      'get-message',
      [],
      wallet1
    );
    expect(getMessage1.result).toBeUtf8('testing');

    // Test setting second message
    const setMessage2 = simnet.callPublicFn(
      'billboard',
      'set-message',
      [Cl.stringUtf8('testing...')],
      wallet1
    );
    expect(setMessage2.result).toBeOk(Cl.uint(120)); // price increases by 10 again

    // Test getting the updated message
    const getMessage2 = simnet.callReadOnlyFn(
      'billboard',
      'get-message',
      [],
      wallet1
    );
    expect(getMessage2.result).toBeUtf8('testing...');

    // Verify STX transfer events
    expect(setMessage1.events).toHaveLength(1);
    const transferEvent1 = setMessage1.events[0];
    expect(transferEvent1.event).toBe('stx_transfer_event');
    expect(transferEvent1.data.sender).toBe(wallet1);
    expect(transferEvent1.data.recipient).toBe(`${deployer}.billboard`);
    expect(transferEvent1.data.amount).toBe('100');
  });

  it('should return correct initial price', () => {
    const accounts = simnet.getAccounts();
    const wallet1 = accounts.get('wallet_1')!;

    const getPrice = simnet.callReadOnlyFn(
      'billboard',
      'get-price',
      [],
      wallet1
    );
    expect(getPrice.result).toBeUint(100);
  });

  it('should return correct initial message', () => {
    const accounts = simnet.getAccounts();
    const wallet1 = accounts.get('wallet_1')!;

    const getMessage = simnet.callReadOnlyFn(
      'billboard',
      'get-message',
      [],
      wallet1
    );
    expect(getMessage.result).toBeUtf8('Hello world!');
  });
});