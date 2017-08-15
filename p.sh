#!/bin/bash
echo "Compiling all the javascripts"
python roadrunner/cacheHtml.py > roadrunner/static/roadrunner/js_src/HtmlCache.js
js=$(cat roadrunner/static/roadrunner/js_src/*.js)
top=$'(function () {\n'
bottom=$'}());\n'
echo "$top$js$bottom" > "roadrunner/static/roadrunner/js/main.js"
