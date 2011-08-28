from lib.BeautifulSoup import BeautifulSoup
import re
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
	"""Returns list of professor matches"""
	profs = []
	
	table = BeautifulSoup(html).find('div', {'id': 'ratingTable'})
	if table is None:
		logging.debug(html[500:])
		return profs

	split = name[:-1].upper().split(',')
	qLast = split[0]
 	try:
		qFirst = split[1]
	except:
		qFirst = ''
			
	rows = table.findAll('div', {'class': re.compile(r"entry (odd|even)")})

	for row in rows:
		divName = row.find('div', {'class': 'profName'})
		anchor = divName.find('a')
		profName = unicode(anchor.renderContents().strip(), 'utf-8', 'ignore').upper()
		
		try:
			firstName = profName.split(',')[1]
		except:
			firstName = ''
			
		# logging.info('Searching against: ' + profName)
		
		if profName.startswith(qLast) and qFirst in firstName:						
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

			profs.append({
				'name': profName,
				'href': href,
				'dept': profDept,
				'ratings': profRatings,
				'quality': profQuality,
				'easiness': profEasiness,
				'hot': profHot
			})

	return profs


