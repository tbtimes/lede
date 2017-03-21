mkdir -p ~/.watchman
cd ~/.watchman
git clone https://github.com/facebook/watchman.git
cd watchman
git checkout v4.7.0
./autogen.sh
./configure --without-puthon --without-pcre
make
sudo make install