import { Array, Order } from "effect";

const byName = Order.mapInput(
  Order.string,
  (script: { name: string }) => script.name,
);
const byUsage = Order.mapInput(
  Order.number,
  (script: { usage: number }) => script.usage,
);
export const sortByUsageAndName = Array.sort(
  Order.combine<{ name: string; usage: number }>(
    Order.reverse(byUsage),
    byName,
  ),
);
