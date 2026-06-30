import router from '@adonisjs/core/services/router'

router.get('/', async ({ inertia }) => {
  return inertia.render('Home')
})
