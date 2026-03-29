import type { SnapState } from './schema';
import { DEFAULT_STATE } from './schema';

export async function getState(): Promise<SnapState> {
  const state = await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });
  if (!state) return { ...DEFAULT_STATE };
  return state as SnapState;
}

export async function updateState(newState: SnapState): Promise<void> {
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState },
  });
}
