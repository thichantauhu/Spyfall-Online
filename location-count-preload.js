const Module=require('module');
const path=require('path');
const fs=require('fs');
const original=Module._extensions['.js'];
Module._extensions['.js']=function(mod,filename){
  if(!filename.endsWith(path.join('server-v2.js')))return original(mod,filename);
  let src=fs.readFileSync(filename,'utf8');
  src=src.replace("const makeRoundLocations=(secret=null)=>{if(ALL_LOCATIONS.length<=20)return [...ALL_LOCATIONS];const others=ALL_LOCATIONS.filter(x=>x!==secret);const picked=sampleLocations(others,secret?19:20);return secret?sampleLocations([...picked,secret],20):picked};", "const makeRoundLocations=(count=20,secret=null)=>{count=[20,25,30].includes(Number(count))?Number(count):20;if(ALL_LOCATIONS.length<=count)return [...ALL_LOCATIONS];const others=ALL_LOCATIONS.filter(x=>x!==secret);const picked=sampleLocations(others,secret?count-1:count);return secret?sampleLocations([...picked,secret],count):picked};");
  src=src.replace("const publicState=r=>({room:r.code,", "const publicState=r=>({locationCount:r.locationCount||20,mainTimeSec:r.mainTimeSec||120,extraTimeSec:r.extraTimeSec||60,room:r.code,");
  src=src.replace("socket.on('create_room',({name,spyCount=1})=>{", "socket.on('create_room',({name,spyCount=1,locationCount=20,mainTimeSec=120,extraTimeSec=60})=>{");
  src=src.replace("spyCount:sc,spyIds:[]", "spyCount:sc,locationCount:[20,25,30].includes(Number(locationCount))?Number(locationCount):20,mainTimeSec:[120,150,180].includes(Number(mainTimeSec))?Number(mainTimeSec):120,extraTimeSec:[60,90,120].includes(Number(extraTimeSec))?Number(extraTimeSec):60,spyIds:[]");
  src=src.replace("r.locations=makeRoundLocations();", "r.locations=makeRoundLocations(r.locationCount||20);");
  src=src.replace("socket.on('kick_player',({targetId})=>{", "socket.on('set_location_count',({locationCount})=>{const r=rooms.get(socket.roomCode);if(!r||r.phase!=='lobby'||r.hostId!==socket.id)return;const n=Number(locationCount);if([20,25,30].includes(n)){r.locationCount=n;emitRoom(r)}});\nsocket.on('set_time_settings',({mainTimeSec,extraTimeSec})=>{const r=rooms.get(socket.roomCode);if(!r||r.phase!=='lobby'||r.hostId!==socket.id)return;const main=Number(mainTimeSec),extra=Number(extraTimeSec);if([120,150,180].includes(main))r.mainTimeSec=main;if([60,90,120].includes(extra))r.extraTimeSec=extra;emitRoom(r)});\nsocket.on('kick_player',({targetId})=>{");
  src=src.replace("const seconds=r.players.length*(extra?60:120);", "const seconds=r.players.length*(extra?(r.extraTimeSec||60):(r.mainTimeSec||120));");
  src=src.replace("Mỗi Spy nhận ${r.extraRound?1:2} điểm.", "Mỗi Spy nhận 2 điểm.");
  mod._compile(src,filename);
};
