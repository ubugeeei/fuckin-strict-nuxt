import { container } from "../../../container";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")!;
  const uow = container.createUoW();
  const r = await container.command.archive(uow)(id).run();
  if (!r.ok)
    throw createError({ statusCode: r.error._tag === "NotFound" ? 404 : 400, data: r.error });
  uow.commit();
  return r.value;
});
