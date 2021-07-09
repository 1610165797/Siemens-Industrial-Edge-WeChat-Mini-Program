SIGTERM
clear
gnome-terminal -e "python3 gantt.py"
gnome-terminal -e "python3 sendMessage.py"
gnome-terminal -e "python3 sankey_sub.py"
sleep 2s
gnome-terminal -e "python3 sankey_pub.py"
gnome-terminal -e "python3 line_pub.py"
sleep 2s
gnome-terminal -e "python3 line_sub.py"
