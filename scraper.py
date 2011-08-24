from lib.BeautifulSoup import BeautifulSoup
import re
from django.utils import simplejson as json
import logging

def strip_search(html):
	form_html = BeautifulSoup(html).find('form', action='http://websoc.reg.uci.edu/')
	
	#replace form submit with our own link
	form_html['action'] = '/schedules'
	
	#remove 'Display Text Results' button
	text_buttons = form_html.findAll(attrs={"class" : "banner-width"})
	for i in text_buttons:
		i.replaceWith('<p id=\"submit-container\"><input type="submit" value="Display Results" name="Submit"></p>')
	
	return str(form_html)
	
def strip_schedule(html):
	schedule_html = BeautifulSoup(html).find('div', 'course-list')
	if schedule_html is None:
		return "<p id=\"error\">No results were found.</p>"
	else:
		return str(schedule_html)

def strip_websoc_version(html):
	version_matches = re.findall('version.{,8}', html)
	
	if not version_matches:
		return 'Couldn\'t find a match'
	else:
		return version_matches[0]
	
	
def strip_professors(html, name):
	table = BeautifulSoup(html).find('div', {'id': 'ratingTable'})
	if table is None:
		logging.debug(html[500:])
		return '{"Error while parsing table at RateMyProfessors.com":""}'
	else:
		profs = list()
		name = name.upper()
		split = name.split(',');
		qLastName = split[0].strip()
		qFirstName = split[1].strip()
		if (qFirstName == None or qFirstName == ''):
			qFirstName = '!'
		rows = table.findAll('div', {'class': re.compile(r".*\bentry\b.*")})
		for row in rows:
			divName = row.find('div', {'class': 'profName'})
			anchor = divName.find('a')
			profName = unicode(anchor.renderContents().strip(), 'utf-8', 'ignore').upper()
			split = profName.split(',');
			lastName = split[0].strip()
			firstName = split[1].strip()
			if (firstName == None or firstName == ''):
				firstName = '!'
			#logging.debug(qLastName + ' =? ' + lastName + ' && ' + qFirstName + ' =? ' + firstName)
			if lastName == qLastName and firstName[0] == qFirstName[0]:
				href = 'http://www.ratemyprofessors.com/' + anchor['href'].strip()
				profDept = row.find('div', {'class': 'profDept'}).renderContents().strip()
				profRatings = row.find('div', {'class': 'profRatings'}).renderContents().strip()
				profQuality = row.find('div', {'class': 'profAvg'}).renderContents().strip()
				profEasiness = row.find('div', {'class': 'profEasy'}).renderContents().strip()
				profHot = row.find('div', {'class': re.compile(r".*\bprofHot\b.*")}).renderContents().strip()
				if profHot == 'Hot':
					profHot = '&#x2713;'
				else:
					profHot = '&nbsp;'
				
				prof = {'name': profName,
						'href': href,
						'dept': profDept,
						'ratings': profRatings,
						'quality': profQuality,
						'easiness': profEasiness,
						'hot': profHot
						}
				#logging.debug(prof)
				profs.append(prof)
		return json.dumps(profs)