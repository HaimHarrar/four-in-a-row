# EC2 Server
## move client files to ec2 instance 
`rsync -avz --exclude 'node_modules' --exclude 'server' --exclude '.git' -e "ssh -i ~/.ssh/four-in-a-row-key.pem" . ubuntu@ec2-(ec2Ip).us-east-2.compute.amazonaws.com:~/app`

## move server file to ec2 instance
`rsync -avz --exclude 'node_modules' --exclude '.git' -e "ssh -i ~/.ssh/four-in-a-row-key.pem" . ubuntu@ec2-(ec2Ip).us-east-2.compute.amazonaws.com:~/server`


## start client on ec2 instance
sudo systemctl daemon-reload
sudo systemctl enable myapp.service
sudo systemctl start myapp.service

### configure client logs path
sudo journalctl -u myapp.service
sudo journalctl -fu myapp.service //tail


## start server on ec2 instance
sudo systemctl daemon-reload
sudo systemctl enable myserver.service
sudo systemctl start myserver.service

### configure server logs path
sudo journalctl -u myserver.service
sudo journalctl -fu myserver.service 

## configure server ip for client
update the url `/etc/app.env` file to the current ec2 instance ip
to save and exit vim, press esc then :wq then enter