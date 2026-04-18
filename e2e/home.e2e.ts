import {device, element, by, expect as detoxExpect} from 'detox';

describe('Home Screen', () => {
  beforeAll(async () => {
    await device.launchApp({newInstance: true});
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('shows the app title', async () => {
    await detoxExpect(element(by.text('Lens'))).toBeVisible();
  });

  it('shows empty state when no documents exist', async () => {
    await detoxExpect(element(by.id('empty-state'))).toBeVisible();
    await detoxExpect(element(by.text('No scans yet'))).toBeVisible();
  });

  it('shows the scan FAB', async () => {
    await detoxExpect(element(by.id('scan-fab'))).toBeVisible();
  });

  it('scan FAB label reads Scan', async () => {
    await detoxExpect(element(by.text('Scan'))).toBeVisible();
  });
});
