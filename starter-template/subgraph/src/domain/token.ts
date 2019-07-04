import { Address, store } from '@graphprotocol/graph-ts';
import { DAOToken } from '../types/DAOToken/DAOToken';
import { Token } from '../types/schema';

export function getToken(id: string): Token {
  let token = store.get('Token', id) as Token;
  if (token == null) {
    token = new Token(id);
  }

  return token;
}

export function saveToken(token: Token): void {
  store.set('Token', token.id, token);
}

export function insertToken(tokenAddress: Address, daoId: string): void {
  let tok = DAOToken.bind(tokenAddress);
  let token = getToken(tokenAddress.toHex());
  token.dao = daoId;
  token.name = tok.name();
  token.symbol = tok.symbol();
  token.totalSupply = tok.totalSupply();
  saveToken(token);
}

export function updateTokenTotalSupply(tokenAddress: Address): void {
  let tok = DAOToken.bind(tokenAddress);
  let token = getToken(tokenAddress.toHex());
  token.totalSupply = tok.totalSupply();
  saveToken(token);
}
