import { container } from "../../container";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const uow = container.createUoW();
  const r = await container.command.create(uow)(body).run();
  if (!r.ok) throw createError({ statusCode: 400, data: r.error });
  uow.commit();
  return r.value;
});
