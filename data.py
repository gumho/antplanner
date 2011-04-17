from google.appengine.ext import db

class Schedule(db.Model):
    caldata = db.TextProperty(required=True)
    modified = db.DateProperty(required=True, auto_now=True)

def save_schedule(username, caldata):
	# TODO: error handling
	s = Schedule(key_name=username, caldata=caldata)
	s.put()
	
def load_schedule(username):
	return Schedule.get_by_key_name(username).caldata