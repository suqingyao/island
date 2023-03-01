import { describe, expect, test } from 'vitest';
import path from 'path';
import { RouteService } from './RouteService';

describe('RouteService', async () => {
  const testDir = path.join(__dirname, 'fixtures');
  const routeService = new RouteService(testDir);
  await routeService.init();

  test('conventional route by file structure', () => {
    const routeMeta = routeService.getRouteMeta().map((item) => {
      return {
        ...item,
        absolutePath: item.absolutePath.replace(testDir, 'TEST_DIR')
      };
    });
    expect(routeMeta).toMatchInlineSnapshot();
  });

  test('Generate route code', () => {
    expect(
      routeService.generateRoutesCode().replaceAll(testDir, 'TEST_DIR')
    ).toMatchInlineSnapshot();
  });
});
