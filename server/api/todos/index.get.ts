import { container } from "../../container";

export default defineEventHandler(async () => {
  const r = await container.query.getAll(true).run();
  return r.ok ? r.value : [];
});
