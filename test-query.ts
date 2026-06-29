import { getRolling12MonthsByType } from './lib/queries';

async function test() {
  const data = await getRolling12MonthsByType();
  console.log(data);
}

test();
