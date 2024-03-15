declare const BUILD_NUM: string;

//import local gameInfo file for this game to be used to customize template scripts
import { gameInfo } from './gameInfo';

//import current template scripts from Temlate Library git repository
import { setGameInfo } from '@gamechangerinteractive/pc-template';

setGameInfo(gameInfo);

// eslint-disable-next-line
console.log('Template Mobile Build =', BUILD_NUM);
