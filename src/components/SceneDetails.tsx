import type { ReactNode } from 'react';
const Pipe = () => <><path d="M20 85H280" stroke="#9cafb3" strokeWidth="38"/><path d="M20 72H280" stroke="#deeaed" strokeWidth="5"/><path d="m133 68-10 13 14 6-12 12 23-3 14-17-15-13Z" fill="#9b4a2d" stroke="#efb885" strokeWidth="3"/><path d="m140 72-7 13 13 3-8 8" fill="none" stroke="#422a25" strokeWidth="4"/></>;
const Plate = ({worn=false}:{worn?:boolean}) => <><rect x="45" y="25" width="210" height="110" rx="7" fill="#d7e3e3" stroke="#93a6ae" strokeWidth="4"/><text x="63" y="53" fill="#24383d" fontSize="16">GERÄT · TYPENSCHILD</text><text x="63" y="83" fill="#24383d" fontSize="17">Typ: G-24</text><text x="63" y="112" fill="#24383d" fontSize="17">Nr.: 123456</text>{worn && <path d="m60 68 175 30M65 95l175-17m-170 35 165-10" stroke="#859696" strokeWidth="15"/>}</>;
const Folder = () => <><rect x="85" y="20" width="130" height="125" rx="7" fill="#89a8b7"/><rect x="100" y="38" width="100" height="65" rx="3" fill="#eef2e9"/><text x="150" y="62" textAnchor="middle" fill="#24383d" fontSize="13">ANLAGEN-</text><text x="150" y="83" textAnchor="middle" fill="#24383d" fontSize="13">UNTERLAGEN</text><circle cx="150" cy="125" r="9" fill="#24383d"/></>;
const Valve = () => <><path d="M150 20V145" stroke="#9cafb3" strokeWidth="20"/><rect x="120" y="53" width="60" height="30" rx="4" fill="#d6bc67"/><path d="M150 68h65" stroke="#e9c758" strokeWidth="12"/><text x="22" y="30" fill="#edf4ed" fontSize="14">Absperrung →</text><rect x="68" y="83" width="173" height="65" fill="#b58d5d" stroke="#e3bc8c" strokeWidth="3"/><path d="M155 85v60" stroke="#dec6a0" strokeWidth="12"/><text x="155" y="125" textAnchor="middle" fill="#292f2b" fontSize="18">KARTONS</text></>;
const Fan = () => <><rect x="85" y="20" width="130" height="125" rx="8" fill="#a1b8bc"/><circle cx="150" cy="82" r="47" fill="#263d43"/>{[0,120,240].map(a=><path key={a} transform={`rotate(${a} 150 82)`} d="M150 82q-37-48 0-39 23 9 0 39" fill="#c5d8db"/>)}<text x="245" y="80" textAnchor="middle" fill="#e9f2e9" fontSize="30">→</text></>;
const Opening = () => <>{[25,175].map((x,i)=><g key={x}><text x={x+50} y="24" textAnchor="middle" fill="#edf4ed" fontSize="16">{i?'Jetzt':'Vorher'}</text><rect x={x} y="40" width="100" height="100" fill="#142428" stroke="#9cafb3" strokeWidth="5"/>{[60,80,100,120].map(y=><path key={y} d={`M${x+5} ${y}h90`} stroke="#9cafb3" strokeWidth="5"/>)}{i===1&&<rect x={x} y="40" width="100" height="70" fill="#b58d5d"/>}</g>)}</>;
type Detail = {name:string; observation:string; art:ReactNode};
const scenes:Record<string,Detail[]> = {
 'q2-1':[
  {name:'Leitungsoberfläche',observation:'Abplatzungen und braune Stellen an der sichtbaren Oberfläche.',art:<Pipe/>},
  {name:'Absperreinrichtung',observation:'Kartons stehen direkt vor der gekennzeichneten Absperrung und versperren den Zugang.',art:<Valve/>},
  {name:'Geräteschild',observation:'Typ und Gerätenummer sind vollständig lesbar.',art:<Plate/>}],
 'q4-2':[
  {name:'Abluftanlage',observation:'Vorher: keine Abluftanlage. Jetzt: ein zusätzlicher Ventilator führt Raumluft nach außen.',art:<Fan/>},
  {name:'Luftöffnung',observation:'Vorher: Öffnung frei. Jetzt: Ein Teil ist durch eine Platte verdeckt.',art:<Opening/>},
  {name:'Dokumentationsordner',observation:'Nur die Beschriftung des Ordners wurde erneuert.',art:<Folder/>}],
 'boss-2':[
  {name:'Typenschild',observation:'Typ und Gerätenummer sind verwischt und nicht eindeutig lesbar.',art:<Plate worn/>},
  {name:'Leitung',observation:'Die Oberfläche zeigt deutliche Abplatzungen und braune Stellen.',art:<Pipe/>},
  {name:'Dokumentation',observation:'Die Unterlagen liegen beschriftet und sortiert im Ordner.',art:<Folder/>}]
};
export function SceneDetails({questionId,textOnly}:{questionId:string;textOnly:boolean}) {
 const details=scenes[questionId];
 if(!details)return null;
 return <div className="scene-details"><p className="scene-intro">Drei Detailansichten. Welche Beobachtungen müssen fachlich geklärt werden? Wähle darunter die passenden Antworten.</p>{details.map((d,i)=><figure key={d.name} className="scene-detail"><figcaption><b>{String.fromCharCode(65+i)}</b><strong>{d.name}</strong></figcaption>{!textOnly&&<svg viewBox="0 0 300 165" role="img" aria-label={d.observation}>{d.art}</svg>}<p>{d.observation}</p></figure>)}</div>;
}
