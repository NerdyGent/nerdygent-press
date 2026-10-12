"""NerdyGent Press concept films. Pillow + imageio-ffmpeg; no live integrations.
Run: python render_films.py --out ../../public/films
Outputs 1280x800 H264 silent 24 fps MP4 plus poster and QA frames.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, subprocess, pathlib, argparse, os
import imageio_ffmpeg
OUT=pathlib.Path(__file__).parent / 'output'
W,H,FPS,SECONDS=1280,800,24,12
BG='#f4f2ec'; INK='#20211f'; MUTED='#7d807a'; LINE='#dedfd8'; ACC='#8d342e'; WHITE='#fffefa'; PALE='#f3e9e4'
FONT=os.environ.get('PRESS_FONT_DIR','/System/Library/Fonts/Supplemental/')
if not FONT.endswith('/'): FONT+='/'
def font(n,serif=False,bold=False):
 return ImageFont.truetype(FONT+('Georgia Bold.ttf' if bold else 'Georgia.ttf') if serif else FONT+('Arial Bold.ttf' if bold else 'Arial.ttf'),n)
def text(d,xy,s,n=18,fill=INK,serif=False,bold=False,anchor=None): d.text(xy,s,font=font(n,serif,bold),fill=fill,anchor=anchor)
def ease(t):
 t=max(0,min(1,t)); return t*t*(3-2*t)
def rule(d,x,y,w,color=LINE): d.line((x,y,x+w,y),fill=color,width=1)
def paragraph(d,x,y,width,rows=6,spacing=9):
 for j in range(rows): d.rounded_rectangle((x,y+j*spacing,x+width*(.73 if j==rows-1 else 1),y+j*spacing+2),radius=1,fill='#b7b9b1')
def label(d,x,y,s): text(d,(x,y),s,11,MUTED,bold=True)
def window():
 im=Image.new('RGB',(W,H),BG); shadow=Image.new('RGBA',(W,H)); dr=ImageDraw.Draw(shadow);dr.rounded_rectangle((104,155,1176,727),radius=15,fill=(28,30,24,25));shadow=shadow.filter(ImageFilter.GaussianBlur(19));im.paste(shadow,(0,0),shadow)
 d=ImageDraw.Draw(im);d.rounded_rectangle((100,142,1180,720),radius=13,fill=WHITE,outline='#d7d9d0',width=1);d.line((101,192,1179,192),fill=LINE,width=1)
 for i,c in enumerate(['#c6c8bf','#d2d3cb','#dddfd5']):d.ellipse((123+i*19,163,132+i*19,172),fill=c)
 text(d,(640,157),'NerdyGent Press',18,serif=True,anchor='mt');text(d,(1128,163),'STUDIO',10,MUTED,anchor='rt')
 text(d,(640,767),'CONCEPT FILM  ·  ILLUSTRATIVE CONTENT',10,MUTED,anchor='mm')
 return im
def newspaper(d,x,y,w,h,alpha=1):
 d.rectangle((x,y,x+w,y+h),fill='#fffefa',outline='#d7d9d0')
 pad=25; label(d,x+pad,y+20,'A PERSONAL EDITION');text(d,(x+w-pad,y+20),'MORNING / No. 01',10,MUTED,anchor='rt')
 text(d,(x+w/2,y+47),'NerdyGent Press',min(39,int(w/13)),serif=True,anchor='mt');rule(d,x+pad,y+101,w-2*pad,INK);rule(d,x+pad,y+104,w-2*pad,INK)
 text(d,(x+pad,y+120),'A new life for the old library',min(28,int(w/22)),serif=True,bold=True)
 text(d,(x+pad,y+162),'LOCAL LIFE   /   A place worth keeping',10,MUTED)
 col=(w-2*pad-36)/3
 # architectural line drawing, monochrome editorial
 ix=x+pad; iy=y+192; iw=col*2+18; ih=105
 d.rectangle((ix,iy,ix+iw,iy+ih),fill='#eeeee5')
 mid=ix+iw/2; bottom=iy+88; left=mid-100; right=mid+100
 d.line((left-12,iy+39,mid,iy+13,right+12,iy+39),fill='#707b6c',width=2)
 d.rectangle((left,iy+41,right,bottom),outline='#707b6c',width=2)
 for k in range(7):
  xx=left+13+k*27;d.rectangle((xx,iy+52,xx+14,iy+72),outline='#707b6c',width=1)
 d.line((left-16,bottom+3,right+16,bottom+3),fill='#707b6c',width=2)
 paragraph(d,ix,y+314,iw,6,10)
 rx=x+pad+2*(col+18); text(d,(rx,y+193),'Small workshop,',16,serif=True);text(d,(rx,y+215),'big ideas.',16,serif=True);paragraph(d,rx,y+248,col,8,10)
 if h>420:
  rule(d,x+pad,y+392,w-2*pad)
  for k,title in enumerate(['A better jig','Above & beyond','One good thing']):
   xx=x+pad+k*(col+18);text(d,(xx,y+410),title,17,serif=True);paragraph(d,xx,y+442,col,3,9)
def source_scene(t):
 im=window();d=ImageDraw.Draw(im)
 text(d,(640,48),'Choose your sources.',43,serif=True,anchor='mt');text(d,(640,103),'Local outlets, RSS feeds and Reddit. You choose the reading list.',16,MUTED,anchor='mt')
 d.rectangle((101,193,302,706),fill='#f6f6f0');rule(d,302,193,1)
 label(d,124,217,'YOUR SOURCES')
 items=[('Local desk','City & neighborhood'),('RSS feeds','Writers & publications'),('Reddit','Communities you follow')]
 for i,(a,b) in enumerate(items):
  yy=254+i*81; active=min(2,int(max(0,t-1)/1.6))==i and t<6
  if active:d.rounded_rectangle((113,yy-9,290,yy+55),radius=7,fill='#eaece2')
  d.ellipse((128,yy+2,135,yy+9),fill=ACC if active else '#a2a797');text(d,(146,yy-1),a,16,bold=True);text(d,(146,yy+23),b,11,MUTED)
 label(d,125,610,'CHOSEN BY YOU');text(d,(125,632),'No infinite feed.',13,MUTED)
 text(d,(330,218),'The source desk',27,serif=True);text(d,(330,258),'Stories from your selected sources.',14,MUTED)
 rows=[('LOCAL DESK','A new life for the old library','A familiar building. A new chapter.','01'),('RSS FEEDS','The small workshop','Good work, in a smaller space.','02'),('REDDIT','The jig that made the difference','r/woodworking · A practical discovery.','03')]
 for i,(kind,title,desc,no) in enumerate(rows):
  p=ease((t-.6-i*1.4)/1.1);yy=int(300+i*109+(1-p)*20)
  layer=Image.new('RGBA',(W,H));ld=ImageDraw.Draw(layer);ld.rounded_rectangle((329,yy,836,yy+93),radius=8,fill=WHITE,outline=LINE);label(ld,347,yy+14,kind);text(ld,(347,yy+35),title,20,serif=True);text(ld,(347,yy+64),desc,12,MUTED)
  text(ld,(812,yy+15),no,11,MUTED,anchor='rt');layer.putalpha(layer.getchannel('A').point(lambda a:int(a*p)));im.paste(layer,(0,0),layer)
 d=ImageDraw.Draw(im);d.line((861,213,861,693),fill=LINE)
 label(d,886,221,'TODAY’S PAPER');text(d,(886,248),'Taking shape.',20,serif=True)
 for i in range(3):
  p=ease((t-5-i*.8)/1.2); y=296+i*95
  d.rounded_rectangle((884,y,1156,y+78),radius=5,fill='#f7f7f1',outline=LINE)
  if p>0:
   d.rectangle((896,y+13,899,y+64),fill=ACC)
   text(d,(911,y+13),['Around the corner','In the workshop','From the community'][i],14,serif=True)
   paragraph(d,911,y+41,int(222*p),2,8)
 prog=ease((t-.6)/8);d.rounded_rectangle((331,661,834,665),radius=2,fill=LINE);d.rounded_rectangle((331,661,331+503*prog,665),radius=2,fill=ACC)
 text(d,(331,677),'Ready to curate' if t>9 else 'Collecting your chosen sources',11,MUTED)
 if t>9:
  a=ease((t-9)/1.2);layer=Image.new('RGBA',(W,H));ld=ImageDraw.Draw(layer);ld.rounded_rectangle((884,617,1156,662),radius=5,fill=INK);text(ld,(1020,632),'Selected for your paper  →',13,WHITE,anchor='mt');layer.putalpha(layer.getchannel('A').point(lambda v:int(v*a)));im.paste(layer,(0,0),layer)
 return im

def edition_scene(t):
 im=window();d=ImageDraw.Draw(im);text(d,(640,48),'Set your preferences.',43,serif=True,anchor='mt');text(d,(640,103),'Choose the topics. Set the priorities. Adjust the next edition.',16,MUTED,anchor='mt')
 # stable split canvas with profile morph and newspaper entrance
 label(d,134,224,'YOUR INTERESTS');text(d,(134,251),'Choose what',28,serif=True);text(d,(134,285),'makes the cut.',28,serif=True)
 for i,(title,value) in enumerate([('Local news',.68),('Woodworking',.48),('Space',.37)]):
  yy=351+i*75;text(d,(135,yy),title,15,bold=True);d.rounded_rectangle((135,yy+31,424,yy+34),radius=2,fill=LINE)
  v=value+(.15*ease((t-2)/1.3) if i==1 else 0); xx=135+289*v;d.rounded_rectangle((135,yy+31,xx,yy+34),radius=2,fill=ACC);d.ellipse((xx-6,yy+26,xx+6,yy+38),fill=WHITE,outline=ACC,width=2)
 a=ease((t-1)/.7)*(1-ease((t-5.5)/.6));layer=Image.new('RGBA',(W,H));ld=ImageDraw.Draw(layer);ld.rounded_rectangle((134,594,425,646),radius=7,fill=PALE);text(ld,(152,611),'3 net topic votes',14,ACC,bold=True);text(ld,(407,610),'+1',16,ACC,anchor='rt');layer.putalpha(layer.getchannel('A').point(lambda v:int(v*a)));im.paste(layer,(0,0),layer)
 d=ImageDraw.Draw(im)
 if t>6:
  text(d,(135,603),'Suggestion accepted.',16,serif=True);text(d,(135,632),'You stay in control.',13,MUTED)
 d.line((473,214,473,688),fill=LINE)
 # controlled physical lift / reveal
 p=ease((t-.4)/2);py=int(209+(1-p)*14);pw=628;px=511
 shadow=Image.new('RGBA',(W,H));sd=ImageDraw.Draw(shadow);sd.rectangle((px+4,py+9,px+pw+4,py+487),fill=(30,34,20,25));shadow=shadow.filter(ImageFilter.GaussianBlur(10));im.paste(shadow,(0,0),shadow)
 d=ImageDraw.Draw(im);newspaper(d,px,py,pw,475)
 # thin production progress resolves to print ready
 pr=ease((t-3)/5);d.rounded_rectangle((517,699,1133,702),radius=2,fill=LINE);d.rounded_rectangle((517,699,517+616*pr,702),radius=2,fill=ACC)
 if t>8:
  a=ease((t-8)/1);layer=Image.new('RGBA',(W,H));ld=ImageDraw.Draw(layer);ld.rounded_rectangle((940,638,1121,674),radius=18,fill=INK);text(ld,(1030,649),'Your edition, ready',11,WHITE,anchor='mt');layer.putalpha(layer.getchannel('A').point(lambda v:int(v*a)));im.paste(layer,(0,0),layer)
 return im

def encode(name,scene):
 cmd=[imageio_ffmpeg.get_ffmpeg_exe(),'-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','slow','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/(name+'.mp4'))]
 p=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
 for i in range(FPS*SECONDS):
  frame=scene(i/FPS);p.stdin.write(frame.tobytes())
  if i in [24,120,240]:frame.save(OUT/f'{name}-qa-{i//24}.png')
  if i==240:frame.save(OUT/(name+'-poster.png'))
 p.stdin.close();assert p.wait()==0
 print(name, (OUT/(name+'.mp4')).stat().st_size,flush=True)
if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--out',type=pathlib.Path,default=OUT);args=parser.parse_args();OUT=args.out;OUT.mkdir(parents=True,exist_ok=True)
 encode('sources-to-stories',source_scene);encode('made-for-you',edition_scene)
