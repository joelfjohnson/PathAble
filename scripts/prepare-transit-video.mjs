import {chromium} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
try{const page=await browser.newPage({viewport:{width:1280,height:960}});await page.setContent(`<style>html,body{margin:0;width:100%;height:100%}svg{width:100%;height:100%;display:block}</style>${readFileSync('public/ar/scenes/transit.svg','utf8')}`);await page.screenshot({path:'public/ar/thumbnails/transit.png'});}finally{await browser.close()}
execFileSync(ffmpeg,['-y','-loop','1','-i','public/ar/thumbnails/transit.png','-t','8','-r','24','-c:v','libx264','-preset','fast','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','public/ar/videos/transit-study.mp4'],{stdio:'ignore'});
console.log('Encoded the original illustrative pickup scene; existing photographic and Blender media are unchanged.');
