let stage = 0;
let cleared = false;
let moved_history = [];
let frame_len_half = 250;
let tile_len = 0;
let can_use_cookie = false;
let state;
function setup(){
    let canvas_len = min(windowWidth*0.85, windowHeight*0.85);
    let canvas = createCanvas(canvas_len, canvas_len);
    frame_len_half = min(canvas_len * 0.45, canvas_len * 0.45);
    let result = document.getElementById('result');
    canvas.parent(result);
    confirm_cookie();
    load_cookie();
    state = init_state();
}

function draw(){
    communicate_html();
    background(255);
    translate(width/2, height/2);
    tile_len = (2*frame_len_half) / n;
    draw_tile(n, frame_len_half, tile_len, state);
    if(is_clear()){
        cleared = true;
    }
    if(cleared){
        progress = clear_performance();
        if(progress == 'finish'){
            clear_count[stage]++;
            save_cookie();
            init_state();
        }
    }
}

function draw_tile(n, frame_len_half, tile_len, state){
    if(judge_criteria[stage]()){
        tile_color = color(tile_colors[stage]);
        stroke(0);
        strokeWeight(3);
        for(let i=0; i<n; i++){
            for(let j=0; j<n; j++){
                if (state[i][j]==config.WHITE_ID)fill(255);
                else if(state[i][j]==config.WROTE_ID)fill(tile_color);
                else if(state[i][j]==config.BLOCK_ID)fill(100);
                rect(-frame_len_half+i*tile_len, -frame_len_half+j*tile_len, tile_len, tile_len);
            }
        }
    }else{
        strokeWeight(3);
        fill(255);
        rect(-frame_len_half, -frame_len_half, frame_len_half*2, frame_len_half*2);
        fill(0);
        textSize(30);
        strokeWeight(1);
        text('開放条件:\n'+criteria[stage], -frame_len_half + 10, -frame_len_half + 50);
    }
}

function mouseDragged(){
    if(!judge_criteria[stage]()) return;
    if(cleared)return;
    let offset_x = width/2 - frame_len_half;
    let offset_y = height/2 - frame_len_half;
    if(mouseX - offset_x < 0 || 2*frame_len_half < mouseX - offset_x)return;
    if(mouseY - offset_y < 0 || 2*frame_len_half < mouseY - offset_y)return;
    let prev_tile = move_history[move_history.length-1];
    px_idx = prev_tile.x;
    py_idx = prev_tile.y;
    let x_idx = int((mouseX - offset_x) / tile_len);
    let y_idx = int((mouseY - offset_y) / tile_len);
    if(state[x_idx][y_idx] == config.WHITE_ID
        && (Math.abs(px_idx - x_idx) + Math.abs(py_idx - y_idx)) == 1){
        state[x_idx][y_idx] = 1;
        move_history.push({'x':x_idx, 'y':y_idx});
    }else if(state[x_idx][y_idx] == config.WROTE_ID){
        while(true){
            let ix = move_history.pop();
            state[ix.x][ix.y] = config.WHITE_ID;
            if(ix.x == x_idx && ix.y == y_idx){
                move_history.push(ix);
                state[ix.x][ix.y] = config.WROTE_ID;
                break;
            }
        }
    }
}

function mouseReleased(){
    if(cleared) return;
    for(let i=0; i<n; i++){
        for(let j=0; j<n; j++){
            state[i][j] = config.BLOCK_ID;
        }
    }
    for(let i=0; i<layout.white_ix.length; i++){
        let ix = layout.white_ix[i];
        state[ix.x][ix.y] = config.WHITE_ID;
    }
    state[layout.start_ix.x][layout.start_ix.y] = config.WROTE_ID;
    move_history = [{'x':layout.start_ix.x, 'y':layout.start_ix.y}];
}

function init_state(){
    cleared=false;
    n = calc_n_tile(clear_count[stage]);
    layout = generate_tile_layout(n);
    console.log('start_ix:', layout.start_ix);
    console.log('white_ix:', layout.white_ix);
    state = new Array(n);
    for(let i=0; i<n; i++)state[i] = new Array(n).fill(config.BLOCK_ID);
    for(let i=0; i<layout.white_ix.length; i++){
        let ix = layout.white_ix[i];
        state[ix.x][ix.y] = config.WHITE_ID;
    }
    state[layout.start_ix.x][layout.start_ix.y] = config.WROTE_ID;
    move_history = [{'x':layout.start_ix.x, 'y':layout.start_ix.y}];
    return state;
}

function is_clear(){
    // returns true or false
    for(let i=0; i<n; i++){
        for(let j=0; j<n; j++){
            if(state[i][j]==0)return false;
        }
    }
    return true;
}

function clear_performance(){
    if(frameCount%3!=0)return;
    if(move_history.length > 0){
        let ix = move_history.pop();
        state[ix.x][ix.y] = 0;
        return 'continue';
    }else{
        return 'finish';
    }
}

function calc_n_tile(clear_count){
    return int(Math.log2(clear_count+4));
}

function communicate_html(){
    let obj = document.getElementById('show_world');
    obj.innerText = '世界 '+ (stage+1) + ', ステージ ' + clear_count[stage];
}

// function mouseDragged(){
//     stroke(0);
//     line(pmouseX, pmouseY, mouseX, mouseY);
// }

function update_stage(mode){
    stage += mode;
    if(stage < 0)stage = 0;
    else if(stage > N_STAGES) stage = N_STAGES;
    else init_state();
}

function confirm_cookie(){
    if (document.cookie.split(';').some(function(item) {
        return item.trim().indexOf('ClearCount0=') >= 0
    })) {
        can_use_cookie = true;
    }else{
        var comfirm_result = confirm('進行状況の自動保存のためにcookieを使用してもいいですか？\nキャンセルを選択した場合，進行状況は保存されません．');
        can_use_cookie = comfirm_result;
    }
    if(can_use_cookie){
        let button = document.getElementById('confirm_cookie')
        if(can_use_cookie){
            button.remove();
        }
    }
}

function save_cookie(){
    if(!can_use_cookie)return;
    for(let i=0; i<clear_count.length; i++){
        // console.log('ClearCount' + i + '=' + clear_count[i]);
        document.cookie = 'ClearCount' + i + '=' + clear_count[i];
    }
    console.log('Saved to cookie:', document.cookie);
}

function load_cookie(){
    if(!can_use_cookie)return;
    if(document.cookie.length == 0)return;
    for(let i=0; i<clear_count.length; i++){
        let count = int(document.cookie
        .split('; ')
        .find(row => row.startsWith('ClearCount' + i))
        .split('=')[1]);
        clear_count[i] = count;
    }
}

function show_progress(){
    let progress = ''
    for(let i=0; i<clear_count.length; i++){
        // console.log('ClearCount' + i + '=' + clear_count[i]);
        progress += 'W' + i + 'S' + clear_count[i] + 'o';
    }
    let obj = document.getElementById('progress_str');
    obj.innerText = progress;
    return progress
}

function load_progress(){
    progress = window.prompt("W0から始まる復元用コードを入力してください．", "");
    for(let i=0; i<clear_count.length; i++){
        let count = int(progress
        .split('o')
        .find(row => row.startsWith('W' + i))
        .split('S')[1]);
        if(count == undefined){
            clear_count[i] = 0;
        }else{
            clear_count[i] = count;
        }
    }
    save_cookie();
    init_state();
}

function reset_game(){
    let can_rest = confirm('ゲームをリセットしていいですか？\n進行状況は全て破棄されます．')
    if(can_rest){
        for(let i=0; i<N_STAGES; i++){
            clear_count[i] = 0;
        }
    }
    save_cookie();
    init_state();
}

function tweet(){
    let tweet_text = '';
    for(let i=0; i<N_STAGES; i++){
        if(clear_count[i] != 0){
            tweet_text += '世界:' + (i+1) + ',ステージ:' + clear_count[i] + '%0A';
        }
    }
    let tweet_url = 'gotutiyan.github.io/infinity_one_stroke' + '%0A';
    let tweet_hashtag = '無限一筆書き' + '%0A'
    let link = 'https://twitter.com/intent/tweet?'
        + 'text=' + tweet_text
        + '&url=' + tweet_url
        + '&hashtags=' + tweet_hashtag
    console.log(link);
    window.open(link, '_blank');
    return link;
}