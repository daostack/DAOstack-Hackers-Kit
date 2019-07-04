import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  EthereumEvent,
  store,
  Value,
} from '@graphprotocol/graph-ts';
import { ContractInfo, Debug } from './types/schema';

export function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i];
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j];
  }
  return out as ByteArray;
}

export function eventId(event: EthereumEvent): string {
  return crypto
    .keccak256(
      concat(event.transaction.hash, event.transactionLogIndex as ByteArray),
    )
    .toHex();
}

export function hexToAddress(hex: string): Address {
  return Address.fromString(hex.substr(2));
}

/**
 * WORKAROUND: there's no `console.log` functionality in mapping.
 * so we use `debug(..)` which writes a `Debug` entity to the store so you can see them in graphiql.
 */
let debugId = 0;
export function debug(msg: string): void {

  let id = BigInt.fromI32(debugId).toHex();
  let ent = new Debug(id);
  ent.set('message', Value.fromString(msg));
  store.set('Debug', id, ent);
  debugId++;
}

export function equalsBytes(a: Bytes, b: Bytes): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function equalStrings(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i].charCodeAt(0) !== b[i].charCodeAt(0)) {
      return false;
    }
  }
  return true;
}

export function setContractInfo(address: string, name: string, version: string): void {
    let contractInfo = ContractInfo.load(address);
    if (contractInfo == null) {
        contractInfo = new  ContractInfo(address);
        contractInfo.address = Address.fromString(address);
        contractInfo.name =  name;
        contractInfo.version = version;
        contractInfo.save();
    }
}
