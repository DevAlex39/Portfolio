/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const HomeController = () => import('#controllers/home_controller')
const ContactController = () => import('#controllers/contact_controller')
const ArrivalsController = () => import('#controllers/arrivals_controller')

router.get('/', [HomeController, 'index'])
router.post('/contact', [ContactController, 'store'])
router.post('/api/arrival', [ArrivalsController, 'store'])
