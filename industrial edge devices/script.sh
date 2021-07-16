SIGTERM
clear
python3 gantt.py &
python3 sendMessage.py &
python3 sankey_sub.py &
sleep 2s
python3 sankey_pub.py &
python3 line_sub.py &
sleep 2s
python3 line_pub.py &
