import web
import urllib
import hashlib

import scraper
from auth import *

from google.appengine.api import urlfetch 
from google.appengine.api import memcache
from google.appengine.api import users

urls = (
	'/', 'index',
    '/search', 'search',
	'/schedules', 'schedules',
	'/admin', 'admin',
	'/admin/flush-cache', 'adminFlushCache',
	'/admin/latest-web-soc', 'latestWebSoc'
)

render = web.template.render('templates/')

class index:
	def GET(self):
		return render.index()

class search:
	def GET(self):
		search_page = memcache.get("SEARCH")
		
		if search_page is None:
			try:
				raw_page = urlfetch.fetch("http://websoc.reg.uci.edu")
				search_page = scraper.strip_search(raw_page.content)
				memcache.add("SEARCH", search_page, 60 * 60)
			except urlfetch.Error:
				search_page = "UCI webpage is not available at the moment"
		
		return render.search(search_page)

class schedules:
	def POST(self):
		p = web.input()
		
		form_fields = {
			"Breadth": p.Breadth,
			"CancelledCourses": p.CancelledCourses,
			"ClassType": p.ClassType,
			"CourseCodes": p.CourseCodes,
			"CourseNum"	: p.CourseNum,
			"CourseTitle": p.CourseTitle,
			"Days": p.Days,
			"Dept": p.Dept,
			"Division": p.Division,
			"EndTime": p.EndTime,
			"FontSize": p.FontSize,
			"FullCourses": p.FullCourses,
			"InstrName": p.InstrName,
			"MaxCap": p.MaxCap,
			"StartTime": p.StartTime,
			"Submit": p.Submit,
			"Units": p.Units,
			"YearTerm": p.YearTerm,
		}
		
		try:
			form_fields["ShowComments"] = p.ShowComments
			form_fields["ShowFinals"] = p.ShowFinals
		except AttributeError, e:
			pass
		form_data = urllib.urlencode(form_fields)
		
		form_concat = ''
		for k, v in form_fields.items():
			form_concat += v
		
		#md5 hash of all the form fields used for memcached key
		form_hash = hashlib.md5(form_concat).hexdigest()
		
		schedule_page = memcache.get(form_hash)
		
		if schedule_page is None:
			try:
				raw_page = urlfetch.fetch("http://websoc.reg.uci.edu",
												payload=form_data,
												method=urlfetch.POST,
												headers={'Content-Type': 'application/x-www-form-urlencoded'})
				schedule_page = scraper.strip_schedule(raw_page.content)
				memcache.add(form_hash, schedule_page, 60 * 60)
			except urlfetch.Error:
				schedule_page = "UCI webpage is not available at the moment"
		
		return render.schedule(schedule_page)
				
class admin:
	@requireAdmin
	def GET(self):		
		stats = memcache.get_stats()
		version = memcache.get('websoc-version')
		if version is None:
			version = ''
		
		logout_link = users.get_current_user()
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

if __name__ == "__main__":
    app = web.application(urls, globals())
    app.cgirun()
