import { getActiveVehicles, getActiveRoutes, getSettingsMap } from './src/lib/data';
(async () => {
  console.time('vehicles');
  const v = await getActiveVehicles('seatac-co');
  console.timeEnd('vehicles');
  console.log('vehicles', v.length);
  console.time('routes');
  const r = await getActiveRoutes('seatac-co');
  console.timeEnd('routes');
  console.log('routes', r.length);
  console.time('settings');
  const s = await getSettingsMap('seatac-co');
  console.timeEnd('settings');
  console.log('settings keys', Object.keys(s).length);
})();
