// template.js
module.exports = {
  viewRouterTemplate: viewName => `{
        path: '/${viewName}',
        name: '${viewName}',
        component: () => import("@/pages/${viewName}/${viewName}")
    }\n`,
  routerTemplate: fileName => `
    import Vue from 'vue'
    import Router from 'vue-router'
    Vue.use(Router)
    let router = new Router({
            mode: 'hash',
            routes: [
                {
                    path: '/${fileName}',
                    name: ${fileName},
                    component: () => import("@/views/${fileName}/${fileName}")
                }
            ]
    })
    router.beforeEach((to, from, next) => {
    next();
    })
    export default router
    `
}
