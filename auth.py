import web
from google.appengine.api import users

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