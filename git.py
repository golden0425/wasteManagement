import os

os.system("git pull")
os.system("git fetch --all")
os.system("git add .")
os.system("git commit -m docs:文件名修改")
# os.system("git commit -m feat:'TS 对赌项目 第一天笔记'")
# os.system("git commit -m chore:'目录调整'")
# os.system("git commit -m style:'Vue3 源码解析 (mount 函数完成) 格式调整'")
os.system("git push")



