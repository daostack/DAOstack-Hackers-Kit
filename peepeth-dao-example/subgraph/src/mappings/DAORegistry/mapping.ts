import 'allocator/arena';

// Import event types from the Token contract ABI
import { Propose, Register, UnRegister } from '../../types/DAORegistry/DAORegistry';

import * as domain from '../../domain';

export function handlePropose(event: Propose): void {
  domain.daoRegister(event.params._avatar, 'proposed');
}

export function handleRegister(event: Register): void {
  domain.daoRegister(event.params._avatar, 'registered');
}

export function handleUnRegister(event: UnRegister): void {
  domain.daoRegister(event.params._avatar, 'unRegistered');
}
