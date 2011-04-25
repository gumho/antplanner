import web

import scraper
from schedule import Schedule
from datetime import date, timedelta

from google.appengine.ext import db
from google.appengine.api import memcache
from google.appengine.api import urlfetch
from google.appengine.api import users

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
		
class adminFlushCache:
	@requireAdmin
	def POST(self):		
		if memcache.flush_all():
			message = "Cache successfully flushed."
		else:
			message = "Cache couldn't be flushed. Server or RPC error."

		raise web.seeother('/admin')

class latestWebSoc:
	@requireAdmin
	def POST(self):
		try:
			page = urlfetch.fetch("http://websoc.reg.uci.edu")
			version = scraper.strip_websoc_version(page.content)
			memcache.add('websoc-version', version, 60 * 60 * 6)
		except urlfetch.Error:
			memcache.add('websoc-version', 'websoc down?', 30)

		raise web.seeother('/admin')

class deleteOldSchedules:
	@requireAdmin
	def GET(self):
		try:
			DELETE_DATE_THRESHOLD = date.today() - timedelta(1 * 30) #approx. 1 month
			db.delete(Schedule.gql("WHERE modified <= :1", DELETE_DATE_THRESHOLD))
			return 'Successfully deleted all schedules before %s' % DELETE_DATE_THRESHOLD
		except:
			return 'Problem deleting old schedules..'