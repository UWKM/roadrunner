#!/usr/bin/python
import os

js = 'var HtmlCache = {'

# traverse html directory, make a list of all the html files
for root, dirs, files in os.walk("roadrunner/static/roadrunner/html/"):
    for file in files:
        fileFront, fileExtension = os.path.splitext(file)
        if(fileExtension == '.html'):
            with open('roadrunner/static/roadrunner/html/' + file, 'r') as myfile:
                # read data, and remove all the newlines
                data = myfile.read().replace('\n', '').replace('\'','\\\'')
                js = js + '\n' + '\'' + fileFront + '\'' + ': \'' + data + '\',\n'

js = js + '};'
print(js)
