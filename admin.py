import web

import scraper
from auth import requireAdmin
from data import Schedule
from google.appengine.ext import db
from datetime import date, timedelta

from google.appengine.api import memcache
from google.appengine.api import urlfetch

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
		DELETE_DATE_THRESHOLD = date.today() - timedelta(1 * 30) #approx. 1 month
		db.delete(Schedule.gql("WHERE modified <= :1", DELETE_DATE_THRESHOLD))