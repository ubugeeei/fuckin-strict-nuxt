export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      title: "DMMF Todo App - 関数型ドメインモデリング",
      meta: [
        {
          name: "description",
          content: "Domain Modeling Made Functionalの概念を反映したTodoアプリ",
        },
      ],
      link: [{ rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/water.css@2/out/water.css" }],
    },
  },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2024-11-01",
  typescript: {
    strict: true,
  },
});
