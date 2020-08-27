const canvas = document.getElementById('tetrisCanvas');
const ctx = canvas.getContext('2d');

const LBtn = document.getElementById('LBtn');
const RBtn = document.getElementById('RBtn');
const downBtn = document.getElementById('downBtn');
const rotateBtn = document.getElementById('rotateBtn');

const refeshInterval = 50; // 50ms
const blockScale = 30; // 1 block size / 30px
const scaledInfoHeight = 6;
const scaledGameWidth = canvas.width/blockScale; // 13 block
const scaledGameHeight = canvas.height/blockScale - scaledInfoHeight; // 17 block
const scaledStartingX = Math.floor(scaledGameWidth/2)-1;
const fallingInterval = 1000;
let timerId = null; // setInterval
let lastFallingTime = 0;

// Game Object
const player = {
    position : {x:scaledStartingX, y:scaledInfoHeight},
    block : [],
    color : []
};
const blocks = [
    [
        [1,1],
        [1,1]
    ],
    [
        [0,2,0],
        [0,2,0],
        [0,2,0],
        [0,2,0]
    ],
    [
        [0,3,3],
        [3,3,0]
    ],
    [
        [4,4,0],
        [0,4,4]
    ],
    [
        [0,5,0],
        [5,5,5],
        [0,0,0]
    ],
    [
        [6,0,0],
        [6,6,6]
    ],
    [
        [0,0,7],
        [7,7,7]
    ]
]; // Array must be Rect
const colors = [
    null,
    'yellow',
    'skyblue',
    'green',
    'red',
    'purple',
    'blue',
    'orange'
]; // block Colors
let land = [];
let gameScore = 0;

init();
start();

function init(){
    console.log('tetris init');
    ctx.scale(blockScale, blockScale);
    // Button Event
    LBtn.addEventListener('click', ()=>{ move('L'); });
    RBtn.addEventListener('click', ()=>{ move('R'); });
    downBtn.addEventListener('click', ()=>{ move('D'); });
    rotateBtn.addEventListener('click', ()=>{ move('rotate'); });
    // Keyboard Event
    document.addEventListener('keydown', (e)=>{
        if(e.keyCode === 37){ move('L'); }
        else if(e.keyCode === 39){ move('R'); }
        else if(e.keyCode === 40){ move('D'); }
        else if(e.keyCode === 38){ move('rotate');}
    });
    // Scroll Lock
    window.addEventListener('keydown', (e)=>{
        if([32,37,38,39,40].indexOf(e.keyCode) > -1){
            e.preventDefault();
        }
    }, false);
}

function start(){
    console.log('tetris start');
    player.position.x=scaledStartingX;
    player.position.y=scaledInfoHeight;
    player.block = [];
    player.color = [];
    land = [];
    gameScore = 0;

    // starting block and color setting
    let blockNum = 0;
    for(i=0; i<2; i++){
        blockNum = Math.floor((Math.random()*blocks.length));
        player.block.push(blocks[blockNum]);
        player.color.push(colors[blockNum+1]);
    }

    // starting land setting
    let ground = new Array(scaledGameWidth+2).fill(1);
    land.push(ground);
    for(i=0; i<scaledGameHeight; i++){
        let wall = new Array(scaledGameWidth+2).fill(0);
        wall[0]=1;
        wall[scaledGameWidth+1]=1;
        land.push(wall);
    }
    
    lastFallingTime = performance.now();
    timerId = setInterval(update, refeshInterval);
}

function update(){
    //falling
    time = performance.now();
    if((time - lastFallingTime) > fallingInterval){
        move('D');
        lastFallingTime = time;
    }

    /* ---Draw Start--- */
    // Background
    ctx.fillStyle ='white';
    ctx.fillRect(0, 0, canvas.width/blockScale, canvas.height/blockScale);
    // GameScore
    ctx.strokeStyle ='black';
    ctx.lineWidth = 2/blockScale;
    ctx.strokeRect(8, 0.5, 4, 2);
    ctx.fillStyle = 'black';
    ctx.font = '1px serif';
    ctx.textAlign = 'center';
    ctx.fillText(gameScore, 10, 2);
    // Next Block Preview
    ctx.strokeStyle ='black';
    ctx.lineWidth = 2/blockScale;
    ctx.strokeRect(0.5, 0.5, 4, 5);
    ctx.fillStyle = player.color[1];
    for(i=0; i<player.block[1].length; i++){
        for(j=0; j<player.block[1][i].length; j++){
            if(player.block[1][i][j] > 0)
                ctx.fillRect(1+j,1+i,1,1);
        }
    }
    // Player
    ctx.fillStyle=player.color[0];
    for(i=0; i<player.block[0].length; i++){
        for(j=0; j<player.block[0][i].length; j++){
            if(player.block[0][i][j] > 0)
                ctx.fillRect(player.position.x+j, player.position.y+i,1,1);
        }
    }
    // land
    for(i=0; i<land.length; i++){
        for(j=0; j<land[i].length; j++){
            if(land[i][j]){
                ctx.fillStyle = colors[land[i][j]];
                ctx.fillRect(j-1,canvas.height/blockScale-i,1,1);
            }
        }
    }
    
}

function collision(block, x, y){
    // PlayerCanvas좌표를 land 좌표계로 변환
    let landX = canvas.height/blockScale-y;
    let landY = x+1;
    for(i=0; i<block.length; i++){
        for(j=0; j<block[i].length; j++){
            if(block[i][j] && land[landX-i][landY+j]){
                return 1;
            }
        }
    }
    return 0;
}

function move(moveTo){
    let x = player.position.x;
    let y = player.position.y;
    let block = player.block[0];

    if(moveTo === 'L'){
        x--;
    }else if(moveTo === 'R'){
        x++;
    }else if(moveTo === 'D'){
        y++;
    }else if(moveTo === 'rotate'){
        block = rotateBlock(block);
    }

    if(collision(block, x, y)){
        if(moveTo === 'D'){
            mergeBlock();
        }
        return 0;
    }else{
        player.position.x = x;
        player.position.y = y;
        player.block[0] = block;
        return 1;
    }
}

function rotateBlock(inputBlock){
    let rotatedBlock= [];
    for (const key in inputBlock[0]) {
        rotatedBlock.push([]);
    }
    for(i=0; i<inputBlock.length; i++){
        for(j=0; j<inputBlock[i].length; j++){
            rotatedBlock[j][inputBlock.length-1-i] = inputBlock[i][j];
        }
    }
    return rotatedBlock;
}

function mergeBlock(){
    // PlayerCanvas좌표를 land 좌표계로 변환
    let landX = canvas.height/blockScale-player.position.y;
    let landY = player.position.x+1;
    for(i=0; i<player.block[0].length; i++){
        for(j=0; j<player.block[0][i].length; j++){
            if(player.block[0][i][j] > 0){
                land[landX-i][landY+j] = player.block[0][i][j];
            }
        }
    }
    clearLines();
    createNextBlock();
}

function createNextBlock(){
    player.position.x = scaledStartingX;
    player.position.y = scaledInfoHeight;
    player.block.shift();
    player.color.shift();
    let blockNum = 0;
    blockNum = Math.floor((Math.random()*blocks.length));
    player.block.push(blocks[blockNum]);
    player.color.push(colors[blockNum+1]);
    lastFallingTime = performance.now();
}

function clearLines(){
    let lines = [];
    let clear = false;
    // Search Lines
    for(i=1; i<land.length; i++){
        clear = true;
        for(j=1; j<land[i].length-1; j++){
            if(land[i][j] === 0){
                clear = false;
                break;
            }
        }
        if(clear == true){
            lines[lines.length] = i;
        }
    }

    // Clear and Score
    for(i=0; i<lines.length; i++){
        land.splice(lines[i]-i,1);
        let wall = new Array(scaledGameWidth+2).fill(0);
        wall[0]=1;
        wall[scaledGameWidth+1]=1;
        land.push(wall);
        
        gameScore += 10;
        gameScore += i*10; //bonus score :)
    }
}

