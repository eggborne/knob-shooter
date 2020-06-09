echo -e "\e[1m \e[41m------------------------> - STAGE - Deploying that... - STAGE -    \e[0m";
npm run build;
echo -e "\e[1m \e[41m------------------------------------> BUILT THAT SUCKA     \e[0m";
scp -r -P 21098 dist/* eggbxhyo@68.65.120.149:/home/eggbxhyo/public_html/knobshooter;
echo -e "\e[1m \e[42m---------------------------------------------------------------------------------> SENT HIM OFF :)     \e[0m";
