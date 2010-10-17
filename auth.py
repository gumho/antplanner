import web

from google.appengine.api import users
from google.appengine.api import memcache

render = web.template.render('templates/')

def requireAdmin(f):
	def wrapper(*args, **kw):
		if users.get_current_user():
			if users.is_current_user_admin():
				return f(*args, **kw)
			else:
				web.seeother(users.create_login_url('/admin'))
		else:
			return web.seeother(users.create_login_url('/admin'))
	
	return wrapper

class admin:
	@requireAdmin
	def GET(self):		
		stats = memcache.get_stats()
		version = memcache.get('websoc-version')
		if version is None:
			version = ''

		logout_link = users.create_logout_url('/admin')
		
		return render.admin(stats, version, logout_link)