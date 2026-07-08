/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const HomeController = () => import('#controllers/home_controller')
const ContactController = () => import('#controllers/contact_controller')
const ArrivalsController = () => import('#controllers/arrivals_controller')
const StatsController = () => import('#controllers/stats_controller')

router.get('/', [HomeController, 'index']).use([middleware.trackVisit()])
router.post('/contact', [ContactController, 'store'])
router.post('/api/arrival', [ArrivalsController, 'store'])
router.get('/stats', [StatsController, 'show'])
