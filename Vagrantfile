# -*- mode: ruby -*-
# vi: set ft=ruby :

$script = <<SCRIPT
echo "Installing Docker..."
sudo apt-get update
sudo apt-get remove docker docker-engine docker.io
echo '* libraries/restart-without-asking boolean true' | sudo debconf-set-selections
sudo apt-get install apt-transport-https ca-certificates curl software-properties-common -y
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg |  sudo apt-key add -
sudo apt-key fingerprint 0EBFCD88
sudo add-apt-repository \
      "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) \
      stable"
sudo apt-get update
sudo apt-get install -y docker-ce
# Restart docker to make sure we get the latest version of the daemon if there is an upgrade
sudo service docker restart
# Make sure we can actually use docker as the vagrant user
sudo usermod -aG docker vagrant
sudo docker --version

SCRIPT

Vagrant.configure(2) do |config|
  config.vm.box = "bento/ubuntu-18.04" # 18.04 LTS
  config.vm.hostname = "docker"
  config.vm.provision "shell", inline: $script, privileged: false
	#config.vm.network "private_network", ip: "192.168.50.4"

  # Expose minio port
  config.vm.network "forwarded_port", guest: 9000, host: 9000, auto_correct: true, host_ip: "127.0.0.1"

  # mem
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "2048"
  end

end
