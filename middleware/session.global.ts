export default defineNuxtRouteMiddleware((to) => {
  const session = useSessionStore()
  const hasMode = session.eventMode !== null
  const hasCode = session.activityCode !== null
  const hasRole = session.selectedRole !== null

  if (to.path === '/join' && !hasMode) return navigateTo('/')

  if (to.path === '/role-selection') {
    if (!hasMode) return navigateTo('/')
    if (!hasCode) return navigateTo('/join')
  }

  if (to.path === '/portal') {
    if (!hasMode) return navigateTo('/')
    if (!hasCode) return navigateTo('/join')
    if (!hasRole) return navigateTo('/role-selection')
  }
})
