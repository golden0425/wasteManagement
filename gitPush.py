import os
import sys

msg = ''

os.system("git pull")
os.system("git fetch --all")
os.system("git add .")
msg = os.system( "input()" )
os.system("git commit -m {msg}")
os.system("git push")



