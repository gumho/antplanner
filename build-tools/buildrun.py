import os
os.system('python ../web/template.py --compile ../templates/')
os.system('/usr/local/bin/dev_appserver.py --clear_datastore ../')