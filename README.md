//client
rsync -avz --exclude 'node_modules' --exclude 'server' \
-e "ssh -i ~/.ssh/four-in-a-row-key.pem" \
. ubuntu@ec2-3-139-66-149.us-east-2.compute.amazonaws.com:~/app

// server
rsync -avz --exclude 'node_modules' \
-e "ssh -i ~/.ssh/four-in-a-row-key.pem" \
. ubuntu@ec2-3-139-66-149.us-east-2.compute.amazonaws.com:~/server

rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' \
-e "ssh -i ~/.ssh/your-key.pem" \
. ubuntu@ec2-3-139-66-149.us-east-2.compute.amazonaws.com:~/app

sudo systemctl daemon-reload
sudo systemctl enable myapp.service
sudo systemctl start myapp.service

//logs
sudo journalctl -u myapp.service
sudo journalctl -fu myapp.service //tail

sudo systemctl daemon-reload
sudo systemctl enable myserver.service
sudo systemctl start myserver.service

//logs
sudo journalctl -u myserver.service
sudo journalctl -fu myserver.service 


update the url /etc/app.env file to the current url
to save and exit vim, press esc then :wq then enter